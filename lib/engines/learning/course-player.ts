import { notFound } from "next/navigation";

import { protectedMediaUrl } from "@/lib/courses/media";
import type { AuthenticatedUser } from "@/lib/engines/auth/types";
import { checkCourseAccess } from "@/lib/engines/learning/enrollments";
import { getCoursePaymentSettings, listStudentPaymentProofs } from "@/lib/engines/learning/manual-payments";
import { listProgressForProduct, markLessonCompleted, markLessonViewed } from "@/lib/engines/learning/repository";
import type { CoursePlayerExperience, CoursePlayerLesson, CoursePlayerModule } from "@/lib/engines/learning/types";
import { createClient } from "@/lib/supabase/server";

type CourseRow = {
  id: string;
  creator_id: string | null;
  title: string;
  slug: string;
  description: string | null;
  cover_image_url: string | null;
  cover_image_path?: string | null;
  thumbnail_url?: string | null;
  thumbnail_path?: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
};

type ModuleRow = { id: string; course_id: string; title: string; description: string | null; display_order: number; created_at: string; updated_at: string };

type LessonRow = {
  id: string;
  product_id: string;
  module_id: string | null;
  title: string;
  slug: string;
  description: string | null;
  video_url: string | null;
  media_bucket?: string | null;
  media_path?: string | null;
  media_kind?: string | null;
  display_order: number;
  is_preview: boolean;
  lesson_type: string;
  duration_minutes: number | null;
  status: string;
  created_at: string;
  updated_at: string;
};

type ResourceRow = {
  id: string;
  lesson_id: string;
  title: string;
  file_url: string;
  file_bucket?: string | null;
  file_path?: string | null;
  display_order: number;
};

type SupabaseQueryError = {
  message: string;
  code?: string;
  details?: string;
  hint?: string;
};
type DbValue = string | number | boolean | null;
type DbRow = Record<string, DbValue>;
type QueryResult = PromiseLike<{ data: DbRow | DbRow[] | null; error: SupabaseQueryError | null }>;
type CoursePlayerQuery = {
  select: (columns: string) => CoursePlayerQuery;
  eq: (column: string, value: DbValue) => CoursePlayerQuery;
  in: (column: string, values: DbValue[]) => CoursePlayerQuery;
  order: (column: string, options?: { ascending?: boolean }) => CoursePlayerQuery;
  maybeSingle: () => QueryResult;
  then: QueryResult["then"];
};
type CoursePlayerTable = {
  select: (columns: string) => CoursePlayerQuery;
};
type CoursePlayerTableName = "courses" | "modules" | "lessons" | "lesson_resources";
type CoursePlayerClient = {
  from: (table: CoursePlayerTableName) => CoursePlayerTable;
};

const courseColumns = "id,creator_id,title,slug,description,cover_image_url,cover_image_path,thumbnail_url,thumbnail_path,is_published,created_at,updated_at";
const storefrontCourseColumns = "id,creator_id,title,slug,description,cover_image_url,thumbnail_url,is_published,created_at,updated_at";
const baseCourseColumns = "id,creator_id,title,slug,description,cover_image_url,is_published,created_at,updated_at";
const moduleColumns = "id,course_id,title,description,display_order,created_at,updated_at";
const lessonColumns = "id,product_id,module_id,title,slug,description,video_url,media_bucket,media_path,media_kind,display_order,is_preview,lesson_type,duration_minutes,status,created_at,updated_at";
const legacyLessonColumns = "id,product_id,module_id,title,slug,description,video_url,display_order,is_preview,lesson_type,duration_minutes,status,created_at,updated_at";
const resourceColumns = "id,lesson_id,title,file_url,file_bucket,file_path,display_order";
const legacyResourceColumns = "id,lesson_id,title,file_url,display_order";

