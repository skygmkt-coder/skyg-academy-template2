import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock3,
  CreditCard,
  GraduationCap,
  PlayCircle,
  RotateCcw,
  Sparkles,
  UserRound
} from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { requireUser } from "@/lib/engines/auth/helpers";
import { listPaymentsForStudent } from "@/lib/engines/commerce/service";
import type { StudentPayment } from "@/lib/engines/commerce/types";
import { listStudentProducts } from "@/lib/engines/learning/service";
import type { StudentProductAccess } from "@/lib/engines/learning/types";

function continueHref(item: StudentProductAccess): string {
  return item.progress.lastViewedLessonSlug
    ? `/learn/${item.product.id}?lessonSlug=${item.progress.lastViewedLessonSlug}`
    : `/learn/${item.product.id}`;
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "short"
  }).format(new Date(value));
}

function paymentStatusLabel(status: StudentPayment["status"]): string {
  if (status === "approved") return "Aprobado";
  if (status === "rejected") return "Rechazado";
  return "En revision";
}

function paymentStatusClass(status: StudentPayment["status"]): string {
  if (status === "approved") return "bg-emerald-50 text-emerald-700";
  if (status === "rejected") return "bg-rose-50 text-rose-700";
  return "bg-amber-50 text-amber-700";
}

