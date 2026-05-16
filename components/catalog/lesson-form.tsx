"use client";

import { useActionState } from "react";

import { addLessonAction } from "@/lib/engines/catalog/actions";
import type { CatalogActionState } from "@/lib/engines/catalog/types";

const initialState: CatalogActionState = { status: "idle", message: "" };

export function LessonForm({ productId }: { productId: string }) {
  const [state, formAction] = useActionState(addLessonAction, initialState);

  return (
    <form action={formAction} className="space-y-4 rounded-lg border border-slate-200 bg-white p-4">
      <input type="hidden" name="productId" value={productId} />
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block text-sm font-medium text-slate-700">
          Titulo
          <input name="title" required className="mt-1 min-h-11 w-full rounded-md border border-slate-300 px-3 py-2" />
        </label>
        <label className="block text-sm font-medium text-slate-700">
          Slug
          <input name="slug" required className="mt-1 min-h-11 w-full rounded-md border border-slate-300 px-3 py-2" />
        </label>
      </div>
      <label className="block text-sm font-medium text-slate-700">
        Video URL
        <input name="videoUrl" type="url" className="mt-1 min-h-11 w-full rounded-md border border-slate-300 px-3 py-2" />
      </label>
      <label className="block text-sm font-medium text-slate-700">
        Descripcion
        <textarea name="description" rows={3} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" />
      </label>
      <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
        <input name="isPreview" type="checkbox" className="h-4 w-4" />
        Preview publico
      </label>
      {state.status !== "idle" ? (
        <p role={state.status === "error" ? "alert" : "status"} className="text-sm text-slate-700">
          {state.message}
        </p>
      ) : null}
      <button className="min-h-10 rounded-md bg-brand-primary px-4 py-2 text-sm font-semibold text-white" type="submit">
        Agregar leccion
      </button>
    </form>
  );
}