async function createCoursePlayerClient(): Promise<CoursePlayerClient> {
  const client = await createClient();
  return {
    from: (table: CoursePlayerTableName) => {
      if (table === "courses") return client.from("courses") as CoursePlayerTable;
      if (table === "modules") return client.from("modules") as CoursePlayerTable;
      if (table === "lessons") return client.from("lessons") as CoursePlayerTable;
      return client.from("lesson_resources") as CoursePlayerTable;
    }
  };
}

export async function getCoursePlayerExperience(input: { auth: AuthenticatedUser; courseId: string; lessonId?: string; lessonSlug?: string; markViewed: boolean }): Promise<CoursePlayerExperience> {
  const course = await getCourseRow(input.courseId);
  if (!course) notFound();

  const [hasAccess, paymentSettings, paymentProofs] = await Promise.all([
    checkCourseAccess(input.auth, course.id),
    getCoursePaymentSettings(course.id),
    listStudentPaymentProofs(input.auth.user.id, course.id)
  ]);

  if (!hasAccess) return emptyExperience(course, false, paymentSettings, paymentProofs);

  const [modules, lessons, resources, progressRows] = await Promise.all([
    listModules(course.id),
    listLessons(course.id),
    listResources(course.id),
    listProgressForProduct(input.auth.user.id, course.id)
  ]);

  const completedLessonIds = progressRows.filter((progress) => progress.isCompleted).map((progress) => progress.lessonId);
  const completedSet = new Set(completedLessonIds);
  const playerLessons = lessons.map((lesson) => ({
    ...mapLesson(lesson, resources.filter((resource) => resource.lesson_id === lesson.id)),
    isCompleted: completedSet.has(lesson.id)
  }));
  const activeLesson = resolveActiveLesson(playerLessons, input.lessonId, input.lessonSlug);

  if (playerLessons.length > 0 && !activeLesson) notFound();

  if (activeLesson && input.markViewed) {
    await markLessonViewed({ userId: input.auth.user.id, productId: course.id, lessonId: activeLesson.id });
  }

  const activeIndex = activeLesson ? playerLessons.findIndex((lesson) => lesson.id === activeLesson.id) : -1;
  const totalLessons = playerLessons.length;
  const completedLessons = completedSet.size;

  return {
    course: mapCourse(course),
    modules: buildPlayerModules(modules, playerLessons),
    activeLesson: activeLesson ?? null,
    previousLessonId: activeIndex > 0 ? playerLessons[activeIndex - 1]?.id ?? null : null,
    nextLessonId: activeIndex >= 0 && activeIndex < playerLessons.length - 1 ? playerLessons[activeIndex + 1]?.id ?? null : null,
    progress: { productId: course.id, totalLessons, completedLessons, progressPercentage: totalLessons === 0 ? 0 : Math.round((completedLessons / totalLessons) * 100), lastViewedLessonSlug: null },
    completedLessonIds,
    hasAccess,
    paymentSettings,
    paymentProofs
  };
}

export async function completeCoursePlayerLesson(input: { auth: AuthenticatedUser; courseId: string; lessonId: string }): Promise<void> {
  const hasAccess = await checkCourseAccess(input.auth, input.courseId);
  if (!hasAccess) throw new Error("No tienes acceso a este curso.");
  const experience = await getCoursePlayerExperience({ auth: input.auth, courseId: input.courseId, lessonId: input.lessonId, markViewed: false });
  if (!experience.activeLesson) throw new Error("Leccion invalida.");
  await markLessonCompleted({ userId: input.auth.user.id, productId: input.courseId, lessonId: input.lessonId });
  const progressRows = await listProgressForProduct(input.auth.user.id, input.courseId);
  if (!progressRows.some((row) => row.lessonId === input.lessonId && row.isCompleted)) throw new Error("No pudimos validar la persistencia del progreso.");
}

