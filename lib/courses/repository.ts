import { createClient } from "@/lib/supabase/server";
import { protectedMediaUrl } from "@/lib/courses/media";
import { slugifyTitle } from "@/lib/courses/helpers";
import type { AdminCourseSummary, Course, CourseContent, Lesson, LessonResource, Module } from "@/lib/courses/types";

type CourseRow = {
  id: string;
  creator_id: string | null;
  title: string;
  slug: string;
  description: string | null;
  cover_image_url: string | null;
  cover_image_path?: string | null;
  thumbnail_url: string | null;
  thumbnail_path?: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
};

type ModuleRow = {
  id: string;
  course_id: string;
  title: string;
  description: string | null;
  display_order: number;
  created_at: string;
  updated_at: string;
};

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

type LessonResourceRow = {
  id: string;
  lesson_id: string;
  title: string;
  file_url: string;
  file_bucket?: string | null;
  file_path?: string | null;
  file_type?: string | null;
  file_size?: number | null;
  display_order: number;
  created_at: string;
  updated_at: string;
};

type SupabaseQueryError = {
  message: string;
  code?: string;
  details?: string;
  hint?: string;
};

const courseColumns = "id,creator_id,title,slug,description,cover_image_url,cover_image_path,thumbnail_url,thumbnail_path,is_published,created_at,updated_at";
const legacyCourseColumns = "id,creator_id,title,slug,description,cover_image_url,thumbnail_url,is_published,created_at,updated_at";
const moduleColumns = "id,course_id,title,description,display_order,created_at,updated_at";
const lessonColumns =
  "id,product_id,module_id,title,slug,description,video_url,media_bucket,media_path,media_kind,display_order,is_preview,lesson_type,duration_minutes,status,created_at,updated_at";
const legacyLessonColumns = "id,product_id,module_id,title,slug,description,video_url,display_order,is_preview,lesson_type,duration_minutes,status,created_at,updated_at";
const resourceColumns = "id,lesson_id,title,file_url,file_bucket,file_path,file_type,file_size,display_order,created_at,updated_at";
const legacyResourceColumns = "id,lesson_id,title,file_url,display_order,created_at,updated_at";

