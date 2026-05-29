import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Circle,
  CreditCard,
  Download,
  ExternalLink,
  FileText,
  Layers3,
  Lock,
  Menu,
  PlayCircle,
  Sparkles,
  Timer,
  XCircle
} from "lucide-react";

import { PaymentProofForm } from "@/components/learning/payment-proof-form";
import { completeCoursePlayerLessonAction, enrollFreeCourseAction } from "@/lib/engines/learning/actions";
import type {
  CoursePlayerExperience,
  CoursePlayerLesson,
  CoursePlayerModule,
  PaymentProofStatus,
  PaymentType
} from "@/lib/engines/learning/types";

type CoursePlayerShellProps = { experience: CoursePlayerExperience };
type IconType = typeof BookOpen;

function lessonTypeLabel(type: CoursePlayerLesson["lessonType"]): string {
  if (type === "pdf") return "PDF";
  if (type === "text") return "Texto";
  return "Video";
}

function formatDuration(minutes: number | null): string {
  if (!minutes) return "Sin duracion";
  return `${minutes} min`;
}

function paymentTypeLabel(type: PaymentType): string {
  if (type === "transfer") return "Transferencia";
  if (type === "dimo") return "DIMO";
  if (type === "mixed") return "Transferencia + DIMO";
  return "Gratis";
}

function proofStatusLabel(status: PaymentProofStatus): string {
  if (status === "approved") return "Aprobado";
  if (status === "rejected") return "Rechazado";
  return "Pendiente de revision";
}

function proofStatusClass(status: PaymentProofStatus): string {
  if (status === "approved") return "bg-emerald-50 text-emerald-700";
  if (status === "rejected") return "bg-rose-50 text-rose-700";
  return "bg-amber-50 text-amber-700";
}

function embedUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("youtube.com")) {
      const id = parsed.searchParams.get("v");
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    if (parsed.hostname.includes("youtu.be")) return `https://www.youtube.com/embed/${parsed.pathname.replace("/", "")}`;
    if (parsed.hostname.includes("vimeo.com")) {
      const id = parsed.pathname.split("/").filter(Boolean).pop();
      return id ? `https://player.vimeo.com/video/${id}` : null;
    }
  } catch {
    return null;
  }
  return null;
}

function lessonHref(courseId: string, lessonId: string): string {
  return `/learn/${courseId}?lesson=${lessonId}`;
}

