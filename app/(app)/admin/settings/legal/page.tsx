import Link from "next/link";
import { ArrowLeft, BadgeCheck, Building2, FileText, Globe2, Mail, Scale, ShieldCheck } from "lucide-react";

import { SubmitButton } from "@/components/auth/submit-button";
import { PageHeader } from "@/components/layout/page-header";
import { updateLegalSettingsAction } from "@/lib/engines/branding/actions";
import { getActiveBrandSettings } from "@/lib/engines/branding/service";
import { requireAdmin } from "@/lib/engines/auth/helpers";

const documentSections = [
  {
    id: "privacyPolicy",
    label: "Politica de privacidad",
    description: "Contenido mostrado en /legal/privacy.",
    rows: 10
  },
  {
    id: "termsConditions",
    label: "Terminos y condiciones",
    description: "Contenido mostrado en /legal/terms.",
    rows: 10
  },
  {
    id: "cookiesPolicy",
    label: "Politica de cookies",
    description: "Contenido mostrado en /legal/cookies.",
    rows: 8
  },
  {
    id: "legalNotice",
    label: "Aviso legal",
    description: "Contenido mostrado en /legal/disclaimer.",
    rows: 8
  }
] as const;

export default async function LegalSettingsPage() {
  await requireAdmin();
  const brand = await getActiveBrandSettings();

  return (
    <section className="space-y-8">
      <PageHeader
        eyebrow="Compliance"
        title="Legal & compliance"
        description="Centraliza datos legales, politicas y terminos del workspace sin editar codigo."
        actions={
          <Link href="/admin/settings" className="inline-flex min-h-10 items-center gap-2 rounded-md border border-line-subtle bg-surface-base px-4 py-2 text-sm font-semibold text-ink-secondary shadow-soft">
            <ArrowLeft aria-hidden className="h-4 w-4" />
            Settings
          </Link>
        }
      />

      <section className="overflow-hidden rounded-lg border border-white/10 bg-slate-950 text-white shadow-float">
        <div className="grid gap-px bg-white/10 lg:grid-cols-3">
          <LegalSignal icon={Building2} label="Entidad" value={brand.legalName || "Pendiente"} detail={brand.country || "Pais no configurado"} />
          <LegalSignal icon={Mail} label="Contacto legal" value={brand.legalEmail || "Pendiente"} detail="Visible en paginas legales" />
          <LegalSignal icon={ShieldCheck} label="Documentos" value="4 rutas" detail="Privacy, terms, cookies, notice" />
        </div>
      </section>

      <form action={updateLegalSettingsAction} className="grid gap-6 xl:grid-cols-[0.86fr_1.14fr]">
        <aside className="space-y-6">
          <section className="rounded-lg border border-line-subtle bg-surface-base p-5 shadow-soft">
            <div className="mb-5 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-md bg-brand-primary/10 text-brand-primary">
                <Scale aria-hidden className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-normal text-brand-primary">Informacion legal</p>
                <h2 className="text-lg font-semibold text-ink-primary">Entidad del workspace</h2>
              </div>
            </div>

            <div className="space-y-4">
              <TextField label="Razon social" name="legalName" defaultValue={brand.legalName} placeholder="Empresa S.A. de C.V." />
              <TextField label="Tax ID / RFC" name="taxId" defaultValue={brand.taxId} placeholder="RFC o identificador fiscal" />
              <div className="grid gap-4 sm:grid-cols-2">
                <TextField label="Pais" name="country" defaultValue={brand.country} placeholder="Mexico" />
                <TextField label="Estado" name="state" defaultValue={brand.state} placeholder="Ciudad de Mexico" />
              </div>
              <TextAreaField label="Direccion" name="address" defaultValue={brand.address} rows={4} placeholder="Direccion legal completa" />
              <TextField label="Correo legal" name="legalEmail" defaultValue={brand.legalEmail} placeholder="legal@empresa.com" type="email" />
            </div>
          </section>

          <section className="rounded-lg border border-line-subtle bg-surface-base p-5 shadow-soft">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-brand-primary/10 text-brand-primary">
                <Globe2 aria-hidden className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-lg font-semibold text-ink-primary">Rutas publicas</h2>
                <p className="mt-2 text-sm leading-6 text-ink-secondary">
                  Los documentos se publican automaticamente usando los valores guardados aqui.
                </p>
              </div>
            </div>
            <div className="mt-5 grid gap-2 text-sm">
              <LegalLink href="/legal/privacy" label="Privacidad" />
              <LegalLink href="/legal/terms" label="Terminos" />
              <LegalLink href="/legal/cookies" label="Cookies" />
              <LegalLink href="/legal/disclaimer" label="Aviso Legal" />
            </div>
          </section>

          <SubmitButton pendingText="Guardando legal...">Guardar configuracion legal</SubmitButton>
        </aside>

        <section className="space-y-6">
          {documentSections.map((section) => (
            <section key={section.id} className="rounded-lg border border-line-subtle bg-surface-base p-5 shadow-soft">
              <div className="mb-4 flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-brand-primary/10 text-brand-primary">
                  <FileText aria-hidden className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-normal text-brand-primary">Documento legal</p>
                  <h2 className="text-lg font-semibold text-ink-primary">{section.label}</h2>
                  <p className="mt-1 text-sm leading-6 text-ink-secondary">{section.description}</p>
                </div>
              </div>
              <TextAreaField
                label={section.label}
                name={section.id}
                defaultValue={brand[section.id]}
                rows={section.rows}
                placeholder="Pega aqui el contenido legal aprobado para este documento."
                hideLabel
              />
            </section>
          ))}
        </section>
      </form>
    </section>
  );
}

