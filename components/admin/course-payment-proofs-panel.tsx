import { CheckCircle2, ExternalLink, XCircle } from "lucide-react";

import { approveCoursePaymentProofAction, rejectCoursePaymentProofAction } from "@/lib/engines/learning/actions";
import type { AdminPaymentProof } from "@/lib/engines/learning/types";

type CoursePaymentProofsPanelProps = {
  courseId: string;
  proofs: AdminPaymentProof[];
};

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

function statusClass(status: AdminPaymentProof["status"]): string {
  if (status === "approved") return "bg-emerald-50 text-emerald-700";
  if (status === "rejected") return "bg-rose-50 text-rose-700";
  return "bg-amber-50 text-amber-700";
}

export function CoursePaymentProofsPanel({ courseId, proofs }: CoursePaymentProofsPanelProps) {
  const pendingCount = proofs.filter((proof) => proof.status === "pending").length;

  return (
    <section className="space-y-4 rounded-lg border border-slate-200 bg-white p-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-normal text-brand-primary">Comprobantes</p>
          <h2 className="text-xl font-semibold text-slate-950">Revision de pagos manuales</h2>
          <p className="mt-1 text-sm text-slate-600">Aprueba comprobantes validos para activar el enrollment automaticamente.</p>
        </div>
        <span className="rounded-md bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">{pendingCount} pendientes</span>
      </div>

      {proofs.length === 0 ? (
        <div className="rounded-md border border-dashed border-slate-300 p-5 text-sm text-slate-600">
          Aun no hay comprobantes enviados para este curso.
        </div>
      ) : (
        <div className="overflow-hidden rounded-md border border-slate-200">
          {proofs.map((proof) => (
            <div key={proof.id} className="grid gap-3 border-b border-slate-200 p-4 text-sm last:border-0 lg:grid-cols-[1fr_auto] lg:items-center">
              <div className="min-w-0 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-slate-950">{proof.student?.email ?? proof.userId}</p>
                  <span className={`rounded-md px-2 py-1 text-xs font-semibold ${statusClass(proof.status)}`}>{proof.status}</span>
                </div>
                <p className="text-slate-600">Enviado {formatDate(proof.createdAt)}</p>
                {proof.notes ? <p className="whitespace-pre-line text-slate-600">{proof.notes}</p> : null}
                <a href={proof.signedImageUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 font-semibold text-brand-primary">
                  Ver comprobante
                  <ExternalLink aria-hidden className="h-4 w-4" />
                </a>
              </div>
              {proof.status === "pending" ? (
                <div className="flex flex-col gap-2 sm:flex-row lg:justify-end">
                  <form action={approveCoursePaymentProofAction}>
                    <input type="hidden" name="courseId" value={courseId} />
                    <input type="hidden" name="proofId" value={proof.id} />
                    <button type="submit" className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-md bg-emerald-600 px-3 py-2 font-semibold text-white sm:w-auto">
                      <CheckCircle2 aria-hidden className="h-4 w-4" />
                      Aprobar
                    </button>
                  </form>
                  <form action={rejectCoursePaymentProofAction}>
                    <input type="hidden" name="courseId" value={courseId} />
                    <input type="hidden" name="proofId" value={proof.id} />
                    <button type="submit" className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 font-semibold text-slate-800 sm:w-auto">
                      <XCircle aria-hidden className="h-4 w-4" />
                      Rechazar
                    </button>
                  </form>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