function LessonMedia({ lesson }: { lesson: CoursePlayerLesson }) {
  const url = lesson.videoUrl;
  if (!url) {
    return (
      <div className="grid aspect-video place-items-center bg-[radial-gradient(circle_at_50%_20%,rgba(20,184,166,0.22),transparent_32%),linear-gradient(135deg,#020617,#0f172a)] p-6 text-white">
        <div className="max-w-sm text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-md border border-white/10 bg-white/[0.06]">
            <BookOpen aria-hidden className="h-7 w-7 text-brand-accent" />
          </span>
          <p className="mt-4 text-sm leading-6 text-slate-300">Area premium lista para video, texto, imagen o PDF.</p>
        </div>
      </div>
    );
  }

  const embedded = embedUrl(url);
  if (embedded) {
    return (
      <iframe
        src={embedded}
        title={lesson.title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="aspect-video w-full bg-black"
      />
    );
  }

  if (lesson.mediaKind === "pdf" || lesson.lessonType === "pdf") {
    return <iframe src={url} title={lesson.title} className="h-[72vh] w-full bg-white" />;
  }

  if (lesson.mediaKind === "image") {
    return (
      <div className="relative aspect-video w-full bg-black">
        <Image src={url} alt="" fill sizes="100vw" className="object-contain" />
      </div>
    );
  }

  if (lesson.mediaKind === "video" || url.includes("bucket=lesson-media")) {
    return <video src={url} controls className="aspect-video w-full bg-black" />;
  }

  return (
    <div className="grid aspect-video place-items-center bg-slate-950 p-6 text-white">
      <div className="max-w-sm text-center">
        <PlayCircle aria-hidden className="mx-auto h-14 w-14 text-brand-accent" />
        <p className="mt-4 text-sm text-slate-300">Media externa configurada</p>
        <a href={url} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-brand-accent">
          Abrir media
          <ExternalLink aria-hidden className="h-4 w-4" />
        </a>
      </div>
    </div>
  );
}

export function CoursePlayerShell({ experience }: CoursePlayerShellProps) {
  const activeLesson = experience.activeLesson;
  const settings = experience.paymentSettings;
  const latestProof = experience.paymentProofs[0] ?? null;
  const canSubmitProof = settings.paymentType !== "free" && latestProof?.status !== "pending";

  if (!experience.hasAccess) {
    return (
      <AccessRequiredView
        experience={experience}
        latestProof={latestProof}
        canSubmitProof={canSubmitProof}
      />
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="grid min-h-screen lg:grid-cols-[360px_1fr]">
        <CourseSidebar experience={experience} activeLesson={activeLesson} />

        <section className="min-w-0 bg-surface-canvas text-ink-primary">
          <PlayerTopbar experience={experience} activeLesson={activeLesson} />
          {activeLesson ? (
            <LessonWorkspace experience={experience} activeLesson={activeLesson} />
          ) : (
            <EmptyLessonState courseId={experience.course.id} />
          )}
        </section>
      </div>
    </main>
  );
}

function AccessRequiredView({
  experience,
  latestProof,
  canSubmitProof
}: {
  experience: CoursePlayerExperience;
  latestProof: CoursePlayerExperience["paymentProofs"][number] | null;
  canSubmitProof: boolean;
}) {
  const settings = experience.paymentSettings;

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <Link href="/mis-productos" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-300 hover:text-white">
          <ArrowLeft aria-hidden className="h-4 w-4" />
          Mis productos
        </Link>

        <section className="mt-8 overflow-hidden rounded-lg border border-white/10 bg-white/[0.06] shadow-float backdrop-blur">
          <div className="grid gap-px bg-white/10 lg:grid-cols-[1fr_420px]">
            <div className="bg-slate-950 p-6 sm:p-8 lg:p-10">
              <span className="flex h-12 w-12 items-center justify-center rounded-md border border-white/10 bg-white/[0.06] text-brand-accent">
                <Lock aria-hidden className="h-6 w-6" />
              </span>
              <p className="mt-8 text-xs font-semibold uppercase tracking-normal text-brand-accent">Acceso requerido</p>
              <h1 className="mt-3 max-w-3xl text-3xl font-semibold leading-tight text-white sm:text-5xl">
                {experience.course.title}
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">
                Este curso requiere acceso activo. Revisa el metodo de pago, envia tu comprobante y el equipo activara tu enrollment.
              </p>

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                <AccessMetric label="Metodo" value={paymentTypeLabel(settings.paymentType)} />
                <AccessMetric label="Comprobante" value={latestProof ? proofStatusLabel(latestProof.status) : "No enviado"} />
                <AccessMetric label="Progreso" value="Bloqueado" />
              </div>

              {latestProof ? (
                <div className="mt-6 rounded-lg border border-white/10 bg-white/[0.05] p-4 text-sm text-slate-300">
                  <span className={`inline-flex rounded-md px-2.5 py-1 text-xs font-semibold ${proofStatusClass(latestProof.status)}`}>
                    {proofStatusLabel(latestProof.status)}
                  </span>
                  <p className="mt-3 leading-6">
                    {latestProof.status === "pending"
                      ? "Tu comprobante esta en revision. Cuando sea aprobado, el acceso se activa automaticamente."
                      : latestProof.status === "rejected"
                        ? "El comprobante fue rechazado. Puedes subir uno nuevo con datos correctos."
                        : "Tu comprobante fue aprobado. Actualiza la pagina si el acceso aun no aparece."}
                  </p>
                </div>
              ) : null}
            </div>

            <aside className="bg-surface-base p-6 text-ink-primary sm:p-8">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-md bg-brand-primary/10 text-brand-primary">
                  <CreditCard aria-hidden className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-normal text-brand-primary">Pago manual</p>
                  <h2 className="font-semibold text-ink-primary">Activa tu acceso</h2>
                </div>
              </div>

              {settings.paymentType === "free" ? (
                <form action={enrollFreeCourseAction} className="mt-6 space-y-4">
                  <input type="hidden" name="courseId" value={experience.course.id} />
                  <p className="text-sm leading-6 text-ink-secondary">
                    Este curso esta configurado como gratis. Activa tu acceso para comenzar ahora.
                  </p>
                  <button type="submit" className="inline-flex min-h-11 w-full items-center justify-center rounded-md bg-brand-primary px-4 py-2 text-sm font-semibold text-white shadow-soft">
                    Activar acceso gratis
                  </button>
                </form>
              ) : (
                <div className="mt-6 space-y-4">
                  {settings.paymentType !== "dimo" ? (
                    <div className="space-y-2 rounded-lg border border-line-subtle bg-surface-muted p-4 text-sm text-ink-secondary">
                      <p className="font-semibold text-ink-primary">Transferencia bancaria</p>
                      {settings.transferBank ? <p>Banco: {settings.transferBank}</p> : null}
                      {settings.transferClabe ? <p>CLABE: {settings.transferClabe}</p> : null}
                      {settings.transferOwner ? <p>Titular: {settings.transferOwner}</p> : null}
                    </div>
                  ) : null}
                  {(settings.paymentType === "dimo" || settings.paymentType === "mixed") && settings.dimoUrl ? (
                    <a href={settings.dimoUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white">
                      Pagar con DIMO
                      <ExternalLink aria-hidden className="h-4 w-4" />
                    </a>
                  ) : null}
                  {settings.paymentNotes ? <p className="whitespace-pre-line text-sm leading-6 text-ink-secondary">{settings.paymentNotes}</p> : null}
                  {canSubmitProof ? <PaymentProofForm courseId={experience.course.id} /> : null}
                </div>
              )}

              <Link href="/mis-productos" className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-md border border-line-subtle bg-surface-base px-4 py-2 text-sm font-semibold text-ink-secondary shadow-soft">
                Ir a mi dashboard
              </Link>
            </aside>
          </div>
        </section>
      </div>
    </main>
  );
}

function AccessMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.05] p-4">
      <p className="text-xs font-semibold uppercase tracking-normal text-slate-500">{label}</p>
      <p className="mt-2 font-semibold text-white">{value}</p>
    </div>
  );
}

