"use client";

import { useState } from "react";

import CourseTabs from "@/components/admin/course-editor/CourseTabs";
import CourseSummaryTab from "@/components/admin/course-editor/CourseSummaryTab";
import CourseContentTab from "@/components/admin/course-editor/CourseContentTab";
import CourseStudentsTab from "@/components/admin/course-editor/CourseStudentsTab";
import CourseSettingsTab from "@/components/admin/course-editor/CourseSettingsTab";

export default function CourseEditorPage() {
  const [activeTab, setActiveTab] = useState("Resumen");

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold">
        Editor de Curso
      </h1>

      <CourseTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <div className="mt-8">
        {activeTab === "Resumen" && <CourseSummaryTab />}
        {activeTab === "Contenido" && <CourseContentTab />}
        {activeTab === "Participantes" && <CourseStudentsTab />}
        {activeTab === "Ajustes" && <CourseSettingsTab />}
      </div>
    </div>
  );
}