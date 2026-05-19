import Link from "next/link";
import { BookOpen, CheckCircle2, ChevronLeft, ChevronRight, Circle, Download, FileText, Menu, PlayCircle } from "lucide-react";

import { completeCoursePlayerLessonAction } from "@/lib/engines/learning/actions";
import type { CoursePlayerExperience, CoursePlayerLesson } from "@/lib/engines/learning/types";

type CoursePlayerShellProps = {
  experience: CoursePlayerExperience;
};

function lessonTypeLabel(type: CoursePlayerLesson["lessonType"]): string {
  if (type === "pdf") return "PDF";
  if (type === "text") return "Texto";
  return "Video";
}

function formatDuration(minutes: number | null): string {
  if (!minutes) return "Sin duracion";
  return `${minutes} min`;
}

export function CoursePlayerShell({ experience }: CoursePlayerShellProps) {
  const activeLesson = experience.activeLesson;

  return (
    <section className="min-h-[calc(100vh-8rem)] overflow-hidden rounded-lg border border-slate-200 bg-white">
      <div className="grid min-h-[calc(100vh-8rem)] lg:grid-cols-[320px_1fr]">
        <aside className="border-b border-slate-200 bg-slate-950 text-white lg:border-b-0 lg:border-r lg:border-slate-800">
          <div className="space-y-4 border-b border-white/10 p-4">
            <Link href="/mis-productos" className="text-sm font-medium text-brand-accent">
              Mis productos
            </Link>
            <div>
              <p className="text-xs font-medium uppercase tracking-normal text-slate-400">Curso</p>
              <h1 className="mt-1 text-lg font-semibold text-white">{experience.course.title}</h1>
            </div>
            <div className="space-y-2">
              <div className="h-2 overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full bg-brand-accent" style={{ width: `${experience.progress.progressPercentage}%` }} />
              </div>
              <p className="text-xs text-slate-300">
                {experience.progress.completedLessons}/{experience.progress.totalLessons} lecciones completadas
              </p>
            </div>
          </div>

          <details className="group" open>
            <summary className="flex cursor-pointer items-center justify-between border-b border-white/10 p-4 text-sm font-semibold text-white lg:hidden">
              Contenido del curso
              <Menu aria-hidden className="h-4 w-4" />
            </summary>
            <nav aria-label="Modulos y lecciones" className="max-h-[48vh] overflow-y-auto p-3 lg:max-h-[calc(100vh-250px)]">
              {experience.modules.length === 0 ? (
                <p className="rounded-md border border-white/10 p-3 text-sm text-slate-300">Este curso todavia no tiene modulos.</p>
              ) : (
                <div className="space-y-4">
                  {experience.modules.map((module, moduleIndex) => (
                    <section key={module.id} className="space-y-2">
                      <div className="px-2">
                        <p className="text-xs font-medium uppercase tracking-normal text-slate-500">Modulo {moduleIndex + 1}</p>
                        <h2 className="text-sm font-semibold text-slate-100">{module.title}</h2>
                      </div>
                      <div className="space-y-1">
                        {module.lessons.length === 0 ? (
                          <p className="px-2 py-1 text-xs text-slate-500">Sin lecciones</p>
                        ) : (
                          module.lessons.map((lesson) => {
                            const isActive = lesson.id === activeLesson?.id;

                            return (
                              <Link
                                key={lesson.id}
                                href={`/learn/${experience.course.id}?lesson=${lesson.id}`}
                                className={`flex gap-3 rounded-md p-3 text-sm transition ${
                                  isActive ? "bg-white text-slate-950" : "text-slate-200 hover:bg-white/10"
                                }`}
                              >
                                {lesson.isCompleted ? (
                                  <CheckCircle2 aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                                ) : (
                                  <Circle aria-hidden className="mt-0.5 h-4 w-4 shrink-0" />
                                )}
                                <span className="min-w-0">
                                  <span className="block truncate font-medium">{lesson.title}</span>
                                  <span className="text-xs opacity-70">{lessonTypeLabel(lesson.lessonType)} - {formatDuration(lesson.durationMinutes)}</span>
                                </span>
                              </Link>
                            );
                          })
                        )}
                      </div>
                    </section>
                  ))}
                </div>
              )}
            </nav>
          </details>
        </aside>

        <main className="min-w-0 bg-slate-50">
          {activeLesson ? (
            <div className="flex min-h-full flex-col">
              <div className="border-b border-slate-200 bg-white p-4 md:p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-brand-primary">{lessonTypeLabel(activeLesson.lessonType)}</p>
                    <h2 className="text-2xl font-semibold text-slate-950">{activeLesson.title}</h2>
                    <div className="flex flex-wrap gap-2 text-xs font-medium text-slate-600">
                      <span className="rounded-md bg-slate-100 px-2 py-1">{formatDuration(activeLesson.durationMinutes)}</span>
                      <span className="rounded-md bg-slate-100 px-2 py-1">{activeLesson.status === "published" ? "Publicado" : "Draft"}</span>
                      <span className="rounded-md bg-slate-100 px-2 py-1">{activeLesson.isCompleted ? "Completada" : "Pendiente"}</span>
                    </div>
                  </div>
                  <form action={completeCoursePlayerLessonAction}>
                    <input type="hidden" name="courseId" value={experience.course.id} />
                    <input type="hidden" name="lessonId" value={activeLesson.id} />
                    <button
                      type="submit"
                      className="inline-flex min-h-11 items-center gap-2 rounded-md bg-brand-primary px-4 py-2 text-sm font-semibold text-white"
                    >
                      <CheckCircle2 aria-hidden className="h-4 w-4" />
                      Marcar completada
                    </button>
                  </form>
                </div>
              </div>

              <div className="flex-1 space-y-6 p-4 md:p-6">
                <section className="overflow-hidden rounded-lg border border-slate-200 bg-slate-950 text-white">
                  <div className="flex aspect-video items-center justify-center bg-black p-6">
                    {activeLesson.videoUrl ? (
                      <div className="space-y-3 text-center">
                        <PlayCircle aria-hidden className="mx-auto h-12 w-12 text-brand-accent" />
                        <p className="text-sm text-slate-300">Video configurado</p>
                        <a href={activeLesson.videoUrl} target="_blank" rel="noreferrer" className="text-sm font-semibold text-brand-accent">
                          Abrir video
                        </a>
                      </div>
                    ) : (
                      <div className="space-y-3 text-center">
                        <BookOpen aria-hidden className="mx-auto h-12 w-12 text-slate-500" />
                        <p className="text-sm text-slate-300">Area de player lista para video, texto o recurso principal.</p>
                      </div>
                    )}
                  </div>
                </section>

                <section className="rounded-lg border border-slate-200 bg-white p-5">
                  <div className="flex items-center gap-2 text-slate-950">
                    <FileText aria-hidden className="h-5 w-5 text-brand-primary" />
                    <h3 className="font-semibold">Contenido de la leccion</h3>
                  </div>
                  {activeLesson.description ? (
                    <p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-600">{activeLesson.description}</p>
                  ) : (
                    <p className="mt-3 text-sm leading-7 text-slate-600">
                      Esta leccion ya esta disponible en la estructura del curso. El contenido extendido puede conectarse aqui sin cambiar el flujo del alumno.
                    </p>
                  )}
                </section>

                <section className="rounded-lg border border-slate-200 bg-white p-5">
                  <div className="flex items-center gap-2 text-slate-950">
                    <Download aria-hidden className="h-5 w-5 text-brand-primary" />
                    <h3 className="font-semibold">Recursos descargables</h3>
                  </div>
                  {activeLesson.resources.length === 0 ? (
                    <p className="mt-3 text-sm text-slate-600">Esta leccion no tiene recursos descargables todavia.</p>
                  ) : (
                    <ul className="mt-3 grid gap-2">
                      {activeLesson.resources.map((resource) => (
                        <li key={resource.id}>
                          <a
                            href={resource.fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="flex min-h-11 items-center justify-between rounded-md border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:border-brand-primary/40"
                          >
                            {resource.title}
                            <Download aria-hidden className="h-4 w-4" />
                          </a>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>

                <div className="flex flex-col gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:justify-between">
                  {experience.previousLessonId ? (
                    <Link
                      href={`/learn/${experience.course.id}?lesson=${experience.previousLessonId}`}
                      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800"
                    >
                      <ChevronLeft aria-hidden className="h-4 w-4" />
                      Anterior
                    </Link>
                  ) : <span />}
                  {experience.nextLessonId ? (
                    <Link
                      href={`/learn/${experience.course.id}?lesson=${experience.nextLessonId}`}
                      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white"
                    >
                      Siguiente
                      <ChevronRight aria-hidden className="h-4 w-4" />
                    </Link>
                  ) : null}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6">
              <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-sm text-slate-600">
                Este curso todavia no tiene lecciones disponibles.
              </div>
            </div>
          )}
        </main>
      </div>
    </section>
  );
}
