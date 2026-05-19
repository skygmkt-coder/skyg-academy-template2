"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { deleteMedia } from "@/lib/courses/media";
import { requireUser } from "@/lib/engines/auth/helpers";
import { stringFromForm } from "@/lib/courses/helpers";
import { assertCourseOwner } from "@/lib/courses/ownership";
import {
  createCourseDraft,
  createLesson,
  createLessonResource,
  createModule,
  deleteLesson,
  deleteLessonResource,
  deleteModule,
  getCourseContent,
  updateCourseMedia,
  updateLessonDetails,
  updateLessonTitle,
  updateModuleTitle
} from "@/lib/courses/repository";
import type { CourseContent } from "@/lib/courses/types";

function courseEditorPath(courseId: string): string {
  return `/admin/cursos/${courseId}`;
}

function nullableString(formData: FormData, key: string): string | null {
  const value = stringFromForm(formData, key).trim();
  return value ? value : null;
}

function numberOrNull(formData: FormData, key: string): number | null {
  const value = stringFromForm(formData, key).trim();
  if (!value) return null;
  const numeric = Number(value);
  return Number.isFinite(numeric) && numeric >= 0 ? Math.round(numeric) : null;
}

export async function createCourseDraftAction(): Promise<void> {
  const auth = await requireUser();
  const course = await createCourseDraft({ ownerId: auth.user.id, title: "Curso sin titulo" });

  revalidatePath("/admin/cursos");
  redirect(courseEditorPath(course.id));
}

export async function getCourseContentAction(courseId?: string): Promise<CourseContent | null> {
  const auth = await requireUser();
  return getCourseContent(courseId, auth.user.id);
}

export async function createModuleAction(formData: FormData): Promise<CourseContent | null> {
  const auth = await requireUser();
  const courseId = stringFromForm(formData, "courseId");
  const title = stringFromForm(formData, "title").trim();

  if (!courseId || title.length < 2) throw new Error("Datos de modulo invalidos.");

  await assertCourseOwner(courseId, auth.user.id);
  await createModule({ courseId, title });
  revalidatePath("/admin/cursos");
  revalidatePath(courseEditorPath(courseId));
  return getCourseContent(courseId, auth.user.id);
}

export async function updateModuleTitleAction(formData: FormData): Promise<CourseContent | null> {
  const auth = await requireUser();
  const courseId = stringFromForm(formData, "courseId");
  const moduleId = stringFromForm(formData, "moduleId");
  const title = stringFromForm(formData, "title").trim();

  if (!courseId || !moduleId || title.length < 2) throw new Error("Titulo de modulo invalido.");

  await assertCourseOwner(courseId, auth.user.id);
  await updateModuleTitle({ courseId, moduleId, title });
  revalidatePath("/admin/cursos");
  revalidatePath(courseEditorPath(courseId));
  return getCourseContent(courseId, auth.user.id);
}

export async function deleteModuleAction(formData: FormData): Promise<CourseContent | null> {
  const auth = await requireUser();
  const courseId = stringFromForm(formData, "courseId");
  const moduleId = stringFromForm(formData, "moduleId");

  if (!courseId || !moduleId) throw new Error("Modulo invalido.");

  await assertCourseOwner(courseId, auth.user.id);
  await deleteModule({ courseId, moduleId });
  revalidatePath("/admin/cursos");
  revalidatePath(courseEditorPath(courseId));
  return getCourseContent(courseId, auth.user.id);
}

export async function createLessonAction(formData: FormData): Promise<CourseContent | null> {
  const auth = await requireUser();
  const courseId = stringFromForm(formData, "courseId");
  const moduleId = stringFromForm(formData, "moduleId");
  const title = stringFromForm(formData, "title").trim();

  if (!courseId || !moduleId || title.length < 2) throw new Error("Datos de leccion invalidos.");

  await assertCourseOwner(courseId, auth.user.id);
  await createLesson({ courseId, moduleId, title });
  revalidatePath("/admin/cursos");
  revalidatePath(courseEditorPath(courseId));
  return getCourseContent(courseId, auth.user.id);
}

export async function updateLessonTitleAction(formData: FormData): Promise<CourseContent | null> {
  const auth = await requireUser();
  const courseId = stringFromForm(formData, "courseId");
  const lessonId = stringFromForm(formData, "lessonId");
  const title = stringFromForm(formData, "title").trim();

  if (!courseId || !lessonId || title.length < 2) throw new Error("Titulo de leccion invalido.");

  await assertCourseOwner(courseId, auth.user.id);
  await updateLessonTitle({ courseId, lessonId, title });
  revalidatePath(courseEditorPath(courseId));
  return getCourseContent(courseId, auth.user.id);
}

