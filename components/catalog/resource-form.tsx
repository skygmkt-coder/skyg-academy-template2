"use client";

import { useActionState } from "react";

import { UploadField } from "@/components/catalog/upload-field";
import { addResourceAction } from "@/lib/engines/catalog/actions";
import type { CatalogActionState } from "@/lib/engines/catalog/types";

const initialState: CatalogActionState = { status: "idle", message: "" };

export function ResourceForm({ productId, lessonId }: { productId: string; lessonId: string }) {
  const [state, formAction] = useActionState(addResourceAction, initialState);

  return (
    <form action={formAction} className="space-y-3 rounded-md bg-slate-50 p-3">
      <input type="hidden" name="productId" value={productId} />
      <input type="hidden" name="lessonId" value={lessonId} />
      <label className="block text-sm font-medium text-slate-700">
        Recurso
        <input name="title" required className="mt-1 min-h-10 w-full rounded-md border border-slate-300 px-3 py-2" />
      </label>
      <UploadField intent="lesson-resource" inputName="fileUrl" label="Archivo URL" />
      {state.status !== "idle" ? (
        <p role={state.status === "error" ? "alert" : "status"} className="text-sm text-slate-700">
          {state.message}
        </p>
      ) : null}
      <button className="min-h-10 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-800" type="submit">
        Agregar recurso
      </button>
    </form>
  );
}
