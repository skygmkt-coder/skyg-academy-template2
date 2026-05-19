import Link from "next/link";
import { BookOpen, CheckCircle2, ChevronLeft, ChevronRight, Circle, CreditCard, Download, ExternalLink, FileText, Lock, Menu, PlayCircle } from "lucide-react";

import { PaymentProofForm } from "@/components/learning/payment-proof-form";
import { completeCoursePlayerLessonAction, enrollFreeCourseAction } from "@/lib/engines/learning/actions";
import type { CoursePlayerExperience, CoursePlayerLesson, PaymentProofStatus, PaymentType } from "@/lib/engines/learning/types";

type CoursePlayerShellProps = { experience: CoursePlayerExperience };

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

function LessonMedia({ lesson }: { lesson: CoursePlayerLesson }) {
  const url = lesson.videoUrl;
  if (!url) {
    return (
      <div className="flex aspect-video items-center justify-center bg-black p-6 text-white">
        <div className="space-y-3 text-center"><BookOpen aria-hidden className="mx-auto h-12 w-12 text-slate-500" /><p className="text-sm text-slate-300">Area de player lista para video, texto o PDF.</p></div>
      </div>
    );
  }

  const embedded = embedUrl(url);
  if (embedded) {
    return <iframe src={embedded} title={lesson.title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="aspect-video w-full bg-black" />;
  }

  if (lesson.mediaKind === "pdf" || lesson.lessonType === "pdf") {
    return <iframe src={url} title={lesson.title} className="h-[70vh] w-full bg-white" />;
  }

  if (lesson.mediaKind === "image") {
    return <img src={url} alt="" className="aspect-video w-full object-contain bg-black" />;
  }

  if (lesson.mediaKind === "video" || url.includes("bucket=lesson-media")) {
    return <video src={url} controls className="aspect-video w-full bg-black" />;
  }

  return (
    <div className="flex aspect-video items-center justify-center bg-black p-6 text-white">
      <div className="space-y-3 text-center"><PlayCircle aria-hidden className="mx-auto h-12 w-12 text-brand-accent" /><p className="text-sm text-slate-300">Video configurado</p><a href={url} target="_blank" rel="noreferrer" className="text-sm font-semibold text-brand-accent">Abrir media</a></div>
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
      <section className="rounded-lg border border-slate-200 bg-white p-5 md:p-8">
        <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[1fr_360px] lg:items-start">
          <div className="space-y-5">
            <span className="flex h-12 w-12 items-center justify-center rounded-md bg-brand-primary/10 text-brand-primary"><Lock aria-hidden className="h-6 w-6" /></span>
            <div><p className="text-sm font-medium uppercase tracking-normal text-brand-primary">Acceso requerido</p><h1 className="mt-2 text-2xl font-semibold text-slate-950">{experience.course.title}</h1><p className="mt-3 text-sm leading-6 text-slate-600">Este curso requiere acceso activo. Revisa las instrucciones de pago y envia tu comprobante para que el equipo lo valide.</p></div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-md border border-slate-200 bg-slate-50 p-4"><p className="text-xs font-medium uppercase tracking-normal text-slate-500">Metodo</p><p className="mt-1 font-semibold text-slate-950">{paymentTypeLabel(settings.paymentType)}</p></div>
              <div className="rounded-md border border-slate-200 bg-slate-50 p-4"><p className="text-xs font-medium uppercase tracking-normal text-slate-500">Comprobante</p><p className="mt-1 font-semibold text-slate-950">{latestProof ? proofStatusLabel(latestProof.status) : "No enviado"}</p></div>
              <div className="rounded-md border border-slate-200 bg-slate-50 p-4"><p className="text-xs font-medium uppercase tracking-normal text-slate-500">Progreso</p><p className="mt-1 font-semibold text-slate-950">Bloqueado</p></div>
            </div>
            {latestProof ? <div className="rounded-md border border-slate-200 bg-white p-4 text-sm text-slate-700"><span className={`inline-flex rounded-md px-2 py-1 text-xs font-semibold ${proofStatusClass(latestProof.status)}`}>{proofStatusLabel(latestProof.status)}</span><p className="mt-2">{latestProof.status === "pending" ? "Tu comprobante esta en revision. Cuando sea aprobado, el acceso se activa automaticamente." : latestProof.status === "rejected" ? "El comprobante fue rechazado. Puedes subir uno nuevo con datos correctos." : "Tu comprobante fue aprobado. Actualiza la pagina si el acceso aun no aparece."}</p></div> : null}
          </div>
          <aside className="space-y-4 rounded-lg border border-slate-200 bg-slate-50 p-5">
            <div className="flex items-center gap-2 text-slate-950"><CreditCard aria-hidden className="h-5 w-5 text-brand-primary" /><h2 className="font-semibold">Pago manual</h2></div>
            {settings.paymentType === "free" ? (
              <form action={enrollFreeCourseAction} className="space-y-3"><input type="hidden" name="courseId" value={experience.course.id} /><p className="text-sm leading-6 text-slate-600">Este curso esta configurado como gratis. Activa tu acceso para comenzar.</p><button type="submit" className="inline-flex min-h-11 w-full items-center justify-center rounded-md bg-brand-primary px-4 py-2 text-sm font-semibold text-white">Activar acceso gratis</button></form>
            ) : (
              <div className="space-y-4">
                {settings.paymentType !== "dimo" ? <div className="space-y-2 rounded-md border border-slate-200 bg-white p-4 text-sm text-slate-700"><p className="font-semibold text-slate-950">Transferencia bancaria</p>{settings.transferBank ? <p>Banco: {settings.transferBank}</p> : null}{settings.transferClabe ? <p>CLABE: {settings.transferClabe}</p> : null}{settings.transferOwner ? <p>Titular: {settings.transferOwner}</p> : null}</div> : null}
                {(settings.paymentType === "dimo" || settings.paymentType === "mixed") && settings.dimoUrl ? <a href={settings.dimoUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white">Pagar con DIMO<ExternalLink aria-hidden className="h-4 w-4" /></a> : null}
                {settings.paymentNotes ? <p className="whitespace-pre-line text-sm leading-6 text-slate-600">{settings.paymentNotes}</p> : null}
                {canSubmitProof ? <PaymentProofForm courseId={experience.course.id} /> : null}
              </div>
            )}
            <Link href="/mis-productos" className="inline-flex min-h-11 w-full items-center justify-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800">Ir a mis productos</Link>
          </aside>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-[calc(100vh-8rem)] overflow-hidden rounded-lg border border-slate-200 bg-white">
      <div className="grid min-h-[calc(100vh-8rem)] lg:grid-cols-[320px_1fr]">
        <aside className="border-b border-slate-200 bg-slate-950 text-white lg:border-b-0 lg:border-r lg:border-slate-800">
          <div className="space-y-4 border-b border-white/10 p-4"><Link href="/mis-productos" className="text-sm font-medium text-brand-accent">Mis productos</Link><div><p className="text-xs font-medium uppercase tracking-normal text-slate-400">Curso</p><h1 className="mt-1 text-lg font-semibold text-white">{experience.course.title}</h1></div><div className="space-y-2"><div className="h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-brand-accent" style={{ width: `${experience.progress.progressPercentage}%` }} /></div><p className="text-xs text-slate-300">{experience.progress.completedLessons}/{experience.progress.totalLessons} lecciones completadas</p></div></div>
          <details className="group" open><summary className="flex cursor-pointer items-center justify-between border-b border-white/10 p-4 text-sm font-semibold text-white lg:hidden">Contenido del curso<Menu aria-hidden className="h-4 w-4" /></summary><nav aria-label="Modulos y lecciones" className="max-h-[48vh] overflow-y-auto p-3 lg:max-h-[calc(100vh-250px)]">{experience.modules.length === 0 ? <p className="rounded-md border border-white/10 p-3 text-sm text-slate-300">Este curso todavia no tiene modulos.</p> : <div className="space-y-4">{experience.modules.map((module, moduleIndex) => <section key={module.id} className="space-y-2"><div className="px-2"><p className="text-xs font-medium uppercase tracking-normal text-slate-500">Modulo {moduleIndex + 1}</p><h2 className="text-sm font-semibold text-slate-100">{module.title}</h2></div><div className="space-y-1">{module.lessons.length === 0 ? <p className="px-2 py-1 text-xs text-slate-500">Sin lecciones</p> : module.lessons.map((lesson) => { const isActive = lesson.id === activeLesson?.id; return <Link key={lesson.id} href={`/learn/${experience.course.id}?lesson=${lesson.id}`} className={`flex gap-3 rounded-md p-3 text-sm transition ${isActive ? "bg-white text-slate-950" : "text-slate-200 hover:bg-white/10"}`}>{lesson.isCompleted ? <CheckCircle2 aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" /> : <Circle aria-hidden className="mt-0.5 h-4 w-4 shrink-0" />}<span className="min-w-0"><span className="block truncate font-medium">{lesson.title}</span><span className="text-xs opacity-70">{lessonTypeLabel(lesson.lessonType)} - {formatDuration(lesson.durationMinutes)}</span></span></Link>; })}</div></section>)}</div>}</nav></details>
        </aside>
        <main className="min-w-0 bg-slate-50">
          {activeLesson ? (
            <div className="flex min-h-full flex-col">
              <div className="border-b border-slate-200 bg-white p-4 md:p-6"><div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between"><div className="space-y-2"><p className="text-sm font-medium text-brand-primary">{lessonTypeLabel(activeLesson.lessonType)}</p><h2 className="text-2xl font-semibold text-slate-950">{activeLesson.title}</h2><div className="flex flex-wrap gap-2 text-xs font-medium text-slate-600"><span className="rounded-md bg-slate-100 px-2 py-1">{formatDuration(activeLesson.durationMinutes)}</span><span className="rounded-md bg-slate-100 px-2 py-1">{activeLesson.status === "published" ? "Publicado" : "Draft"}</span><span className="rounded-md bg-slate-100 px-2 py-1">{activeLesson.isCompleted ? "Completada" : "Pendiente"}</span></div></div><form action={completeCoursePlayerLessonAction}><input type="hidden" name="courseId" value={experience.course.id} /><input type="hidden" name="lessonId" value={activeLesson.id} /><button type="submit" className="inline-flex min-h-11 items-center gap-2 rounded-md bg-brand-primary px-4 py-2 text-sm font-semibold text-white"><CheckCircle2 aria-hidden className="h-4 w-4" />Marcar completada</button></form></div></div>
              <div className="flex-1 space-y-6 p-4 md:p-6">
                <section className="overflow-hidden rounded-lg border border-slate-200 bg-slate-950 text-white"><LessonMedia lesson={activeLesson} /></section>
                <section className="rounded-lg border border-slate-200 bg-white p-5"><div className="flex items-center gap-2 text-slate-950"><FileText aria-hidden className="h-5 w-5 text-brand-primary" /><h3 className="font-semibold">Contenido de la leccion</h3></div>{activeLesson.description ? <p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-600">{activeLesson.description}</p> : <p className="mt-3 text-sm leading-7 text-slate-600">Esta leccion ya esta disponible en la estructura del curso.</p>}</section>
                <section className="rounded-lg border border-slate-200 bg-white p-5"><div className="flex items-center gap-2 text-slate-950"><Download aria-hidden className="h-5 w-5 text-brand-primary" /><h3 className="font-semibold">Recursos descargables</h3></div>{activeLesson.resources.length === 0 ? <p className="mt-3 text-sm text-slate-600">Esta leccion no tiene recursos descargables todavia.</p> : <ul className="mt-3 grid gap-2">{activeLesson.resources.map((resource) => <li key={resource.id}><a href={resource.fileUrl} target="_blank" rel="noreferrer" className="flex min-h-11 items-center justify-between rounded-md border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:border-brand-primary/40">{resource.title}<Download aria-hidden className="h-4 w-4" /></a></li>)}</ul>}</section>
                <div className="flex flex-col gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:justify-between">{experience.previousLessonId ? <Link href={`/learn/${experience.course.id}?lesson=${experience.previousLessonId}`} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800"><ChevronLeft aria-hidden className="h-4 w-4" />Anterior</Link> : <span />}{experience.nextLessonId ? <Link href={`/learn/${experience.course.id}?lesson=${experience.nextLessonId}`} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white">Siguiente<ChevronRight aria-hidden className="h-4 w-4" /></Link> : null}</div>
              </div>
            </div>
          ) : <div className="p-6"><div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-sm text-slate-600">Este curso todavia no tiene lecciones disponibles.</div></div>}
        </main>
      </div>
    </section>
  );
}
