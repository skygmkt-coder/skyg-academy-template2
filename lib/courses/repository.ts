import { createClient } from "@/lib/supabase/server";
import { slugifyTitle } from "@/lib/courses/helpers";
import type { Course, CourseContent, Lesson, Module } from "@/lib/courses/types";

type CourseRow = {
  id: string;
  creator_id: string | null;
  title: string;
  slug: string;
  description: string | null;
  cover_image_url: string | null;
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
  display_order: number;
  is_preview: boolean;
  lesson_type: string;
  duration_minutes: number | null;
  status: string;
  created_at: string;
  updated_at: string;
};

const courseColumns = "id,creator_id,title,slug,description,cover_image_url,is_published,created_at,updated_at";
const moduleColumns = "id,course_id,title,description,display_order,created_at,updated_at";
const lessonColumns =
  "id,product_id,module_id,title,slug,description,video_url,display_order,is_preview,lesson_type,duration_minutes,status,created_at,updated_at";

function mapCourse(row: CourseRow): Course {
  return {
    id: row.id,
    creatorId: row.creator_id,
    title: row.title,
    slug: row.slug,
    description: row.description,
    coverImageUrl: row.cover_image_url,
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

function mapLesson(row: LessonRow): Lesson {
  return {
    id: row.id,
    courseId: row.product_id,
    moduleId: row.module_id,
    title: row.title,
    slug: row.slug,
    description: row.description,
    videoUrl: row.video_url,
    displayOrder: row.display_order,
    isPreview: row.is_preview,
    lessonType: row.lesson_type === "text" || row.lesson_type === "pdf" ? row.lesson_type : "video",
    durationMinutes: row.duration_minutes,
    status: row.status === "published" ? "published" : "draft",
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export async function getCourseContent(courseId?: string, ownerId?: string): Promise<CourseContent | null> {
  const supabase = await createClient();
  let courseQuery = supabase.from("courses").select(courseColumns);

  if (ownerId) {
    courseQuery = courseQuery.eq("creator_id", ownerId);
  }

  const { data: courseRow, error: courseError } = courseId
    ? await courseQuery.eq("id", courseId).maybeSingle()
    : await courseQuery.order("created_at", { ascending: false }).limit(1).maybeSingle();

  if (courseError) {
    throw new Error(`Unable to load course: ${courseError.message}`);
  }

  if (!courseRow) {
    return null;
  }

  const course = mapCourse(courseRow);
  const [modules, lessons] = await Promise.all([
    listModules(course.id),
    listLessons(course.id)
  ]);

  return {
    ...course,
    modules: modules.map((module) => ({
      ...module,
      lessons: lessons.filter((lesson) => lesson.moduleId === module.id)
    }))
  };
}

export async function createModule(input: { courseId: string; title: string }): Promise<Module> {
  const modules = await listModules(input.courseId);
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("modules")
    .insert({
      course_id: input.courseId,
      title: input.title,
      display_order: nextDisplayOrder(modules)
    })
    .select(moduleColumns)
    .single();

  if (error) {
    throw new Error(`Unable to create module: ${error.message}`);
  }

  return mapModule(data);
}

export async function updateModuleTitle(input: {
  courseId: string;
  moduleId: string;
  title: string;
}): Promise<Module> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("modules")
    .update({ title: input.title })
    .eq("id", input.moduleId)
    .eq("course_id", input.courseId)
    .select(moduleColumns)
    .single();

  if (error) {
    throw new Error(`Unable to update module title: ${error.message}`);
  }

  return mapModule(data);
}

export async function deleteModule(input: { courseId: string; moduleId: string }): Promise<void> {
  const supabase = await createClient();
  const { error: lessonsError } = await supabase
    .from("lessons")
    .delete()
    .eq("product_id", input.courseId)
    .eq("module_id", input.moduleId);

  if (lessonsError) {
    throw new Error(`Unable to delete module lessons: ${lessonsError.message}`);
  }

  const { error } = await supabase
    .from("modules")
    .delete()
    .eq("id", input.moduleId)
    .eq("course_id", input.courseId);

  if (error) {
    throw new Error(`Unable to delete module: ${error.message}`);
  }
}

export async function createLesson(input: { courseId: string; moduleId: string; title: string }): Promise<Lesson> {
  const [module, lessons] = await Promise.all([
    getModuleById(input.moduleId),
    listLessons(input.courseId)
  ]);

  if (!module || module.courseId !== input.courseId) {
    throw new Error("Modulo invalido.");
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("lessons")
    .insert({
      product_id: input.courseId,
      module_id: input.moduleId,
      title: input.title,
      slug: nextLessonSlug(input.title, lessons),
      display_order: nextDisplayOrder(lessons.filter((lesson) => lesson.moduleId === input.moduleId)),
      status: "draft"
    })
    .select(lessonColumns)
    .single();

  if (error) {
    throw new Error(`Unable to create lesson: ${error.message}`);
  }

  return mapLesson(data);
}

export async function updateLessonTitle(input: {
  courseId: string;
  lessonId: string;
  title: string;
}): Promise<Lesson> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("lessons")
    .update({ title: input.title })
    .eq("id", input.lessonId)
    .eq("product_id", input.courseId)
    .select(lessonColumns)
    .single();

  if (error) {
    throw new Error(`Unable to update lesson title: ${error.message}`);
  }

  return mapLesson(data);
}

export async function deleteLesson(input: { courseId: string; lessonId: string }): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("lessons")
    .delete()
    .eq("id", input.lessonId)
    .eq("product_id", input.courseId);

  if (error) {
    throw new Error(`Unable to delete lesson: ${error.message}`);
  }
}

async function listModules(courseId: string): Promise<Module[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("modules")
    .select(moduleColumns)
    .eq("course_id", courseId)
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(`Unable to list modules: ${error.message}`);
  }

  return data.map(mapModule);
}

async function listLessons(courseId: string): Promise<Lesson[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("lessons")
    .select(lessonColumns)
    .eq("product_id", courseId)
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(`Unable to list lessons: ${error.message}`);
  }

  return data.map(mapLesson);
}

async function getModuleById(moduleId: string): Promise<Module | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("modules")
    .select(moduleColumns)
    .eq("id", moduleId)
    .maybeSingle();

  if (error) {
    throw new Error(`Unable to load module: ${error.message}`);
  }

  return data ? mapModule(data) : null;
}

function nextDisplayOrder(items: Array<{ displayOrder: number }>): number {
  return items.length === 0 ? 0 : Math.max(...items.map((item) => item.displayOrder)) + 1;
}

function nextLessonSlug(title: string, lessons: Lesson[]): string {
  const baseSlug = slugifyTitle(title);
  const existingSlugs = new Set(lessons.map((lesson) => lesson.slug));

  if (!existingSlugs.has(baseSlug)) {
    return baseSlug;
  }

  let suffix = 2;
  while (existingSlugs.has(`${baseSlug}-${suffix}`)) {
    suffix += 1;
  }

  return `${baseSlug}-${suffix}`;
}
