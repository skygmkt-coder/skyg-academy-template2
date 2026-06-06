import type { ComponentType, ReactNode } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Bell,
  Building2,
  ChevronRight,
  CreditCard,
  DatabaseZap,
  Fingerprint,
  Globe2,
  LockKeyhole,
  Mail,
  Palette,
  PlugZap,
  Scale,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  SunMoon,
  UserCog,
  UsersRound,
  WandSparkles
} from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { requireAdmin } from "@/lib/engines/auth/helpers";
import { getActiveBrandSettings } from "@/lib/engines/branding/service";

type SettingsSection = {
  id: string;
  title: string;
  description: string;
  icon: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  href?: string;
};

type Integration = {
  name: string;
  description: string;
  status: "Ready" | "Mock" | "Soon";
  icon: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
};

const sections: SettingsSection[] = [
  {
    id: "workspace",
    title: "Workspace",
    description: "Nombre, dominio, region y preferencias operativas.",
    icon: Building2
  },
  {
    id: "brand",
    title: "Branding",
    description: "Colores, logo, tono visual y personalizacion.",
    icon: Palette
  },
  {
    id: "account",
    title: "Cuenta",
    description: "Perfil, email y preferencias de administrador.",
    icon: UserCog
  },
  {
    id: "security",
    title: "Seguridad",
    description: "Acceso, permisos y controles enterprise.",
    icon: ShieldCheck
  },
  {
    id: "legal",
    title: "Legal",
    description: "Razon social, terminos, privacidad y avisos.",
    icon: Scale,
    href: "/admin/settings/legal"
  }
];

const integrations: Integration[] = [
  {
    name: "Supabase",
    description: "Auth, database, storage y RLS conectados.",
    status: "Ready",
    icon: DatabaseZap
  },
  {
    name: "Manual payments",
    description: "DIMO, transferencias y comprobantes LATAM.",
    status: "Ready",
    icon: CreditCard
  },
  {
    name: "AI workspace",
    description: "Insights, CRM y automatizaciones visuales.",
    status: "Mock",
    icon: WandSparkles
  },
  {
    name: "Email provider",
    description: "Invitaciones, recibos y notificaciones futuras.",
    status: "Soon",
    icon: Mail
  }
];

const teamMembers = [
  { name: "Workspace Owner", role: "Admin", status: "Activo" },
  { name: "Course Manager", role: "Editor", status: "Placeholder" },
  { name: "Support Agent", role: "Soporte", status: "Placeholder" }
];

