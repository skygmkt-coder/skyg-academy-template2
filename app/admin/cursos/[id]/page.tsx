import { notFound } from "next/navigation";

import CourseContentTab from "@/components/admin/course-editor/CourseContentTab";
import { getCourseContent } from "@/lib/courses/repository";
import { requireUser } from "@/lib/engines/auth/helpers";

export default async function AdminCourseEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const auth = await requireUser();
  const { id } = await params;
  const course = await getCourseContent(id, auth.user.id);

  if (!course) {
    notFound();
  }

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
    </section>
  );
}
