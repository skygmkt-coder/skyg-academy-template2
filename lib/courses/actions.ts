"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/engines/auth/helpers";
import { stringFromForm } from "@/lib/courses/helpers";
import {
  createLesson,
  createModule,
  getCourseContent,
  updateLessonTitle
} from "@/lib/courses/repository";
import type { CourseContent } from "@/lib/courses/types";

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
  revalidatePath("/admin/cursos/id");
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
  revalidatePath("/admin/cursos/id");
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
  revalidatePath("/admin/cursos/id");
  return getCourseContent(courseId);
}
