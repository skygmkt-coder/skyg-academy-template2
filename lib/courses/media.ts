import crypto from "node:crypto";

import type { AuthenticatedUser } from "@/lib/engines/auth/types";
import { requireUser } from "@/lib/engines/auth/helpers";
import { canManageCourseEnrollment, checkCourseAccess } from "@/lib/engines/learning/enrollments";
import { createClient } from "@/lib/supabase/server";
import { APP_ROUTES, EXTENSION_BY_CONTENT_TYPE, STORAGE_BUCKETS, STORAGE_MIME_TYPES, STORAGE_SIGNED_URL_TTL_SECONDS, STORAGE_UPLOAD_LIMITS } from "@/src/config";

export type CourseMediaIntent = "course-thumbnail" | "course-cover" | "lesson-resource" | "lesson-media";
export type MediaKind = "video" | "pdf" | "image" | "external";

type SignedCourseMediaInput = {
  intent: CourseMediaIntent;
  courseId: string;
  lessonId?: string;
  fileName: string;
  contentType: string;
  size?: number;
};

type QueryBuilder = {
  select: (columns: string) => QueryBuilder;
  eq: (column: string, value: unknown) => QueryBuilder;
  maybeSingle: () => Promise<{ data: unknown; error: { message: string } | null }>;
};

type UntypedClient = {
  from: (table: string) => QueryBuilder;
};

const imageTypes = STORAGE_MIME_TYPES.IMAGES;
const resourceTypes = [...STORAGE_MIME_TYPES.DOCUMENTS, ...imageTypes];
const mediaTypes = [...STORAGE_MIME_TYPES.VIDEOS, "application/pdf", ...imageTypes];

export async function createSignedCourseMediaUpload(input: SignedCourseMediaInput): Promise<{
  bucket: string;
  path: string;
  token: string;
  signedUrl: string;
  publicUrl: string | null;
  mediaUrl: string;
}> {
  const auth = await requireUser();
  await assertCanManageCourseMedia(auth, input.courseId, input.lessonId);
  validateUpload(input);

  const supabase = await createClient();
  const bucket = bucketForIntent(input.intent);
  const extension = EXTENSION_BY_CONTENT_TYPE[input.contentType];
  const path = `${auth.user.id}/${input.courseId}/${input.lessonId ?? "course"}/${crypto.randomUUID()}.${extension}`;
  const { data, error } = await supabase.storage.from(bucket).createSignedUploadUrl(path);

  if (error || !data) {
    throw new Error(error?.message ?? "No pudimos preparar la carga del archivo.");
  }

  const publicUrl = bucket === STORAGE_BUCKETS.COURSE_THUMBNAILS ? supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl : null;
  const mediaUrl = publicUrl ?? protectedMediaUrl({ bucket, path, courseId: input.courseId, lessonId: input.lessonId });

  return { bucket, path, token: data.token, signedUrl: data.signedUrl, publicUrl, mediaUrl };
}

export async function createSignedMediaReadUrl(input: {
  auth: AuthenticatedUser;
  bucket: string;
  path: string;
  courseId: string;
}): Promise<string> {
  if (!(await checkCourseAccess(input.auth, input.courseId))) {
    throw new Error("No tienes acceso a este archivo.");
  }

  const supabase = await createClient();
  const { data, error } = await supabase.storage.from(input.bucket).createSignedUrl(input.path, STORAGE_SIGNED_URL_TTL_SECONDS.PROTECTED_MEDIA);

  if (error || !data) {
    throw new Error(error?.message ?? "No pudimos abrir el archivo.");
  }

  return data.signedUrl;
}

export async function deleteMedia(input: { auth: AuthenticatedUser; courseId: string; bucket: string; path: string }): Promise<void> {
  if (!(await canManageCourseEnrollment(input.auth, input.courseId))) {
    throw new Error("No tienes permisos para eliminar este archivo.");
  }

  const supabase = await createClient();
  const { error } = await supabase.storage.from(input.bucket).remove([input.path]);

  if (error) {
    throw new Error(`No pudimos eliminar el archivo: ${error.message}`);
  }
}

export function protectedMediaUrl(input: { bucket: string; path: string; courseId: string; lessonId?: string }): string {
  const params = new URLSearchParams({ bucket: input.bucket, path: input.path, courseId: input.courseId });
  if (input.lessonId) params.set("lessonId", input.lessonId);
  return `${APP_ROUTES.mediaDownload}?${params.toString()}`;
}

export function mediaKindFromContentType(contentType: string): MediaKind {
  if (contentType === "application/pdf") return "pdf";
  if (contentType.startsWith("image/")) return "image";
  return "video";
}

async function assertCanManageCourseMedia(auth: AuthenticatedUser, courseId: string, lessonId?: string): Promise<void> {
  if (!(await canManageCourseEnrollment(auth, courseId))) {
    throw new Error("No tienes permisos para administrar media de este curso.");
  }

  if (!lessonId) return;

  const db = (await createClient()) as unknown as UntypedClient;
  const { data, error } = await db
    .from("lessons")
    .select("id,product_id")
    .eq("id", lessonId)
    .eq("product_id", courseId)
    .maybeSingle();

  if (error) {
    throw new Error(`No pudimos validar la leccion: ${error.message}`);
  }

  if (!data) {
    throw new Error("Leccion invalida para este curso.");
  }
}

function bucketForIntent(intent: CourseMediaIntent): string {
  if (intent === "lesson-resource") return STORAGE_BUCKETS.LESSON_RESOURCES;
  if (intent === "lesson-media") return STORAGE_BUCKETS.LESSON_MEDIA;
  return STORAGE_BUCKETS.COURSE_THUMBNAILS;
}

function validateUpload(input: SignedCourseMediaInput): void {
  const extension = EXTENSION_BY_CONTENT_TYPE[input.contentType];
  if (!extension) throw new Error("Tipo de archivo no permitido.");
  if ((input.size ?? 0) > maxSizeForIntent(input.intent)) throw new Error("El archivo excede el limite permitido.");

  const allowed = input.intent === "lesson-media" ? mediaTypes : input.intent === "lesson-resource" ? resourceTypes : imageTypes;
  if (!allowed.includes(input.contentType)) throw new Error("Tipo de archivo no permitido para este destino.");
  if ((input.intent === "lesson-resource" || input.intent === "lesson-media") && !input.lessonId) {
    throw new Error("La leccion es obligatoria para subir media.");
  }
}

function maxSizeForIntent(intent: CourseMediaIntent): number {
  if (intent === "lesson-media") return STORAGE_UPLOAD_LIMITS.LESSON_MEDIA_BYTES;
  if (intent === "lesson-resource") return STORAGE_UPLOAD_LIMITS.LESSON_RESOURCE_BYTES;
  return STORAGE_UPLOAD_LIMITS.COURSE_IMAGE_BYTES;
}
