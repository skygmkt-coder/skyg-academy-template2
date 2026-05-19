import { CoursePlayerShell } from "@/components/learning/course-player-shell";
import { requireUser } from "@/lib/engines/auth/helpers";
import { getCoursePlayerExperience } from "@/lib/engines/learning/course-player";

export default async function LearnCoursePage({
  params,
  searchParams
}: {
  params: Promise<{ courseId: string }>;
  searchParams: Promise<{ lesson?: string; lessonSlug?: string }>;
}) {
  const auth = await requireUser();
  const { courseId } = await params;
  const { lesson, lessonSlug } = await searchParams;
  const experience = await getCoursePlayerExperience({
    auth,
    courseId,
    lessonId: lesson,
    lessonSlug,
    markViewed: true
  });

  return <CoursePlayerShell experience={experience} />;
}
