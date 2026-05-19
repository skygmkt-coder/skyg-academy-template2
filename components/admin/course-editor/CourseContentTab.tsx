"use client";

import { useState } from "react";

const modules = [
  {
    id: 1,
    title: "Módulo 1: Introducción",
    lessons: [
      {
        title: "Bienvenida",
        type: "Video",
        duration: "5 min",
        status: "Publicado",
      },
      {
        title: "Cómo usar este curso",
        type: "Video",
        duration: "12 min",
        status: "Draft",
      },
      {
        title: "Objetivos",
        type: "Texto",
        duration: "3 min",
        status: "Publicado",
      },
    ],
  },
  {
    id: 2,
    title: "Módulo 2: Fundamentos",
    lessons: [
      {
        title: "Conceptos clave",
        type: "Video",
        duration: "18 min",
        status: "Publicado",
      },
      {
        title: "Ejercicio práctico",
        type: "PDF",
        duration: "10 min",
        status: "Draft",
      },
      {
        title: "Resumen",
        type: "Texto",
        duration: "4 min",
        status: "Publicado",
      },
    ],
  },
];

export default function CourseContentTab() {
  const [selectedModule, setSelectedModule] = useState(modules[0]);

  return (
    <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
      <aside className="rounded-2xl border border-gray-200 bg-white p-4">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-bold text-gray-900">Módulos</h2>

          <button className="rounded-lg bg-black px-3 py-2 text-sm text-white">
            +
          </button>
        </div>

        <div className="space-y-2">
          {modules.map((module) => {
            const isActive = selectedModule.id === module.id;

            return (
              <button
                key={module.id}
                onClick={() => setSelectedModule(module)}
                className={`w-full rounded-xl p-4 text-left transition ${
                  isActive
                    ? "bg-black text-white"
                    : "bg-gray-50 hover:bg-gray-100"
                }`}
              >
                <p className="font-medium">{module.title}</p>

                <p
                  className={`mt-1 text-sm ${
                    isActive ? "text-gray-300" : "text-gray-500"
                  }`}
                >
                  {module.lessons.length} lecciones
                </p>
              </button>
            );
          })}
        </div>
      </aside>

      <section className="rounded-2xl border border-gray-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {selectedModule.title}
            </h2>

            <p className="mt-1 text-gray-500">
              Administra las lecciones del módulo.
            </p>
          </div>

          <button className="rounded-xl bg-black px-4 py-2 text-sm font-medium text-white">
            Agregar lección
          </button>
        </div>

        <div className="mt-8 space-y-3">
          {selectedModule.lessons.map((lesson) => (
            <div
              key={lesson.title}
              className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white p-5"
            >
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-gray-900">
                    {lesson.title}
                  </p>

                  <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600">
                    {lesson.type}
                  </span>
                </div>

                <div className="mt-2 flex items-center gap-3 text-sm text-gray-500">
                  <span>{lesson.duration}</span>
                  <span>•</span>
                  <span>{lesson.status}</span>
                </div>
              </div>

              <button className="rounded-xl border border-gray-200 px-4 py-2 text-sm hover:bg-gray-50">
                Editar
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}