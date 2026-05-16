import { requireUser } from "@/lib/engines/auth/helpers";
import { getLearningExperience } from "@/lib/engines/learning/service";

export default async function LearningProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const auth = await requireUser();
  const { slug } = await params;

  await getLearningExperience({
    auth,
    productSlug: slug,
    markViewed: false
  });

  return null;
}
