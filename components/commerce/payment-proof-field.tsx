"use client";

import { useState } from "react";
import { CheckCircle2, FileUp, UploadCloud, XCircle } from "lucide-react";

import { uploadPaymentProof } from "@/lib/engines/commerce/upload-client";

export function PaymentProofField({ defaultValue }: { defaultValue?: string }) {
  const [value, setValue] = useState(defaultValue ?? "");
  const [fileName, setFileName] = useState("");
  const [status, setStatus] = useState<"idle" | "uploading" | "error">("idle");

  return (
    <div className="space-y-3">
      <input type="hidden" name="proofUrl" value={value} />
      <label className="block cursor-pointer rounded-lg border border-dashed border-white/18 bg-slate-950/45 p-5 text-center transition hover:border-brand-accent/70 hover:bg-slate-950/65">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-md bg-white/[0.08] text-brand-accent">
          {value ? <CheckCircle2 aria-hidden className="h-6 w-6" /> : <UploadCloud aria-hidden className="h-6 w-6" />}
        </span>
        <span className="mt-4 block text-sm font-semibold text-white">
          {status === "uploading" ? "Subiendo comprobante..." : value ? "Comprobante cargado" : "Subir comprobante"}
        </span>
        <span className="mt-1 block text-xs leading-5 text-slate-400">
          {fileName || "Arrastra o selecciona una imagen/PDF claro del pago."}
        </span>
        <input
          type="file"
          className="sr-only"
          accept="image/png,image/jpeg,image/webp,application/pdf"
          onChange={async (event) => {
            const file = event.target.files?.[0];
            if (!file) return;
            setStatus("uploading");
            setFileName(file.name);
            try {
              setValue(await uploadPaymentProof(file));
              setStatus("idle");
            } catch {
              setStatus("error");
            }
          }}
        />
      </label>
      {value ? (
        <p className="inline-flex items-center gap-2 rounded-md bg-emerald-400/10 px-3 py-2 text-sm font-medium text-emerald-200">
          <FileUp aria-hidden className="h-4 w-4" />
          Comprobante listo para enviar.
        </p>
      ) : null}
      {status === "error" ? (
        <p role="alert" className="inline-flex items-center gap-2 rounded-md bg-rose-400/10 px-3 py-2 text-sm font-medium text-rose-200">
          <XCircle aria-hidden className="h-4 w-4" />
          No pudimos subir el comprobante.
        </p>
      ) : null}
    </div>
  );
}
