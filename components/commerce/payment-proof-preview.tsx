"use client";

import { useRef } from "react";
import { ExternalLink, X } from "lucide-react";

type PaymentProofPreviewProps = {
  imageUrl: string;
  label: string;
};

export function PaymentProofPreview({ imageUrl, label }: PaymentProofPreviewProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  return (
    <>
      <button
        type="button"
        onClick={() => dialogRef.current?.showModal()}
        className="group flex w-full items-center gap-3 rounded-md border border-line-subtle bg-surface-raised p-2 text-left transition hover:border-brand-primary/40"
      >
        <span
          className="h-14 w-14 shrink-0 rounded-md border border-line-subtle bg-surface-muted bg-cover bg-center"
          style={{ backgroundImage: `url(${imageUrl})` }}
        />
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold text-ink-primary">Comprobante</span>
          <span className="block truncate text-xs text-ink-muted">{label}</span>
        </span>
        <ExternalLink aria-hidden className="h-4 w-4 shrink-0 text-ink-muted group-hover:text-brand-primary" />
      </button>

      <dialog ref={dialogRef} className="w-[min(42rem,92vw)] rounded-lg border border-line-subtle bg-surface-base p-0 shadow-float backdrop:bg-slate-950/60">
        <div className="flex items-center justify-between gap-4 border-b border-line-subtle px-4 py-3">
          <div>
            <p className="text-sm font-semibold text-ink-primary">Comprobante de pago</p>
            <p className="text-xs text-ink-muted">{label}</p>
          </div>
          <button
            type="button"
            aria-label="Cerrar comprobante"
            onClick={() => dialogRef.current?.close()}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-line-subtle bg-surface-raised text-ink-secondary"
          >
            <X aria-hidden className="h-4 w-4" />
          </button>
        </div>
        <div className="max-h-[72vh] overflow-auto bg-surface-muted p-4">
          <div
            aria-label="Comprobante de pago"
            role="img"
            className="mx-auto h-[68vh] max-w-full rounded-md border border-line-subtle bg-white bg-contain bg-center bg-no-repeat shadow-soft"
            style={{ backgroundImage: `url(${imageUrl})` }}
          />
        </div>
        <div className="flex justify-end border-t border-line-subtle px-4 py-3">
          <a href={imageUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-10 items-center gap-2 rounded-md bg-brand-primary px-4 py-2 text-sm font-semibold text-white">
            Abrir imagen
            <ExternalLink aria-hidden className="h-4 w-4" />
          </a>
        </div>
      </dialog>
    </>
  );
}
