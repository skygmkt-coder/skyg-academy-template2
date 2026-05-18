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
    <main className="min-h-screen bg-gray-50 p-6">
      <section className="mx-auto max-w-6xl">
        <div className="mb-6 rounded-2xl bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">Panel de administración</p>
          <h1 className="mt-2 text-3xl font-bold text-gray-900">
            Editor de Curso
          </h1>
          <p className="mt-2 text-gray-600">
            Administra la información, contenido, alumnos y configuración del curso.
          </p>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <CourseTabs activeTab={activeTab} onTabChange={setActiveTab} />

          <div className="mt-8">
            {activeTab === "Resumen" && <CourseSummaryTab />}
            {activeTab === "Contenido" && <CourseContentTab />}
            {activeTab === "Participantes" && <CourseStudentsTab />}
            {activeTab === "Ajustes" && <CourseSettingsTab />}
          </div>
        </div>
      </section>
    </main>
  );
}