async function getCourseRow(courseId: string): Promise<CourseRow | null> {
  const supabase = await createCoursePlayerClient();
  const primary = await supabase.from("courses").select(courseColumns).eq("id", courseId).maybeSingle();
  let data = primary.data as CourseRow | null;
  let error: SupabaseQueryError | null = primary.error;

  if (isMissingCourseMediaSchemaColumn(error)) {
    const storefrontFallback = await supabase.from("courses").select(storefrontCourseColumns).eq("id", courseId).maybeSingle();
    data = storefrontFallback.data as CourseRow | null;
    error = storefrontFallback.error;
  }

  if (isMissingCourseMediaSchemaColumn(error)) {
    const baseFallback = await supabase.from("courses").select(baseCourseColumns).eq("id", courseId).maybeSingle();
    data = baseFallback.data as CourseRow | null;
    error = baseFallback.error;
  }

  if (error) throw new Error(`Unable to load course: ${error.message}`);
  return data;
}

async function listModules(courseId: string): Promise<ModuleRow[]> {
  const supabase = await createCoursePlayerClient();
  const { data, error } = await supabase.from("modules").select(moduleColumns).eq("course_id", courseId).order("display_order", { ascending: true }).order("created_at", { ascending: true });
  if (error) throw new Error(`Unable to load course modules: ${error.message}`);
  return (data ?? []) as ModuleRow[];
}

async function listLessons(courseId: string): Promise<LessonRow[]> {
  const supabase = await createCoursePlayerClient();
  const primary = await supabase.from("lessons").select(lessonColumns).eq("product_id", courseId).order("display_order", { ascending: true }).order("created_at", { ascending: true });
  let data = primary.data as LessonRow[] | null;
  let error: SupabaseQueryError | null = primary.error;

  if (isMissingCourseMediaSchemaColumn(error)) {
    const fallback = await supabase.from("lessons").select(legacyLessonColumns).eq("product_id", courseId).order("display_order", { ascending: true }).order("created_at", { ascending: true });
    data = fallback.data as LessonRow[] | null;
    error = fallback.error;
  }

  if (error) throw new Error(`Unable to load course lessons: ${error.message}`);
  return data ?? [];
}

async function listResources(courseId: string): Promise<ResourceRow[]> {
  const lessons = await listLessonIds(courseId);
  if (lessons.length === 0) return [];
  const supabase = await createCoursePlayerClient();
  const primary = await supabase.from("lesson_resources").select(resourceColumns).in("lesson_id", lessons).order("display_order", { ascending: true });
  let data = primary.data as ResourceRow[] | null;
  let error: SupabaseQueryError | null = primary.error;

  if (isMissingCourseMediaSchemaColumn(error)) {
    const fallback = await supabase.from("lesson_resources").select(legacyResourceColumns).in("lesson_id", lessons).order("display_order", { ascending: true });
    data = fallback.data as ResourceRow[] | null;
    error = fallback.error;
  }

  if (error) throw new Error(`Unable to load lesson resources: ${error.message}`);
  return data ?? [];
}

async function listLessonIds(courseId: string): Promise<string[]> {
  const supabase = await createCoursePlayerClient();
  const { data, error } = await supabase.from("lessons").select("id").eq("product_id", courseId);
  if (error) throw new Error(`Unable to load lesson ids: ${error.message}`);
  return ((data ?? []) as Array<{ id: string }>).map((row) => row.id);
}

function buildPlayerModules(modules: ModuleRow[], lessons: CoursePlayerLesson[]): CoursePlayerModule[] {
  const knownModuleIds = new Set(modules.map((module) => module.id));
  const grouped = modules.map((module) => ({ id: module.id, courseId: module.course_id, title: module.title, description: module.description, displayOrder: module.display_order, createdAt: module.created_at, updatedAt: module.updated_at, lessons: lessons.filter((lesson) => lesson.moduleId === module.id) }));
  const looseLessons = lessons.filter((lesson) => !lesson.moduleId || !knownModuleIds.has(lesson.moduleId));
  if (looseLessons.length > 0) grouped.push({ id: "unassigned", courseId: looseLessons[0]?.courseId ?? "", title: "Sin modulo", description: null, displayOrder: grouped.length, createdAt: "", updatedAt: "", lessons: looseLessons });
  return grouped;
}