export default async function AdminSettingsPage() {
  const [{ profile }, brand] = await Promise.all([requireAdmin(), getActiveBrandSettings()]);

  return (
    <section className="space-y-8">
      <PageHeader
        eyebrow="Settings"
        title="Workspace settings"
        description="Una experiencia de configuracion premium para marca, cuenta, seguridad, integraciones y operacion enterprise."
        actions={
          <>
            <Link href="/admin/settings/legal" className="inline-flex min-h-10 items-center gap-2 rounded-md border border-line-subtle bg-surface-base px-4 py-2 text-sm font-semibold text-ink-secondary shadow-soft">
              <SlidersHorizontal aria-hidden className="h-4 w-4" />
              Legal settings
            </Link>
            <Link href="/admin/settings/legal" className="inline-flex min-h-10 items-center gap-2 rounded-md bg-ink-primary px-4 py-2 text-sm font-semibold text-surface-base shadow-soft">
              Editar configuracion real
              <ArrowRight aria-hidden className="h-4 w-4" />
            </Link>
          </>
        }
      />

      <section className="overflow-hidden rounded-lg border border-white/10 bg-slate-950 text-white shadow-float">
        <div className="grid gap-px bg-white/10 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="bg-[radial-gradient(circle_at_18%_10%,rgba(20,184,166,0.25),transparent_30%),radial-gradient(circle_at_86%_16%,rgba(59,130,246,0.22),transparent_28%),linear-gradient(145deg,#020617,#0f172a)] p-5 sm:p-7">
            <span className="inline-flex items-center gap-2 rounded-md border border-white/10 bg-white/[0.06] px-3 py-1.5 text-xs font-semibold text-brand-accent">
              <Sparkles aria-hidden className="h-4 w-4" />
              Enterprise workspace
            </span>
            <h2 className="mt-6 max-w-3xl text-3xl font-semibold leading-tight sm:text-5xl">
              Controla como se ve, opera y escala tu academia.
            </h2>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-300">
              Una capa de settings pensada para transmitir confianza: marca consistente, permisos claros, integraciones visibles y seguridad preparada.
            </p>
            <div className="mt-8 grid gap-3 md:grid-cols-3">
              <DarkStat icon={BadgeCheck} label="Workspace" value="Activo" detail="Configuracion base" />
              <DarkStat icon={LockKeyhole} label="Security" value="RLS" detail="Acceso protegido" />
              <DarkStat icon={PlugZap} label="Integrations" value="4" detail="Ready / mock / soon" />
            </div>
          </div>

          <aside className="bg-slate-950 p-5 sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-normal text-brand-accent">Current brand</p>
                <h3 className="mt-1 text-2xl font-semibold text-white">{brand.brandName}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">Admin: {profile.email}</p>
              </div>
              <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-white text-sm font-semibold text-slate-950">
                {brand.brandName.slice(0, 2).toUpperCase()}
              </span>
            </div>
            <div className="mt-6 grid gap-3">
              <ColorSwatch label="Primary" value={brand.primaryColor} />
              <ColorSwatch label="Accent" value={brand.accentColor} />
              <div className="rounded-md border border-dashed border-white/14 bg-white/[0.04] p-4 text-sm leading-6 text-slate-300">
                Logo, dominio custom y workspace avatar quedan preparados como UI premium placeholder.
              </div>
            </div>
          </aside>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.78fr_1.22fr]">
        <aside className="space-y-3">
          {sections.map((section) => (
            <SettingsNavCard key={section.id} section={section} />
          ))}
        </aside>

        <div className="space-y-6">
          <section className="grid gap-6 lg:grid-cols-2">
            <WorkspaceOverview brandName={brand.brandName} />
            <BrandingSettings primaryColor={brand.primaryColor} accentColor={brand.accentColor} />
          </section>

          <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <AccountPanel email={profile.email} name={profile.fullName ?? "Workspace admin"} />
            <AppearancePanel />
          </section>

          <section className="grid gap-6 lg:grid-cols-3">
            <BillingOverview />
            <NotificationsPanel />
            <SecurityPanel />
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <IntegrationsPanel />
            <TeamPanel />
          </section>
        </div>
      </section>
    </section>
  );
}

function SettingsNavCard({ section }: { section: SettingsSection }) {
  const Icon = section.icon;
  const content = (
    <>
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-brand-primary/10 text-brand-primary">
        <Icon aria-hidden className="h-5 w-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold text-ink-primary">{section.title}</span>
        <span className="mt-1 block text-sm leading-5 text-ink-secondary">{section.description}</span>
        {!section.href ? <span className="mt-2 block text-xs font-semibold text-ink-muted">Editable MVP pendiente</span> : null}
      </span>
      <ChevronRight aria-hidden className="mt-1 h-4 w-4 text-ink-muted transition group-hover:translate-x-0.5 group-hover:text-brand-primary" />
    </>
  );

  if (section.href) {
    return (
      <Link href={section.href} className="group flex gap-3 rounded-lg border border-line-subtle bg-surface-base p-4 shadow-soft transition hover:border-brand-primary/40">
        {content}
      </Link>
    );
  }

  return (
    <div className="flex gap-3 rounded-lg border border-line-subtle bg-surface-base p-4 opacity-85 shadow-soft">
      {content}
    </div>
  );
}

function WorkspaceOverview({ brandName }: { brandName: string }) {
  return (
    <SettingsCard id="workspace" eyebrow="Workspace overview" icon={Building2} title="Identidad del workspace">
      <div className="space-y-3">
        <MockInput label="Workspace name" value={brandName} />
        <MockInput label="Workspace URL" value="academy.skyg.app" />
        <MockInput label="Region" value="Mexico / LATAM" />
      </div>
      <p className="mt-4 rounded-md bg-surface-muted p-3 text-sm leading-6 text-ink-secondary">
        Multi-workspace ready: la UI deja espacio para dominios, regiones, estados y ownership futuro.
      </p>
    </SettingsCard>
  );
}

function BrandingSettings({ accentColor, primaryColor }: { accentColor: string; primaryColor: string }) {
  return (
    <SettingsCard id="brand" eyebrow="Branding settings" icon={Palette} title="Marca y personalizacion">
      <div className="grid gap-3 sm:grid-cols-2">
        <BrandColor label="Primary" value={primaryColor} />
        <BrandColor label="Accent" value={accentColor} />
      </div>
      <div className="mt-4 rounded-lg border border-dashed border-line-strong bg-surface-muted p-5 text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-md bg-surface-base text-brand-primary shadow-soft">
          <Globe2 aria-hidden className="h-6 w-6" />
        </span>
        <p className="mt-3 text-sm font-semibold text-ink-primary">Logo y cover del workspace</p>
        <p className="mt-1 text-sm leading-6 text-ink-secondary">Placeholder visual para upload de marca sin tocar storage.</p>
      </div>
    </SettingsCard>
  );
}

function AccountPanel({ email, name }: { email: string; name: string }) {
  return (
    <SettingsCard id="account" eyebrow="Profile / account" icon={UserCog} title="Cuenta administradora">
      <div className="space-y-3">
        <MockInput label="Nombre" value={name} />
        <MockInput label="Email" value={email} />
        <MockInput label="Rol" value="Admin owner" />
      </div>
    </SettingsCard>
  );
}

function AppearancePanel() {
  return (
    <SettingsCard id="appearance" eyebrow="Appearance" icon={SunMoon} title="Tema y experiencia">
      <div className="grid gap-3 sm:grid-cols-3">
        <ThemeOption active label="System" />
        <ThemeOption label="Light" />
        <ThemeOption label="Dark" />
      </div>
      <p className="mt-4 text-sm leading-6 text-ink-secondary">
        Dark mode ready, neutral hierarchy y superficies consistentes para settings enterprise.
      </p>
    </SettingsCard>
  );
}

function BillingOverview() {
  return (
    <MiniSettingsCard icon={CreditCard} title="Billing" value="Manual LATAM" detail="DIMO, transfer y comprobantes configurables." />
  );
}

function NotificationsPanel() {
  return (
    <MiniSettingsCard icon={Bell} title="Notifications" value="Digest ready" detail="Alertas de pagos, leads y alumnos en placeholder." />
  );
}

function SecurityPanel() {
  return (
    <MiniSettingsCard icon={Fingerprint} title="Security" value="Protected" detail="Auth, RLS y ownership conservados sin cambios." />
  );
}

function IntegrationsPanel() {
  return (
    <SettingsCard id="integrations" eyebrow="Integrations" icon={PlugZap} title="Conexiones del workspace">
      <p className="mb-4 text-sm leading-6 text-ink-secondary">
        Estado auditado de integraciones visibles. La configuracion editable debe conectarse en PRs pequenos por proveedor.
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        {integrations.map((integration) => {
          const Icon = integration.icon;
          return (
            <article key={integration.name} className="rounded-md border border-line-subtle bg-surface-raised p-4">
              <div className="flex items-start justify-between gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-md bg-brand-primary/10 text-brand-primary">
                  <Icon aria-hidden className="h-5 w-5" />
                </span>
                <span className={`rounded-md px-2 py-1 text-xs font-semibold ${integration.status === "Ready" ? "bg-emerald-50 text-emerald-700" : integration.status === "Mock" ? "bg-brand-primary/10 text-brand-primary" : "bg-surface-muted text-ink-muted"}`}>
                  {integration.status}
                </span>
              </div>
              <h3 className="mt-4 text-sm font-semibold text-ink-primary">{integration.name}</h3>
              <p className="mt-2 text-sm leading-6 text-ink-secondary">{integration.description}</p>
            </article>
          );
        })}
      </div>
    </SettingsCard>
  );
}

function TeamPanel() {
  return (
    <SettingsCard id="team" eyebrow="Team / workspace" icon={UsersRound} title="Equipo y permisos">
      <p className="mb-4 text-sm leading-6 text-ink-secondary">
        Estructura MVP propuesta: owner, editor de cursos y soporte. La gestion real de roles queda pendiente de persistencia.
      </p>
      <div className="space-y-3">
        {teamMembers.map((member) => (
          <div key={member.name} className="flex items-center justify-between gap-3 rounded-md border border-line-subtle bg-surface-raised p-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-ink-primary">{member.name}</p>
              <p className="text-sm text-ink-muted">{member.role}</p>
            </div>
            <span className="rounded-md bg-surface-muted px-2 py-1 text-xs font-semibold text-ink-muted">{member.status}</span>
          </div>
        ))}
      </div>
      <div className="mt-4 rounded-md border border-dashed border-line-strong bg-surface-muted p-4 text-sm leading-6 text-ink-secondary">
        Empty state premium para invitar equipo cuando se agregue colaboracion real.
      </div>
    </SettingsCard>
  );
}

function SettingsCard({
  children,
  eyebrow,
  icon: Icon,
  id,
  title
}: {
  children: ReactNode;
  eyebrow: string;
  icon: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  id: string;
  title: string;
}) {
  return (
    <section id={id} className="rounded-lg border border-line-subtle bg-surface-base p-5 shadow-soft">
      <div className="mb-5 flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-md bg-brand-primary/10 text-brand-primary">
          <Icon aria-hidden className="h-5 w-5" />
        </span>
        <div>
          <p className="text-xs font-semibold uppercase tracking-normal text-brand-primary">{eyebrow}</p>
          <h2 className="text-lg font-semibold text-ink-primary">{title}</h2>
        </div>
      </div>
      {children}
    </section>
  );
}

function MiniSettingsCard({
  detail,
  icon: Icon,
  title,
  value
}: {
  detail: string;
  icon: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  title: string;
  value: string;
}) {
  return (
    <section className="rounded-lg border border-line-subtle bg-surface-base p-5 shadow-soft">
      <Icon aria-hidden className="h-5 w-5 text-brand-primary" />
      <p className="mt-4 text-sm text-ink-muted">{title}</p>
      <h2 className="mt-1 text-lg font-semibold text-ink-primary">{value}</h2>
      <p className="mt-2 text-sm leading-6 text-ink-secondary">{detail}</p>
    </section>
  );
}

function DarkStat({
  detail,
  icon: Icon,
  label,
  value
}: {
  detail: string;
  icon: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.06] p-4">
      <Icon aria-hidden className="h-5 w-5 text-brand-accent" />
      <p className="mt-4 text-sm text-slate-400">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-white">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{detail}</p>
    </div>
  );
}

