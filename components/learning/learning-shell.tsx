import Link from "next/link";
import { CheckCircle2, Circle, Download, ChevronLeft, ChevronRight } from "lucide-react";

import { VideoPlayer } from "@/components/learning/video-player";
import { completeLessonAction } from "@/lib/engines/learning/actions";
import type { LearningExperience } from "@/lib/engines/learning/types";

type LearningShellProps = {
  experience: LearningExperience;
};

export function LearningShell({ experience }: LearningShellProps) {
  const activeLesson = experience.product.lessons.find(
    (lesson) => lesson.slug === experience.activeLessonSlug
  );

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="grid min-h-screen lg:grid-cols-[320px_1fr]">
        <aside className="border-b border-white/10 bg-slate-900 lg:border-b-0 lg:border-r">
          <div className="space-y-3 border-b border-white/10 p-4">
            <Link href="/mis-productos" className="text-sm font-medium text-brand-accent">
              Mis productos
            </Link>
            <h1 className="text-lg font-semibold">{experience.product.title}</h1>
            <div className="h-2 overflow-hidden rounded bg-white/10">
              <div
                className="h-full bg-brand-accent"
                style={{ width: `${experience.progress.progressPercentage}%` }}
              />
            </div>
            <p className="text-xs text-slate-300">
              {experience.progress.completedLessons}/{experience.progress.totalLessons} lecciones completadas
            </p>
          </div>
          <nav aria-label="Lecciones" className="max-h-[42vh] overflow-y-auto p-2 lg:max-h-[calc(100vh-132px)]">
            {experience.product.lessons.length === 0 ? (
              <p className="p-3 text-sm text-slate-300">No hay lecciones disponibles.</p>
            ) : (
              experience.product.lessons.map((lesson, index) => {
                const isActive = lesson.slug === experience.activeLessonSlug;
                const isCompleted = experience.completedLessonIds.includes(lesson.id);

                return (
                  <Link
                    key={lesson.id}
                    href={`/aprender/${experience.product.slug}/${lesson.slug}`}
                    className={`flex gap-3 rounded-md p-3 text-sm transition ${
                      isActive ? "bg-white text-slate-950" : "text-slate-200 hover:bg-white/10"
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                    ) : (
                      <Circle aria-hidden className="mt-0.5 h-4 w-4 shrink-0" />
                    )}
                    <span>
                      <span className="block text-xs opacity-70">Leccion {index + 1}</span>
                      <span className="font-medium">{lesson.title}</span>
                    </span>
                  </Link>
                );
              })
            )}
          </nav>
        </aside>
        <section className="flex min-w-0 flex-col">
          <div className="bg-black">
            <VideoPlayer videoUrl={activeLesson?.videoUrl ?? null} title={activeLesson?.title ?? experience.product.title} />
          </div>
          <div className="flex-1 space-y-6 p-4 md:p-8">
            {activeLesson ? (
              <>
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="space-y-2">
                    <p className="text-sm text-brand-accent">{experience.product.title}</p>
                    <h2 className="text-2xl font-semibold">{activeLesson.title}</h2>
                    {activeLesson.description ? (
                      <p className="max-w-3xl whitespace-pre-line text-sm leading-7 text-slate-300">
                        {activeLesson.description}
                      </p>
                    ) : null}
                  </div>
                  <form action={completeLessonAction}>
                    <input type="hidden" name="productSlug" value={experience.product.slug} />
                    <input type="hidden" name="lessonSlug" value={activeLesson.slug} />
                    <input type="hidden" name="productId" value={experience.product.id} />
                    <input type="hidden" name="lessonId" value={activeLesson.id} />
                    <button
                      type="submit"
                      className="min-h-11 rounded-md bg-brand-accent px-4 py-2 text-sm font-semibold text-slate-950"
                    >
                      Marcar completada
                    </button>
                  </form>
                </div>
                <div className="flex flex-col gap-3 border-y border-white/10 py-4 sm:flex-row sm:justify-between">
                  {experience.previousLessonSlug ? (
                    <Link
                      className="inline-flex min-h-11 items-center gap-2 rounded-md border border-white/20 px-4 py-2 text-sm font-semibold"
                      href={`/aprender/${experience.product.slug}/${experience.previousLessonSlug}`}
                    >
                      <ChevronLeft aria-hidden className="h-4 w-4" />
                      Anterior
                    </Link>
                  ) : <span />}
                  {experience.nextLessonSlug ? (
                    <Link
                      className="inline-flex min-h-11 items-center gap-2 rounded-md bg-white px-4 py-2 text-sm font-semibold text-slate-950"
                      href={`/aprender/${experience.product.slug}/${experience.nextLessonSlug}`}
                    >
                      Siguiente
                      <ChevronRight aria-hidden className="h-4 w-4" />
                    </Link>
                  ) : null}
                </div>
                <section>
                  <h3 className="text-lg font-semibold">Recursos</h3>
                  {activeLesson.resources.length === 0 ? (
                    <p className="mt-2 text-sm text-slate-300">Esta leccion no tiene recursos descargables.</p>
                  ) : (
                    <ul className="mt-3 grid gap-2">
                      {activeLesson.resources.map((resource) => (
                        <li key={resource.id}>
                          <a
                            href={resource.fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="flex min-h-11 items-center justify-between rounded-md border border-white/10 px-3 py-2 text-sm hover:bg-white/10"
                          >
                            {resource.title}
                            <Download aria-hidden className="h-4 w-4" />
                          </a>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              </>
            ) : (
              <div className="rounded-lg border border-white/10 p-6 text-sm text-slate-300">
                Este producto todavia no tiene lecciones.
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
