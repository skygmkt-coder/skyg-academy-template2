import type { AuthenticatedUser } from "@/lib/engines/auth/types";
import { canManageCourseEnrollment } from "@/lib/engines/learning/enrollments";
import type { CoursePaymentSettings, PaymentType } from "@/lib/engines/learning/types";
import type { UpdateCourseStorefrontSettingsInput } from "@/lib/engines/learning/validation";
import { createClient } from "@/lib/supabase/server";

type QueryBuilder = {
  select: (columns: string) => QueryBuilder;
  update: (values: Record<string, unknown>) => QueryBuilder;
  eq: (column: string, value: unknown) => QueryBuilder;
  in: (column: string, values: unknown[]) => QueryBuilder;
  order: (column: string, options?: { ascending?: boolean }) => QueryBuilder;
  maybeSingle: () => Promise<{ data: unknown; error: { message: string } | null }>;
  single: () => Promise<{ data: unknown; error: { message: string } | null }>;
  then: Promise<{ data: unknown; error: { message: string } | null }>["then"];
};

type UntypedClient = {
  from: (table: string) => QueryBuilder;
};

type CourseRow = {
  id: string;
  creator_id: string | null;
  title: string;
  slug: string;
  subtitle: string | null;
  description: string | null;
  short_description: string | null;
  thumbnail_url: string | null;
  cover_image_url: string | null;
  instructor_name: string | null;
  price_mxn_cents: number;
  is_published: boolean;
  show_on_landing: boolean;
  created_at: string;
  updated_at: string;
  payment_type: string | null;
  dimo_url: string | null;
  transfer_bank: string | null;
  transfer_clabe: string | null;
  transfer_owner: string | null;
  payment_notes: string | null;
};

type ModuleRow = {
  id: string;
  course_id: string;
  title: string;
  description: string | null;
  display_order: number;
};

type LessonRow = {
  id: string;
  product_id: string;
  module_id: string | null;
  title: string;
  description: string | null;
  display_order: number;
  is_preview: boolean;
  lesson_type: string;
  duration_minutes: number | null;
  status: string;
};

export type PublicCourseLesson = {
  id: string;
  courseId: string;
  moduleId: string | null;
  title: string;
  description: string | null;
  displayOrder: number;
  isPreview: boolean;
  lessonType: "video" | "text" | "pdf";
  durationMinutes: number | null;
  status: "draft" | "published";
};

export type PublicCourseModule = {
  id: string;
  courseId: string;
  title: string;
  description: string | null;
  displayOrder: number;
  lessons: PublicCourseLesson[];
};

export type PublicCourseSummary = {
  id: string;
  creatorId: string | null;
  title: string;
  slug: string;
  shortDescription: string | null;
  description: string | null;
  thumbnailUrl: string | null;
  coverImageUrl: string | null;
  instructorName: string | null;
  priceMxnCents: number;
  isPublished: boolean;
  showOnLanding: boolean;
  createdAt: string;
  updatedAt: string;
  paymentSettings: CoursePaymentSettings;
  moduleCount: number;
  lessonCount: number;
  durationMinutes: number;
};

export type PublicCourseDetail = PublicCourseSummary & {
  modules: PublicCourseModule[];
};

export type CourseStorefrontSettings = {
  courseId: string;
  showOnLanding: boolean;
  shortDescription: string | null;
  thumbnailUrl: string | null;
  instructorName: string | null;
};

const productColumns =
  "id,creator_id,title,slug,subtitle,description,short_description,thumbnail_url,cover_image_url,instructor_name,price_mxn_cents,is_published,show_on_landing,created_at,updated_at,payment_type,dimo_url,transfer_bank,transfer_clabe,transfer_owner,payment_notes";
const moduleColumns = "id,course_id,title,description,display_order";
const lessonColumns = "id,product_id,module_id,title,description,display_order,is_preview,lesson_type,duration_minutes,status";

