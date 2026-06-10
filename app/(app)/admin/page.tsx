import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock3,
  CreditCard,
  GraduationCap,
  Layers3,
  LineChart,
  Package,
  Rocket,
  Sparkles,
  TrendingUp,
  Users
} from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { listOwnedCourseSummaries } from "@/lib/courses/repository";
import { requireAdmin } from "@/lib/engines/auth/helpers";
import { listStudentProfiles } from "@/lib/engines/auth/repository";
import { formatMxn } from "@/lib/engines/catalog/helpers";
import { listAdminProducts } from "@/lib/engines/catalog/service";
import { listPaymentsForAdmin } from "@/lib/engines/commerce/service";
import { DATA_FETCH_TIMEOUT_MS, safeData } from "@/src/services/performance";

type DashboardActivity = {
  id: string;
  title: string;
  description: string;
  href: string;
  createdAt: string;
  tone: "admin" | "enrollment" | "payment";
};

function formatCompactDate(value: string): string {
  return new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "short"
  }).format(new Date(value));
}

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

function pluralize(count: number, singular: string, plural: string): string {
  return `${count} ${count === 1 ? singular : plural}`;
}

function clampPercent(value: number): number {
  return Math.max(0, Math.min(100, value));
}

export default async function AdminPage() {
  const auth = await requireAdmin();
  const [courses, products, payments, students] = await Promise.all([
    safeData({
      label: "admin course summaries",
      load: () => listOwnedCourseSummaries(auth.user.id),
      fallback: [],
      timeoutMs: DATA_FETCH_TIMEOUT_MS.DASHBOARD_QUERY
    }),
    safeData({
      label: "admin products",
      load: listAdminProducts,
      fallback: [],
      timeoutMs: DATA_FETCH_TIMEOUT_MS.DASHBOARD_QUERY
    }),
    safeData({
      label: "admin payments",
      load: () => listPaymentsForAdmin(),
      fallback: [],
      timeoutMs: DATA_FETCH_TIMEOUT_MS.DASHBOARD_QUERY
    }),
    safeData({
      label: "student profiles",
      load: listStudentProfiles,
      fallback: [],
      timeoutMs: DATA_FETCH_TIMEOUT_MS.DASHBOARD_QUERY
    })
  ]);

  const publishedCourses = courses.filter((course) => course.isPublished);
  const draftCourses = courses.length - publishedCourses.length;
  const pendingPayments = payments.filter((payment) => payment.status === "pending_review");
  const approvedPayments = payments.filter((payment) => payment.status === "approved");
  const revenueMxnCents = approvedPayments.reduce((total, payment) => total + payment.order.totalMxnCents, 0);
  const totalModules = courses.reduce((total, course) => total + course.moduleCount, 0);
  const totalLessons = courses.reduce((total, course) => total + course.lessonCount, 0);
  const publishedProducts = products.filter((product) => product.isPublished);

  const recentActivity: DashboardActivity[] = [
    ...courses.slice(0, 4).map((course) => ({
      id: `course-${course.id}`,
      title: `Curso actualizado: ${course.title}`,
      description: `Admin action - ${course.isPublished ? "Publicado" : "Draft"} - ${pluralize(course.lessonCount, "leccion", "lecciones")}`,
      href: `/admin/cursos/${course.id}`,
      createdAt: course.updatedAt,
      tone: "admin" as const
    })),
    ...payments.slice(0, 4).map((payment) => ({
      id: `payment-${payment.id}`,
      title: payment.status === "approved" ? "Enrollment aprobado por pago" : "Comprobante recibido",
      description: `${payment.order.product?.title ?? "Pago manual"} - ${payment.order.student?.email ?? "Alumno sin perfil"}`,
      href: "/admin/pagos",
      createdAt: payment.updatedAt,
      tone: payment.status === "approved" ? "enrollment" as const : "payment" as const
    })),
    ...products.slice(0, 3).map((product) => ({
      id: `product-${product.id}`,
      title: `Producto ${product.isPublished ? "publicado" : "en draft"}`,
      description: `${product.title} - ${formatMxn(product.priceMxnCents)}`,
      href: `/admin/productos/${product.id}`,
      createdAt: product.updatedAt,
      tone: "admin" as const
    }))
  ]
    .toSorted((first, second) => new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime())
    .slice(0, 6);

  const courseCompletion = courses.length > 0 ? Math.round((publishedCourses.length / courses.length) * 100) : 0;
  const pendingPaymentRatio = payments.length > 0 ? Math.round((pendingPayments.length / payments.length) * 100) : 0;
  const contentDepth = courses.length > 0 ? Math.round(totalLessons / courses.length) : 0;
  const completionRate = totalLessons > 0 ? clampPercent(Math.round((publishedCourses.length / Math.max(courses.length, 1)) * 100)) : 0;
  const activeStudentsEstimate = Math.max(students.length - pendingPayments.length, 0);
  const conversionSignal = payments.length > 0 ? clampPercent(Math.round((approvedPayments.length / payments.length) * 100)) : 0;
  const reviewQueueDepth = Math.min(100, pendingPayments.length * 18);
  const revenueBars = [22, 34, 48, 55, 62, 74, revenueMxnCents > 0 ? 88 : 18];
  const engagementBars = [18, 32, 44, 51, 63, 72, courses.length > 0 ? 82 : 18];

  return (
    <section className="space-y-8">
      <PageHeader
        eyebrow="Admin"
        title="Dashboard"
        description="Una vista ejecutiva para operar cursos, pagos manuales y alumnos sin perder foco."
        actions={
          <>
            <Link
              href="/admin/cursos"
              className="inline-flex min-h-10 items-center gap-2 rounded-md bg-brand-primary px-4 py-2 text-sm font-semibold text-white shadow-soft"
            >
              Gestionar cursos
              <ArrowRight aria-hidden className="h-4 w-4" />
            </Link>
            <Link
              href="/admin/pagos"
              className="inline-flex min-h-10 items-center gap-2 rounded-md border border-line-subtle bg-surface-base px-4 py-2 text-sm font-semibold text-ink-secondary shadow-soft"
            >
              Revisar pagos
            </Link>
          </>
        }
      />

      <section className="grid gap-3 md:grid-cols-3 xl:grid-cols-5">
        <QuickAction href="/admin/pagos" icon={CreditCard} title="Revisar pagos" description={`${pendingPayments.length} pendientes`} />
        <QuickAction href="/admin/cursos" icon={BookOpen} title="Gestionar cursos" description={`${courses.length} cursos`} />
        <QuickAction href="/admin/productos" icon={Package} title="Editar catalogo" description={`${products.length} productos`} />
        <QuickAction href="/onboarding" icon={Rocket} title="Checklist setup" description="Activacion operativa" />
        <QuickAction href="/admin/settings" icon={GraduationCap} title="Configurar workspace" description="Marca, legal y seguridad" />
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          href="/admin/cursos"
          icon={BookOpen}
          label="Cursos"
          value={courses.length.toString()}
          detail={`${publishedCourses.length} publicados - ${draftCourses} drafts`}
          trend={`${courseCompletion}% publicados`}
        />
        <MetricCard
          href="/mis-productos"
          icon={Users}
          label="Alumnos"
          value={students.length.toString()}
          detail="Perfiles student disponibles"
          trend="Acceso y enrollments"
        />
        <MetricCard
          href="/admin/pagos"
          icon={CreditCard}
          label="Pagos pendientes"
          value={pendingPayments.length.toString()}
          detail={`${payments.length} comprobantes totales`}
          trend={`${pendingPaymentRatio}% por revisar`}
        />
        <MetricCard
          href="/admin/pagos"
          icon={Sparkles}
          label="Ingresos aprobados"
          value={formatMxn(revenueMxnCents)}
          detail={`${approvedPayments.length} pagos aprobados`}
          trend="Manual LATAM"
        />
      </section>

      <AnalyticsCommandCenter
        activeStudents={activeStudentsEstimate}
        completionRate={completionRate}
        conversionSignal={conversionSignal}
        engagementBars={engagementBars}
        pendingPayments={pendingPayments.length}
        publishedProducts={publishedProducts.length}
        reviewQueueDepth={reviewQueueDepth}
        revenue={formatMxn(revenueMxnCents)}
        revenueBars={revenueBars}
      />

      <section className="grid gap-6 xl:grid-cols-[1.45fr_0.9fr]">
        <div className="space-y-6">
          <section className="overflow-hidden rounded-lg border border-line-subtle bg-surface-base shadow-soft">
            <div className="flex flex-col gap-3 border-b border-line-subtle p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-normal text-brand-primary">Operacion</p>
                <h2 className="mt-1 text-lg font-semibold text-ink-primary">Estado del sistema academico</h2>
              </div>
              <span className="inline-flex w-fit items-center gap-2 rounded-md border border-line-subtle bg-surface-muted px-3 py-1.5 text-xs font-medium text-ink-secondary">
                <CheckCircle2 aria-hidden className="h-4 w-4 text-semantic-success" />
                Produccion lista
              </span>
            </div>
            <div className="grid gap-px bg-line-subtle md:grid-cols-3">
              <StatusPanel
                icon={Layers3}
                title="Contenido"
                value={pluralize(totalLessons, "leccion", "lecciones")}
                detail={`${pluralize(totalModules, "modulo", "modulos")} en ${pluralize(courses.length, "curso", "cursos")}`}
                href="/admin/cursos"
              />
              <StatusPanel
                icon={CreditCard}
                title="Pagos"
                value={pendingPayments.length > 0 ? "Revision requerida" : "Sin pendientes"}
                detail={pendingPayments.length > 0 ? pluralize(pendingPayments.length, "comprobante", "comprobantes") : "Flujo manual al dia"}
                href="/admin/pagos"
              />
              <StatusPanel
                icon={Package}
                title="Catalogo"
                value={pluralize(products.length, "producto", "productos")}
                detail={`${products.filter((product) => product.isPublished).length} publicados`}
                href="/admin/productos"
              />
            </div>
          </section>

          <section className="rounded-lg border border-line-subtle bg-surface-base p-5 shadow-soft">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-normal text-brand-primary">Cursos</p>
                <h2 className="mt-1 text-lg font-semibold text-ink-primary">Cursos recientes</h2>
              </div>
              <Link href="/admin/cursos" className="text-sm font-semibold text-brand-primary">
                Ver todos
              </Link>
            </div>

            {courses.length === 0 ? (
              <EmptyState
                icon={BookOpen}
                title="Todavia no hay cursos"
                description="Crea tu primer curso para activar modulos, lecciones, pagos y alumnos desde el sistema SaaS."
                href="/admin/cursos"
                action="Crear curso"
              />
            ) : (
              <div className="mt-5 grid gap-3">
                {courses.slice(0, 4).map((course) => (
                  <Link
                    key={course.id}
                    href={`/admin/cursos/${course.id}`}
                    className="grid gap-3 rounded-md border border-line-subtle bg-surface-raised p-4 transition hover:border-brand-primary/40 md:grid-cols-[1fr_auto]"
                  >
                    <div className="min-w-0">
                      <div className="flex min-w-0 items-center gap-2">
                        <h3 className="truncate font-semibold text-ink-primary">{course.title}</h3>
                        <span className={`shrink-0 rounded-md px-2 py-1 text-xs font-semibold ${course.isPublished ? "bg-emerald-50 text-emerald-700" : "bg-surface-muted text-ink-muted"}`}>
                          {course.isPublished ? "Publicado" : "Draft"}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-ink-secondary">
                        {pluralize(course.moduleCount, "modulo", "modulos")} - {pluralize(course.lessonCount, "leccion", "lecciones")}
                      </p>
                    </div>
                    <span className="text-sm text-ink-muted">Actualizado {formatCompactDate(course.updatedAt)}</span>
                  </Link>
                ))}
              </div>
            )}
          </section>

          <InsightsSection
            contentDepth={contentDepth}
            conversionSignal={conversionSignal}
            courseCompletion={courseCompletion}
            pendingPayments={pendingPayments.length}
          />
        </div>

        <aside className="space-y-6">
          <section className="rounded-lg border border-line-subtle bg-surface-base p-5 shadow-soft">
            <div>
              <p className="text-xs font-semibold uppercase tracking-normal text-brand-primary">Actividad</p>
              <h2 className="mt-1 text-lg font-semibold text-ink-primary">Reciente</h2>
            </div>
            {recentActivity.length === 0 ? (
              <EmptyState
                icon={Clock3}
                title="Sin actividad todavia"
                description="Cuando existan cursos, productos o pagos, apareceran aqui para lectura rapida."
              />
            ) : (
              <ol className="mt-5 space-y-3">
                {recentActivity.map((activity) => (
                  <li key={activity.id}>
                    <Link href={activity.href} className="flex gap-3 rounded-md p-2 transition hover:bg-surface-muted">
                      <span className={`mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full ${activity.tone === "payment" ? "bg-brand-accent" : activity.tone === "enrollment" ? "bg-semantic-success" : "bg-brand-primary"}`} />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold text-ink-primary">{activity.title}</span>
                        <span className="block truncate text-sm text-ink-secondary">{activity.description}</span>
                      </span>
                      <span className="shrink-0 text-xs text-ink-muted">{formatDateTime(activity.createdAt)}</span>
                    </Link>
                  </li>
                ))}
              </ol>
            )}
          </section>

          <section className="rounded-lg border border-line-subtle bg-surface-base p-5 shadow-soft">
            <div>
              <p className="text-xs font-semibold uppercase tracking-normal text-brand-primary">Accesos rapidos</p>
              <h2 className="mt-1 text-lg font-semibold text-ink-primary">Next recommended action</h2>
            </div>
            <div className="mt-5 grid gap-3">
              {pendingPayments.length > 0 ? (
                <QuickAction href="/admin/pagos" icon={CreditCard} title="Aprobar comprobantes" description="Accion prioritaria para desbloquear acceso." />
              ) : draftCourses > 0 ? (
                <QuickAction href="/admin/cursos" icon={BookOpen} title="Publicar drafts" description="Completa cursos antes de venderlos." />
              ) : (
                <QuickAction href="/onboarding" icon={Rocket} title="Completar checklist" description="Revisa la operacion minima del workspace." />
              )}
            </div>
          </section>
        </aside>
      </section>
    </section>
  );
}