function CourseSidebar({
  experience,
  activeLesson
}: {
  experience: CoursePlayerExperience;
  activeLesson: CoursePlayerLesson | null;
}) {
  return (
    <aside className="hidden border-r border-white/10 bg-slate-950 lg:block">
      <div className="sticky top-0 flex h-screen flex-col">
        <SidebarHeader experience={experience} />
        <nav aria-label="Modulos y lecciones" className="min-h-0 flex-1 overflow-y-auto px-3 py-4">
          <ModuleNavigation modules={experience.modules} courseId={experience.course.id} activeLesson={activeLesson} />
        </nav>
        <div className="border-t border-white/10 p-4">
          <Link href="/mis-productos" className="inline-flex min-h-10 w-full items-center justify-center rounded-md border border-white/10 bg-white/[0.06] px-4 py-2 text-sm font-semibold text-slate-200">
            Salir al dashboard
          </Link>
        </div>
      </div>
    </aside>
  );
}

function SidebarHeader({ experience }: { experience: CoursePlayerExperience }) {
  return (
    <div className="border-b border-white/10 p-5">
      <Link href="/mis-productos" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-white">
        <ArrowLeft aria-hidden className="h-4 w-4" />
        Mis productos
      </Link>
      <div className="mt-6">
        <p className="text-xs font-semibold uppercase tracking-normal text-brand-accent">Curso</p>
        <h1 className="mt-2 text-xl font-semibold leading-tight text-white">{experience.course.title}</h1>
      </div>
      <ProgressSummary experience={experience} />
    </div>
  );
}

function ProgressSummary({ experience }: { experience: CoursePlayerExperience }) {
  return (
    <div className="mt-6 rounded-lg border border-white/10 bg-white/[0.05] p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-white">Progreso</p>
        <span className="text-sm font-semibold text-brand-accent">{experience.progress.progressPercentage}%</span>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
        <div className="h-full rounded-full bg-brand-accent" style={{ width: `${experience.progress.progressPercentage}%` }} />
      </div>
      <p className="mt-3 text-xs text-slate-400">
        {experience.progress.completedLessons}/{experience.progress.totalLessons} lecciones completadas
      </p>
    </div>
  );
}

