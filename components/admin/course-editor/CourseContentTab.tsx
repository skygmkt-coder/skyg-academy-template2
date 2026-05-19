"use client";

import { useEffect, useMemo, useState, useTransition } from "react";

import {
  createLessonAction,
  createModuleAction,
  getCourseContentAction,
  updateLessonTitleAction
} from "@/lib/courses/actions";
import type { CourseContent, ModuleWithLessons } from "@/lib/courses/types";

type CourseContentTabProps = {
  courseId?: string;
};

export default function CourseContentTab({ courseId }: CourseContentTabProps) {
  const [course, setCourse] = useState<CourseContent | null>(null);
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    let isMounted = true;

    startTransition(async () => {
      try {
        const content = await getCourseContentAction(courseId);
        if (!isMounted) return;
        setCourse(content);
        setSelectedModuleId(content?.modules[0]?.id ?? null);
      } catch (error) {
        if (!isMounted) return;
        setMessage(error instanceof Error ? error.message : "No pudimos cargar el contenido.");
      }
    });

    return () => {
      isMounted = false;
    };
  }, [courseId]);

  const selectedModule = useMemo<ModuleWithLessons | null>(() => {
    return course?.modules.find((module) => module.id === selectedModuleId) ?? course?.modules[0] ?? null;
  }, [course, selectedModuleId]);

  function refreshWith(action: () => Promise<CourseContent | null>, successMessage: string) {
    setMessage(null);
    startTransition(async () => {
      try {
        const nextCourse = await action();
        setCourse(nextCourse);
        setSelectedModuleId((current) => {
          if (current && nextCourse?.modules.some((module) => module.id === current)) return current;
          return nextCourse?.modules[0]?.id ?? null;
        });
        setMessage(successMessage);
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "No pudimos guardar los cambios.");
      }
    });
  }

  function handleCreateModule() {
    if (!course) return;

    const formData = new FormData();
    formData.set("courseId", course.id);
    formData.set("title", `Nuevo modulo ${course.modules.length + 1}`);
    refreshWith(() => createModuleAction(formData), "Modulo creado.");
  }

  function handleCreateLesson() {
    if (!course || !selectedModule) return;

    const formData = new FormData();
    formData.set("courseId", course.id);
    formData.set("moduleId", selectedModule.id);
    formData.set("title", `Nueva leccion ${selectedModule.lessons.length + 1}`);
    refreshWith(() => createLessonAction(formData), "Leccion creada.");
  }

  function handleUpdateLessonTitle(lessonId: string, title: string) {
    if (!course) return;

    const formData = new FormData();
    formData.set("courseId", course.id);
    formData.set("lessonId", lessonId);
    formData.set("title", title);
    refreshWith(() => updateLessonTitleAction(formData), "Titulo actualizado.");
  }

  if (!course && isPending) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 text-sm text-gray-500">
        Cargando contenido del curso...
      </div>
    );
  }

  if (!course) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6">
        <h2 className="text-xl font-bold text-gray-900">Contenido</h2>
        <p className="mt-2 text-sm text-gray-500">
          No hay un curso disponible para administrar.
        </p>
        {message ? <p className="mt-4 text-sm text-red-600">{message}</p> : null}
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
      <aside className="rounded-2xl border border-gray-200 bg-white p-4">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-bold text-gray-900">Modulos</h2>

          <button
            className="rounded-lg bg-black px-3 py-2 text-sm text-white disabled:opacity-50"
            disabled={isPending}
            onClick={handleCreateModule}
            type="button"
          >
            +
          </button>
        </div>

        <div className="space-y-2">
          {course.modules.length === 0 ? (
            <div className="rounded-xl bg-gray-50 p-4 text-sm text-gray-500">
              Crea el primer modulo para agregar lecciones.
            </div>
          ) : (
            course.modules.map((module) => {
              const isActive = selectedModule?.id === module.id;

              return (
                <button
                  key={module.id}
                  onClick={() => setSelectedModuleId(module.id)}
                  className={`w-full rounded-xl p-4 text-left transition ${
                    isActive
                      ? "bg-black text-white"
                      : "bg-gray-50 hover:bg-gray-100"
                  }`}
                  type="button"
                >
                  <p className="font-medium">{module.title}</p>

                  <p
                    className={`mt-1 text-sm ${
                      isActive ? "text-gray-300" : "text-gray-500"
                    }`}
                  >
                    {module.lessons.length} lecciones
                  </p>
                </button>
              );
            })
          )}
        </div>
      </aside>

      <section className="rounded-2xl border border-gray-200 bg-white p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {selectedModule?.title ?? "Contenido del curso"}
            </h2>

            <p className="mt-1 text-gray-500">
              Administra las lecciones del modulo.
            </p>
          </div>

          <button
            className="rounded-xl bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            disabled={isPending || !selectedModule}
            onClick={handleCreateLesson}
            type="button"
          >
            Agregar leccion
          </button>
        </div>

        {message ? <p className="mt-4 text-sm text-gray-500">{message}</p> : null}

        <div className="mt-8 space-y-3">
          {!selectedModule ? (
            <div className="rounded-2xl border border-dashed border-gray-200 p-6 text-sm text-gray-500">
              Selecciona o crea un modulo para administrar lecciones.
            </div>
          ) : selectedModule.lessons.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-200 p-6 text-sm text-gray-500">
              Este modulo todavia no tiene lecciones.
            </div>
          ) : (
            selectedModule.lessons.map((lesson) => (
              <LessonCard
                key={lesson.id}
                disabled={isPending}
                lesson={lesson}
                onUpdateTitle={handleUpdateLessonTitle}
              />
            ))
          )}
        </div>
      </section>
    </div>
  );
}

function LessonCard({
  disabled,
  lesson,
  onUpdateTitle
}: {
  disabled: boolean;
  lesson: ModuleWithLessons["lessons"][number];
  onUpdateTitle: (lessonId: string, title: string) => void;
}) {
  const [title, setTitle] = useState(lesson.title);

  useEffect(() => {
    setTitle(lesson.title);
  }, [lesson.title]);

  const duration = lesson.durationMinutes ? `${lesson.durationMinutes} min` : "Sin duracion";
  const status = lesson.status === "published" ? "Publicado" : "Draft";
  const type = lesson.lessonType === "pdf" ? "PDF" : lesson.lessonType === "text" ? "Texto" : "Video";

  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-gray-200 bg-white p-5">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <input
            className="min-w-0 flex-1 rounded-lg border border-transparent px-2 py-1 font-semibold text-gray-900 outline-none focus:border-gray-200"
            disabled={disabled}
            onChange={(event) => setTitle(event.target.value)}
            value={title}
          />

          <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600">
            {type}
          </span>
        </div>

        <div className="mt-2 flex items-center gap-3 text-sm text-gray-500">
          <span>{duration}</span>
          <span>-</span>
          <span>{status}</span>
        </div>
      </div>

      <button
        className="rounded-xl border border-gray-200 px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-50"
        disabled={disabled || title.trim() === lesson.title || title.trim().length < 2}
        onClick={() => onUpdateTitle(lesson.id, title)}
        type="button"
      >
        Guardar
      </button>
    </div>
  );
}