function AnalyticsCommandCenter({
  activeStudents,
  completionRate,
  conversionSignal,
  engagementBars,
  pendingPayments,
  publishedProducts,
  reviewQueueDepth,
  revenue,
  revenueBars
}: {
  activeStudents: number;
  completionRate: number;
  conversionSignal: number;
  engagementBars: number[];
  pendingPayments: number;
  publishedProducts: number;
  reviewQueueDepth: number;
  revenue: string;
  revenueBars: number[];
}) {
  return (
    <section className="overflow-hidden rounded-lg border border-white/10 bg-slate-950 text-white shadow-float">
      <div className="grid gap-px bg-white/10 xl:grid-cols-[1.25fr_0.75fr]">
        <div className="bg-[radial-gradient(circle_at_18%_12%,rgba(20,184,166,0.22),transparent_30%),linear-gradient(145deg,#020617,#0f172a)] p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-normal text-brand-accent">Analytics</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">Command center</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
                Snapshot operativo: combina metricas reales disponibles con tendencias visuales marcadas como estimadas.
              </p>
            </div>
            <span className="inline-flex w-fit items-center gap-2 rounded-md border border-white/10 bg-white/[0.06] px-3 py-1.5 text-xs font-semibold text-slate-200">
              <TrendingUp aria-hidden className="h-4 w-4 text-brand-accent" />
              Operational preview
            </span>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-3">
            <DarkStat label="Revenue aprobado" value={revenue} detail="+18.4% mock trend" />
            <DarkStat label="Alumnos activos" value={activeStudents.toString()} detail="Cohorte estimada" />
            <DarkStat label="Conversion" value={`${conversionSignal}%`} detail="Pagos aprobados" />
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <ChartCard
              bars={revenueBars}
              label="Sales overview"
              meta={`${pendingPayments} pagos por revisar`}
              title="Revenue review queue"
            />
            <ChartCard
              bars={engagementBars}
              label="Engagement"
              meta={`${completionRate}% readiness`}
              title="Content readiness"
            />
          </div>
        </div>

        <aside className="bg-slate-950 p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-md border border-white/10 bg-white/[0.06] text-brand-accent">
              <LineChart aria-hidden className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-normal text-slate-500">Signals</p>
              <h3 className="font-semibold text-white">Platform pulse</h3>
            </div>
          </div>
          <div className="mt-6 space-y-3">
            <SignalRow label="Productos publicados" value={publishedProducts.toString()} tone="good" />
            <SignalRow label="Completion readiness" value={`${completionRate}%`} tone={completionRate > 50 ? "good" : "watch"} />
            <SignalRow label="Revenue review queue" value={pendingPayments.toString()} tone={pendingPayments > 0 ? "watch" : "good"} />
            <SignalRow label="Revision pendiente" value={`${reviewQueueDepth}%`} tone={reviewQueueDepth > 0 ? "watch" : "good"} />
          </div>
        </aside>
      </div>
    </section>
  );
}