function ModuleNavigation({
  modules,
  courseId,
  activeLesson
}: {
  modules: CoursePlayerModule[];
  courseId: string;
  activeLesson: CoursePlayerLesson | null;
}) {
  if (modules.length === 0) {
    return (
      <div className="rounded-lg border border-white/10 bg-white/[0.05] p-4 text-sm text-slate-300">
        Este curso todavia no tiene modulos.
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {modules.map((module, moduleIndex) => (
        <section key={module.id} className="space-y-2">
          <div className="px-2">
            <p className="text-xs font-semibold uppercase tracking-normal text-slate-500">Modulo {moduleIndex + 1}</p>
            <h2 className="mt-1 text-sm font-semibold text-slate-100">{module.title}</h2>
          </div>
          <div className="space-y-1">
            {module.lessons.length === 0 ? (
              <p className="px-2 py-1 text-xs text-slate-500">Sin lecciones</p>
            ) : (
              module.lessons.map((lesson) => (
                <LessonNavItem
                  key={lesson.id}
                  courseId={courseId}
                  lesson={lesson}
                  isActive={lesson.id === activeLesson?.id}
                />
              ))
            )}
          </div>
        </section>
      ))}
    </div>
  );
}

function LessonNavItem({
  courseId,
  lesson,
  isActive
}: {
  courseId: string;
  lesson: CoursePlayerLesson;
  isActive: boolean;
}) {
  return (
    <Link
      href={lessonHref(courseId, lesson.id)}
      className={`group flex gap-3 rounded-md p-3 text-sm transition ${
        isActive ? "bg-white text-slate-950 shadow-soft" : "text-slate-200 hover:bg-white/10"
      }`}
    >
      {lesson.isCompleted ? (
        <CheckCircle2 aria-hidden className={`mt-0.5 h-4 w-4 shrink-0 ${isActive ? "text-emerald-600" : "text-emerald-400"}`} />
      ) : (
        <Circle aria-hidden className={`mt-0.5 h-4 w-4 shrink-0 ${isActive ? "text-slate-500" : "text-slate-500 group-hover:text-slate-300"}`} />
      )}
      <span className="min-w-0">
        <span className="block truncate font-medium">{lesson.title}</span>
        <span className={`text-xs ${isActive ? "text-slate-500" : "text-slate-500"}`}>
          {lessonTypeLabel(lesson.lessonType)} - {formatDuration(lesson.durationMinutes)}
        </span>
      </span>
    </Link>
  );
}

function PlayerTopbar({
  experience,
  activeLesson
}: {
  experience: CoursePlayerExperience;
  activeLesson: CoursePlayerLesson | null;
}) {
  return (
    <header className="sticky top-0 z-20 border-b border-line-subtle bg-surface-canvas/92 px-4 py-3 backdrop-blur-xl sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
        <div className="min-w-0">
          <div className="hidden items-center gap-2 text-xs font-medium text-ink-muted sm:flex">
            <Link href="/mis-productos" className="hover:text-ink-primary">Mis productos</Link>
            <span>/</span>
            <span className="truncate">{experience.course.title}</span>
          </div>
          <p className="truncate text-sm font-semibold text-ink-primary sm:mt-1">{activeLesson?.title ?? experience.course.title}</p>
        </div>

        <details className="relative lg:hidden">
          <summary className="flex h-10 w-10 cursor-pointer list-none items-center justify-center rounded-md border border-line-subtle bg-surface-base text-ink-secondary shadow-soft">
            <Menu aria-hidden className="h-4 w-4" />
          </summary>
          <div className="absolute right-0 top-12 z-30 max-h-[70vh] w-[min(24rem,calc(100vw-2rem))] overflow-y-auto rounded-lg border border-line-subtle bg-slate-950 p-3 text-white shadow-float">
            <SidebarHeader experience={experience} />
            <div className="mt-4">
              <ModuleNavigation modules={experience.modules} courseId={experience.course.id} activeLesson={activeLesson} />
            </div>
          </div>
        </details>
      </div>
    </header>
  );
}

function LessonWorkspace({
  experience,
  activeLesson
}: {
  experience: CoursePlayerExperience;
  activeLesson: CoursePlayerLesson;
}) {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
      <section className="overflow-hidden rounded-lg border border-line-subtle bg-slate-950 shadow-float">
        <LessonMedia lesson={activeLesson} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_320px]">
        <article className="space-y-6">
          <LessonHeader experience={experience} activeLesson={activeLesson} />
          <LessonContent lesson={activeLesson} />
          <ResourcePanel lesson={activeLesson} />
          <LessonPager experience={experience} />
        </article>

        <aside className="space-y-4 xl:sticky xl:top-24 xl:self-start">
          <CompletionCard experience={experience} activeLesson={activeLesson} />
          <StudyCard />
        </aside>
      </section>
    </div>
  );
}