function mapLesson(row: LessonRow, resources: ResourceRow[]): Omit<CoursePlayerLesson, "isCompleted"> {
  const mediaBucket = row.media_bucket ?? null;
  const mediaPath = row.media_path ?? null;
  const mediaKind = row.media_kind ?? null;
  const mediaUrl = mediaBucket && mediaPath ? protectedMediaUrl({ bucket: mediaBucket, path: mediaPath, courseId: row.product_id, lessonId: row.id }) : row.video_url;
  return {
    id: row.id,
    courseId: row.product_id,
    moduleId: row.module_id,
    title: row.title,
    slug: row.slug,
    description: row.description,
    videoUrl: mediaUrl,
    mediaBucket,
    mediaPath,
    mediaKind: mediaKind === "pdf" || mediaKind === "image" || mediaKind === "external" ? mediaKind : mediaKind === "video" ? "video" : null,
    displayOrder: row.display_order,
    isPreview: row.is_preview,
    lessonType: row.lesson_type === "text" || row.lesson_type === "pdf" ? row.lesson_type : "video",
    durationMinutes: row.duration_minutes,
    status: row.status === "published" ? "published" : "draft",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    resources: resources.map((resource) => {
      const fileBucket = resource.file_bucket ?? null;
      const filePath = resource.file_path ?? null;
      return {
        id: resource.id,
        lessonId: resource.lesson_id,
        title: resource.title,
        fileUrl: fileBucket && filePath ? protectedMediaUrl({ bucket: fileBucket, path: filePath, courseId: row.product_id, lessonId: resource.lesson_id }) : resource.file_url,
        displayOrder: resource.display_order
      };
    })
  };
}

function resolveActiveLesson(lessons: CoursePlayerLesson[], lessonId?: string, lessonSlug?: string): CoursePlayerLesson | null {
  if (lessons.length === 0) return null;
  if (lessonId) return lessons.find((lesson) => lesson.id === lessonId) ?? null;
  if (lessonSlug) return lessons.find((lesson) => lesson.slug === lessonSlug) ?? null;
  return lessons[0] ?? null;
}

function mapCourse(course: CourseRow): CoursePlayerExperience["course"] {
  return { id: course.id, creatorId: course.creator_id, title: course.title, slug: course.slug, description: course.description, coverImageUrl: course.cover_image_url, coverImagePath: course.cover_image_path ?? null, thumbnailUrl: course.thumbnail_url ?? null, thumbnailPath: course.thumbnail_path ?? null, isPublished: course.is_published, createdAt: course.created_at, updatedAt: course.updated_at };
}

function emptyExperience(course: CourseRow, hasAccess: boolean, paymentSettings: CoursePlayerExperience["paymentSettings"], paymentProofs: CoursePlayerExperience["paymentProofs"]): CoursePlayerExperience {
  return { course: mapCourse(course), modules: [], activeLesson: null, previousLessonId: null, nextLessonId: null, progress: { productId: course.id, totalLessons: 0, completedLessons: 0, progressPercentage: 0, lastViewedLessonSlug: null }, completedLessonIds: [], hasAccess, paymentSettings, paymentProofs };
}

function isMissingCourseMediaSchemaColumn(error: SupabaseQueryError | null): boolean {
  if (!error) return false;
  const schemaColumns = [
    "cover_image_path",
    "thumbnail_url",
    "thumbnail_path",
    "media_bucket",
    "media_path",
    "media_kind",
    "file_bucket",
    "file_path"
  ];
  const message = [error.message, error.details, error.hint].filter(Boolean).join(" ").toLowerCase();
  return (
    schemaColumns.some((column) => message.includes(column)) &&
    (message.includes("does not exist") || message.includes("could not find") || message.includes("schema cache"))
  );
}