function DarkStat({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <article className="rounded-lg border border-white/10 bg-white/[0.06] p-4">
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
      <p className="mt-2 text-xs font-medium text-brand-accent">{detail}</p>
    </article>
  );
}

function ChartCard({ bars, label, meta, title }: { bars: number[]; label: string; meta: string; title: string }) {
  return (
    <article className="rounded-lg border border-white/10 bg-white/[0.05] p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-normal text-brand-accent">{label}</p>
          <h3 className="mt-1 font-semibold text-white">{title}</h3>
        </div>
        <p className="text-xs text-slate-400">{meta}</p>
      </div>
      <div className="mt-5 flex h-32 items-end gap-2">
        {bars.map((bar, index) => (
          <div key={`${title}-${index}`} className="flex flex-1 items-end rounded-t-md bg-white/[0.06]">
            <div
              className="w-full rounded-t-md bg-gradient-to-t from-brand-primary to-brand-accent"
              style={{ height: `${bar}%` }}
            />
          </div>
        ))}
      </div>
    </article>
  );
}

function SignalRow({ label, value, tone }: { label: string; value: string; tone: "good" | "watch" | "neutral" }) {
  const toneClass = tone === "good" ? "bg-emerald-400/10 text-emerald-300" : tone === "watch" ? "bg-amber-400/10 text-amber-300" : "bg-white/10 text-slate-300";

  return (
    <div className="flex items-center justify-between gap-3 rounded-md border border-white/10 bg-white/[0.04] px-3 py-2 text-sm">
      <span className="text-slate-300">{label}</span>
      <span className={`rounded-md px-2 py-1 text-xs font-semibold ${toneClass}`}>{value}</span>
    </div>
  );
}

