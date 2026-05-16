"use client";

import { useState } from "react";
import { Upload } from "lucide-react";

import { uploadCatalogAsset } from "@/lib/engines/catalog/upload-client";
import type { SignedUploadIntent } from "@/lib/engines/catalog/types";

type UploadFieldProps = {
  intent: SignedUploadIntent;
  inputName: string;
  label: string;
  defaultValue?: string | null;
};

export function UploadField({ intent, inputName, label, defaultValue }: UploadFieldProps) {
  const [value, setValue] = useState(defaultValue ?? "");
  const [status, setStatus] = useState<"idle" | "uploading" | "error">("idle");

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-700">
        {label}
        <input
          name={inputName}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          className="mt-1 min-h-11 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-950 outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
        />
      </label>
      <label className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
        <Upload aria-hidden className="h-4 w-4" />
        {status === "uploading" ? "Cargando..." : "Subir archivo"}
        <input
          type="file"
          className="sr-only"
          onChange={async (event) => {
            const file = event.target.files?.[0];
            if (!file) {
              return;
            }

            setStatus("uploading");
            try {
              const publicUrl = await uploadCatalogAsset({ intent, file });
              setValue(publicUrl);
              setStatus("idle");
            } catch {
              setStatus("error");
            }
          }}
        />
      </label>
      {status === "error" ? (
        <p role="alert" className="text-sm text-red-700">
          No pudimos subir el archivo.
        </p>
      ) : null}
    </div>
  );
}
