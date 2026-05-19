import Link from "next/link";
import { CheckCircle2, CreditCard, ExternalLink, Lock } from "lucide-react";

import { PaymentProofForm } from "@/components/learning/payment-proof-form";
import { enrollFreeCourseAction } from "@/lib/engines/learning/actions";
import type { CoursePaymentSettings, PaymentProofStatus, StudentPaymentProof } from "@/lib/engines/learning/types";
import { formatMxn } from "@/lib/engines/catalog/helpers";

type CourseAccessPanelProps = {
  courseId: string;
  courseSlug: string;
  priceMxnCents: number;
  hasAccess: boolean;
  isAuthenticated: boolean;
  paymentSettings: CoursePaymentSettings;
  paymentProofs: StudentPaymentProof[];
};

function paymentLabel(type: CoursePaymentSettings["paymentType"]): string {
  if (type === "transfer") return "Transferencia";
  if (type === "dimo") return "DIMO";
  if (type === "mixed") return "Transferencia + DIMO";
  return "Gratis";
}

function proofStatusLabel(status: PaymentProofStatus): string {
  if (status === "approved") return "Aprobado";
  if (status === "rejected") return "Rechazado";
  return "Pendiente de revision";
}

function proofStatusClass(status: PaymentProofStatus): string {
  if (status === "approved") return "bg-emerald-50 text-emerald-700";
  if (status === "rejected") return "bg-rose-50 text-rose-700";
  return "bg-amber-50 text-amber-700";
}

export function CourseAccessPanel({
  courseId,
  courseSlug,
  priceMxnCents,
  hasAccess,
  isAuthenticated,
  paymentSettings,
  paymentProofs
}: CourseAccessPanelProps) {
  const latestProof = paymentProofs[0] ?? null;
  const canSubmitProof = isAuthenticated && paymentSettings.paymentType !== "free" && latestProof?.status !== "pending";

  if (hasAccess) {
    return (
      <aside className="space-y-4 rounded-lg border border-emerald-200 bg-emerald-50 p-5">
        <div className="flex items-center gap-2 text-emerald-800">
          <CheckCircle2 aria-hidden className="h-5 w-5" />
          <h2 className="font-semibold">Acceso activo</h2>
        </div>
        <p className="text-sm leading-6 text-emerald-800">Ya tienes acceso a este curso.</p>
        <Link href={`/learn/${courseId}`} className="inline-flex min-h-11 w-full items-center justify-center rounded-md bg-emerald-700 px-4 py-2 text-sm font-semibold text-white">
          Entrar al curso
        </Link>
      </aside>
    );
  }

  return (
    <aside className="space-y-5 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-normal text-brand-primary">Inscripcion</p>
          <p className="mt-1 text-2xl font-semibold text-slate-950">
            {paymentSettings.paymentType === "free" ? "Gratis" : formatMxn(priceMxnCents)}
          </p>
        </div>
        <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">{paymentLabel(paymentSettings.paymentType)}</span>
      </div>

      {paymentSettings.paymentType === "free" ? (
        isAuthenticated ? (
          <form action={enrollFreeCourseAction}>
            <input type="hidden" name="courseId" value={courseId} />
            <button type="submit" className="inline-flex min-h-11 w-full items-center justify-center rounded-md bg-brand-primary px-4 py-2 text-sm font-semibold text-white">
              Activar acceso gratis
            </button>
          </form>
        ) : (
          <Link href="/login" className="inline-flex min-h-11 w-full items-center justify-center rounded-md bg-brand-primary px-4 py-2 text-sm font-semibold text-white">
            Entrar para acceder
          </Link>
        )
      ) : (
        <div className="space-y-4">
          <div className="rounded-md border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
            <div className="flex items-center gap-2 font-semibold text-slate-950">
              <CreditCard aria-hidden className="h-4 w-4 text-brand-primary" />
              Pago manual
            </div>
            {paymentSettings.paymentType !== "dimo" ? (
              <div className="mt-3 space-y-1">
                {paymentSettings.transferBank ? <p>Banco: {paymentSettings.transferBank}</p> : null}
                {paymentSettings.transferClabe ? <p>CLABE: {paymentSettings.transferClabe}</p> : null}
                {paymentSettings.transferOwner ? <p>Titular: {paymentSettings.transferOwner}</p> : null}
              </div>
            ) : null}
            {paymentSettings.paymentNotes ? <p className="mt-3 whitespace-pre-line leading-6">{paymentSettings.paymentNotes}</p> : null}
          </div>

          {(paymentSettings.paymentType === "dimo" || paymentSettings.paymentType === "mixed") && paymentSettings.dimoUrl ? (
            <a href={paymentSettings.dimoUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white">
              Pagar con DIMO
              <ExternalLink aria-hidden className="h-4 w-4" />
            </a>
          ) : null}

          {latestProof ? (
            <div className="rounded-md border border-slate-200 p-3 text-sm text-slate-700">
              <span className={`inline-flex rounded-md px-2 py-1 text-xs font-semibold ${proofStatusClass(latestProof.status)}`}>
                {proofStatusLabel(latestProof.status)}
              </span>
              <p className="mt-2">
                {latestProof.status === "pending" ? "Tu comprobante esta en revision." : "Puedes enviar un nuevo comprobante si necesitas corregirlo."}
              </p>
            </div>
          ) : null}

          {canSubmitProof ? <PaymentProofForm courseId={courseId} /> : null}
          {!isAuthenticated ? (
            <Link href="/login" className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md bg-brand-primary px-4 py-2 text-sm font-semibold text-white">
              <Lock aria-hidden className="h-4 w-4" />
              Entrar para enviar comprobante
            </Link>
          ) : null}
        </div>
      )}

      <Link href={`/cursos/${courseSlug}`} className="sr-only">Ver curso</Link>
    </aside>
  );
}