function ColorSwatch({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-md border border-white/10 bg-white/[0.04] p-3 text-sm">
      <span className="text-slate-400">{label}</span>
      <span className="flex items-center gap-2 font-semibold text-white">
        <span className="h-4 w-4 rounded-full border border-white/20" style={{ backgroundColor: value }} />
        {value}
      </span>
    </div>
  );
}

function BrandColor({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-line-subtle bg-surface-raised p-3">
      <p className="text-sm font-semibold text-ink-primary">{label}</p>
      <div className="mt-3 flex items-center gap-3">
        <span className="h-10 w-10 rounded-md border border-line-subtle shadow-soft" style={{ backgroundColor: value }} />
        <span className="text-sm text-ink-secondary">{value}</span>
      </div>
    </div>
  );
}

function MockInput({ label, value }: { label: string; value: string }) {
  return (
    <label className="block space-y-2 text-sm font-semibold text-ink-primary">
      {label}
      <span className="block rounded-md border border-line-subtle bg-surface-raised px-3 py-2 text-sm font-medium text-ink-secondary shadow-soft">
        {value}
      </span>
    </label>
  );
}

function ThemeOption({ active, label }: { active?: boolean; label: string }) {
  return (
    <button
      type="button"
      className={`rounded-md border px-3 py-3 text-sm font-semibold shadow-soft ${active ? "border-brand-primary bg-brand-primary text-white" : "border-line-subtle bg-surface-raised text-ink-secondary"}`}
    >
      {label}
    </button>
  );
}
