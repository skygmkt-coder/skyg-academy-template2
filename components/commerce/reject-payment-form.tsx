"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { rejectPaymentAction } from "@/lib/engines/commerce/actions";
import type { CommerceActionState } from "@/lib/engines/commerce/types";

const initialState: CommerceActionState = { status: "idle", message: "" };

function RejectSubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="min-h-10 rounded-md border border-red-200 px-3 py-2 text-sm font-semibold text-red-700 disabled:cursor-not-allowed disabled:opacity-70">
      {pending ? "Rechazando..." : "Rechazar"}
    </button>
  );
}

export function RejectPaymentForm({ paymentId }: { paymentId: string }) {
  const [state, formAction] = useActionState(rejectPaymentAction, initialState);
  return (
    <form action={formAction} className="flex flex-col gap-2 sm:flex-row">
      <input type="hidden" name="paymentId" value={paymentId} />
      <label className="sr-only" htmlFor={`reason-${paymentId}`}>Motivo</label>
      <input id={`reason-${paymentId}`} name="rejectionReason" required placeholder="Motivo" className="min-h-10 rounded-md border border-slate-300 px-3 py-2 text-sm" />
      <RejectSubmitButton />
      {state.status === "error" ? <p role="alert" className="text-sm text-red-700">{state.message}</p> : null}
    </form>
  );
}
