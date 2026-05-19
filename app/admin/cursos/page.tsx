import Link from "next/link";
import { BookOpen, Layers, Plus, ScrollText } from "lucide-react";

import { createCourseDraftAction } from "@/lib/courses/actions";
import { listOwnedCourseSummaries } from "@/lib/courses/repository";
import { requireUser } from "@/lib/engines/auth/helpers";

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(new Date(value));
}

export default async function AdminCoursesPage() {
  const auth = await requireUser();
  const courses = await listOwnedCourseSummaries(auth.user.id);

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-normal text-brand-primary">Cursos</p>
          <h1 className="text-2xl font-semibold text-slate-950">Administrar cursos</h1>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-600">
            Gestiona el contenido de los cursos que pertenecen a tu cuenta.
          </p>
        </div>
        <form action={createCourseDraftAction}>
          <button
            type="submit"
            className="inline-flex min-h-11 items-center gap-2 rounded-md bg-brand-primary px-4 py-2 text-sm font-semibold text-white"
          >
            <Plus aria-hidden className="h-4 w-4" />
            Nuevo curso
          </button>
        </form>
      </div>

      {courses.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8">
          <div className="flex max-w-xl flex-col gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-md bg-brand-primary/10 text-brand-primary">
              <BookOpen aria-hidden className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-lg font-semibold text-slate-950">Todavia no hay cursos</h2>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                Crea tu primer curso para empezar a organizar modulos y lecciones desde el panel.
              </p>
            </div>
            <form action={createCourseDraftAction}>
              <button
                type="submit"
                className="inline-flex min-h-11 w-fit items-center gap-2 rounded-md bg-brand-primary px-4 py-2 text-sm font-semibold text-white"
              >
                <Plus aria-hidden className="h-4 w-4" />
                Nuevo curso
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {courses.map((course) => (
            <Link
              key={course.id}
              href={`/admin/cursos/${course.id}`}
              className="rounded-lg border border-slate-200 bg-white p-5 transition hover:border-brand-primary/40 hover:shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h2 className="truncate text-lg font-semibold text-slate-950">{course.title}</h2>
                  <p className="mt-1 text-sm text-slate-500">Creado el {formatDate(course.createdAt)}</p>
                </div>
                <span
                  className={`shrink-0 rounded-md px-2 py-1 text-xs font-semibold ${
                    course.isPublished ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {course.isPublished ? "Publicado" : "Draft"}
                </span>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3 text-sm text-slate-600">
                <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
                  <div className="flex items-center gap-2 font-medium text-slate-900">
                    <Layers aria-hidden className="h-4 w-4 text-brand-primary" />
                    {course.moduleCount}
                  </div>
                  <p className="mt-1">Modulos</p>
                </div>
                <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
                  <div className="flex items-center gap-2 font-medium text-slate-900">
                    <ScrollText aria-hidden className="h-4 w-4 text-brand-primary" />
                    {course.lessonCount}
                  </div>
                  <p className="mt-1">Lecciones</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
