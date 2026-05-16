"use client";

import { useState } from "react";
import { Upload } from "lucide-react";

import { uploadPaymentProof } from "@/lib/engines/commerce/upload-client";

export function PaymentProofField({ defaultValue }: { defaultValue?: string }) {
  const [value, setValue] = useState(defaultValue ?? "");
  const [status, setStatus] = useState<"idle" | "uploading" | "error">("idle");

  return (
    <div className="space-y-2">
      <input type="hidden" name="proofUrl" value={value} />
      <label className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800">
        <Upload aria-hidden className="h-4 w-4" />
        {status === "uploading" ? "Subiendo..." : value ? "Cambiar comprobante" : "Subir comprobante"}
        <input
          type="file"
          className="sr-only"
          accept="image/png,image/jpeg,image/webp,application/pdf"
          onChange={async (event) => {
            const file = event.target.files?.[0];
            if (!file) return;
            setStatus("uploading");
            try {
              setValue(await uploadPaymentProof(file));
              setStatus("idle");
            } catch {
              setStatus("error");
            }
          }}
        />
      </label>
      {value ? <p className="text-sm text-emerald-700">Comprobante cargado.</p> : null}
      {status === "error" ? <p role="alert" className="text-sm text-red-700">No pudimos subir el comprobante.</p> : null}
    </div>
  );
}
