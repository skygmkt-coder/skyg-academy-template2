"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireUser } from "@/lib/engines/auth/helpers";
import { stringFromForm } from "@/lib/courses/helpers";
import { assertCourseOwner } from "@/lib/courses/ownership";
import {
  createCourseDraft,
  createLesson,
  createModule,
  deleteLesson,
  deleteModule,
  getCourseContent,
  updateLessonTitle,
  updateModuleTitle
} from "@/lib/courses/repository";
import type { CourseContent } from "@/lib/courses/types";

function courseEditorPath(courseId: string): string {
  return `/admin/cursos/${courseId}`;
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

  if (!courseId || title.length < 2) {
    throw new Error("Datos de modulo invalidos.");
  }

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

  if (!courseId || !moduleId || title.length < 2) {
    throw new Error("Titulo de modulo invalido.");
  }

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

  if (!courseId || !moduleId) {
    throw new Error("Modulo invalido.");
  }

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

  if (!courseId || !moduleId || title.length < 2) {
    throw new Error("Datos de leccion invalidos.");
  }

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

  if (!courseId || !lessonId || title.length < 2) {
    throw new Error("Titulo de leccion invalido.");
  }

  await assertCourseOwner(courseId, auth.user.id);
  await updateLessonTitle({ courseId, lessonId, title });
  revalidatePath(courseEditorPath(courseId));
  return getCourseContent(courseId, auth.user.id);
}

export async function deleteLessonAction(formData: FormData): Promise<CourseContent | null> {
  const auth = await requireUser();
  const courseId = stringFromForm(formData, "courseId");
  const lessonId = stringFromForm(formData, "lessonId");

  if (!courseId || !lessonId) {
    throw new Error("Leccion invalida.");
  }

  await assertCourseOwner(courseId, auth.user.id);
  await deleteLesson({ courseId, lessonId });
  revalidatePath("/admin/cursos");
  revalidatePath(courseEditorPath(courseId));
  return getCourseContent(courseId, auth.user.id);
}
