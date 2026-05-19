import { CreditCard } from "lucide-react";

import { updateCoursePaymentSettingsAction } from "@/lib/engines/learning/actions";
import type { CoursePaymentSettings } from "@/lib/engines/learning/types";

type CoursePaymentSettingsPanelProps = {
  settings: CoursePaymentSettings;
};

export function CoursePaymentSettingsPanel({ settings }: CoursePaymentSettingsPanelProps) {
  return (
    <section className="space-y-4 rounded-lg border border-slate-200 bg-white p-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-normal text-brand-primary">Pagos</p>
          <h2 className="text-xl font-semibold text-slate-950">Metodos de pago del curso</h2>
          <p className="mt-1 text-sm text-slate-600">Configura transferencia, DIMO o acceso gratuito para este curso.</p>
        </div>
        <span className="inline-flex w-fit items-center gap-2 rounded-md bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
          <CreditCard aria-hidden className="h-4 w-4" />
          {settings.paymentType}
        </span>
      </div>

      <form action={updateCoursePaymentSettingsAction} className="grid gap-4 rounded-md border border-slate-200 bg-slate-50 p-4 md:grid-cols-2">
        <input type="hidden" name="courseId" value={settings.courseId} />
        <label className="space-y-1 text-sm font-semibold text-slate-800">
          Tipo de pago
          <select name="paymentType" defaultValue={settings.paymentType} className="min-h-11 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm">
            <option value="free">Gratis</option>
            <option value="transfer">Transferencia</option>
            <option value="dimo">DIMO</option>
            <option value="mixed">Transferencia + DIMO</option>
          </select>
        </label>
        <label className="space-y-1 text-sm font-semibold text-slate-800">
          Link DIMO
          <input name="dimoUrl" defaultValue={settings.dimoUrl ?? ""} placeholder="https://..." className="min-h-11 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm" />
        </label>
        <label className="space-y-1 text-sm font-semibold text-slate-800">
          Banco
          <input name="transferBank" defaultValue={settings.transferBank ?? ""} placeholder="BBVA, Banorte, Santander..." className="min-h-11 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm" />
        </label>
        <label className="space-y-1 text-sm font-semibold text-slate-800">
          CLABE
          <input name="transferClabe" defaultValue={settings.transferClabe ?? ""} inputMode="numeric" placeholder="18 digitos" className="min-h-11 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm" />
        </label>
        <label className="space-y-1 text-sm font-semibold text-slate-800">
          Titular
          <input name="transferOwner" defaultValue={settings.transferOwner ?? ""} placeholder="Nombre del titular" className="min-h-11 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm" />
        </label>
        <label className="space-y-1 text-sm font-semibold text-slate-800 md:col-span-2">
          Notas de pago
          <textarea name="paymentNotes" defaultValue={settings.paymentNotes ?? ""} rows={4} className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm" placeholder="Instrucciones, monto, conceptos o tiempos de revision." />
        </label>
        <div className="md:col-span-2">
          <button type="submit" className="inline-flex min-h-11 items-center justify-center rounded-md bg-brand-primary px-4 py-2 text-sm font-semibold text-white">
            Guardar metodos de pago
          </button>
        </div>
      </form>
    </section>
  );
}
