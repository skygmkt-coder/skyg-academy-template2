const modules = [
  {
    title: "Módulo 1: Introducción",
    lessons: ["Bienvenida", "Cómo usar este curso", "Objetivo del módulo"],
  },
  {
    title: "Módulo 2: Fundamentos",
    lessons: ["Conceptos clave", "Ejercicio práctico", "Cierre del módulo"],
  },
];

export default function CourseContentTab() {
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
    </div>
  );
}