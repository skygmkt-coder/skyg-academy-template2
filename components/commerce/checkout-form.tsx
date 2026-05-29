"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { ArrowRight, BadgeCheck, Landmark, Smartphone, UploadCloud, type LucideIcon } from "lucide-react";

import { PaymentProofField } from "@/components/commerce/payment-proof-field";
import { submitManualPaymentAction } from "@/lib/engines/commerce/actions";
import type { CommerceActionState, PaymentMethod } from "@/lib/engines/commerce/types";

const initialState: CommerceActionState = { status: "idle", message: "" };

function CheckoutSubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-md bg-white px-5 py-3 text-sm font-semibold text-slate-950 shadow-float disabled:cursor-not-allowed disabled:opacity-70"
    >
      {pending ? "Enviando a revision..." : "Enviar comprobante"}
      <ArrowRight aria-hidden className="h-4 w-4" />
    </button>
  );
}

export function CheckoutForm({
  productId,
  productSlug,
  productTitle,
  priceLabel
}: {
  productId: string;
  productSlug: string;
  productTitle?: string;
  priceLabel?: string;
}) {
  const [method, setMethod] = useState<PaymentMethod>("transferencia");
  const [state, formAction] = useActionState(submitManualPaymentAction, initialState);

  return (
    <form action={formAction} className="overflow-hidden rounded-lg border border-white/10 bg-white/[0.06] text-white shadow-float backdrop-blur">
      <input type="hidden" name="productId" value={productId} />
      <input type="hidden" name="productSlug" value={productSlug} />

      <div className="border-b border-white/10 p-5 sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-normal text-brand-accent">Payment method</p>
        <h2 className="mt-2 text-2xl font-semibold">Elige como vas a pagar</h2>
        <p className="mt-2 text-sm leading-6 text-slate-300">
          {productTitle ? `${productTitle} - ${priceLabel ?? "Pago manual"}` : "Pago manual con comprobante para revision."}
        </p>
      </div>

      <div className="space-y-6 p-5 sm:p-6">
        <div className="grid gap-3 sm:grid-cols-2">
          <PaymentMethodCard
            checked={method === "transferencia"}
            description="Transferencia bancaria con referencia del producto."
            icon={Landmark}
            label="Transferencia"
            onSelect={() => setMethod("transferencia")}
            value="transferencia"
          />
          <PaymentMethodCard
            checked={method === "dimo"}
            description="Pago por DIMO y comprobante para validacion."
            icon={Smartphone}
            label="DIMO"
            onSelect={() => setMethod("dimo")}
            value="dimo"
          />
        </div>

        <div className="rounded-lg border border-white/10 bg-slate-950/55 p-4 text-sm leading-6 text-slate-300">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-brand-accent/10 text-brand-accent">
              <BadgeCheck aria-hidden className="h-4 w-4" />
            </span>
            <p>
              {method === "transferencia"
                ? "Realiza tu transferencia bancaria y sube un comprobante claro. El equipo revisara el pago y desbloqueara el acceso."
                : "Realiza tu pago por DIMO al contacto configurado por la academia y sube el comprobante para revision."}
            </p>
          </div>
        </div>

        <PaymentProofField />

        {state.status !== "idle" ? (
          <div
            role={state.status === "error" ? "alert" : "status"}
            className={`rounded-lg border p-4 text-sm ${
              state.status === "error"
                ? "border-rose-400/20 bg-rose-400/10 text-rose-200"
                : "border-emerald-400/20 bg-emerald-400/10 text-emerald-200"
            }`}
          >
            {state.message}
          </div>
        ) : null}

        <CheckoutSubmitButton />

        <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
          <UploadCloud aria-hidden className="h-3.5 w-3.5" />
          PNG, JPG, WebP o PDF. Revision manual segura.
        </div>
      </div>
    </form>
  );
}

function PaymentMethodCard({
  checked,
  description,
  icon: Icon,
  label,
  onSelect,
  value
}: {
  checked: boolean;
  description: string;
  icon: LucideIcon;
  label: string;
  onSelect: () => void;
  value: PaymentMethod;
}) {
  return (
    <label className={`cursor-pointer rounded-lg border p-4 transition ${checked ? "border-brand-accent bg-brand-accent/10" : "border-white/10 bg-white/[0.04] hover:border-white/20"}`}>
      <input name="method" type="radio" value={value} checked={checked} onChange={onSelect} className="sr-only" />
      <span className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-white/[0.08] text-brand-accent">
          <Icon aria-hidden className="h-5 w-5" />
        </span>
        <span>
          <span className="block font-semibold text-white">{label}</span>
          <span className="mt-1 block text-sm leading-6 text-slate-400">{description}</span>
        </span>
      </span>
    </label>
  );
}
