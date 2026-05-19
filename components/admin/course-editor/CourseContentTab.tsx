"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { Download, File, ImageIcon, Trash2, UploadCloud, Video } from "lucide-react";

import {
  createLessonAction,
  createLessonResourceAction,
  createModuleAction,
  deleteLessonAction,
  deleteLessonMediaAction,
  deleteLessonResourceAction,
  deleteModuleAction,
  getCourseContentAction,
  updateCourseMediaAction,
  updateLessonMediaAction,
  updateLessonTitleAction,
  updateModuleTitleAction
} from "@/lib/courses/actions";
import { uploadCourseCover, uploadCourseThumbnail, uploadLessonMedia, uploadLessonResource } from "@/lib/courses/media-client";
import type { CourseContent, Lesson, ModuleWithLessons } from "@/lib/courses/types";

type CourseContentTabProps = {
  courseId?: string;
};

function mediaKindFromFile(file: File): "video" | "pdf" | "image" {
  if (file.type === "application/pdf") return "pdf";
  if (file.type.startsWith("image/")) return "image";
  return "video";
}

export default function CourseContentTab({ courseId }: CourseContentTabProps) {
  const [course, setCourse] = useState<CourseContent | null>(null);
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [moduleTitle, setModuleTitle] = useState("");
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

  useEffect(() => {
    setModuleTitle(selectedModule?.title ?? "");
  }, [selectedModule?.title]);

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

  function handleUpdateModuleTitle() {
    if (!course || !selectedModule) return;
    const formData = new FormData();
    formData.set("courseId", course.id);
    formData.set("moduleId", selectedModule.id);
    formData.set("title", moduleTitle);
    refreshWith(() => updateModuleTitleAction(formData), "Modulo actualizado.");
  }

  function handleDeleteModule() {
    if (!course || !selectedModule) return;
    const formData = new FormData();
    formData.set("courseId", course.id);
    formData.set("moduleId", selectedModule.id);
    refreshWith(() => deleteModuleAction(formData), "Modulo eliminado.");
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

  function handleDeleteLesson(lessonId: string) {
    if (!course) return;
    const formData = new FormData();
    formData.set("courseId", course.id);
    formData.set("lessonId", lessonId);
    refreshWith(() => deleteLessonAction(formData), "Leccion eliminada.");
  }

  function handleCourseUpload(file: File, role: "thumbnail" | "cover") {
    if (!course) return;
    refreshWith(async () => {
      const upload = role === "cover" ? await uploadCourseCover(course.id, file) : await uploadCourseThumbnail(course.id, file);
      const formData = new FormData();
      formData.set("courseId", course.id);
      formData.set("mediaRole", role);
      formData.set("mediaUrl", upload.publicUrl ?? upload.mediaUrl);
      formData.set("mediaPath", upload.path);
      return updateCourseMediaAction(formData);
    }, role === "cover" ? "Cover actualizado." : "Thumbnail actualizado.");
  }

  if (!course && isPending) {
    return <div className="rounded-lg border border-slate-200 bg-white p-6 text-sm text-slate-500">Cargando contenido del curso...</div>;
  }

  if (!course) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="text-xl font-semibold text-slate-950">Contenido</h2>
        <p className="mt-2 text-sm text-slate-600">No hay un curso disponible para administrar.</p>
        {message ? <p className="mt-4 text-sm text-rose-600">{message}</p> : null}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 rounded-lg border border-slate-200 bg-white p-5 md:grid-cols-2">
        <CourseImageUpload title="Thumbnail" value={course.thumbnailUrl} onUpload={(file) => handleCourseUpload(file, "thumbnail")} />
        <CourseImageUpload title="Cover" value={course.coverImageUrl} onUpload={(file) => handleCourseUpload(file, "cover")} />
      </section>

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <aside className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-slate-950">Modulos</h2>
            <button className="rounded-md bg-slate-950 px-3 py-2 text-sm text-white disabled:opacity-50" disabled={isPending} onClick={handleCreateModule} type="button">+</button>
          </div>

          <div className="space-y-2">
            {course.modules.length === 0 ? (
              <div className="rounded-md bg-slate-50 p-4 text-sm text-slate-600">Crea el primer modulo para agregar lecciones.</div>
            ) : (
              course.modules.map((module) => {
                const isActive = selectedModule?.id === module.id;
                return (
                  <button key={module.id} onClick={() => setSelectedModuleId(module.id)} className={`w-full rounded-md p-4 text-left transition ${isActive ? "bg-slate-950 text-white" : "bg-slate-50 hover:bg-slate-100"}`} type="button">
                    <p className="font-medium">{module.title}</p>
                    <p className={`mt-1 text-sm ${isActive ? "text-slate-300" : "text-slate-500"}`}>{module.lessons.length} lecciones</p>
                  </button>
                );
              })
            )}
          </div>
        </aside>

        <section className="rounded-lg border border-slate-200 bg-white p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 flex-1">
              {selectedModule ? (
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <input className="min-w-0 flex-1 rounded-md border border-slate-200 px-3 py-2 text-2xl font-semibold text-slate-950 outline-none focus:border-slate-400" disabled={isPending} onChange={(event) => setModuleTitle(event.target.value)} value={moduleTitle} />
                  <div className="flex gap-2">
                    <button className="rounded-md border border-slate-200 px-4 py-2 text-sm hover:bg-slate-50 disabled:opacity-50" disabled={isPending || moduleTitle.trim() === selectedModule.title || moduleTitle.trim().length < 2} onClick={handleUpdateModuleTitle} type="button">Guardar</button>
                    <button className="rounded-md border border-rose-200 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 disabled:opacity-50" disabled={isPending} onClick={handleDeleteModule} type="button">Eliminar</button>
                  </div>
                </div>
              ) : <h2 className="text-2xl font-semibold text-slate-950">Contenido del curso</h2>}
              <p className="mt-1 text-sm text-slate-600">Administra lecciones, videos y recursos del modulo.</p>
            </div>
            <button className="rounded-md bg-slate-950 px-4 py-2 text-sm font-medium text-white disabled:opacity-50" disabled={isPending || !selectedModule} onClick={handleCreateLesson} type="button">Agregar leccion</button>
          </div>

          {message ? <p className="mt-4 text-sm text-slate-600">{message}</p> : null}

          <div className="mt-8 space-y-4">
            {!selectedModule ? (
              <div className="rounded-lg border border-dashed border-slate-300 p-6 text-sm text-slate-600">Selecciona o crea un modulo para administrar lecciones.</div>
            ) : selectedModule.lessons.length === 0 ? (
              <div className="rounded-lg border border-dashed border-slate-300 p-6 text-sm text-slate-600">Este modulo todavia no tiene lecciones.</div>
            ) : (
              selectedModule.lessons.map((lesson) => (
                <LessonCard key={lesson.id} courseId={course.id} disabled={isPending} lesson={lesson} refreshWith={refreshWith} onDelete={handleDeleteLesson} onUpdateTitle={handleUpdateLessonTitle} />
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function CourseImageUpload({ title, value, onUpload }: { title: string; value: string | null; onUpload: (file: File) => void }) {
  return (
    <div className="space-y-3 rounded-md border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center gap-2 font-semibold text-slate-950"><ImageIcon aria-hidden className="h-4 w-4 text-brand-primary" />{title}</div>
      {value ? <img src={value} alt="" className="aspect-video w-full rounded-md border border-slate-200 object-cover" /> : <div className="flex aspect-video items-center justify-center rounded-md border border-dashed border-slate-300 text-sm text-slate-500">Sin imagen</div>}
      <label className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-md bg-white px-3 py-2 text-sm font-semibold text-slate-800 ring-1 ring-slate-200">
        <UploadCloud aria-hidden className="h-4 w-4" /> Reemplazar
        <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(event) => { const file = event.target.files?.[0]; if (file) onUpload(file); }} />
      </label>
    </div>
  );
}

function LessonCard({ courseId, disabled, lesson, refreshWith, onDelete, onUpdateTitle }: {
  courseId: string;
  disabled: boolean;
  lesson: Lesson;
  refreshWith: (action: () => Promise<CourseContent | null>, successMessage: string) => void;
  onDelete: (lessonId: string) => void;
  onUpdateTitle: (lessonId: string, title: string) => void;
}) {
  const [title, setTitle] = useState(lesson.title);
  const [description, setDescription] = useState(lesson.description ?? "");
  const [videoUrl, setVideoUrl] = useState(lesson.videoUrl ?? "");
  const [duration, setDuration] = useState(lesson.durationMinutes ? String(lesson.durationMinutes) : "");
  const [lessonType, setLessonType] = useState(lesson.lessonType);
  const [status, setStatus] = useState(lesson.status);

  useEffect(() => {
    setTitle(lesson.title);
    setDescription(lesson.description ?? "");
    setVideoUrl(lesson.videoUrl ?? "");
    setDuration(lesson.durationMinutes ? String(lesson.durationMinutes) : "");
    setLessonType(lesson.lessonType);
    setStatus(lesson.status);
  }, [lesson]);

  function saveLesson(extra?: { mediaUrl?: string; bucket?: string; path?: string; mediaKind?: string }) {
    const formData = new FormData();
    formData.set("courseId", courseId);
    formData.set("lessonId", lesson.id);
    formData.set("title", title);
    formData.set("description", description);
    formData.set("videoUrl", extra?.mediaUrl ?? videoUrl);
    formData.set("mediaBucket", extra?.bucket ?? lesson.mediaBucket ?? "");
    formData.set("mediaPath", extra?.path ?? lesson.mediaPath ?? "");
    formData.set("mediaKind", extra?.mediaKind ?? lesson.mediaKind ?? (videoUrl ? "external" : ""));
    formData.set("lessonType", lessonType);
    formData.set("durationMinutes", duration);
    formData.set("status", status);
    refreshWith(() => updateLessonMediaAction(formData), "Leccion actualizada.");
  }

  function handleLessonMediaUpload(file: File) {
    refreshWith(async () => {
      const upload = await uploadLessonMedia(courseId, lesson.id, file);
      const formData = new FormData();
      formData.set("courseId", courseId);
      formData.set("lessonId", lesson.id);
      formData.set("title", title);
      formData.set("description", description);
      formData.set("videoUrl", upload.mediaUrl);
      formData.set("mediaBucket", upload.bucket);
      formData.set("mediaPath", upload.path);
      formData.set("mediaKind", mediaKindFromFile(file));
      formData.set("lessonType", file.type === "application/pdf" ? "pdf" : lessonType);
      formData.set("durationMinutes", duration);
      formData.set("status", status);
      return updateLessonMediaAction(formData);
    }, "Media de leccion actualizada.");
  }

  function handleResourceUpload(file: File) {
    refreshWith(async () => {
      const upload = await uploadLessonResource(courseId, lesson.id, file);
      const formData = new FormData();
      formData.set("courseId", courseId);
      formData.set("lessonId", lesson.id);
      formData.set("title", file.name.replace(/\.[^.]+$/, ""));
      formData.set("fileUrl", upload.mediaUrl);
      formData.set("fileBucket", upload.bucket);
      formData.set("filePath", upload.path);
      formData.set("fileType", file.type);
      formData.set("fileSize", String(file.size));
      return createLessonResourceAction(formData);
    }, "Recurso agregado.");
  }

  function handleDeleteResource(resource: Lesson["resources"][number]) {
    const formData = new FormData();
    formData.set("courseId", courseId);
    formData.set("resourceId", resource.id);
    formData.set("fileBucket", resource.fileBucket ?? "");
    formData.set("filePath", resource.filePath ?? "");
    refreshWith(() => deleteLessonResourceAction(formData), "Recurso eliminado.");
  }

  function handleDeleteMedia() {
    const formData = new FormData();
    formData.set("courseId", courseId);
    formData.set("lessonId", lesson.id);
    formData.set("mediaBucket", lesson.mediaBucket ?? "");
    formData.set("mediaPath", lesson.mediaPath ?? "");
    refreshWith(() => deleteLessonMediaAction(formData), "Media eliminada.");
  }

  const type = lesson.lessonType === "pdf" ? "PDF" : lesson.lessonType === "text" ? "Texto" : "Video";

  return (
    <div className="space-y-4 rounded-lg border border-slate-200 bg-white p-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex items-center gap-2">
            <input className="min-w-0 flex-1 rounded-md border border-slate-200 px-3 py-2 font-semibold text-slate-950 outline-none focus:border-slate-400" disabled={disabled} onChange={(event) => setTitle(event.target.value)} value={title} />
            <span className="rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-600">{type}</span>
          </div>
          <div className="grid gap-2 md:grid-cols-3">
            <select value={lessonType} onChange={(event) => setLessonType(event.target.value as Lesson["lessonType"])} className="min-h-10 rounded-md border border-slate-300 px-3 py-2 text-sm"><option value="video">Video</option><option value="text">Texto</option><option value="pdf">PDF</option></select>
            <select value={status} onChange={(event) => setStatus(event.target.value as Lesson["status"])} className="min-h-10 rounded-md border border-slate-300 px-3 py-2 text-sm"><option value="draft">Draft</option><option value="published">Publicado</option></select>
            <input value={duration} onChange={(event) => setDuration(event.target.value)} inputMode="numeric" placeholder="Duracion min" className="min-h-10 rounded-md border border-slate-300 px-3 py-2 text-sm" />
          </div>
          <input value={videoUrl} onChange={(event) => setVideoUrl(event.target.value)} placeholder="YouTube, Vimeo o video URL" className="min-h-10 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
          <textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={3} placeholder="Contenido o descripcion de la leccion" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
        </div>
        <div className="flex flex-wrap gap-2 lg:justify-end">
          <button className="rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold hover:bg-slate-50 disabled:opacity-50" disabled={disabled || title.trim().length < 2} onClick={() => saveLesson()} type="button">Guardar</button>
          <button className="rounded-md border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50 disabled:opacity-50" disabled={disabled || title.trim() === lesson.title || title.trim().length < 2} onClick={() => onUpdateTitle(lesson.id, title)} type="button">Titulo</button>
          <button className="rounded-md border border-rose-200 px-3 py-2 text-sm text-rose-600 hover:bg-rose-50 disabled:opacity-50" disabled={disabled} onClick={() => onDelete(lesson.id)} type="button">Eliminar</button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-3 rounded-md border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center gap-2 font-semibold text-slate-950"><Video aria-hidden className="h-4 w-4 text-brand-primary" />Media principal</div>
          {lesson.videoUrl ? <a href={lesson.videoUrl} target="_blank" rel="noreferrer" className="block truncate text-sm font-medium text-brand-primary">{lesson.videoUrl}</a> : <p className="text-sm text-slate-600">Sin media configurada.</p>}
          <div className="flex flex-wrap gap-2">
            <label className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-md bg-white px-3 py-2 text-sm font-semibold text-slate-800 ring-1 ring-slate-200"><UploadCloud aria-hidden className="h-4 w-4" />Subir media<input type="file" accept="video/mp4,video/webm,application/pdf,image/jpeg,image/png,image/webp" className="sr-only" onChange={(event) => { const file = event.target.files?.[0]; if (file) handleLessonMediaUpload(file); }} /></label>
            {lesson.mediaPath ? <button type="button" onClick={handleDeleteMedia} className="inline-flex min-h-10 items-center gap-2 rounded-md border border-rose-200 bg-white px-3 py-2 text-sm font-semibold text-rose-600"><Trash2 aria-hidden className="h-4 w-4" />Eliminar</button> : null}
          </div>
        </div>

        <div className="space-y-3 rounded-md border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center gap-2 font-semibold text-slate-950"><Download aria-hidden className="h-4 w-4 text-brand-primary" />Recursos descargables</div>
          {lesson.resources.length === 0 ? <p className="text-sm text-slate-600">Sin recursos.</p> : (
            <ul className="space-y-2">
              {lesson.resources.map((resource) => (
                <li key={resource.id} className="flex items-center justify-between gap-3 rounded-md bg-white px-3 py-2 text-sm ring-1 ring-slate-200">
                  <a href={resource.fileUrl} target="_blank" rel="noreferrer" className="min-w-0 truncate font-medium text-slate-800"><File aria-hidden className="mr-2 inline h-4 w-4 text-slate-500" />{resource.title}</a>
                  <button type="button" onClick={() => handleDeleteResource(resource)} className="text-rose-600"><Trash2 aria-hidden className="h-4 w-4" /></button>
                </li>
              ))}
            </ul>
          )}
          <label className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-md bg-white px-3 py-2 text-sm font-semibold text-slate-800 ring-1 ring-slate-200"><UploadCloud aria-hidden className="h-4 w-4" />Subir recurso<input type="file" accept="application/pdf,application/zip,text/plain,image/jpeg,image/png,image/webp" className="sr-only" onChange={(event) => { const file = event.target.files?.[0]; if (file) handleResourceUpload(file); }} /></label>
        </div>
      </div>
    </div>
  );
}