function mapCourse(row: CourseRow): Course {
  return {
    id: row.id,
    creatorId: row.creator_id,
    title: row.title,
    slug: row.slug,
    description: row.description,
    coverImageUrl: row.cover_image_url,
    coverImagePath: row.cover_image_path ?? null,
    thumbnailUrl: row.thumbnail_url,
    thumbnailPath: row.thumbnail_path ?? null,
    isPublished: row.is_published,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function mapModule(row: ModuleRow): Module {
  return {
    id: row.id,
    courseId: row.course_id,
    title: row.title,
    description: row.description,
    displayOrder: row.display_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function mapLesson(row: LessonRow, resources: LessonResource[] = []): Lesson {
  return {
    id: row.id,
    courseId: row.product_id,
    moduleId: row.module_id,
    title: row.title,
    slug: row.slug,
    description: row.description,
    videoUrl: row.video_url,
    mediaBucket: row.media_bucket ?? null,
    mediaPath: row.media_path ?? null,
    mediaKind: normalizeMediaKind(row.media_kind ?? null),
    displayOrder: row.display_order,
    isPreview: row.is_preview,
    lessonType: row.lesson_type === "text" || row.lesson_type === "pdf" ? row.lesson_type : "video",
    durationMinutes: row.duration_minutes,
    status: row.status === "published" ? "published" : "draft",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    resources
  };
}

function mapResource(row: LessonResourceRow, courseId: string): LessonResource {
  const fileBucket = row.file_bucket ?? null;
  const filePath = row.file_path ?? null;

  return {
    id: row.id,
    lessonId: row.lesson_id,
    title: row.title,
    fileUrl: fileBucket && filePath ? protectedMediaUrl({ bucket: fileBucket, path: filePath, courseId, lessonId: row.lesson_id }) : row.file_url,
    fileBucket,
    filePath,
    fileType: row.file_type ?? null,
    fileSize: row.file_size ?? null,
    displayOrder: row.display_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export async function listOwnedCourseSummaries(ownerId: string): Promise<AdminCourseSummary[]> {
  const supabase = await createClient();
  const primary = await supabase
    .from("courses")
    .select(courseColumns)
    .eq("creator_id", ownerId)
    .order("created_at", { ascending: false });
  let data = primary.data as CourseRow[] | null;
  let error: SupabaseQueryError | null = primary.error;

  if (isMissingCourseMediaSchemaColumn(error)) {
    const fallback = await supabase
      .from("courses")
      .select(legacyCourseColumns)
      .eq("creator_id", ownerId)
      .order("created_at", { ascending: false });
    data = fallback.data as CourseRow[] | null;
    error = fallback.error;
  }

  if (error) throw new Error(`Unable to list courses: ${error.message}`);

  const courses = (data ?? []).map(mapCourse);
  const courseIds = courses.map((course) => course.id);
  if (courseIds.length === 0) return [];

  const [modulesResult, lessonsResult] = await Promise.all([
    supabase.from("modules").select("id,course_id").in("course_id", courseIds),
    supabase.from("lessons").select("id,product_id").in("product_id", courseIds)
  ]);

  if (modulesResult.error) throw new Error(`Unable to count modules: ${modulesResult.error.message}`);
  if (lessonsResult.error) throw new Error(`Unable to count lessons: ${lessonsResult.error.message}`);

  const moduleCounts = countByKey(modulesResult.data, "course_id");
  const lessonCounts = countByKey(lessonsResult.data, "product_id");

  return courses.map((course) => ({ ...course, moduleCount: moduleCounts.get(course.id) ?? 0, lessonCount: lessonCounts.get(course.id) ?? 0 }));
}

export async function createCourseDraft(input: { ownerId: string; title: string }): Promise<Course> {
  const normalizedTitle = input.title.trim();
  const slug = `${slugifyTitle(normalizedTitle)}-${Date.now().toString(36)}`;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .insert({ creator_id: input.ownerId, title: normalizedTitle, slug, type: "curso", is_published: false })
    .select(legacyCourseColumns)
    .single();

  if (error) throw new Error(`Unable to create course: ${error.message}`);
  return mapCourse(data as CourseRow);
}

export async function getCourseContent(courseId?: string, ownerId?: string): Promise<CourseContent | null> {
  const supabase = await createClient();
  let courseQuery = supabase.from("courses").select(courseColumns);
  if (ownerId) courseQuery = courseQuery.eq("creator_id", ownerId);

  const primary = courseId
    ? await courseQuery.eq("id", courseId).maybeSingle()
    : await courseQuery.order("created_at", { ascending: false }).limit(1).maybeSingle();
  let courseRow = primary.data as CourseRow | null;
  let courseError: SupabaseQueryError | null = primary.error;

  if (isMissingCourseMediaSchemaColumn(courseError)) {
    let legacyCourseQuery = supabase.from("courses").select(legacyCourseColumns);
    if (ownerId) legacyCourseQuery = legacyCourseQuery.eq("creator_id", ownerId);
    const fallback = courseId
      ? await legacyCourseQuery.eq("id", courseId).maybeSingle()
      : await legacyCourseQuery.order("created_at", { ascending: false }).limit(1).maybeSingle();
    courseRow = fallback.data as CourseRow | null;
    courseError = fallback.error;
  }

  if (courseError) throw new Error(`Unable to load course: ${courseError.message}`);
  if (!courseRow) return null;

  const course = mapCourse(courseRow);
  const [modules, lessons, resources] = await Promise.all([listModules(course.id), listLessons(course.id), listResources(course.id)]);

  return {
    ...course,
    modules: modules.map((module) => ({
      ...module,
      lessons: lessons
        .filter((lesson) => lesson.moduleId === module.id)
        .map((lesson) => ({ ...lesson, resources: resources.filter((resource) => resource.lessonId === lesson.id) }))
    }))
  };
}

export async function createModule(input: { courseId: string; title: string }): Promise<Module> {
  const modules = await listModules(input.courseId);
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("modules")
    .insert({ course_id: input.courseId, title: input.title, display_order: nextDisplayOrder(modules) })
    .select(moduleColumns)
    .single();
  if (error) throw new Error(`Unable to create module: ${error.message}`);
  return mapModule(data);
}

export async function updateModuleTitle(input: { courseId: string; moduleId: string; title: string }): Promise<Module> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("modules")
    .update({ title: input.title })
    .eq("id", input.moduleId)
    .eq("course_id", input.courseId)
    .select(moduleColumns)
    .single();
  if (error) throw new Error(`Unable to update module title: ${error.message}`);
  return mapModule(data);
}

export async function deleteModule(input: { courseId: string; moduleId: string }): Promise<void> {
  const supabase = await createClient();
  const { error: lessonsError } = await supabase.from("lessons").delete().eq("product_id", input.courseId).eq("module_id", input.moduleId);
  if (lessonsError) throw new Error(`Unable to delete module lessons: ${lessonsError.message}`);
  const { error } = await supabase.from("modules").delete().eq("id", input.moduleId).eq("course_id", input.courseId);
  if (error) throw new Error(`Unable to delete module: ${error.message}`);
}

export async function createLesson(input: { courseId: string; moduleId: string; title: string }): Promise<Lesson> {
  const [module, lessons] = await Promise.all([getModuleById(input.moduleId), listLessons(input.courseId)]);
  if (!module || module.courseId !== input.courseId) throw new Error("Modulo invalido.");

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("lessons")
    .insert({ product_id: input.courseId, module_id: input.moduleId, title: input.title, slug: nextLessonSlug(input.title, lessons), display_order: nextDisplayOrder(lessons.filter((lesson) => lesson.moduleId === input.moduleId)), status: "draft" })
    .select(legacyLessonColumns)
    .single();
  if (error) throw new Error(`Unable to create lesson: ${error.message}`);
  return mapLesson(data as LessonRow);
}

export async function updateLessonTitle(input: { courseId: string; lessonId: string; title: string }): Promise<Lesson> {
  return updateLessonDetails({ courseId: input.courseId, lessonId: input.lessonId, title: input.title });
}

export async function updateLessonDetails(input: {
  courseId: string;
  lessonId: string;
  title?: string;
  description?: string | null;
  videoUrl?: string | null;
  mediaBucket?: string | null;
  mediaPath?: string | null;
  mediaKind?: string | null;
  lessonType?: string;
  durationMinutes?: number | null;
  status?: string;
}): Promise<Lesson> {
  const supabase = await createClient();
  const update: Record<string, unknown> = {};
  if (input.title !== undefined) update.title = input.title;
  if (input.description !== undefined) update.description = input.description;
  if (input.videoUrl !== undefined) update.video_url = input.videoUrl;
  if (input.mediaBucket !== undefined) update.media_bucket = input.mediaBucket;
  if (input.mediaPath !== undefined) update.media_path = input.mediaPath;
  if (input.mediaKind !== undefined) update.media_kind = input.mediaKind;
  if (input.lessonType !== undefined) update.lesson_type = input.lessonType;
  if (input.durationMinutes !== undefined) update.duration_minutes = input.durationMinutes;
  if (input.status !== undefined) update.status = input.status;

  const primary = await supabase
    .from("lessons")
    .update(update)
    .eq("id", input.lessonId)
    .eq("product_id", input.courseId)
    .select(lessonColumns)
    .single();
  let data = primary.data as LessonRow | null;
  let error: SupabaseQueryError | null = primary.error;

  if (isMissingCourseMediaSchemaColumn(error)) {
    const legacyUpdate: Record<string, unknown> = {};
    if (input.title !== undefined) legacyUpdate.title = input.title;
    if (input.description !== undefined) legacyUpdate.description = input.description;
    if (input.videoUrl !== undefined) legacyUpdate.video_url = input.videoUrl;
    if (input.lessonType !== undefined) legacyUpdate.lesson_type = input.lessonType;
    if (input.durationMinutes !== undefined) legacyUpdate.duration_minutes = input.durationMinutes;
    if (input.status !== undefined) legacyUpdate.status = input.status;

    if (Object.keys(legacyUpdate).length === 0) {
      throw new Error("Unable to update lesson: lesson media columns are not available in the database schema.");
    }

    const fallback = await supabase
      .from("lessons")
      .update(legacyUpdate)
      .eq("id", input.lessonId)
      .eq("product_id", input.courseId)
      .select(legacyLessonColumns)
      .single();
    data = fallback.data as LessonRow | null;
    error = fallback.error;
  }

  if (error) throw new Error(`Unable to update lesson: ${error.message}`);
  if (!data) throw new Error("Unable to update lesson: lesson not found.");
  return mapLesson(data);
}

export async function deleteLesson(input: { courseId: string; lessonId: string }): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("lessons").delete().eq("id", input.lessonId).eq("product_id", input.courseId);
  if (error) throw new Error(`Unable to delete lesson: ${error.message}`);
}

export async function updateCourseMedia(input: { courseId: string; thumbnailUrl?: string | null; thumbnailPath?: string | null; coverImageUrl?: string | null; coverImagePath?: string | null }): Promise<Course> {
  const supabase = await createClient();
  const update: Record<string, unknown> = {};
  if (input.thumbnailUrl !== undefined) update.thumbnail_url = input.thumbnailUrl;
  if (input.thumbnailPath !== undefined) update.thumbnail_path = input.thumbnailPath;
  if (input.coverImageUrl !== undefined) update.cover_image_url = input.coverImageUrl;
  if (input.coverImagePath !== undefined) update.cover_image_path = input.coverImagePath;

  const primary = await supabase.from("products").update(update).eq("id", input.courseId).eq("type", "curso").select(courseColumns).single();
  let data = primary.data as CourseRow | null;
  let error: SupabaseQueryError | null = primary.error;

  if (isMissingCourseMediaSchemaColumn(error)) {
    const legacyUpdate: Record<string, unknown> = {};
    if (input.thumbnailUrl !== undefined) legacyUpdate.thumbnail_url = input.thumbnailUrl;
    if (input.coverImageUrl !== undefined) legacyUpdate.cover_image_url = input.coverImageUrl;

    if (Object.keys(legacyUpdate).length === 0) {
      throw new Error("Unable to update course media: course media path columns are not available in the database schema.");
    }

    const fallback = await supabase.from("products").update(legacyUpdate).eq("id", input.courseId).eq("type", "curso").select(legacyCourseColumns).single();
    data = fallback.data as CourseRow | null;
    error = fallback.error;
  }

  if (error) throw new Error(`Unable to update course media: ${error.message}`);
  if (!data) throw new Error("Unable to update course media: course not found.");
  return mapCourse(data);
}

export async function createLessonResource(input: { courseId: string; lessonId: string; title: string; fileUrl: string; fileBucket: string | null; filePath: string | null; fileType: string | null; fileSize: number | null }): Promise<LessonResource> {
  const resources = await listResources(input.courseId, input.lessonId);
  const supabase = await createClient();
  const primary = await supabase
    .from("lesson_resources")
    .insert({ lesson_id: input.lessonId, title: input.title, file_url: input.fileUrl, file_bucket: input.fileBucket, file_path: input.filePath, file_type: input.fileType, file_size: input.fileSize, display_order: nextDisplayOrder(resources) })
    .select(resourceColumns)
    .single();
  let data = primary.data as LessonResourceRow | null;
  let error: SupabaseQueryError | null = primary.error;

  if (isMissingCourseMediaSchemaColumn(error)) {
    const fallback = await supabase
      .from("lesson_resources")
      .insert({ lesson_id: input.lessonId, title: input.title, file_url: input.fileUrl, display_order: nextDisplayOrder(resources) })
      .select(legacyResourceColumns)
      .single();
    data = fallback.data as LessonResourceRow | null;
    error = fallback.error;
  }

  if (error) throw new Error(`Unable to create lesson resource: ${error.message}`);
  if (!data) throw new Error("Unable to create lesson resource: resource not found.");
  return mapResource(data, input.courseId);
}

export async function deleteLessonResource(input: { courseId: string; resourceId: string }): Promise<LessonResource | null> {
  const supabase = await createClient();
  const primary = await supabase
    .from("lesson_resources")
    .delete()
    .eq("id", input.resourceId)
    .select(resourceColumns)
    .maybeSingle();
  let data = primary.data as LessonResourceRow | null;
  let error: SupabaseQueryError | null = primary.error;

  if (isMissingCourseMediaSchemaColumn(error)) {
    const fallback = await supabase
      .from("lesson_resources")
      .delete()
      .eq("id", input.resourceId)
      .select(legacyResourceColumns)
      .maybeSingle();
    data = fallback.data as LessonResourceRow | null;
    error = fallback.error;
  }

  if (error) throw new Error(`Unable to delete lesson resource: ${error.message}`);
  return data ? mapResource(data, input.courseId) : null;
}

async function listModules(courseId: string): Promise<Module[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("modules").select(moduleColumns).eq("course_id", courseId).order("display_order", { ascending: true }).order("created_at", { ascending: true });
  if (error) throw new Error(`Unable to list modules: ${error.message}`);
  return data.map(mapModule);
}

async function listLessons(courseId: string): Promise<Lesson[]> {
  const supabase = await createClient();
  const primary = await supabase.from("lessons").select(lessonColumns).eq("product_id", courseId).order("display_order", { ascending: true }).order("created_at", { ascending: true });
  let data = primary.data as LessonRow[] | null;
  let error: SupabaseQueryError | null = primary.error;

  if (isMissingCourseMediaSchemaColumn(error)) {
    const fallback = await supabase.from("lessons").select(legacyLessonColumns).eq("product_id", courseId).order("display_order", { ascending: true }).order("created_at", { ascending: true });
    data = fallback.data as LessonRow[] | null;
    error = fallback.error;
  }

  if (error) throw new Error(`Unable to list lessons: ${error.message}`);
  return (data ?? []).map((row) => mapLesson(row));
}

async function listResources(courseId: string, lessonId?: string): Promise<LessonResource[]> {
  const lessons = await listLessons(courseId);
  const lessonIds = lessonId ? [lessonId] : lessons.map((lesson) => lesson.id);
  if (lessonIds.length === 0) return [];
  const supabase = await createClient();
  const primary = await supabase.from("lesson_resources").select(resourceColumns).in("lesson_id", lessonIds).order("display_order", { ascending: true }).order("created_at", { ascending: true });
  let data = primary.data as LessonResourceRow[] | null;
  let error: SupabaseQueryError | null = primary.error;

  if (isMissingCourseMediaSchemaColumn(error)) {
    const fallback = await supabase.from("lesson_resources").select(legacyResourceColumns).in("lesson_id", lessonIds).order("display_order", { ascending: true }).order("created_at", { ascending: true });
    data = fallback.data as LessonResourceRow[] | null;
    error = fallback.error;
  }

  if (error) throw new Error(`Unable to list resources: ${error.message}`);
  return (data ?? []).map((row) => mapResource(row, courseId));
}

async function getModuleById(moduleId: string): Promise<Module | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("modules").select(moduleColumns).eq("id", moduleId).maybeSingle();
  if (error) throw new Error(`Unable to load module: ${error.message}`);
  return data ? mapModule(data) : null;
}

function nextDisplayOrder(items: Array<{ displayOrder: number }>): number {
  return items.length === 0 ? 0 : Math.max(...items.map((item) => item.displayOrder)) + 1;
}

function nextLessonSlug(title: string, lessons: Lesson[]): string {
  const baseSlug = slugifyTitle(title);
  const existingSlugs = new Set(lessons.map((lesson) => lesson.slug));
  if (!existingSlugs.has(baseSlug)) return baseSlug;
  let suffix = 2;
  while (existingSlugs.has(`${baseSlug}-${suffix}`)) suffix += 1;
  return `${baseSlug}-${suffix}`;
}

function countByKey<T extends Record<string, string>>(rows: T[] | null, key: keyof T): Map<string, number> {
  const counts = new Map<string, number>();
  rows?.forEach((row) => {
    const value = row[key];
    counts.set(value, (counts.get(value) ?? 0) + 1);
  });
  return counts;
}

function normalizeMediaKind(value: string | null): Lesson["mediaKind"] {
  if (value === "pdf" || value === "image" || value === "external") return value;
  if (value === "video") return "video";
  return null;
}

function isMissingCourseMediaSchemaColumn(error: SupabaseQueryError | null): boolean {
  if (!error) return false;
  const mediaSchemaColumns = [
    "cover_image_path",
    "thumbnail_path",
    "media_bucket",
    "media_path",
    "media_kind",
    "file_bucket",
    "file_path",
    "file_type",
    "file_size"
  ];
  const message = [error.message, error.details, error.hint].filter(Boolean).join(" ").toLowerCase();
  return (
    mediaSchemaColumns.some((column) => message.includes(column)) &&
    (message.includes("does not exist") || message.includes("could not find") || message.includes("schema cache"))
  );
}
