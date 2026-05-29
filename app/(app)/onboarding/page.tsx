import type { ComponentType } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  BookOpen,
  Boxes,
  BrainCircuit,
  CheckCircle2,
  ChevronRight,
  Circle,
  CreditCard,
  FileText,
  GraduationCap,
  Layers3,
  Lightbulb,
  Palette,
  PlayCircle,
  Rocket,
  ShieldCheck,
  Sparkles,
  WandSparkles
} from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { requireUser } from "@/lib/engines/auth/helpers";

type StepStatus = "done" | "current" | "next";

type OnboardingStep = {
  id: string;
  title: string;
  description: string;
  status: StepStatus;
  icon: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
};

type SetupCard = {
  title: string;
  description: string;
  href: string;
  action: string;
  icon: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  progress: number;
};

const onboardingSteps: OnboardingStep[] = [
  {
    id: "welcome",
    title: "Bienvenida",
    description: "Conoce la plataforma y el mapa de activacion.",
    status: "done",
    icon: Sparkles
  },
  {
    id: "academy",
    title: "Configura academia",
    description: "Define curso, producto y experiencia de pago.",
    status: "current",
    icon: Layers3
  },
  {
    id: "publish",
    title: "Publica",
    description: "Activa storefront, acceso y primer alumno.",
    status: "next",
    icon: Rocket
  }
];

const setupCards: SetupCard[] = [
  {
    title: "Primer curso",
    description: "Crea estructura, modulos y una leccion inicial con una experiencia limpia.",
    href: "/admin/cursos",
    action: "Crear curso",
    icon: BookOpen,
    progress: 72
  },
  {
    title: "Primer producto",
    description: "Prepara precio, descripcion comercial y CTA para convertir el catalogo.",
    href: "/admin/productos",
    action: "Configurar producto",
    icon: Boxes,
    progress: 48
  },
  {
    title: "Pago manual",
    description: "Ensaya DIMO, transferencia y comprobante para que el alumno confie.",
    href: "/admin/pagos",
    action: "Revisar pagos",
    icon: CreditCard,
    progress: 64
  }
];

const aiSuggestions = [
  "Publica un curso starter con 3 modulos para validar demanda antes de crear toda la academia.",
  "Activa una oferta manual LATAM simple: transferencia + DIMO + instrucciones claras.",
  "Usa el storefront como primera prueba comercial y revisa conversion desde el dashboard."
];

const checklist = [
  { title: "Branding base listo", detail: "Nombre, tono y experiencia visual inicial.", done: true },
  { title: "Curso demo creado", detail: "Estructura minima para mostrar valor rapido.", done: true },
  { title: "Producto vendible", detail: "Precio, descripcion y checkout conectados.", done: false },
  { title: "Primer alumno invitado", detail: "Validar acceso, player y progreso.", done: false }
];

