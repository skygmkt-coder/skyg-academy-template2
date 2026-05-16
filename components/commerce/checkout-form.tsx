"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";

import { PaymentProofField } from "@/components/commerce/payment-proof-field";
import { submitManualPaymentAction } from "@/lib/engines/commerce/actions";
import type { CommerceActionState, PaymentMethod } from "@/lib/engines/commerce/types";

const initialState: CommerceActionState = { status: "idle", message: "" };

function CheckoutSubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="min-h-11 rounded-md bg-brand-primary px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70">
      {pending ? "Enviando..." : "Enviar a revision"}
    </button>
  );
}

export function CheckoutForm({ productId, productSlug }: { productId: string; productSlug: string }) {
  const [method, setMethod] = useState<PaymentMethod>("transferencia");
  const [state, formAction] = useActionState(submitManualPaymentAction, initialState);

  return (
    <form action={formAction} className="space-y-5 rounded-lg border border-slate-200 bg-white p-4">
      <input type="hidden" name="productId" value={productId} />
      <input type="hidden" name="productSlug" value={productSlug} />
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex cursor-pointer items-center gap-3 rounded-md border border-slate-300 p-3 text-sm font-medium">
          <input name="method" type="radio" value="transferencia" checked={method === "transferencia"} onChange={() => setMethod("transferencia")} />
          Transferencia
        </label>
        <label className="flex cursor-pointer items-center gap-3 rounded-md border border-slate-300 p-3 text-sm font-medium">
          <input name="method" type="radio" value="dimo" checked={method === "dimo"} onChange={() => setMethod("dimo")} />
          DIMO
        </label>
      </div>
      <div className="rounded-md bg-slate-50 p-4 text-sm leading-6 text-slate-700">
        {method === "transferencia" ? (
          <p>Realiza tu transferencia bancaria con la referencia del producto y sube el comprobante.</p>
        ) : (
          <p>Realiza tu pago por DIMO al contacto configurado por la academia y sube el comprobante.</p>
        )}
      </div>
      <PaymentProofField />
      {state.status !== "idle" ? (
        <p role={state.status === "error" ? "alert" : "status"} className={`text-sm ${state.status === "error" ? "text-red-700" : "text-emerald-700"}`}>
          {state.message}
        </p>
      ) : null}
      <CheckoutSubmitButton />
    </form>
  );
}
