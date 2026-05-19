import { Store } from "lucide-react";

import { updateCourseStorefrontSettingsAction } from "@/lib/engines/learning/actions";
import type { CourseStorefrontSettings } from "@/lib/courses/storefront";

type CourseStorefrontSettingsPanelProps = {
  settings: CourseStorefrontSettings;
};

export function CourseStorefrontSettingsPanel({ settings }: CourseStorefrontSettingsPanelProps) {
  return (
    <section className="space-y-4 rounded-lg border border-slate-200 bg-white p-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-normal text-brand-primary">Storefront</p>
          <h2 className="text-xl font-semibold text-slate-950">Ficha publica del curso</h2>
          <p className="mt-1 text-sm text-slate-600">Controla visibilidad, instructor y metadata comercial para /cursos.</p>
        </div>
        <span className="inline-flex w-fit items-center gap-2 rounded-md bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
          <Store aria-hidden className="h-4 w-4" />
          {settings.showOnLanding ? "Visible" : "Oculto"}
        </span>
      </div>

      <form action={updateCourseStorefrontSettingsAction} className="grid gap-4 rounded-md border border-slate-200 bg-slate-50 p-4 md:grid-cols-2">
        <input type="hidden" name="courseId" value={settings.courseId} />
        <label className="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-3 text-sm font-semibold text-slate-800 md:col-span-2">
          <input type="checkbox" name="showOnLanding" defaultChecked={settings.showOnLanding} className="h-4 w-4 rounded border-slate-300" />
          Mostrar en /cursos
        </label>
        <label className="space-y-1 text-sm font-semibold text-slate-800">
          Instructor
          <input name="instructorName" defaultValue={settings.instructorName ?? ""} placeholder="Nombre del instructor" className="min-h-11 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm" />
        </label>
        <label className="space-y-1 text-sm font-semibold text-slate-800">
          Thumbnail
          <input name="thumbnailUrl" defaultValue={settings.thumbnailUrl ?? ""} placeholder="https://..." className="min-h-11 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm" />
        </label>
        <label className="space-y-1 text-sm font-semibold text-slate-800 md:col-span-2">
          Descripcion corta
          <textarea name="shortDescription" defaultValue={settings.shortDescription ?? ""} rows={3} className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm" placeholder="Promesa clara del curso para el catalogo publico." />
        </label>
        <div className="md:col-span-2">
          <button type="submit" className="inline-flex min-h-11 items-center justify-center rounded-md bg-brand-primary px-4 py-2 text-sm font-semibold text-white">
            Guardar storefront
          </button>
        </div>
      </form>
    </section>
  );
}