function LessonHeader({
  experience,
  activeLesson
}: {
  experience: CoursePlayerExperience;
  activeLesson: CoursePlayerLesson;
}) {
  return (
    <section className="rounded-lg border border-line-subtle bg-surface-base p-5 shadow-soft sm:p-6">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-normal text-brand-primary">{lessonTypeLabel(activeLesson.lessonType)}</p>
          <h2 className="mt-2 text-2xl font-semibold leading-tight text-ink-primary sm:text-3xl">{activeLesson.title}</h2>
          <div className="mt-4 flex flex-wrap gap-2 text-xs font-medium text-ink-secondary">
            <MetaPill icon={Timer} label={formatDuration(activeLesson.durationMinutes)} />
            <MetaPill icon={Sparkles} label={activeLesson.status === "published" ? "Publicado" : "Draft"} />
            <MetaPill icon={activeLesson.isCompleted ? CheckCircle2 : Circle} label={activeLesson.isCompleted ? "Completada" : "Pendiente"} />
          </div>
        </div>
        <div className="shrink-0 rounded-lg border border-line-subtle bg-surface-muted p-3 text-sm">
          <p className="font-semibold text-ink-primary">{experience.progress.progressPercentage}% del curso</p>
          <p className="mt-1 text-ink-muted">{experience.progress.completedLessons}/{experience.progress.totalLessons} lecciones</p>
        </div>
      </div>
    </section>
  );
}

function MetaPill({ icon: Icon, label }: { icon: IconType; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md bg-surface-muted px-2.5 py-1">
      <Icon aria-hidden className="h-3.5 w-3.5 text-brand-primary" />
      {label}
    </span>
  );
}

function LessonContent({ lesson }: { lesson: CoursePlayerLesson }) {
  return (
    <section className="rounded-lg border border-line-subtle bg-surface-base p-5 shadow-soft sm:p-6">
      <div className="flex items-center gap-2 text-ink-primary">
        <FileText aria-hidden className="h-5 w-5 text-brand-primary" />
        <h3 className="font-semibold">Contenido de la leccion</h3>
      </div>
      {lesson.description ? (
        <p className="mt-4 whitespace-pre-line text-sm leading-7 text-ink-secondary">{lesson.description}</p>
      ) : (
        <div className="mt-4 rounded-lg border border-dashed border-line-strong bg-surface-muted p-5">
          <p className="text-sm leading-6 text-ink-secondary">
            Esta leccion ya esta disponible en la estructura del curso. Puedes usar este espacio para notas, resumen o contenido escrito.
          </p>
        </div>
      )}
    </section>
  );
}