function InsightsSection({
  contentDepth,
  conversionSignal,
  courseCompletion,
  pendingPayments
}: {
  contentDepth: number;
  conversionSignal: number;
  courseCompletion: number;
  pendingPayments: number;
}) {
  return (
    <section className="rounded-lg border border-line-subtle bg-surface-base p-5 shadow-soft">
      <div>
        <p className="text-xs font-semibold uppercase tracking-normal text-brand-primary">Insights</p>
        <h2 className="mt-1 text-lg font-semibold text-ink-primary">Next recommended action</h2>
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        <InsightCard
          icon={Sparkles}
          title="Profundidad de contenido"
          value={`${contentDepth} lecciones/curso`}
          description="Mantener cada curso con una ruta clara ayuda a sostener engagement."
        />
        <InsightCard
          icon={TrendingUp}
          title="Conversion operativa"
          value={`${conversionSignal}%`}
          description="La tasa sube cuando los comprobantes pendientes se revisan el mismo dia."
        />
        <InsightCard
          icon={BookOpen}
          title="Readiness editorial"
          value={`${courseCompletion}%`}
          description="Publica drafts o completa storefront para mejorar percepcion comercial."
        />
        <InsightCard
          icon={CreditCard}
          title="Queue de pagos"
          value={pendingPayments.toString()}
          description="Los pagos pendientes son la accion de mayor impacto en revenue inmediato."
        />
      </div>
    </section>
  );
}

