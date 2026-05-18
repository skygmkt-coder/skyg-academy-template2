import CourseTabs from "@/components/admin/course-editor/CourseTabs";
import CourseSummaryTab from "@/components/admin/course-editor/CourseSummaryTab";
import CourseContentTab from "@/components/admin/course-editor/CourseContentTab";
import CourseStudentsTab from "@/components/admin/course-editor/CourseStudentsTab";
import CourseSettingsTab from "@/components/admin/course-editor/CourseSettingsTab";

export default function CourseEditorPage() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold">
        Editor de Curso
      </h1>

      <CourseTabs />

      <div className="mt-8 space-y-6">
        <CourseSummaryTab />
        <CourseContentTab />
        <CourseStudentsTab />
        <CourseSettingsTab />
      </div>
    </div>
  );
}