export async function listPublicStorefrontCourses(): Promise<PublicCourseSummary[]> {
  const db = (await createClient()) as unknown as UntypedClient;
  const { data, error } = await db
    .from("products")
    .select(productColumns)
    .eq("type", "curso")
    .eq("is_published", true)
    .eq("show_on_landing", true)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Unable to list public courses: ${error.message}`);
  }

  return attachCounts((data ?? []) as CourseRow[]);
}

export async function getPublicStorefrontCourse(slug: string): Promise<PublicCourseDetail | null> {
  const db = (await createClient()) as unknown as UntypedClient;
  const { data, error } = await db
    .from("products")
    .select(productColumns)
    .eq("type", "curso")
    .eq("is_published", true)
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    throw new Error(`Unable to load public course: ${error.message}`);
  }

  if (!data) {
    return null;
  }

  const row = data as CourseRow;
  const [modules, lessons] = await Promise.all([listModules(row.id), listPublishedLessons(row.id)]);
  const detail = mapCourse(row, modules.length, lessons.length, totalDuration(lessons));

  return {
    ...detail,
    modules: buildModules(row.id, modules, lessons)
  };
}

export async function getCourseStorefrontSettings(courseId: string): Promise<CourseStorefrontSettings> {
  const db = (await createClient()) as unknown as UntypedClient;
  const { data, error } = await db
    .from("products")
    .select("id,show_on_landing,short_description,thumbnail_url,instructor_name")
    .eq("id", courseId)
    .eq("type", "curso")
    .maybeSingle();

  if (error) {
    throw new Error(`Unable to load storefront settings: ${error.message}`);
  }

  if (!data) {
    throw new Error("Curso no encontrado.");
  }

  const row = data as {
    id: string;
    show_on_landing: boolean;
    short_description: string | null;
    thumbnail_url: string | null;
    instructor_name: string | null;
  };

  return {
    courseId: row.id,
    showOnLanding: row.show_on_landing,
    shortDescription: row.short_description,
    thumbnailUrl: row.thumbnail_url,
    instructorName: row.instructor_name
  };
}

export async function updateCourseStorefrontSettings(
  auth: AuthenticatedUser,
  input: UpdateCourseStorefrontSettingsInput
): Promise<CourseStorefrontSettings> {
  if (!(await canManageCourseEnrollment(auth, input.courseId))) {
    throw new Error("No tienes permisos para administrar el storefront de este curso.");
  }

  const db = (await createClient()) as unknown as UntypedClient;
  const { data, error } = await db
    .from("products")
    .update({
      show_on_landing: input.showOnLanding,
      short_description: input.shortDescription,
      thumbnail_url: input.thumbnailUrl,
      instructor_name: input.instructorName
    })
    .eq("id", input.courseId)
    .eq("type", "curso")
    .select("id,show_on_landing,short_description,thumbnail_url,instructor_name")
    .single();

  if (error) {
    throw new Error(`Unable to update storefront settings: ${error.message}`);
  }

  const row = data as {
    id: string;
    show_on_landing: boolean;
    short_description: string | null;
    thumbnail_url: string | null;
    instructor_name: string | null;
  };

  return {
    courseId: row.id,
    showOnLanding: row.show_on_landing,
    shortDescription: row.short_description,
    thumbnailUrl: row.thumbnail_url,
    instructorName: row.instructor_name
  };
}

async function attachCounts(rows: CourseRow[]): Promise<PublicCourseSummary[]> {
  if (rows.length === 0) {
    return [];
  }

  const courseIds = rows.map((course) => course.id);
  const db = (await createClient()) as unknown as UntypedClient;
  const [modulesResult, lessonsResult] = await Promise.all([
    db.from("modules").select("id,course_id").in("course_id", courseIds),
    db.from("lessons").select("id,product_id,duration_minutes,status").in("product_id", courseIds).eq("status", "published")
  ]);

  if (modulesResult.error) {
    throw new Error(`Unable to count public course modules: ${modulesResult.error.message}`);
  }

  if (lessonsResult.error) {
    throw new Error(`Unable to count public course lessons: ${lessonsResult.error.message}`);
  }

  const modules = (modulesResult.data ?? []) as Array<{ course_id: string }>;
  const lessons = (lessonsResult.data ?? []) as Array<{ product_id: string; duration_minutes: number | null }>;

  return rows.map((row) => {
    const courseLessons = lessons.filter((lesson) => lesson.product_id === row.id);
    return mapCourse(
      row,
      modules.filter((module) => module.course_id === row.id).length,
      courseLessons.length,
      courseLessons.reduce((total, lesson) => total + (lesson.duration_minutes ?? 0), 0)
    );
  });
}

async function listModules(courseId: string): Promise<ModuleRow[]> {
  const db = (await createClient()) as unknown as UntypedClient;
  const { data, error } = await db
    .from("modules")
    .select(moduleColumns)
    .eq("course_id", courseId)
    .order("display_order", { ascending: true });

  if (error) {
    throw new Error(`Unable to load public course modules: ${error.message}`);
  }

  return (data ?? []) as ModuleRow[];
}

async function listPublishedLessons(courseId: string): Promise<LessonRow[]> {
  const db = (await createClient()) as unknown as UntypedClient;
  const { data, error } = await db
    .from("lessons")
    .select(lessonColumns)
    .eq("product_id", courseId)
    .eq("status", "published")
    .order("display_order", { ascending: true });

  if (error) {
    throw new Error(`Unable to load public course lessons: ${error.message}`);
  }

  return (data ?? []) as LessonRow[];
}

function mapCourse(row: CourseRow, moduleCount: number, lessonCount: number, durationMinutes: number): PublicCourseSummary {
  return {
    id: row.id,
    creatorId: row.creator_id,
    title: row.title,
    slug: row.slug,
    shortDescription: row.short_description ?? row.subtitle ?? summarize(row.description),
    description: row.description,
    thumbnailUrl: row.thumbnail_url ?? row.cover_image_url,
    coverImageUrl: row.cover_image_url ?? row.thumbnail_url,
    instructorName: row.instructor_name,
    priceMxnCents: row.price_mxn_cents,
    isPublished: row.is_published,
    showOnLanding: row.show_on_landing,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    paymentSettings: {
      courseId: row.id,
      paymentType: normalizePaymentType(row.payment_type),
      dimoUrl: row.dimo_url,
      transferBank: row.transfer_bank,
      transferClabe: row.transfer_clabe,
      transferOwner: row.transfer_owner,
      paymentNotes: row.payment_notes
    },
    moduleCount,
    lessonCount,
    durationMinutes
  };
}

function buildModules(courseId: string, modules: ModuleRow[], lessons: LessonRow[]): PublicCourseModule[] {
  const knownIds = new Set(modules.map((module) => module.id));
  const grouped = modules.map((module) => ({
    id: module.id,
    courseId: module.course_id,
    title: module.title,
    description: module.description,
    displayOrder: module.display_order,
    lessons: lessons.filter((lesson) => lesson.module_id === module.id).map(mapLesson)
  }));
  const looseLessons = lessons.filter((lesson) => !lesson.module_id || !knownIds.has(lesson.module_id));

  if (looseLessons.length > 0) {
    grouped.push({
      id: "unassigned",
      courseId,
      title: "Contenido adicional",
      description: null,
      displayOrder: grouped.length,
      lessons: looseLessons.map(mapLesson)
    });
  }

  return grouped;
}

function mapLesson(row: LessonRow): PublicCourseLesson {
  return {
    id: row.id,
    courseId: row.product_id,
    moduleId: row.module_id,
    title: row.title,
    description: row.description,
    displayOrder: row.display_order,
    isPreview: row.is_preview,
    lessonType: row.lesson_type === "text" || row.lesson_type === "pdf" ? row.lesson_type : "video",
    durationMinutes: row.duration_minutes,
    status: row.status === "published" ? "published" : "draft"
  };
}

function totalDuration(lessons: LessonRow[]): number {
  return lessons.reduce((total, lesson) => total + (lesson.duration_minutes ?? 0), 0);
}

function summarize(value: string | null): string | null {
  if (!value) return null;
  return value.length > 180 ? `${value.slice(0, 177)}...` : value;
}

function normalizePaymentType(value: string | null): PaymentType {
  if (value === "transfer" || value === "dimo" || value === "mixed") return value;
  return "free";
}