function InsightCard({ icon: Icon, title, value, description }: { icon: typeof BookOpen; title: string; value: string; description: string }) {
  return (
    <article className="rounded-md border border-line-subtle bg-surface-raised p-4">
      <div className="flex items-start justify-between gap-4">
        <span className="flex h-10 w-10 items-center justify-center rounded-md bg-brand-primary/10 text-brand-primary">
          <Icon aria-hidden className="h-5 w-5" />
        </span>
        <p className="text-lg font-semibold text-ink-primary">{value}</p>
      </div>
      <h3 className="mt-4 font-semibold text-ink-primary">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-ink-secondary">{description}</p>
    </article>
  );
}

function MetricCard({
  icon: Icon,
  href,
  label,
  value,
  detail,
  trend
}: {
  icon: typeof BookOpen;
  href: string;
  label: string;
  value: string;
  detail: string;
  trend: string;
}) {
  return (
    <Link href={href} className="block rounded-lg border border-line-subtle bg-surface-base p-5 shadow-soft transition hover:border-brand-primary/40 hover:bg-surface-muted">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <p className="text-sm font-medium text-ink-muted">{label}</p>
          <p className="text-2xl font-semibold text-ink-primary">{value}</p>
        </div>
        <span className="flex h-10 w-10 items-center justify-center rounded-md bg-brand-primary/10 text-brand-primary">
          <Icon aria-hidden className="h-5 w-5" />
        </span>
      </div>
      <p className="mt-4 text-sm text-ink-secondary">{detail}</p>
      <p className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-brand-primary">
        {trend}
        <ArrowRight aria-hidden className="h-3.5 w-3.5" />
      </p>
    </Link>
  );
}

