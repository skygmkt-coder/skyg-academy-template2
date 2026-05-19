"use client";

import { createClient } from "@/lib/supabase/client";
import type { CourseMediaIntent } from "@/lib/courses/media";

type UploadResult = {
  bucket: string;
  path: string;
  publicUrl: string | null;
  mediaUrl: string;
};

type UploadInput = {
  intent: CourseMediaIntent;
  courseId: string;
  lessonId?: string;
  file: File;
};

export async function uploadCourseThumbnail(courseId: string, file: File): Promise<UploadResult> {
  return uploadCourseMedia({ intent: "course-thumbnail", courseId, file });
}

export async function uploadCourseCover(courseId: string, file: File): Promise<UploadResult> {
  return uploadCourseMedia({ intent: "course-cover", courseId, file });
}

export async function uploadLessonResource(courseId: string, lessonId: string, file: File): Promise<UploadResult> {
  return uploadCourseMedia({ intent: "lesson-resource", courseId, lessonId, file });
}

export async function uploadLessonMedia(courseId: string, lessonId: string, file: File): Promise<UploadResult> {
  return uploadCourseMedia({ intent: "lesson-media", courseId, lessonId, file });
}

async function uploadCourseMedia(input: UploadInput): Promise<UploadResult> {
  const response = await fetch("/api/uploads/course-media", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      intent: input.intent,
      courseId: input.courseId,
      lessonId: input.lessonId,
      fileName: input.file.name,
      contentType: input.file.type,
      size: input.file.size
    })
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { message?: string } | null;
    throw new Error(payload?.message ?? "No pudimos preparar la carga.");
  }

  const payload = (await response.json()) as UploadResult & { token: string };
  const supabase = createClient();
  const { error } = await supabase.storage
    .from(payload.bucket)
    .uploadToSignedUrl(payload.path, payload.token, input.file, { contentType: input.file.type });

  if (error) {
    throw new Error(error.message);
  }

  return { bucket: payload.bucket, path: payload.path, publicUrl: payload.publicUrl, mediaUrl: payload.mediaUrl };
}
