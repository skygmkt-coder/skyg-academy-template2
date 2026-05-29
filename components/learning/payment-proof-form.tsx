"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { CheckCircle2, FileUp, UploadCloud, XCircle } from "lucide-react";

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
    <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-line-subtle bg-surface-base p-4 text-left shadow-soft">
      <div>
        <p className="text-xs font-semibold uppercase tracking-normal text-brand-primary">Comprobante</p>
        <h3 className="mt-1 font-semibold text-ink-primary">Solicita activacion</h3>
        <p className="mt-1 text-sm leading-6 text-ink-secondary">Sube tu archivo y agrega referencias para acelerar la revision.</p>
      </div>

      <label className="block cursor-pointer rounded-lg border border-dashed border-line-strong bg-surface-muted p-5 text-center transition hover:border-brand-primary/50">
        <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-md bg-surface-base text-brand-primary shadow-soft">
          {file ? <CheckCircle2 aria-hidden className="h-5 w-5" /> : <UploadCloud aria-hidden className="h-5 w-5" />}
        </span>
        <span className="mt-3 block text-sm font-semibold text-ink-primary">
          {file ? file.name : "Seleccionar comprobante"}
        </span>
        <span className="mt-1 block text-xs text-ink-muted">PNG, JPG, WebP o PDF</span>
        <input
          id="payment-proof-file"
          type="file"
          accept="image/png,image/jpeg,image/webp,application/pdf"
          onChange={(event) => setFile(event.target.files?.[0] ?? null)}
          className="sr-only"
        />
      </label>

      <label className="block space-y-2 text-sm font-semibold text-ink-primary">
        Notas para revision
        <textarea
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          rows={3}
          className="w-full rounded-md border border-line-subtle bg-surface-base px-3 py-2 text-sm text-ink-primary shadow-soft"
          placeholder="Referencia, monto, nombre del titular o cualquier detalle util."
        />
      </label>

      <button
        type="submit"
        disabled={isPending}
        className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md bg-brand-primary px-4 py-2 text-sm font-semibold text-white shadow-soft disabled:cursor-not-allowed disabled:opacity-60"
      >
        <FileUp aria-hidden className="h-4 w-4" />
        {isPending ? "Enviando..." : "Enviar comprobante"}
      </button>
      {message ? (
        <p className="inline-flex items-center gap-2 rounded-md bg-surface-muted px-3 py-2 text-sm text-ink-secondary">
          {message.toLowerCase().includes("no pudimos") ? <XCircle aria-hidden className="h-4 w-4 text-semantic-danger" /> : <CheckCircle2 aria-hidden className="h-4 w-4 text-semantic-success" />}
          {message}
        </p>
      ) : null}
    </form>
  );
}