function TextField({
  defaultValue,
  label,
  name,
  placeholder,
  type = "text"
}: {
  defaultValue: string;
  label: string;
  name: string;
  placeholder: string;
  type?: string;
}) {
  return (
    <label className="block space-y-2 text-sm font-semibold text-ink-primary">
      {label}
      <input
        name={name}
        type={type}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="min-h-11 w-full rounded-md border border-line-subtle bg-surface-raised px-3 py-2 text-sm font-medium text-ink-primary shadow-soft outline-none transition placeholder:text-ink-muted focus:border-brand-primary"
      />
    </label>
  );
}

function TextAreaField({
  defaultValue,
  hideLabel,
  label,
  name,
  placeholder,
  rows
}: {
  defaultValue: string;
  hideLabel?: boolean;
  label: string;
  name: string;
  placeholder: string;
  rows: number;
}) {
  return (
    <label className="block space-y-2 text-sm font-semibold text-ink-primary">
      {hideLabel ? <span className="sr-only">{label}</span> : label}
      <textarea
        name={name}
        defaultValue={defaultValue}
        placeholder={placeholder}
        rows={rows}
        className="w-full rounded-md border border-line-subtle bg-surface-raised px-3 py-2 text-sm leading-6 text-ink-primary shadow-soft outline-none transition placeholder:text-ink-muted focus:border-brand-primary"
      />
    </label>
  );
}

function LegalSignal({
  detail,
  icon: Icon,
  label,
  value
}: {
  detail: string;
  icon: typeof Building2;
  label: string;
  value: string;
}) {
  return (
    <article className="bg-slate-950 p-5">
      <Icon aria-hidden className="h-5 w-5 text-brand-accent" />
      <p className="mt-4 text-sm text-slate-400">{label}</p>
      <p className="mt-1 truncate text-xl font-semibold text-white">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{detail}</p>
    </article>
  );
}

function LegalLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="flex items-center justify-between rounded-md border border-line-subtle bg-surface-raised px-3 py-2 font-medium text-ink-secondary">
      {label}
      <BadgeCheck aria-hidden className="h-4 w-4 text-brand-primary" />
    </Link>
  );
}