export default async function MyProductsPage() {
  const auth = await requireUser();
  const [products, payments] = await Promise.all([
    listStudentProducts(auth),
    listPaymentsForStudent(auth.user.id)
  ]);

  const activeProducts = products.filter(({ progress }) => progress.progressPercentage < 100);
  const completedProducts = products.length - activeProducts.length;
  const totalLessons = products.reduce((total, item) => total + item.progress.totalLessons, 0);
  const completedLessons = products.reduce((total, item) => total + item.progress.completedLessons, 0);
  const averageProgress = products.length > 0
    ? Math.round(products.reduce((total, item) => total + item.progress.progressPercentage, 0) / products.length)
    : 0;
  const continueProduct = activeProducts.find(({ progress }) => progress.progressPercentage > 0) ?? activeProducts[0] ?? products[0] ?? null;
  const pendingPayments = payments.filter((payment) => payment.status === "pending_review");
  const rejectedPayments = payments.filter((payment) => payment.status === "rejected");

  return (
    <section className="space-y-8">
      <PageHeader
        eyebrow="Cuenta"
        title="Mi aprendizaje"
        description={`Hola${auth.profile.fullName ? `, ${auth.profile.fullName}` : ""}. Tu espacio para continuar cursos, revisar progreso y mantener tus accesos al dia.`}
      />

      <section className="rounded-lg border border-line-subtle bg-surface-base p-5 shadow-soft">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-brand-primary/10 text-brand-primary">
              <UserRound aria-hidden className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-normal text-brand-primary">Perfil</p>
              <h2 className="mt-1 text-lg font-semibold text-ink-primary">Datos del alumno</h2>
              <p className="mt-1 text-sm leading-6 text-ink-secondary">
                Edicion de perfil pendiente de conectar a persistencia. Los campos actuales son solo lectura.
              </p>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:w-[34rem]">
            <ReadOnlyField label="Nombre" value={auth.profile.fullName ?? "Sin nombre"} />
            <ReadOnlyField label="Email" value={auth.profile.email} />
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.45fr_0.9fr]">
        <ContinueLearningCard item={continueProduct} />
        <LearningPulse
          courseCount={products.length}
          activeCount={activeProducts.length}
          completedCount={completedProducts}
          completedLessons={completedLessons}
          totalLessons={totalLessons}
          averageProgress={averageProgress}
        />
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <StudentMetric icon={GraduationCap} label="Cursos inscritos" value={products.length.toString()} detail={`${activeProducts.length} activos`} />
        <StudentMetric icon={CheckCircle2} label="Lecciones completas" value={`${completedLessons}/${totalLessons}`} detail={`${averageProgress}% avance promedio`} />
        <StudentMetric icon={CreditCard} label="Pagos en revision" value={pendingPayments.length.toString()} detail={rejectedPayments.length > 0 ? `${rejectedPayments.length} requieren accion` : "Accesos al dia"} />
      </section>

      <section className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-normal text-brand-primary">Cursos</p>
            <h2 className="mt-1 text-xl font-semibold text-ink-primary">Tus cursos inscritos</h2>
          </div>
          <Link href="/cursos" className="inline-flex min-h-10 w-fit items-center gap-2 rounded-md border border-line-subtle bg-surface-base px-4 py-2 text-sm font-semibold text-ink-secondary shadow-soft">
            Explorar catalogo
            <ArrowRight aria-hidden className="h-4 w-4" />
          </Link>
        </div>

        {products.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="Aun no tienes cursos activos"
            description="Cuando tu enrollment sea aprobado, tus cursos apareceran aqui con progreso, acceso rapido y pagos relacionados."
            actionHref="/cursos"
            actionLabel="Ver cursos"
          />
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {products.map((item) => (
              <CourseCard key={item.product.id} item={item} />
            ))}
          </div>
        )}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
        <section className="rounded-lg border border-line-subtle bg-surface-base p-5 shadow-soft">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-normal text-brand-primary">Pagos</p>
              <h2 className="mt-1 text-lg font-semibold text-ink-primary">Estado de accesos</h2>
            </div>
            <span className="rounded-md border border-line-subtle bg-surface-muted px-3 py-1.5 text-xs font-medium text-ink-secondary">
              {payments.length} registros
            </span>
          </div>

          {payments.length === 0 ? (
            <EmptyState
              icon={CreditCard}
              title="Sin pagos registrados"
              description="Los comprobantes y revisiones de pago apareceran aqui cuando solicites acceso a un curso de pago."
            />
          ) : (
            <div className="mt-5 grid gap-3">
              {payments.slice(0, 5).map((payment) => (
                <PaymentRow key={payment.id} payment={payment} />
              ))}
            </div>
          )}
        </section>

        <section className="rounded-lg border border-line-subtle bg-surface-base p-5 shadow-soft">
          <div>
            <p className="text-xs font-semibold uppercase tracking-normal text-brand-primary">Siguiente paso</p>
            <h2 className="mt-1 text-lg font-semibold text-ink-primary">Ritmo de estudio</h2>
          </div>
          <div className="mt-5 space-y-4">
            <Insight icon={Clock3} title="Avance constante" description={products.length > 0 ? "Continua una leccion corta y mantén el curso activo en tu semana." : "Inscribete a un curso para activar tu tablero de progreso."} />
            <Insight icon={Sparkles} title="Contenido disponible" description={`${totalLessons} lecciones listas en tus cursos actuales.`} />
            <Insight icon={RotateCcw} title="Retoma rapido" description="El boton de continuar te lleva a tu ultima leccion vista cuando existe progreso previo." />
          </div>
        </section>
      </section>
    </section>
  );
}

