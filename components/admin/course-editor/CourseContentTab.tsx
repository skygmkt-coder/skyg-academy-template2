< course-module-sidebar
"use client";

import { useState } from "react";

const modules = [
  {
    id: 1,
    title: "Módulo 1: Introducción",
    lessons: ["Bienvenida", "Cómo usar este curso", "Objetivos"],
  },
  {
    id: 2,
    title: "Módulo 2: Fundamentos",
    lessons: ["Conceptos clave", "Ejercicio práctico", "Resumen"],
=======
const modules = [
  {
    title: "Módulo 1: Introducción",
    lessons: ["Bienvenida", "Cómo usar este curso", "Objetivo del módulo"],
  },
  {
    title: "Módulo 2: Fundamentos",
    lessons: ["Conceptos clave", "Ejercicio práctico", "Cierre del módulo"],
> main
  },
];

export default function CourseContentTab() {
< course-module-sidebar
  const [selectedModule, setSelectedModule] = useState(modules[0]);

  return (
    <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
      {/* Sidebar */}
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

      {/* Content */}
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
              key={lesson}
              className="flex items-center justify-between rounded-xl border border-gray-200 p-4"
            >
              <div>
                <p className="font-medium text-gray-900">{lesson}</p>

                <p className="text-sm text-gray-500">
                  Lección del módulo
                </p>
              </div>

              <button className="text-sm text-gray-500 hover:text-black">
                Editar
              </button>
            </div>
          ))}
        </div>
      </section>
=======
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Contenido del curso</h2>
          <p className="text-sm text-gray-500">
            Organiza módulos y lecciones del programa.
          </p>
        </div>

        <button className="rounded-xl bg-black px-4 py-2 text-sm font-medium text-white">
          Agregar módulo
        </button>
      </div>

      <div className="space-y-4">
        {modules.map((module) => (
          <div
            key={module.title}
            className="rounded-2xl border border-gray-200 bg-white p-5"
          >
            <h3 className="font-semibold text-gray-900">{module.title}</h3>

            <div className="mt-4 space-y-2">
              {module.lessons.map((lesson) => (
                <div
                  key={lesson}
                  className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3 text-sm"
                >
                  <span>{lesson}</span>
                  <button className="text-gray-500 hover:text-gray-900">
                    Editar
                  </button>
                </div>
              ))}
            </div>

            <button className="mt-4 text-sm font-medium text-gray-600 hover:text-black">
              + Agregar lección
            </button>
          </div>
        ))}
      </div>
> main
    </div>
  );
}