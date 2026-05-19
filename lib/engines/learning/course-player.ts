import { notFound } from "next/navigation";

import type { AuthenticatedUser } from "@/lib/engines/auth/types";
import { checkCourseAccess } from "@/lib/engines/learning/enrollments";
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

type ResourceRow = {
  id: string;
  lesson_id: string;
  title: string;
  file_url: string;
  display_order: number;
};

const courseColumns = "id,creator_id,title,slug,description,cover_image_url,is_published,created_at,updated_at";
const moduleColumns = "id,course_id,title,description,display_order,created_at,updated_at";
const lessonColumns =
  "id,product_id,module_id,title,slug,description,video_url,display_order,is_preview,lesson_type,duration_minutes,status,created_at,updated_at";
const resourceColumns = "id,lesson_id,title,file_url,display_order";

export async function getCoursePlayerExperience(input: {
  auth: AuthenticatedUser;
  courseId: string;
  lessonId?: string;
  lessonSlug?: string;
  markViewed: boolean;
}): Promise<CoursePlayerExperience> {
  const course = await getCourseRow(input.courseId);

  if (!course) {
    notFound();
  }

  const hasAccess = await checkCourseAccess(input.auth, course.id);

  if (!hasAccess) {
    return emptyExperience(course, false);
  }

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

  if (playerLessons.length > 0 && !activeLesson) {
    notFound();
  }

  if (activeLesson && input.markViewed) {
    await markLessonViewed({
      userId: input.auth.user.id,
      productId: course.id,
      lessonId: activeLesson.id
    });
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
    progress: {
      productId: course.id,
      totalLessons,
      completedLessons,
      progressPercentage: totalLessons === 0 ? 0 : Math.round((completedLessons / totalLessons) * 100),
      lastViewedLessonSlug: null
    },
    completedLessonIds,
    hasAccess
  };
}

export async function completeCoursePlayerLesson(input: {
  auth: AuthenticatedUser;
  courseId: string;
  lessonId: string;
}): Promise<void> {
  const hasAccess = await checkCourseAccess(input.auth, input.courseId);

  if (!hasAccess) {
    throw new Error("No tienes acceso a este curso.");
  }

  const experience = await getCoursePlayerExperience({
    auth: input.auth,
    courseId: input.courseId,
    lessonId: input.lessonId,
    markViewed: false
  });

  if (!experience.activeLesson) {
    throw new Error("Leccion invalida.");
  }

  await markLessonCompleted({
    userId: input.auth.user.id,
    productId: input.courseId,
    lessonId: input.lessonId
  });

  const progressRows = await listProgressForProduct(input.auth.user.id, input.courseId);

  if (!progressRows.some((row) => row.lessonId === input.lessonId && row.isCompleted)) {
    throw new Error("No pudimos validar la persistencia del progreso.");
  }
}

async function getCourseRow(courseId: string): Promise<CourseRow | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("courses")
    .select(courseColumns)
    .eq("id", courseId)
    .maybeSingle();

  if (error) {
    throw new Error(`Unable to load course: ${error.message}`);
  }

  return data as CourseRow | null;
}

async function listModules(courseId: string): Promise<ModuleRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("modules")
    .select(moduleColumns)
    .eq("course_id", courseId)
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(`Unable to load course modules: ${error.message}`);
  }

  return data as ModuleRow[];
}

async function listLessons(courseId: string): Promise<LessonRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("lessons")
    .select(lessonColumns)
    .eq("product_id", courseId)
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(`Unable to load course lessons: ${error.message}`);
  }

  return data as LessonRow[];
}

async function listResources(courseId: string): Promise<ResourceRow[]> {
  const lessons = await listLessonIds(courseId);

  if (lessons.length === 0) {
    return [];
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("lesson_resources")
    .select(resourceColumns)
    .in("lesson_id", lessons)
    .order("display_order", { ascending: true });

  if (error) {
    throw new Error(`Unable to load lesson resources: ${error.message}`);
  }

  return data as ResourceRow[];
}

async function listLessonIds(courseId: string): Promise<string[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("lessons").select("id").eq("product_id", courseId);

  if (error) {
    throw new Error(`Unable to load lesson ids: ${error.message}`);
  }

  return data.map((row) => row.id);
}

function buildPlayerModules(modules: ModuleRow[], lessons: CoursePlayerLesson[]): CoursePlayerModule[] {
  const knownModuleIds = new Set(modules.map((module) => module.id));
  const grouped = modules.map((module) => ({
    id: module.id,
    courseId: module.course_id,
    title: module.title,
    description: module.description,
    displayOrder: module.display_order,
    createdAt: module.created_at,
    updatedAt: module.updated_at,
    lessons: lessons.filter((lesson) => lesson.moduleId === module.id)
  }));
  const looseLessons = lessons.filter((lesson) => !lesson.moduleId || !knownModuleIds.has(lesson.moduleId));

  if (looseLessons.length > 0) {
    grouped.push({
      id: "unassigned",
      courseId: looseLessons[0]?.courseId ?? "",
      title: "Sin modulo",
      description: null,
      displayOrder: grouped.length,
      createdAt: "",
      updatedAt: "",
      lessons: looseLessons
    });
  }

  return grouped;
}

function mapLesson(row: LessonRow, resources: ResourceRow[]): Omit<CoursePlayerLesson, "isCompleted"> {
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
    updatedAt: row.updated_at,
    resources: resources.map((resource) => ({
      id: resource.id,
      lessonId: resource.lesson_id,
      title: resource.title,
      fileUrl: resource.file_url,
      displayOrder: resource.display_order
    }))
  };
}

function resolveActiveLesson(
  lessons: CoursePlayerLesson[],
  lessonId?: string,
  lessonSlug?: string
): CoursePlayerLesson | null {
  if (lessons.length === 0) {
    return null;
  }

  if (lessonId) {
    return lessons.find((lesson) => lesson.id === lessonId) ?? null;
  }

  if (lessonSlug) {
    return lessons.find((lesson) => lesson.slug === lessonSlug) ?? null;
  }

  return lessons[0] ?? null;
}

function mapCourse(course: CourseRow): CoursePlayerExperience["course"] {
  return {
    id: course.id,
    creatorId: course.creator_id,
    title: course.title,
    slug: course.slug,
    description: course.description,
    coverImageUrl: course.cover_image_url,
    isPublished: course.is_published,
    createdAt: course.created_at,
    updatedAt: course.updated_at
  };
}

function emptyExperience(course: CourseRow, hasAccess: boolean): CoursePlayerExperience {
  return {
    course: mapCourse(course),
    modules: [],
    activeLesson: null,
    previousLessonId: null,
    nextLessonId: null,
    progress: {
      productId: course.id,
      totalLessons: 0,
      completedLessons: 0,
      progressPercentage: 0,
      lastViewedLessonSlug: null
    },
    completedLessonIds: [],
    hasAccess
  };
}