function StatusPanel({
  icon: Icon,
  title,
  value,
  detail,
  href
}: {
  icon: typeof BookOpen;
  title: string;
  value: string;
  detail: string;
  href: string;
}) {
  return (
    <Link href={href} className="group bg-surface-base p-5 transition hover:bg-surface-muted">
      <span className="flex h-10 w-10 items-center justify-center rounded-md border border-line-subtle bg-surface-raised text-brand-primary">
        <Icon aria-hidden className="h-5 w-5" />
      </span>
      <h3 className="mt-4 font-semibold text-ink-primary">{title}</h3>
      <p className="mt-2 text-sm font-medium text-ink-secondary">{value}</p>
      <p className="mt-1 text-sm text-ink-muted">{detail}</p>
      <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-primary">
        Abrir
        <ArrowRight aria-hidden className="h-4 w-4 transition group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}

function EmptyState({
  icon: Icon,
  title,
  description,
  href,
  action
}: {
  icon: typeof BookOpen;
  title: string;
  description: string;
  href?: string;
  action?: string;
}) {
  return (
    <div className="mt-5 rounded-lg border border-dashed border-line-strong bg-surface-muted p-6">
      <span className="flex h-10 w-10 items-center justify-center rounded-md bg-surface-base text-brand-primary shadow-soft">
        <Icon aria-hidden className="h-5 w-5" />
      </span>
      <h3 className="mt-4 font-semibold text-ink-primary">{title}</h3>
      <p className="mt-2 max-w-md text-sm leading-6 text-ink-secondary">{description}</p>
      {href && action ? (
        <Link href={href} className="mt-4 inline-flex min-h-10 items-center rounded-md bg-brand-primary px-4 py-2 text-sm font-semibold text-white">
          {action}
        </Link>
      ) : null}
    </div>
  );
}

function QuickAction({
  href,
  icon: Icon,
  title,
  description
}: {
  href: string;
  icon: typeof BookOpen;
  title: string;
  description: string;
}) {
  return (
    <Link href={href} className="group flex items-center gap-3 rounded-md border border-line-subtle bg-surface-raised p-3 transition hover:border-brand-primary/40 hover:bg-surface-muted">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-brand-primary/10 text-brand-primary">
        <Icon aria-hidden className="h-5 w-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold text-ink-primary">{title}</span>
        <span className="block truncate text-sm text-ink-muted">{description}</span>
      </span>
      <ArrowRight aria-hidden className="h-4 w-4 shrink-0 text-ink-muted transition group-hover:translate-x-0.5 group-hover:text-brand-primary" />
    </Link>
  );
}
