import { LearningShell } from "@/components/learning/learning-shell";
import { requireUser } from "@/lib/engines/auth/helpers";
import { getLearningExperience } from "@/lib/engines/learning/service";

export default async function LearningLessonPage({
  params
}: {
  params: Promise<{ slug: string; lessonSlug: string }>;
}) {
  const auth = await requireUser();
  const { slug, lessonSlug } = await params;
  const experience = await getLearningExperience({
    auth,
    productSlug: slug,
    lessonSlug,
    markViewed: true
  });

  return <LearningShell experience={experience} />;
}
