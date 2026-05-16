"use client";

import { useActionState } from "react";

import { UploadField } from "@/components/catalog/upload-field";
import { saveProductAction } from "@/lib/engines/catalog/actions";
import type { CatalogActionState, Product } from "@/lib/engines/catalog/types";

const initialState: CatalogActionState = { status: "idle", message: "" };

export function ProductForm({ product }: { product: Product }) {
  const [state, formAction] = useActionState(saveProductAction, initialState);

  return (
    <form action={formAction} className="space-y-5 rounded-lg border border-slate-200 bg-white p-4">
      <input type="hidden" name="id" value={product.id} />
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block text-sm font-medium text-slate-700">
          Titulo
          <input
            required
            name="title"
            defaultValue={product.title}
            className="mt-1 min-h-11 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-950 outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
          />
        </label>
        <label className="block text-sm font-medium text-slate-700">
          Slug
          <input
            required
            name="slug"
            defaultValue={product.slug}
            className="mt-1 min-h-11 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-950 outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
          />
        </label>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block text-sm font-medium text-slate-700">
          Tipo
          <select
            required
            name="type"
            defaultValue={product.type}
            className="mt-1 min-h-11 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-950 outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
          >
            <option value="curso">Curso</option>
            <option value="taller">Taller</option>
          </select>
        </label>
        <label className="block text-sm font-medium text-slate-700">
          Precio MXN centavos
          <input
            required
            name="priceMxnCents"
            type="number"
            min="0"
            step="1"
            defaultValue={product.priceMxnCents}
            className="mt-1 min-h-11 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-950 outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
          />
        </label>
      </div>
      <label className="block text-sm font-medium text-slate-700">
        Subtitulo
        <input
          name="subtitle"
          defaultValue={product.subtitle ?? ""}
          className="mt-1 min-h-11 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-950 outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
        />
      </label>
      <label className="block text-sm font-medium text-slate-700">
        Descripcion
        <textarea
          name="description"
          rows={5}
          defaultValue={product.description ?? ""}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-950 outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
        />
      </label>
      <UploadField
        intent="cover-image"
        inputName="coverImageUrl"
        label="Cover image URL"
        defaultValue={product.coverImageUrl}
      />
      {state.status !== "idle" ? (
        <p
          role={state.status === "error" ? "alert" : "status"}
          className={`rounded-md px-3 py-2 text-sm ${
            state.status === "error" ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"
          }`}
        >
          {state.message}
        </p>
      ) : null}
      <button className="min-h-11 rounded-md bg-brand-primary px-4 py-2 text-sm font-semibold text-white" type="submit">
        Guardar producto
      </button>
    </form>
  );
}