export default async function OnboardingPage() {
  const { profile } = await requireUser();
  const firstName = profile.fullName?.split(" ")[0] ?? "bienvenido";
  const isAdmin = profile.role === "admin";
  const setupProgress = isAdmin ? 62 : 38;

  return (
    <section className="space-y-8">
      <PageHeader
        eyebrow="Onboarding"
        title={`Hola, ${firstName}. Vamos a activar tu academia.`}
        description="Un flujo guiado para convertir una instalacion nueva en una plataforma lista para vender, ensenar y operar."
        actions={
          <>
            <Link
              href={isAdmin ? "/admin/cursos" : "/mis-productos"}
              className="inline-flex min-h-10 items-center gap-2 rounded-md bg-brand-primary px-4 py-2 text-sm font-semibold text-white shadow-soft"
            >
              {isAdmin ? "Empezar setup" : "Ver mis productos"}
              <ArrowRight aria-hidden className="h-4 w-4" />
            </Link>
            <Link
              href={isAdmin ? "/admin" : "/mis-productos"}
              className="inline-flex min-h-10 items-center gap-2 rounded-md border border-line-subtle bg-surface-base px-4 py-2 text-sm font-semibold text-ink-secondary shadow-soft"
            >
              Ir al dashboard
            </Link>
          </>
        }
      />

      <section className="overflow-hidden rounded-lg border border-white/10 bg-slate-950 text-white shadow-float">
        <div className="grid gap-px bg-white/10 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="bg-[radial-gradient(circle_at_18%_12%,rgba(20,184,166,0.26),transparent_30%),radial-gradient(circle_at_90%_18%,rgba(59,130,246,0.22),transparent_28%),linear-gradient(145deg,#020617,#0f172a)] p-5 sm:p-7">
            <span className="inline-flex items-center gap-2 rounded-md border border-white/10 bg-white/[0.06] px-3 py-1.5 text-xs font-semibold text-brand-accent">
              <WandSparkles aria-hidden className="h-4 w-4" />
              First run experience
            </span>
            <h2 className="mt-6 max-w-3xl text-3xl font-semibold leading-tight sm:text-5xl">
              Tu primer wow moment: una academia lista para tomar forma en minutos.
            </h2>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-300">
              El sistema te guia por las piezas importantes: curso, producto, checkout, storefront y primera experiencia del alumno.
            </p>

            <div className="mt-8 grid gap-3 md:grid-cols-3">
              <DarkSignal icon={ShieldCheck} label="Produccion" value="Lista" detail="Auth y acceso protegidos" />
              <DarkSignal icon={PlayCircle} label="Tiempo estimado" value="12 min" detail="Setup guiado mock" />
              <DarkSignal icon={BadgeCheck} label="Activacion" value={`${setupProgress}%`} detail="Progreso visual" />
            </div>
          </div>

          <aside className="bg-slate-950 p-5 sm:p-7">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-normal text-brand-accent">Activation tracker</p>
                <h3 className="mt-1 text-lg font-semibold text-white">Progreso inicial</h3>
              </div>
              <span className="rounded-md bg-white/[0.08] px-2.5 py-1 text-xs font-semibold text-slate-300">{setupProgress}%</span>
            </div>
            <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-brand-accent" style={{ width: `${setupProgress}%` }} />
            </div>
            <div className="mt-6 space-y-3">
              {onboardingSteps.map((step) => (
                <WizardStep key={step.id} step={step} />
              ))}
            </div>
          </aside>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.4fr_0.85fr]">
        <div className="space-y-6">
          <section className="rounded-lg border border-line-subtle bg-surface-base p-5 shadow-soft">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-normal text-brand-primary">Setup wizard</p>
                <h2 className="mt-1 text-lg font-semibold text-ink-primary">Las primeras tres decisiones</h2>
              </div>
              <span className="inline-flex w-fit items-center gap-2 rounded-md bg-surface-muted px-3 py-1.5 text-xs font-semibold text-ink-secondary">
                <Sparkles aria-hidden className="h-4 w-4 text-brand-primary" />
                Guiado por IA
              </span>
            </div>
            <div className="mt-5 grid gap-4 lg:grid-cols-3">
              {setupCards.map((card) => (
                <SetupCardView key={card.title} card={card} />
              ))}
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
            <ChecklistPanel />
            <FirstCoursePreview />
          </section>
        </div>

        <aside className="space-y-6">
          <AiSetupSuggestions />
          <WelcomeFlowCard isAdmin={isAdmin} />
          <EmptyStatePreview />
        </aside>
      </section>
    </section>
  );
}

function WizardStep({ step }: { step: OnboardingStep }) {
  const Icon = step.icon;
  const isDone = step.status === "done";
  const isCurrent = step.status === "current";

  return (
    <div className={`flex gap-3 rounded-md border p-3 ${isCurrent ? "border-brand-accent/40 bg-brand-accent/10" : "border-white/10 bg-white/[0.04]"}`}>
      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md ${isDone ? "bg-emerald-400/10 text-emerald-300" : isCurrent ? "bg-brand-accent/15 text-brand-accent" : "bg-white/[0.06] text-slate-400"}`}>
        <Icon aria-hidden className="h-4 w-4" />
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-white">{step.title}</span>
        <span className="mt-1 block text-xs leading-5 text-slate-400">{step.description}</span>
      </span>
    </div>
  );
}

function SetupCardView({ card }: { card: SetupCard }) {
  const Icon = card.icon;

  return (
    <Link href={card.href} className="group rounded-lg border border-line-subtle bg-surface-raised p-4 shadow-soft transition hover:border-brand-primary/40">
      <div className="flex items-start justify-between gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-md bg-brand-primary/10 text-brand-primary">
          <Icon aria-hidden className="h-5 w-5" />
        </span>
        <ChevronRight aria-hidden className="h-4 w-4 text-ink-muted transition group-hover:translate-x-0.5 group-hover:text-brand-primary" />
      </div>
      <h3 className="mt-4 font-semibold text-ink-primary">{card.title}</h3>
      <p className="mt-2 text-sm leading-6 text-ink-secondary">{card.description}</p>
      <div className="mt-5 h-2 overflow-hidden rounded-full bg-surface-muted">
        <div className="h-full rounded-full bg-brand-primary" style={{ width: `${card.progress}%` }} />
      </div>
      <p className="mt-3 text-sm font-semibold text-brand-primary">{card.action}</p>
    </Link>
  );
}

function ChecklistPanel() {
  return (
    <section className="rounded-lg border border-line-subtle bg-surface-base p-5 shadow-soft">
      <div>
        <p className="text-xs font-semibold uppercase tracking-normal text-brand-primary">Setup checklist</p>
        <h2 className="mt-1 text-lg font-semibold text-ink-primary">Antes de publicar</h2>
      </div>
      <div className="mt-5 space-y-3">
        {checklist.map((item) => (
          <div key={item.title} className="flex gap-3 rounded-md border border-line-subtle bg-surface-raised p-3">
            {item.done ? (
              <CheckCircle2 aria-hidden className="mt-0.5 h-5 w-5 shrink-0 text-semantic-success" />
            ) : (
              <Circle aria-hidden className="mt-0.5 h-5 w-5 shrink-0 text-ink-muted" />
            )}
            <div>
              <p className="text-sm font-semibold text-ink-primary">{item.title}</p>
              <p className="mt-1 text-sm leading-5 text-ink-secondary">{item.detail}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function FirstCoursePreview() {
  return (
    <section className="rounded-lg border border-line-subtle bg-surface-base p-5 shadow-soft">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-normal text-brand-primary">First-course setup</p>
          <h2 className="mt-1 text-lg font-semibold text-ink-primary">Blueprint inicial</h2>
        </div>
        <GraduationCap aria-hidden className="h-5 w-5 text-brand-primary" />
      </div>
      <div className="mt-5 space-y-3">
        <BlueprintRow icon={FileText} title="Promesa del curso" detail="Una frase clara para el storefront." />
        <BlueprintRow icon={Layers3} title="3 modulos base" detail="Introduccion, sistema, implementacion." />
        <BlueprintRow icon={PlayCircle} title="Leccion wow" detail="Un video o recurso que entregue valor inmediato." />
      </div>
    </section>
  );
}

function AiSetupSuggestions() {
  return (
    <section className="rounded-lg border border-line-subtle bg-surface-base p-5 shadow-float">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-md bg-brand-accent/10 text-brand-accent">
          <BrainCircuit aria-hidden className="h-5 w-5" />
        </span>
        <div>
          <p className="text-xs font-semibold uppercase tracking-normal text-brand-primary">AI setup suggestions</p>
          <h2 className="text-lg font-semibold text-ink-primary">Siguiente mejor paso</h2>
        </div>
      </div>
      <div className="mt-5 space-y-3">
        {aiSuggestions.map((suggestion) => (
          <p key={suggestion} className="rounded-md border border-line-subtle bg-surface-raised p-3 text-sm leading-6 text-ink-secondary">
            {suggestion}
          </p>
        ))}
      </div>
    </section>
  );
}

function WelcomeFlowCard({ isAdmin }: { isAdmin: boolean }) {
  return (
    <section className="rounded-lg border border-line-subtle bg-surface-base p-5 shadow-soft">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-normal text-brand-primary">Welcome flow</p>
          <h2 className="mt-1 text-lg font-semibold text-ink-primary">Modo recomendado</h2>
        </div>
        <Lightbulb aria-hidden className="h-5 w-5 text-brand-primary" />
      </div>
      <p className="mt-4 text-sm leading-6 text-ink-secondary">
        {isAdmin
          ? "Empieza como operador: crea un curso demo, enlaza un producto y valida el checkout antes de invitar alumnos."
          : "Empieza como alumno: entra a tus productos, continua una leccion y confirma que el progreso se siente claro."}
      </p>
      <Link href={isAdmin ? "/admin" : "/mis-productos"} className="mt-5 inline-flex min-h-10 items-center gap-2 rounded-md bg-ink-primary px-4 py-2 text-sm font-semibold text-surface-base">
        Abrir experiencia
        <ArrowRight aria-hidden className="h-4 w-4" />
      </Link>
    </section>
  );
}

function EmptyStatePreview() {
  return (
    <section className="rounded-lg border border-dashed border-line-strong bg-surface-base p-5 text-center shadow-soft">
      <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-md bg-surface-muted text-brand-primary">
        <Palette aria-hidden className="h-6 w-6" />
      </span>
      <h2 className="mt-4 font-semibold text-ink-primary">Empty states inteligentes</h2>
      <p className="mt-2 text-sm leading-6 text-ink-secondary">
        Cuando no existan cursos, productos o pagos, el sistema puede guiar al usuario hacia la siguiente accion.
      </p>
    </section>
  );
}

function DarkSignal({
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

function BlueprintRow({
  detail,
  icon: Icon,
  title
}: {
  detail: string;
  icon: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  title: string;
}) {
  return (
    <div className="flex gap-3 rounded-md border border-line-subtle bg-surface-raised p-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-surface-muted text-brand-primary">
        <Icon aria-hidden className="h-4 w-4" />
      </span>
      <div>
        <p className="text-sm font-semibold text-ink-primary">{title}</p>
        <p className="mt-1 text-sm leading-5 text-ink-secondary">{detail}</p>
      </div>
    </div>
  );
}