export async function updateLessonMediaAction(formData: FormData): Promise<CourseContent | null> {
  const auth = await requireUser();
  const courseId = stringFromForm(formData, "courseId");
  const lessonId = stringFromForm(formData, "lessonId");
  const title = stringFromForm(formData, "title").trim();
  const lessonType = stringFromForm(formData, "lessonType") || "video";
  const status = stringFromForm(formData, "status") || "draft";

  if (!courseId || !lessonId || title.length < 2) throw new Error("Leccion invalida.");

  await assertCourseOwner(courseId, auth.user.id);
  await updateLessonDetails({
    courseId,
    lessonId,
    title,
    description: nullableString(formData, "description"),
    videoUrl: nullableString(formData, "videoUrl"),
    mediaBucket: nullableString(formData, "mediaBucket"),
    mediaPath: nullableString(formData, "mediaPath"),
    mediaKind: nullableString(formData, "mediaKind"),
    lessonType,
    durationMinutes: numberOrNull(formData, "durationMinutes"),
    status
  });
  revalidatePath(courseEditorPath(courseId));
  revalidatePath(`/learn/${courseId}`);
  revalidatePath("/cursos");
  return getCourseContent(courseId, auth.user.id);
}

export async function deleteLessonAction(formData: FormData): Promise<CourseContent | null> {
  const auth = await requireUser();
  const courseId = stringFromForm(formData, "courseId");
  const lessonId = stringFromForm(formData, "lessonId");

  if (!courseId || !lessonId) throw new Error("Leccion invalida.");

  await assertCourseOwner(courseId, auth.user.id);
  await deleteLesson({ courseId, lessonId });
  revalidatePath("/admin/cursos");
  revalidatePath(courseEditorPath(courseId));
  return getCourseContent(courseId, auth.user.id);
}

export async function updateCourseMediaAction(formData: FormData): Promise<CourseContent | null> {
  const auth = await requireUser();
  const courseId = stringFromForm(formData, "courseId");
  const mediaRole = stringFromForm(formData, "mediaRole");
  const mediaUrl = nullableString(formData, "mediaUrl");
  const mediaPath = nullableString(formData, "mediaPath");

  if (!courseId || !mediaRole) throw new Error("Media de curso invalida.");

  await assertCourseOwner(courseId, auth.user.id);
  await updateCourseMedia(
    mediaRole === "cover"
      ? { courseId, coverImageUrl: mediaUrl, coverImagePath: mediaPath }
      : { courseId, thumbnailUrl: mediaUrl, thumbnailPath: mediaPath }
  );
  revalidatePath(courseEditorPath(courseId));
  revalidatePath("/cursos");
  return getCourseContent(courseId, auth.user.id);
}

export async function createLessonResourceAction(formData: FormData): Promise<CourseContent | null> {
  const auth = await requireUser();
  const courseId = stringFromForm(formData, "courseId");
  const lessonId = stringFromForm(formData, "lessonId");
  const title = stringFromForm(formData, "title").trim();
  const fileUrl = stringFromForm(formData, "fileUrl");
  const fileType = nullableString(formData, "fileType");

  if (!courseId || !lessonId || title.length < 2 || !fileUrl) throw new Error("Recurso invalido.");

  await assertCourseOwner(courseId, auth.user.id);
  await createLessonResource({
    courseId,
    lessonId,
    title,
    fileUrl,
    fileBucket: nullableString(formData, "fileBucket"),
    filePath: nullableString(formData, "filePath"),
    fileType,
    fileSize: numberOrNull(formData, "fileSize")
  });
  revalidatePath(courseEditorPath(courseId));
  revalidatePath(`/learn/${courseId}`);
  return getCourseContent(courseId, auth.user.id);
}

export async function deleteLessonResourceAction(formData: FormData): Promise<CourseContent | null> {
  const auth = await requireUser();
  const courseId = stringFromForm(formData, "courseId");
  const resourceId = stringFromForm(formData, "resourceId");
  const bucket = nullableString(formData, "fileBucket");
  const path = nullableString(formData, "filePath");

  if (!courseId || !resourceId) throw new Error("Recurso invalido.");

  await assertCourseOwner(courseId, auth.user.id);
  await deleteLessonResource({ courseId, resourceId });
  if (bucket && path) await deleteMedia({ auth, courseId, bucket, path });
  revalidatePath(courseEditorPath(courseId));
  revalidatePath(`/learn/${courseId}`);
  return getCourseContent(courseId, auth.user.id);
}

export async function deleteLessonMediaAction(formData: FormData): Promise<CourseContent | null> {
  const auth = await requireUser();
  const courseId = stringFromForm(formData, "courseId");
  const lessonId = stringFromForm(formData, "lessonId");
  const bucket = nullableString(formData, "mediaBucket");
  const path = nullableString(formData, "mediaPath");

  if (!courseId || !lessonId) throw new Error("Media invalida.");

  await assertCourseOwner(courseId, auth.user.id);
  await updateLessonDetails({ courseId, lessonId, videoUrl: null, mediaBucket: null, mediaPath: null, mediaKind: null });
  if (bucket && path) await deleteMedia({ auth, courseId, bucket, path });
  revalidatePath(courseEditorPath(courseId));
  revalidatePath(`/learn/${courseId}`);
  return getCourseContent(courseId, auth.user.id);
}
