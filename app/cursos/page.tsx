import Link from "next/link";
import { BookOpen, CheckCircle2, GraduationCap } from "lucide-react";

import { CourseCard } from "@/components/catalog/course-card";
import { BrandMark } from "@/components/layout/brand-mark";
import { getActiveBrandSettings } from "@/lib/engines/branding/service";
import { listPublicStorefrontCourses } from "@/lib/courses/storefront";

export default async function PublicCoursesPage() {
  const [brand, courses] = await Promise.all([getActiveBrandSettings(), listPublicStorefrontCourses()]);
  const totalLessons = courses.reduce((total, course) => total + course.lessonCount, 0);

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <BrandMark brand={brand} />
          <div className="flex items-center gap-4">
            <Link className="hidden text-sm font-medium text-slate-700 sm:inline" href="/mis-productos">Mis cursos</Link>
            <Link className="text-sm font-medium text-brand-primary" href="/login">Entrar</Link>
          </div>
        </div>
      </header>

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <div className="space-y-5">
            <p className="inline-flex items-center gap-2 rounded-md bg-brand-primary/10 px-3 py-1 text-sm font-semibold text-brand-primary">
              <GraduationCap aria-hidden className="h-4 w-4" />
              Cursos online
            </p>
            <div className="space-y-3">
              <h1 className="max-w-3xl text-4xl font-semibold tracking-normal text-slate-950 md:text-5xl">Catalogo de cursos para avanzar con claridad.</h1>
              <p className="max-w-2xl text-base leading-7 text-slate-600">
                Programas publicados por {brand.brandName}, con acceso digital, pagos manuales y experiencia de alumno lista para aprender.
              </p>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="text-3xl font-semibold text-slate-950">{courses.length}</p>
              <p className="mt-1 text-sm text-slate-600">Cursos visibles</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="text-3xl font-semibold text-slate-950">{totalLessons}</p>
              <p className="mt-1 text-sm text-slate-600">Lecciones</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="text-3xl font-semibold text-slate-950">MX</p>
              <p className="mt-1 text-sm text-slate-600">Pagos locales</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10">
        {courses.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center">
            <BookOpen aria-hidden className="mx-auto h-10 w-10 text-slate-400" />
            <h2 className="mt-3 text-lg font-semibold text-slate-950">No hay cursos visibles todavia</h2>
            <p className="mt-2 text-sm text-slate-600">Cuando publiques cursos y los marques para landing apareceran aqui.</p>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}
      </section>

      <section className="border-t border-slate-200 bg-white">
        <div className="mx-auto grid max-w-6xl gap-4 px-4 py-8 md:grid-cols-3">
          {[
            "Acceso inmediato cuando tu enrollment esta activo",
            "Pagos por transferencia o DIMO segun cada curso",
            "Player responsivo con modulos, lecciones y progreso"
          ].map((item) => (
            <div key={item} className="flex gap-3 rounded-lg border border-slate-200 p-4 text-sm text-slate-700">
              <CheckCircle2 aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              {item}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