function ContinueLearningCard({ item }: { item: StudentProductAccess | null }) {
  if (!item) {
    return (
      <section className="overflow-hidden rounded-lg border border-line-subtle bg-surface-base shadow-soft">
        <div className="grid min-h-72 place-items-center bg-surface-muted p-6">
          <div className="max-w-md text-center">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-md bg-surface-base text-brand-primary shadow-soft">
              <PlayCircle aria-hidden className="h-6 w-6" />
            </span>
            <h2 className="mt-5 text-xl font-semibold text-ink-primary">Tu proximo curso empieza aqui</h2>
            <p className="mt-2 text-sm leading-6 text-ink-secondary">
              Cuando tengas un enrollment activo, mostraremos tu curso principal y el acceso directo para continuar.
            </p>
            <Link href="/cursos" className="mt-5 inline-flex min-h-10 items-center rounded-md bg-brand-primary px-4 py-2 text-sm font-semibold text-white">
              Explorar cursos
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="overflow-hidden rounded-lg border border-line-subtle bg-surface-base shadow-soft">
      <div className="grid min-h-72 md:grid-cols-[0.92fr_1fr]">
        <div className="relative min-h-56 bg-surface-muted md:min-h-full">
          {item.product.coverImageUrl ? (
            <Image src={item.product.coverImageUrl} alt="" fill sizes="(min-width: 1024px) 42vw, 100vw" className="object-cover" priority />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-surface-muted">
              <BookOpen aria-hidden className="h-14 w-14 text-brand-primary/40" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/45 via-transparent to-transparent" />
        </div>
        <div className="flex flex-col justify-between gap-8 p-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-normal text-brand-primary">Continua aprendiendo</p>
            <h2 className="mt-2 text-2xl font-semibold text-ink-primary">{item.product.title}</h2>
            {item.product.subtitle ? <p className="mt-2 text-sm leading-6 text-ink-secondary">{item.product.subtitle}</p> : null}
          </div>
          <div className="space-y-4">
            <ProgressBar value={item.progress.progressPercentage} />
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-ink-secondary">
                {item.progress.completedLessons} de {item.progress.totalLessons} lecciones completas
              </p>
              <Link href={continueHref(item)} className="inline-flex min-h-10 w-fit items-center gap-2 rounded-md bg-brand-primary px-4 py-2 text-sm font-semibold text-white">
                Continuar
                <ArrowRight aria-hidden className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function LearningPulse({
  courseCount,
  activeCount,
  completedCount,
  completedLessons,
  totalLessons,
  averageProgress
}: {
  courseCount: number;
  activeCount: number;
  completedCount: number;
  completedLessons: number;
  totalLessons: number;
  averageProgress: number;
}) {
  return (
    <section className="rounded-lg border border-line-subtle bg-surface-base p-5 shadow-soft">
      <div>
        <p className="text-xs font-semibold uppercase tracking-normal text-brand-primary">Resumen</p>
        <h2 className="mt-1 text-lg font-semibold text-ink-primary">Tu progreso</h2>
      </div>
      <div className="mt-6 flex items-center gap-5">
        <div className="grid h-28 w-28 shrink-0 place-items-center rounded-full border border-line-subtle bg-surface-muted">
          <div className="text-center">
            <p className="text-2xl font-semibold text-ink-primary">{averageProgress}%</p>
            <p className="text-xs text-ink-muted">promedio</p>
          </div>
        </div>
        <div className="min-w-0 flex-1 space-y-3 text-sm">
          <PulseLine label="Cursos activos" value={`${activeCount}/${courseCount}`} />
          <PulseLine label="Cursos completos" value={completedCount.toString()} />
          <PulseLine label="Lecciones" value={`${completedLessons}/${totalLessons}`} />
        </div>
      </div>
    </section>
  );
}

function CourseCard({ item }: { item: StudentProductAccess }) {
  return (
    <article className="overflow-hidden rounded-lg border border-line-subtle bg-surface-base shadow-soft">
      <div className="relative aspect-[16/9] bg-surface-muted">
        {item.product.coverImageUrl ? (
          <Image src={item.product.coverImageUrl} alt="" fill sizes="(min-width: 1024px) 38vw, 100vw" className="object-cover" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <BookOpen aria-hidden className="h-12 w-12 text-brand-primary/40" />
          </div>
        )}
        <span className="absolute left-4 top-4 rounded-md bg-surface-base/90 px-2.5 py-1 text-xs font-semibold text-ink-secondary shadow-soft">
          {item.progress.progressPercentage}% completado
        </span>
      </div>
      <div className="space-y-4 p-5">
        <div>
          <h3 className="text-lg font-semibold text-ink-primary">{item.product.title}</h3>
          {item.product.subtitle ? <p className="mt-1 text-sm leading-6 text-ink-secondary">{item.product.subtitle}</p> : null}
        </div>
        <ProgressBar value={item.progress.progressPercentage} />
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-ink-muted">
            Inscrito {formatDate(item.enrollment.enrolledAt)}
          </p>
          <Link href={continueHref(item)} className="inline-flex min-h-10 w-fit items-center gap-2 rounded-md bg-brand-primary px-4 py-2 text-sm font-semibold text-white">
            Continuar
            <ArrowRight aria-hidden className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </article>
  );
}

function PaymentRow({ payment }: { payment: StudentPayment }) {
  return (
    <article className="rounded-md border border-line-subtle bg-surface-raised p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="truncate font-semibold text-ink-primary">{payment.order.product?.title ?? payment.order.productId}</p>
          <p className="mt-1 text-sm text-ink-secondary">{payment.method} - {formatDate(payment.createdAt)}</p>
          {payment.rejectionReason ? <p className="mt-2 text-sm text-semantic-danger">{payment.rejectionReason}</p> : null}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className={`rounded-md px-2.5 py-1 text-xs font-semibold ${paymentStatusClass(payment.status)}`}>
            {paymentStatusLabel(payment.status)}
          </span>
          {payment.status === "rejected" && payment.order.product ? (
            <Link href={`/checkout/${payment.order.product.slug}`} className="inline-flex min-h-9 items-center gap-1 rounded-md border border-line-subtle bg-surface-base px-3 py-2 text-sm font-semibold text-ink-secondary">
              Reintentar
              <ArrowRight aria-hidden className="h-4 w-4" />
            </Link>
          ) : null}
        </div>
      </div>
    </article>
  );
}

function StudentMetric({ icon: Icon, label, value, detail }: { icon: typeof BookOpen; label: string; value: string; detail: string }) {
  return (
    <article className="rounded-lg border border-line-subtle bg-surface-base p-5 shadow-soft">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-ink-muted">{label}</p>
          <p className="mt-1 text-2xl font-semibold text-ink-primary">{value}</p>
        </div>
        <span className="flex h-10 w-10 items-center justify-center rounded-md bg-brand-primary/10 text-brand-primary">
          <Icon aria-hidden className="h-5 w-5" />
        </span>
      </div>
      <p className="mt-4 text-sm text-ink-secondary">{detail}</p>
    </article>
  );
}

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <label className="block space-y-2 text-sm font-semibold text-ink-primary">
      {label}
      <input
        value={value}
        disabled
        readOnly
        className="min-h-10 w-full rounded-md border border-line-subtle bg-surface-muted px-3 py-2 text-sm font-medium text-ink-secondary"
      />
    </label>
  );
}

function ProgressBar({ value }: { value: number }) {
  return (
    <div>
      <div className="h-2 overflow-hidden rounded-full bg-surface-muted">
        <div className="h-full rounded-full bg-brand-primary" style={{ width: `${value}%` }} />
      </div>
      <p className="mt-2 text-xs font-medium text-ink-muted">{value}% completado</p>
    </div>
  );
}

function PulseLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-md bg-surface-muted px-3 py-2">
      <span className="text-ink-secondary">{label}</span>
      <span className="font-semibold text-ink-primary">{value}</span>
    </div>
  );
}

function Insight({ icon: Icon, title, description }: { icon: typeof BookOpen; title: string; description: string }) {
  return (
    <div className="flex gap-3 rounded-md border border-line-subtle bg-surface-raised p-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-brand-primary/10 text-brand-primary">
        <Icon aria-hidden className="h-4 w-4" />
      </span>
      <div>
        <h3 className="text-sm font-semibold text-ink-primary">{title}</h3>
        <p className="mt-1 text-sm leading-6 text-ink-secondary">{description}</p>
      </div>
    </div>
  );
}

function EmptyState({
  icon: Icon,
  title,
  description,
  actionHref,
  actionLabel
}: {
  icon: typeof BookOpen;
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div className="rounded-lg border border-dashed border-line-strong bg-surface-base p-8 shadow-soft">
      <span className="flex h-11 w-11 items-center justify-center rounded-md bg-brand-primary/10 text-brand-primary">
        <Icon aria-hidden className="h-5 w-5" />
      </span>
      <h3 className="mt-4 text-lg font-semibold text-ink-primary">{title}</h3>
      <p className="mt-2 max-w-xl text-sm leading-6 text-ink-secondary">{description}</p>
      {actionHref && actionLabel ? (
        <Link href={actionHref} className="mt-5 inline-flex min-h-10 items-center rounded-md bg-brand-primary px-4 py-2 text-sm font-semibold text-white">
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}
