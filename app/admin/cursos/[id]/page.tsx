import { notFound } from "next/navigation";

import { CourseEnrollmentsPanel } from "@/components/admin/course-enrollments-panel";
import { CoursePaymentProofsPanel } from "@/components/admin/course-payment-proofs-panel";
import { CoursePaymentSettingsPanel } from "@/components/admin/course-payment-settings-panel";
import CourseContentTab from "@/components/admin/course-editor/CourseContentTab";
import { getCourseContent } from "@/lib/courses/repository";
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

  const [enrollments, students, paymentSettings, paymentProofs] = await Promise.all([
    listCourseEnrollments(course.id),
    listStudentProfiles(),
    getCoursePaymentSettings(course.id),
    listCoursePaymentProofs(auth, course.id)
  ]);
  const lessonCount = course.modules.reduce((total, module) => total + module.lessons.length, 0);

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-normal text-brand-primary">Editor de curso</p>
          <h1 className="text-2xl font-semibold text-slate-950">{course.title}</h1>
          <p className="mt-1 text-sm text-slate-600">
            {course.isPublished ? "Publicado" : "Draft"} - {course.modules.length} modulos - {lessonCount} lecciones
          </p>
        </div>
      </div>
      <CourseContentTab courseId={course.id} />
      <CoursePaymentSettingsPanel settings={paymentSettings} />
      <CoursePaymentProofsPanel courseId={course.id} proofs={paymentProofs} />
      <CourseEnrollmentsPanel courseId={course.id} students={students} enrollments={enrollments} />
    </section>
  );
}
