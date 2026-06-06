import Link from "next/link";
import { BookOpen, KeyRound, Layers, Plus, ScrollText, Users } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
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
      <PageHeader
        eyebrow="Cursos"
        title="Administrar cursos"
        description="Gestiona el contenido, media, pagos y alumnos de los cursos que pertenecen a tu cuenta."
        actions={
        <form action={createCourseDraftAction}>
          <button
            type="submit"
            className="inline-flex min-h-10 items-center gap-2 rounded-md bg-brand-primary px-4 py-2 text-sm font-semibold text-white shadow-soft"
          >
            <Plus aria-hidden className="h-4 w-4" />
            Nuevo curso
          </button>
        </form>
        }
      />

      {courses.length === 0 ? (
        <div className="rounded-lg border border-dashed border-line-strong bg-surface-base p-8 shadow-soft">
          <div className="flex max-w-xl flex-col gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-md bg-brand-primary/10 text-brand-primary">
              <BookOpen aria-hidden className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-lg font-semibold text-ink-primary">Todavia no hay cursos</h2>
              <p className="mt-1 text-sm leading-6 text-ink-secondary">
                Crea tu primer curso para empezar a organizar modulos y lecciones desde el panel.
              </p>
            </div>
            <form action={createCourseDraftAction}>
              <button
                type="submit"
                className="inline-flex min-h-10 w-fit items-center gap-2 rounded-md bg-brand-primary px-4 py-2 text-sm font-semibold text-white shadow-soft"
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
              className="rounded-lg border border-line-subtle bg-surface-base p-5 shadow-soft transition hover:border-brand-primary/40"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h2 className="truncate text-lg font-semibold text-ink-primary">{course.title}</h2>
                  <p className="mt-1 text-sm text-ink-muted">Creado el {formatDate(course.createdAt)}</p>
                </div>
                <span
                  className={`shrink-0 rounded-md px-2 py-1 text-xs font-semibold ${
                    course.isPublished ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {course.isPublished ? "Publicado" : "Draft"}
                </span>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3 text-sm text-ink-secondary">
                <div className="rounded-md border border-line-subtle bg-surface-muted px-3 py-2">
                  <div className="flex items-center gap-2 font-medium text-ink-primary">
                    <Layers aria-hidden className="h-4 w-4 text-brand-primary" />
                    {course.moduleCount}
                  </div>
                  <p className="mt-1">Modulos</p>
                </div>
                <div className="rounded-md border border-line-subtle bg-surface-muted px-3 py-2">
                  <div className="flex items-center gap-2 font-medium text-ink-primary">
                    <ScrollText aria-hidden className="h-4 w-4 text-brand-primary" />
                    {course.lessonCount}
                  </div>
                  <p className="mt-1">Lecciones</p>
                </div>
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                <span className="inline-flex min-h-9 items-center gap-1 rounded-md border border-line-subtle bg-surface-base px-3 py-2 text-sm font-semibold text-ink-secondary">
                  <BookOpen aria-hidden className="h-4 w-4" />
                  Contenido
                </span>
                <span className="inline-flex min-h-9 items-center gap-1 rounded-md border border-line-subtle bg-surface-base px-3 py-2 text-sm font-semibold text-ink-secondary">
                  <Users aria-hidden className="h-4 w-4" />
                  Alumnos
                </span>
                <span className="inline-flex min-h-9 items-center gap-1 rounded-md border border-line-subtle bg-surface-base px-3 py-2 text-sm font-semibold text-ink-secondary">
                  <KeyRound aria-hidden className="h-4 w-4" />
                  Acceso
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
