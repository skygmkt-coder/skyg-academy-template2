"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { UploadCloud } from "lucide-react";

import { submitCoursePaymentProofAction } from "@/lib/engines/learning/actions";
import { uploadPaymentProof } from "@/lib/engines/commerce/upload-client";

type PaymentProofFormProps = {
  courseId: string;
};

export function PaymentProofForm({ courseId }: PaymentProofFormProps) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [notes, setNotes] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file) {
      setMessage("Selecciona una imagen o PDF del comprobante.");
      return;
    }

    setMessage(null);
    startTransition(async () => {
      try {
        const imageUrl = await uploadPaymentProof(file);
        const formData = new FormData();
        formData.set("courseId", courseId);
        formData.set("imageUrl", imageUrl);
        formData.set("notes", notes);
        const result = await submitCoursePaymentProofAction(formData);
        setMessage(result.message);
        if (result.status === "success") {
          setFile(null);
          setNotes("");
          router.refresh();
        }
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "No pudimos subir el comprobante.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-md border border-slate-200 bg-slate-50 p-4 text-left">
      <div className="space-y-1">
        <label className="text-sm font-semibold text-slate-800" htmlFor="payment-proof-file">
          Comprobante
        </label>
        <input
          id="payment-proof-file"
          type="file"
          accept="image/png,image/jpeg,image/webp,application/pdf"
          onChange={(event) => setFile(event.target.files?.[0] ?? null)}
          className="block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700"
        />
      </div>
      <label className="block space-y-1 text-sm font-semibold text-slate-800">
        Notas para revision
        <textarea
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          rows={3}
          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700"
          placeholder="Referencia, monto, nombre del titular o cualquier detalle util."
        />
      </label>
      <button
        type="submit"
        disabled={isPending}
        className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md bg-brand-primary px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
      >
        <UploadCloud aria-hidden className="h-4 w-4" />
        {isPending ? "Enviando..." : "Subir comprobante"}
      </button>
      {message ? <p className="text-sm text-slate-600">{message}</p> : null}
    </form>
  );
}
