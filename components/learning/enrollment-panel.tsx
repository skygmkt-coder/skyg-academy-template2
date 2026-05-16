"use client";

import { useActionState } from "react";

import { grantEnrollmentAction } from "@/lib/engines/learning/actions";
import type { Profile } from "@/lib/engines/auth/types";
import type { AdminEnrollment, LearningActionState } from "@/lib/engines/learning/types";

const initialState: LearningActionState = { status: "idle", message: "" };

type EnrollmentPanelProps = {
  productId: string;
  students: Profile[];
  enrollments: AdminEnrollment[];
  revokeAction: (formData: FormData) => void;
};

export function EnrollmentPanel({ productId, students, enrollments, revokeAction }: EnrollmentPanelProps) {
  const [state, formAction] = useActionState(grantEnrollmentAction, initialState);

  return (
    <section className="space-y-4 rounded-lg border border-slate-200 bg-white p-4">
      <div>
        <h2 className="text-xl font-semibold text-slate-950">Accesos</h2>
        <p className="mt-1 text-sm text-slate-600">Otorga o revoca acceso manual para estudiantes.</p>
      </div>
      <form action={formAction} className="grid gap-3 md:grid-cols-2">
        <input type="hidden" name="productId" value={productId} />
        <label className="block text-sm font-medium text-slate-700">
          Estudiante
          <select name="userId" required className="mt-1 min-h-11 w-full rounded-md border border-slate-300 px-3 py-2">
            <option value="">Selecciona</option>
            {students.map((student) => (
              <option key={student.id} value={student.id}>
                {student.fullName ? `${student.fullName} - ${student.email}` : student.email}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm font-medium text-slate-700">
          Expira
          <input name="expiresAt" type="datetime-local" className="mt-1 min-h-11 w-full rounded-md border border-slate-300 px-3 py-2" />
        </label>
        <label className="block text-sm font-medium text-slate-700 md:col-span-2">
          Motivo
          <input name="grantedReason" className="mt-1 min-h-11 w-full rounded-md border border-slate-300 px-3 py-2" />
        </label>
        {state.status !== "idle" ? (
          <p
            role={state.status === "error" ? "alert" : "status"}
            className={`text-sm ${state.status === "error" ? "text-red-700" : "text-emerald-700"}`}
          >
            {state.message}
          </p>
        ) : null}
        <button type="submit" className="min-h-11 rounded-md bg-brand-primary px-4 py-2 text-sm font-semibold text-white">
          Otorgar acceso
        </button>
      </form>
      {enrollments.length === 0 ? (
        <div className="rounded-md border border-dashed border-slate-300 p-4 text-sm text-slate-600">
          No hay estudiantes inscritos.
        </div>
      ) : (
        <div className="divide-y divide-slate-200 rounded-md border border-slate-200">
          {enrollments.map((enrollment) => (
            <div key={enrollment.id} className="grid gap-3 p-3 md:grid-cols-[1fr_auto_auto] md:items-center">
              <div>
                <p className="font-medium text-slate-950">{enrollment.student?.email ?? enrollment.userId}</p>
                <p className="text-sm text-slate-600">
                  {enrollment.status}
                  {enrollment.expiresAt ? ` · expira ${new Date(enrollment.expiresAt).toLocaleString("es-MX")}` : ""}
                </p>
              </div>
              <p className="text-sm text-slate-600">{enrollment.grantedReason ?? "Sin motivo"}</p>
              {enrollment.status !== "revoked" ? (
                <form action={revokeAction}>
                  <input type="hidden" name="productId" value={productId} />
                  <input type="hidden" name="enrollmentId" value={enrollment.id} />
                  <button type="submit" className="min-h-10 rounded-md border border-red-200 px-3 py-2 text-sm font-semibold text-red-700">
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
