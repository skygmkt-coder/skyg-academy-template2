import Image from "next/image";
import Link from "next/link";
import { BookOpen, Clock, Layers } from "lucide-react";

import type { PublicCourseSummary } from "@/lib/courses/storefront";
import { formatMxn } from "@/lib/engines/catalog/helpers";

type CourseCardProps = {
  course: PublicCourseSummary;
};

function formatDuration(minutes: number): string {
  if (minutes <= 0) return "Duracion flexible";
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest > 0 ? `${hours} h ${rest} min` : `${hours} h`;
}

export function CourseCard({ course }: CourseCardProps) {
  return (
    <article className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <Link href={`/cursos/${course.slug}`} className="block">
        <div className="relative aspect-[16/10] bg-slate-200">
          {course.thumbnailUrl ? (
            <Image src={course.thumbnailUrl} alt="" fill sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw" className="object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center bg-slate-950 text-white">
              <BookOpen aria-hidden className="h-10 w-10 text-brand-accent" />
            </div>
          )}
          <span className="absolute left-3 top-3 rounded-md bg-white px-2 py-1 text-xs font-semibold text-slate-900 shadow-sm">
            {course.paymentSettings.paymentType === "free" ? "Gratis" : formatMxn(course.priceMxnCents)}
          </span>
        </div>
        <div className="space-y-4 p-5">
          <div>
            <p className="text-sm font-medium text-brand-primary">{course.instructorName ?? "Instructor"}</p>
            <h2 className="mt-1 text-lg font-semibold text-slate-950">{course.title}</h2>
            {course.shortDescription ? <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">{course.shortDescription}</p> : null}
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs font-medium text-slate-600">
            <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1">
              <Layers aria-hidden className="h-3.5 w-3.5" />
              {course.moduleCount} modulos
            </span>
            <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1">
              <Clock aria-hidden className="h-3.5 w-3.5" />
              {formatDuration(course.durationMinutes)}
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
