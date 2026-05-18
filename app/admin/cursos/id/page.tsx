export default function CourseEditorPage() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold">
        Editor de Curso
      </h1>

      <div className="mt-6 flex gap-4">
        <button>Resumen</button>
        <button>Contenido</button>
        <button>Participantes</button>
        <button>Ajustes</button>
      </div>
    </div>
  );
}