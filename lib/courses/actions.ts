"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/engines/auth/helpers";
import { stringFromForm } from "@/lib/courses/helpers";
import {
  createLesson,
  createModule,
  deleteLesson,
  deleteModule,
  getCourseContent,
  updateLessonTitle,
  updateModuleTitle
} from "@/lib/courses/repository";
import type { CourseContent } from "@/lib/courses/types";

const courseEditorPath = "/admin/cursos/id";

export async function getCourseContentAction(courseId?: string): Promise<CourseContent | null> {
  await requireAdmin();
  return getCourseContent(courseId);
}

export async function createModuleAction(formData: FormData): Promise<CourseContent | null> {
  await requireAdmin();
  const courseId = stringFromForm(formData, "courseId");
  const title = stringFromForm(formData, "title").trim();

  if (!courseId || title.length < 2) {
    throw new Error("Datos de modulo invalidos.");
  }

  await createModule({ courseId, title });
  revalidatePath(courseEditorPath);
  return getCourseContent(courseId);
}

export async function updateModuleTitleAction(formData: FormData): Promise<CourseContent | null> {
  await requireAdmin();
  const courseId = stringFromForm(formData, "courseId");
  const moduleId = stringFromForm(formData, "moduleId");
  const title = stringFromForm(formData, "title").trim();

  if (!courseId || !moduleId || title.length < 2) {
    throw new Error("Titulo de modulo invalido.");
  }

  await updateModuleTitle({ courseId, moduleId, title });
  revalidatePath(courseEditorPath);
  return getCourseContent(courseId);
}

export async function deleteModuleAction(formData: FormData): Promise<CourseContent | null> {
  await requireAdmin();
  const courseId = stringFromForm(formData, "courseId");
  const moduleId = stringFromForm(formData, "moduleId");

  if (!courseId || !moduleId) {
    throw new Error("Modulo invalido.");
  }

  await deleteModule({ courseId, moduleId });
  revalidatePath(courseEditorPath);
  return getCourseContent(courseId);
}

export async function createLessonAction(formData: FormData): Promise<CourseContent | null> {
  await requireAdmin();
  const courseId = stringFromForm(formData, "courseId");
  const moduleId = stringFromForm(formData, "moduleId");
  const title = stringFromForm(formData, "title").trim();

  if (!courseId || !moduleId || title.length < 2) {
    throw new Error("Datos de leccion invalidos.");
  }

  await createLesson({ courseId, moduleId, title });
  revalidatePath(courseEditorPath);
  return getCourseContent(courseId);
}

export async function updateLessonTitleAction(formData: FormData): Promise<CourseContent | null> {
  await requireAdmin();
  const courseId = stringFromForm(formData, "courseId");
  const lessonId = stringFromForm(formData, "lessonId");
  const title = stringFromForm(formData, "title").trim();

  if (!courseId || !lessonId || title.length < 2) {
    throw new Error("Titulo de leccion invalido.");
  }

  await updateLessonTitle({ courseId, lessonId, title });
  revalidatePath(courseEditorPath);
  return getCourseContent(courseId);
}

export async function deleteLessonAction(formData: FormData): Promise<CourseContent | null> {
  await requireAdmin();
  const courseId = stringFromForm(formData, "courseId");
  const lessonId = stringFromForm(formData, "lessonId");

  if (!courseId || !lessonId) {
    throw new Error("Leccion invalida.");
  }

  await deleteLesson({ courseId, lessonId });
  revalidatePath(courseEditorPath);
  return getCourseContent(courseId);
}
