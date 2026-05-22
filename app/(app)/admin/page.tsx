import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock3,
  CreditCard,
  GraduationCap,
  Layers3,
  Package,
  Sparkles,
  Users
} from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { listOwnedCourseSummaries } from "@/lib/courses/repository";
import { requireAdmin } from "@/lib/engines/auth/helpers";
import { listStudentProfiles } from "@/lib/engines/auth/repository";
import { formatMxn } from "@/lib/engines/catalog/helpers";
import { listAdminProducts } from "@/lib/engines/catalog/service";
import { listPaymentsForAdmin } from "@/lib/engines/commerce/service";

type DashboardActivity = {
  id: string;
  title: string;
  description: string;
  href: string;
  createdAt: string;
  tone: "course" | "payment" | "product";
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

export default async function AdminPage() {
  const auth = await requireAdmin();
  const [courses, products, payments, students] = await Promise.all([
    listOwnedCourseSummaries(auth.user.id),
    listAdminProducts(),
    listPaymentsForAdmin(),
    listStudentProfiles()
  ]);

  const publishedCourses = courses.filter((course) => course.isPublished);
  const draftCourses = courses.length - publishedCourses.length;
  const pendingPayments = payments.filter((payment) => payment.status === "pending_review");
  const approvedPayments = payments.filter((payment) => payment.status === "approved");
  const revenueMxnCents = approvedPayments.reduce((total, payment) => total + payment.order.totalMxnCents, 0);
  const totalModules = courses.reduce((total, course) => total + course.moduleCount, 0);
  const totalLessons = courses.reduce((total, course) => total + course.lessonCount, 0);

  const recentActivity: DashboardActivity[] = [
    ...courses.slice(0, 4).map((course) => ({
      id: `course-${course.id}`,
      title: course.title,
      description: `${course.isPublished ? "Publicado" : "Draft"} - ${pluralize(course.lessonCount, "leccion", "lecciones")}`,
      href: `/admin/cursos/${course.id}`,
      createdAt: course.updatedAt,
      tone: "course" as const
    })),
    ...payments.slice(0, 4).map((payment) => ({
      id: `payment-${payment.id}`,
      title: payment.order.product?.title ?? "Pago manual",
      description: `${payment.status} - ${payment.order.student?.email ?? "Alumno sin perfil"}`,
      href: "/admin/pagos",
      createdAt: payment.updatedAt,
      tone: "payment" as const
    })),
    ...products.slice(0, 3).map((product) => ({
      id: `product-${product.id}`,
      title: product.title,
      description: `${product.isPublished ? "Publicado" : "Draft"} - ${formatMxn(product.priceMxnCents)}`,
      href: `/admin/productos/${product.id}`,
      createdAt: product.updatedAt,
      tone: "product" as const
    }))
  ]
    .toSorted((first, second) => new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime())
    .slice(0, 6);

  const courseCompletion = courses.length > 0 ? Math.round((publishedCourses.length / courses.length) * 100) : 0;
  const pendingPaymentRatio = payments.length > 0 ? Math.round((pendingPayments.length / payments.length) * 100) : 0;

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

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon={BookOpen}
          label="Cursos"
          value={courses.length.toString()}
          detail={`${publishedCourses.length} publicados - ${draftCourses} drafts`}
          trend={`${courseCompletion}% publicados`}
        />
        <MetricCard
          icon={Users}
          label="Alumnos"
          value={students.length.toString()}
          detail="Perfiles student disponibles"
          trend="Acceso y enrollments"
        />
        <MetricCard
          icon={CreditCard}
          label="Pagos pendientes"
          value={pendingPayments.length.toString()}
          detail={`${payments.length} comprobantes totales`}
          trend={`${pendingPaymentRatio}% por revisar`}
        />
        <MetricCard
          icon={Sparkles}
          label="Ingresos aprobados"
          value={formatMxn(revenueMxnCents)}
          detail={`${approvedPayments.length} pagos aprobados`}
          trend="Manual LATAM"
        />
      </section>

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
                      <span className={`mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full ${activity.tone === "payment" ? "bg-brand-accent" : activity.tone === "product" ? "bg-semantic-warning" : "bg-brand-primary"}`} />
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
              <h2 className="mt-1 text-lg font-semibold text-ink-primary">Siguiente accion</h2>
            </div>
            <div className="mt-5 grid gap-3">
              <QuickAction href="/admin/cursos" icon={BookOpen} title="Crear o editar cursos" description="Contenido, media y alumnos." />
              <QuickAction href="/admin/pagos" icon={CreditCard} title="Aprobar comprobantes" description="Validacion manual de pagos." />
              <QuickAction href="/admin/productos" icon={Package} title="Gestionar catalogo" description="Productos legacy y precios." />
              <QuickAction href="/mis-productos" icon={GraduationCap} title="Ver experiencia alumno" description="Validar acceso como estudiante." />
            </div>
          </section>
        </aside>
      </section>
    </section>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  detail,
  trend
}: {
  icon: typeof BookOpen;
  label: string;
  value: string;
  detail: string;
  trend: string;
}) {
  return (
    <article className="rounded-lg border border-line-subtle bg-surface-base p-5 shadow-soft">
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
      <p className="mt-2 text-xs font-medium text-brand-primary">{trend}</p>
    </article>
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
