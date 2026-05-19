import { UserPlus } from "lucide-react";

import { enrollUserToCourseAction, revokeCourseAccessAction } from "@/lib/engines/learning/actions";
import type { Profile } from "@/lib/engines/auth/types";
import type { AdminEnrollment } from "@/lib/engines/learning/types";

type CourseEnrollmentsPanelProps = {
  courseId: string;
  students: Profile[];
  enrollments: AdminEnrollment[];
};

function formatDate(value: string | null): string {
  if (!value) return "Sin expiracion";
  return new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(new Date(value));
}

export function CourseEnrollmentsPanel({ courseId, students, enrollments }: CourseEnrollmentsPanelProps) {
  const activeUserIds = new Set(enrollments.filter((item) => item.status === "active").map((item) => item.userId));
  const availableStudents = students.filter((student) => !activeUserIds.has(student.id));

  return (
    <section className="space-y-4 rounded-lg border border-slate-200 bg-white p-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-normal text-brand-primary">Acceso</p>
          <h2 className="text-xl font-semibold text-slate-950">Alumnos del curso</h2>
          <p className="mt-1 text-sm text-slate-600">Gestiona enrollments manuales y revoca acceso cuando sea necesario.</p>
        </div>
        <span className="rounded-md bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
          {enrollments.filter((item) => item.status === "active").length} activos
        </span>
      </div>

      <form action={enrollUserToCourseAction} className="grid gap-3 rounded-md border border-slate-200 bg-slate-50 p-4 md:grid-cols-[1fr_160px_150px_auto]">
        <input type="hidden" name="courseId" value={courseId} />
        <label className="space-y-1 text-sm font-medium text-slate-700">
          Alumno
          <select name="userId" required className="min-h-11 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm">
            <option value="">Seleccionar alumno</option>
            {availableStudents.map((student) => (
              <option key={student.id} value={student.id}>
                {student.email}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1 text-sm font-medium text-slate-700">
          Expira
          <input name="expiresAt" type="date" className="min-h-11 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm" />
        </label>
        <label className="space-y-1 text-sm font-medium text-slate-700">
          Referencia
          <input name="paymentReference" placeholder="Manual" className="min-h-11 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm" />
        </label>
        <input type="hidden" name="paymentProvider" value="manual" />
        <button type="submit" className="inline-flex min-h-11 items-center justify-center gap-2 self-end rounded-md bg-brand-primary px-4 py-2 text-sm font-semibold text-white">
          <UserPlus aria-hidden className="h-4 w-4" />
          Enroll
        </button>
      </form>

      {enrollments.length === 0 ? (
        <div className="rounded-md border border-dashed border-slate-300 p-5 text-sm text-slate-600">
          Aun no hay alumnos inscritos en este curso.
        </div>
      ) : (
        <div className="overflow-hidden rounded-md border border-slate-200">
          {enrollments.map((enrollment) => (
            <div key={enrollment.id} className="grid gap-3 border-b border-slate-200 p-4 text-sm last:border-0 md:grid-cols-[1fr_auto_auto] md:items-center">
              <div>
                <p className="font-semibold text-slate-950">{enrollment.student?.email ?? enrollment.userId}</p>
                <p className="text-slate-600">
                  Enrolled {formatDate(enrollment.enrolledAt)} - Expira {formatDate(enrollment.expiresAt)}
                </p>
                {enrollment.paymentReference ? <p className="text-slate-500">Ref: {enrollment.paymentReference}</p> : null}
              </div>
              <span className={`w-fit rounded-md px-2 py-1 text-xs font-semibold ${enrollment.status === "active" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                {enrollment.status}
              </span>
              {enrollment.status === "active" ? (
                <form action={revokeCourseAccessAction}>
                  <input type="hidden" name="courseId" value={courseId} />
                  <input type="hidden" name="enrollmentId" value={enrollment.id} />
                  <button type="submit" className="min-h-10 rounded-md border border-slate-300 bg-white px-3 py-2 font-semibold text-slate-800">
                    Revocar
                  </button>
                </form>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
