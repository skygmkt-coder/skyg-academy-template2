import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BookOpen, CheckCircle2, Clock, FileText, Layers, Lock, PlayCircle } from "lucide-react";

import { CourseAccessPanel } from "@/components/catalog/course-access-panel";
import { BrandMark } from "@/components/layout/brand-mark";
import { getPublicStorefrontCourse } from "@/lib/courses/storefront";
import { getActiveBrandSettings } from "@/lib/engines/branding/service";
import { getOptionalUser } from "@/lib/engines/auth/helpers";
import { formatMxn } from "@/lib/engines/catalog/helpers";
import { checkCourseAccess } from "@/lib/engines/learning/enrollments";
import { listStudentPaymentProofs } from "@/lib/engines/learning/manual-payments";
import type { StudentPaymentProof } from "@/lib/engines/learning/types";

type CoursePageProps = {
  params: Promise<{ slug: string }>;
};

function formatDuration(minutes: number): string {
  if (minutes <= 0) return "Duracion flexible";
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest > 0 ? `${hours} h ${rest} min` : `${hours} h`;
}

function lessonTypeIcon(type: "video" | "text" | "pdf") {
  if (type === "text") return FileText;
  if (type === "pdf") return Lock;
  return PlayCircle;
}

export default async function PublicCoursePage({ params }: CoursePageProps) {
  const { slug } = await params;
  const [brand, course, auth] = await Promise.all([
    getActiveBrandSettings(),
    getPublicStorefrontCourse(slug),
    getOptionalUser()
  ]);

  if (!course) {
    notFound();
  }

  let hasAccess = false;
  let paymentProofs: StudentPaymentProof[] = [];

  if (auth) {
    [hasAccess, paymentProofs] = await Promise.all([
      checkCourseAccess(auth, course.id),
      listStudentPaymentProofs(auth.user.id, course.id)
    ]);
  }

  const priceLabel = course.paymentSettings.paymentType === "free" ? "Gratis" : formatMxn(course.priceMxnCents);

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <BrandMark brand={brand} />
          <div className="flex items-center gap-4">
            <Link className="text-sm font-medium text-slate-700" href="/cursos">Cursos</Link>
            <Link className="text-sm font-medium text-brand-primary" href={auth ? "/mis-productos" : "/login"}>{auth ? "Mis cursos" : "Entrar"}</Link>
          </div>
        </div>
      </header>

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="space-y-5">
            <div className="flex flex-wrap gap-2 text-xs font-semibold text-slate-700">
              <span className="rounded-md bg-brand-primary/10 px-2 py-1 text-brand-primary">{priceLabel}</span>
              <span className="rounded-md bg-slate-100 px-2 py-1">{course.lessonCount} lecciones</span>
              <span className="rounded-md bg-slate-100 px-2 py-1">{formatDuration(course.durationMinutes)}</span>
            </div>
            <div className="space-y-3">
              <p className="text-sm font-medium text-brand-primary">{course.instructorName ?? brand.brandName}</p>
              <h1 className="max-w-3xl text-4xl font-semibold tracking-normal text-slate-950 md:text-5xl">{course.title}</h1>
              {course.shortDescription ? <p className="max-w-2xl text-base leading-7 text-slate-600">{course.shortDescription}</p> : null}
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <Layers aria-hidden className="h-5 w-5 text-brand-primary" />
                <p className="mt-2 text-sm font-semibold text-slate-950">{course.moduleCount} modulos</p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <Clock aria-hidden className="h-5 w-5 text-brand-primary" />
                <p className="mt-2 text-sm font-semibold text-slate-950">{formatDuration(course.durationMinutes)}</p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <CheckCircle2 aria-hidden className="h-5 w-5 text-brand-primary" />
                <p className="mt-2 text-sm font-semibold text-slate-950">Publicado</p>
              </div>
            </div>
          </div>
          <div className="relative aspect-[16/10] overflow-hidden rounded-lg bg-slate-950 shadow-sm">
            {course.coverImageUrl ? (
              <Image src={course.coverImageUrl} alt="" fill priority sizes="(min-width: 1024px) 45vw, 100vw" className="object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-white">
                <BookOpen aria-hidden className="h-16 w-16 text-brand-accent" />
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-8 px-4 py-10 lg:grid-cols-[1fr_360px] lg:items-start">
        <div className="space-y-8">
          {course.description ? (
            <section className="rounded-lg border border-slate-200 bg-white p-6">
              <h2 className="text-xl font-semibold text-slate-950">Sobre el curso</h2>
              <p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-600">{course.description}</p>
            </section>
          ) : null}

          <section className="rounded-lg border border-slate-200 bg-white p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-slate-950">Contenido</h2>
                <p className="mt-1 text-sm text-slate-600">Modulos y lecciones publicadas.</p>
              </div>
            </div>
            {course.modules.length === 0 ? (
              <div className="mt-5 rounded-md border border-dashed border-slate-300 p-5 text-sm text-slate-600">El temario publico se publicara pronto.</div>
            ) : (
              <div className="mt-5 space-y-4">
                {course.modules.map((module, index) => (
                  <section key={module.id} className="rounded-md border border-slate-200">
                    <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
                      <p className="text-xs font-medium uppercase tracking-normal text-slate-500">Modulo {index + 1}</p>
                      <h3 className="font-semibold text-slate-950">{module.title}</h3>
                    </div>
                    <div className="divide-y divide-slate-200">
                      {module.lessons.length === 0 ? (
                        <p className="px-4 py-3 text-sm text-slate-500">Sin lecciones publicadas.</p>
                      ) : (
                        module.lessons.map((lesson) => {
                          const Icon = lessonTypeIcon(lesson.lessonType);
                          return (
                            <div key={lesson.id} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                              <div className="flex min-w-0 items-center gap-3">
                                <Icon aria-hidden className="h-4 w-4 shrink-0 text-brand-primary" />
                                <span className="font-medium text-slate-800">{lesson.title}</span>
                                {lesson.isPreview ? <span className="rounded-md bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700">Preview</span> : null}
                              </div>
                              <span className="shrink-0 text-xs text-slate-500">{lesson.durationMinutes ? `${lesson.durationMinutes} min` : "Flexible"}</span>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </section>
                ))}
              </div>
            )}
          </section>
        </div>

        <CourseAccessPanel
          courseId={course.id}
          courseSlug={course.slug}
          priceMxnCents={course.priceMxnCents}
          hasAccess={hasAccess}
          isAuthenticated={Boolean(auth)}
          paymentSettings={course.paymentSettings}
          paymentProofs={paymentProofs}
        />
      </section>
    </main>
  );
}
