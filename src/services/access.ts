import type { AuthenticatedUser } from "@/lib/engines/auth/types";
import { getServerSupabaseClient } from "@/src/services/supabase";

type CourseOwnershipRow = {
  id: string;
  creator_id: string | null;
};

export async function getCourseOwnership(courseId: string): Promise<CourseOwnershipRow | null> {
  const supabase = await getServerSupabaseClient();
  const { data, error } = await supabase
    .from("courses")
    .select("id,creator_id")
    .eq("id", courseId)
    .maybeSingle();

  if (error) {
    throw new Error(`Unable to check course ownership: ${error.message}`);
  }

  return data as CourseOwnershipRow | null;
}

export async function canAdminOrOwnCourse(auth: AuthenticatedUser, courseId: string): Promise<boolean> {
  if (auth.profile.role === "admin") {
    return true;
  }

  const course = await getCourseOwnership(courseId);
  return course?.creator_id === auth.user.id;
}