function ResourcePanel({ lesson }: { lesson: CoursePlayerLesson }) {
  return (
    <section className="rounded-lg border border-line-subtle bg-surface-base p-5 shadow-soft sm:p-6">
      <div className="flex items-center gap-2 text-ink-primary">
        <Download aria-hidden className="h-5 w-5 text-brand-primary" />
        <h3 className="font-semibold">Recursos descargables</h3>
      </div>
      {lesson.resources.length === 0 ? (
        <div className="mt-4 rounded-lg border border-dashed border-line-strong bg-surface-muted p-5">
          <p className="text-sm text-ink-secondary">Esta leccion no tiene recursos descargables todavia.</p>
        </div>
      ) : (
        <ul className="mt-4 grid gap-2">
          {lesson.resources.map((resource) => (
            <li key={resource.id}>
              <a
                href={resource.fileUrl}
                target="_blank"
                rel="noreferrer"
                className="flex min-h-11 items-center justify-between gap-4 rounded-md border border-line-subtle bg-surface-raised px-3 py-2 text-sm font-medium text-ink-secondary transition hover:border-brand-primary/40 hover:text-ink-primary"
              >
                {resource.title}
                <Download aria-hidden className="h-4 w-4 shrink-0" />
              </a>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function CompletionCard({
  experience,
  activeLesson
}: {
  experience: CoursePlayerExperience;
  activeLesson: CoursePlayerLesson;
}) {
  return (
    <section className="rounded-lg border border-line-subtle bg-surface-base p-5 shadow-soft">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-md bg-brand-primary/10 text-brand-primary">
          {activeLesson.isCompleted ? <CheckCircle2 aria-hidden className="h-5 w-5" /> : <Circle aria-hidden className="h-5 w-5" />}
        </span>
        <div>
          <p className="text-sm font-semibold text-ink-primary">{activeLesson.isCompleted ? "Leccion completada" : "Marca tu avance"}</p>
          <p className="text-xs text-ink-muted">Tu progreso se guarda en Supabase.</p>
        </div>
      </div>
      <form action={completeCoursePlayerLessonAction} className="mt-5">
        <input type="hidden" name="courseId" value={experience.course.id} />
        <input type="hidden" name="lessonId" value={activeLesson.id} />
        <button type="submit" className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md bg-brand-primary px-4 py-2 text-sm font-semibold text-white shadow-soft">
          <CheckCircle2 aria-hidden className="h-4 w-4" />
          {activeLesson.isCompleted ? "Guardar completado" : "Marcar completada"}
        </button>
      </form>
    </section>
  );
}

function StudyCard() {
  return (
    <section className="rounded-lg border border-line-subtle bg-surface-base p-5 shadow-soft">
      <div className="flex items-center gap-2">
        <Layers3 aria-hidden className="h-5 w-5 text-brand-primary" />
        <h3 className="font-semibold text-ink-primary">Modo enfoque</h3>
      </div>
      <p className="mt-3 text-sm leading-6 text-ink-secondary">
        Mira la leccion, descarga recursos y avanza desde la navegacion fija sin perder el hilo del curso.
      </p>
    </section>
  );
}

function LessonPager({ experience }: { experience: CoursePlayerExperience }) {
  return (
    <div className="sticky bottom-3 z-10 flex flex-col gap-3 rounded-lg border border-line-subtle bg-surface-base/95 p-3 shadow-float backdrop-blur sm:flex-row sm:items-center sm:justify-between">
      {experience.previousLessonId ? (
        <Link href={lessonHref(experience.course.id, experience.previousLessonId)} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-line-subtle bg-surface-base px-4 py-2 text-sm font-semibold text-ink-secondary">
          <ChevronLeft aria-hidden className="h-4 w-4" />
          Anterior
        </Link>
      ) : (
        <span className="hidden sm:block" />
      )}
      {experience.nextLessonId ? (
        <Link href={lessonHref(experience.course.id, experience.nextLessonId)} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white">
          Siguiente leccion
          <ChevronRight aria-hidden className="h-4 w-4" />
        </Link>
      ) : (
        <span className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">
          <CheckCircle2 aria-hidden className="h-4 w-4" />
          Ultima leccion
        </span>
      )}
    </div>
  );
}

function EmptyLessonState({ courseId }: { courseId: string }) {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="rounded-lg border border-dashed border-line-strong bg-surface-base p-8 text-center shadow-soft">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-md bg-brand-primary/10 text-brand-primary">
          <XCircle aria-hidden className="h-6 w-6" />
        </span>
        <h2 className="mt-5 text-xl font-semibold text-ink-primary">Este curso todavia no tiene lecciones disponibles.</h2>
        <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-ink-secondary">
          Cuando el contenido este publicado, el player mostrara modulos, lecciones, recursos y progreso aqui.
        </p>
        <Link href={`/learn/${courseId}`} className="mt-5 inline-flex min-h-10 items-center rounded-md border border-line-subtle px-4 py-2 text-sm font-semibold text-ink-secondary">
          Actualizar player
        </Link>
      </div>
    </div>
  );
}
