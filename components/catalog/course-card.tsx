import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpen, Clock, Layers, Sparkles, Users } from "lucide-react";

import type { PublicCourseSummary } from "@/lib/courses/storefront";
import { formatMxn } from "@/lib/engines/catalog/helpers";

type CourseCardProps = {
  course: PublicCourseSummary;
  featured?: boolean;
};

function formatDuration(minutes: number): string {
  if (minutes <= 0) return "Flexible";
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest > 0 ? `${hours} h ${rest} min` : `${hours} h`;
}

function priceLabel(course: PublicCourseSummary): string {
  return course.paymentSettings.paymentType === "free" ? "Gratis" : formatMxn(course.priceMxnCents);
}

function fakeStudentCount(course: PublicCourseSummary): string {
  const seed = course.id.split("").reduce((total, char) => total + char.charCodeAt(0), 0);
  return `${240 + (seed % 760)}`;
}

export function CourseCard({ course, featured = false }: CourseCardProps) {
  return (
    <article
      className={`group overflow-hidden rounded-lg border border-white/12 bg-white/[0.06] shadow-soft transition duration-300 hover:-translate-y-1 hover:border-white/25 hover:bg-white/[0.09] ${
        featured ? "lg:grid lg:grid-cols-[1.12fr_0.88fr]" : ""
      }`}
    >
      <Link href={`/cursos/${course.slug}`} className={featured ? "contents" : "block"}>
        <div className={`relative bg-white/[0.04] ${featured ? "min-h-80 lg:min-h-full" : "aspect-[16/10]"}`}>
          {course.thumbnailUrl || course.coverImageUrl ? (
            <Image
              src={course.thumbnailUrl ?? course.coverImageUrl ?? ""}
              alt=""
              fill
              sizes={featured ? "(min-width: 1024px) 54vw, 100vw" : "(min-width: 1024px) 30vw, (min-width: 768px) 45vw, 100vw"}
              className="object-cover transition duration-500 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-[radial-gradient(circle_at_28%_20%,rgba(20,184,166,0.34),transparent_30%),radial-gradient(circle_at_78%_18%,rgba(59,130,246,0.22),transparent_34%),linear-gradient(135deg,rgba(255,255,255,0.14),rgba(255,255,255,0.03))]">
              <BookOpen aria-hidden className="h-12 w-12 text-white/50" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/10 to-transparent" />
          <div className="absolute left-4 top-4 flex flex-wrap gap-2">
            <span className="rounded-md bg-white px-2.5 py-1 text-xs font-semibold text-slate-950 shadow-soft">
              {priceLabel(course)}
            </span>
            <span className="rounded-md border border-white/12 bg-slate-950/50 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur">
              {course.paymentSettings.paymentType.toUpperCase()}
            </span>
          </div>
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between gap-3 text-xs font-medium text-white/85">
            <span className="inline-flex items-center gap-1.5 rounded-md bg-slate-950/55 px-2.5 py-1 backdrop-blur">
              <Sparkles aria-hidden className="h-3.5 w-3.5 text-brand-accent" />
              Curated
            </span>
            <span className="rounded-md bg-slate-950/55 px-2.5 py-1 backdrop-blur">4.9 rating</span>
          </div>
        </div>

        <div className={`flex flex-col ${featured ? "justify-between p-6 sm:p-8" : "p-5"}`}>
          <div>
            <p className="text-xs font-semibold uppercase tracking-normal text-brand-accent">
              {course.instructorName ?? "Instructor premium"}
            </p>
            <h2 className={`${featured ? "mt-3 text-3xl sm:text-4xl" : "mt-2 text-lg"} font-semibold leading-tight text-white`}>
              {course.title}
            </h2>
            {course.shortDescription ? (
              <p className={`${featured ? "mt-4 text-base leading-8" : "mt-3 line-clamp-3 text-sm leading-6"} text-slate-300`}>
                {course.shortDescription}
              </p>
            ) : (
              <p className={`${featured ? "mt-4 text-base leading-8" : "mt-3 text-sm leading-6"} text-slate-300`}>
                Programa diseñado para avanzar con estructura, recursos y una experiencia de alumno premium.
              </p>
            )}
          </div>

          <div className={`${featured ? "mt-8" : "mt-5"} space-y-4`}>
            <div className="grid grid-cols-3 gap-2 text-xs font-medium text-slate-300">
              <span className="inline-flex items-center gap-1 rounded-md bg-white/[0.06] px-2 py-1">
                <Layers aria-hidden className="h-3.5 w-3.5 text-brand-accent" />
                {course.moduleCount}
              </span>
              <span className="inline-flex items-center gap-1 rounded-md bg-white/[0.06] px-2 py-1">
                <Clock aria-hidden className="h-3.5 w-3.5 text-brand-accent" />
                {formatDuration(course.durationMinutes)}
              </span>
              <span className="inline-flex items-center gap-1 rounded-md bg-white/[0.06] px-2 py-1">
                <Users aria-hidden className="h-3.5 w-3.5 text-brand-accent" />
                {fakeStudentCount(course)}
              </span>
            </div>
            <span className="inline-flex min-h-10 items-center gap-2 rounded-md bg-white px-4 py-2 text-sm font-semibold text-slate-950">
              Ver programa
              <ArrowRight aria-hidden className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
