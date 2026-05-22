import { notFound } from "next/navigation";

import { CourseEnrollmentsPanel } from "@/components/admin/course-enrollments-panel";
import { CoursePaymentProofsPanel } from "@/components/admin/course-payment-proofs-panel";
import { CoursePaymentSettingsPanel } from "@/components/admin/course-payment-settings-panel";
import { CourseStorefrontSettingsPanel } from "@/components/admin/course-storefront-settings-panel";
import CourseContentTab from "@/components/admin/course-editor/CourseContentTab";
import { PageHeader } from "@/components/layout/page-header";
import { getCourseContent } from "@/lib/courses/repository";
import { getCourseStorefrontSettings } from "@/lib/courses/storefront";
import { listStudentProfiles } from "@/lib/engines/auth/repository";
import { requireUser } from "@/lib/engines/auth/helpers";
import { listCourseEnrollments } from "@/lib/engines/learning/enrollments";
import { getCoursePaymentSettings, listCoursePaymentProofs } from "@/lib/engines/learning/manual-payments";

export default async function AdminCourseEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const auth = await requireUser();
  const { id } = await params;
  const ownerId = auth.profile.role === "admin" ? undefined : auth.user.id;
  const course = await getCourseContent(id, ownerId);

  if (!course) {
    notFound();
  }

  const [enrollments, students, paymentSettings, paymentProofs, storefrontSettings] = await Promise.all([
    listCourseEnrollments(course.id),
    listStudentProfiles(),
    getCoursePaymentSettings(course.id),
    listCoursePaymentProofs(auth, course.id),
    getCourseStorefrontSettings(course.id)
  ]);
  const lessonCount = course.modules.reduce((total, module) => total + module.lessons.length, 0);

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow="Editor de curso"
        title={course.title}
        meta={`${course.isPublished ? "Publicado" : "Draft"} - ${course.modules.length} modulos - ${lessonCount} lecciones`}
      />
      <CourseContentTab courseId={course.id} />
      <CourseStorefrontSettingsPanel settings={storefrontSettings} />
      <CoursePaymentSettingsPanel settings={paymentSettings} />
      <CoursePaymentProofsPanel courseId={course.id} proofs={paymentProofs} />
      <CourseEnrollmentsPanel courseId={course.id} students={students} enrollments={enrollments} />
    </section>
  );
}
