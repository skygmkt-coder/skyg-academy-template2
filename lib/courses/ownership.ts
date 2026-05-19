import { createClient } from "@/lib/supabase/server";

export type CourseOwnership = {
  courseId: string;
  creatorId: string | null;
};

export function isCourseOwner(course: CourseOwnership, userId: string): boolean {
  return course.creatorId === userId;
}

export async function getCourseOwnership(courseId: string): Promise<CourseOwnership | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("courses")
    .select("id,creator_id")
    .eq("id", courseId)
    .maybeSingle();

  if (error) {
    throw new Error(`Unable to load course ownership: ${error.message}`);
  }

  return data ? { courseId: data.id, creatorId: data.creator_id } : null;
}

export async function assertCourseOwner(courseId: string, userId: string): Promise<void> {
  const ownership = await getCourseOwnership(courseId);

  if (!ownership || !isCourseOwner(ownership, userId)) {
    throw new Error("No tienes permisos para modificar este curso.");
  }
}
