import type { ComponentType } from "react";
import {
  ArrowRight,
  Bell,
  Bot,
  BrainCircuit,
  CalendarClock,
  CheckCircle2,
  CircleDot,
  Mail,
  MessageSquareText,
  Phone,
  Play,
  Plus,
  Sparkles,
  Target,
  UsersRound,
  WandSparkles,
  Zap
} from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { requireAdmin } from "@/lib/engines/auth/helpers";

type LeadStage = {
  id: string;
  title: string;
  value: string;
  tone: string;
  leads: Lead[];
};

type Lead = {
  id: string;
  name: string;
  company: string;
  course: string;
  score: number;
  value: string;
  status: string;
  lastTouch: string;
  intent: "Hot" | "Warm" | "Nurture";
};

type Automation = {
  id: string;
  title: string;
  description: string;
  status: "Activa" | "Draft" | "Pausada";
  metric: string;
  icon: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
};

const stages: LeadStage[] = [
  {
    id: "new",
    title: "Nuevos leads",
    value: "$42k",
    tone: "from-cyan-400/20 to-blue-500/10",
    leads: [
      {
        id: "lead-1",
        name: "Mariana Torres",
        company: "Studio Growth",
        course: "Academia de ventas premium",
        score: 94,
        value: "$9,800",
        status: "Solicito temario",
        lastTouch: "Hace 12 min",
        intent: "Hot"
      },
      {
        id: "lead-2",
        name: "Carlos Medina",
        company: "Founder cohort",
        course: "Launch System",
        score: 82,
        value: "$6,400",
        status: "Vio checkout",
        lastTouch: "Hace 24 min",
        intent: "Warm"
      }
    ]
  },
  {
    id: "qualified",
    title: "Calificados por IA",
    value: "$67k",
    tone: "from-teal-400/20 to-emerald-500/10",
    leads: [
      {
        id: "lead-3",
        name: "Andrea Leon",
        company: "Ops Academy",
        course: "AI CRM Intensive",
        score: 91,
        value: "$14,200",
        status: "Alta intencion",
        lastTouch: "Hace 38 min",
        intent: "Hot"
      },
      {
        id: "lead-4",
        name: "Ricardo Salas",
        company: "Revenue Lab",
        course: "Funnels LATAM",
        score: 76,
        value: "$7,100",
        status: "Respondio mensaje",
        lastTouch: "Hace 1 h",
        intent: "Warm"
      }
    ]
  },
  {
    id: "followup",
    title: "Seguimiento",
    value: "$31k",
    tone: "from-violet-400/20 to-fuchsia-500/10",
    leads: [
      {
        id: "lead-5",
        name: "Sofia Ruiz",
        company: "Creator OS",
        course: "Kajabi-style Academy",
        score: 68,
        value: "$5,900",
        status: "Necesita recordatorio",
        lastTouch: "Ayer",
        intent: "Nurture"
      }
    ]
  }
];

const automations: Automation[] = [
  {
    id: "auto-1",
    title: "Rescate de checkout",
    description: "Detecta abandono, resume objeciones y agenda follow-up manual.",
    status: "Activa",
    metric: "18 leads en cola",
    icon: Zap
  },
  {
    id: "auto-2",
    title: "Aprobacion de pago",
    description: "Prepara respuesta post-comprobante y senala pagos con alta confianza.",
    status: "Activa",
    metric: "92% claridad",
    icon: CheckCircle2
  },
  {
    id: "auto-3",
    title: "Nurture de alumnos",
    description: "Sugiere recordatorios cuando baja el progreso de lecciones.",
    status: "Draft",
    metric: "Lista para configurar",
    icon: WandSparkles
  }
];

const activities = [
  {
    id: "act-1",
    title: "AI insight",
    body: "Mariana repitio la vista de pricing 3 veces. Recomendada oferta consultiva con cupo limitado.",
    time: "12 min",
    icon: BrainCircuit
  },
  {
    id: "act-2",
    title: "Conversacion",
    body: "Carlos pregunto por transferencias y acceso inmediato. Responder con flujo manual y tiempos de revision.",
    time: "24 min",
    icon: MessageSquareText
  },
  {
    id: "act-3",
    title: "Reminder",
    body: "Sofia lleva 48h sin responder. Siguiente accion sugerida: prueba social + modulo de resultados.",
    time: "Hoy",
    icon: CalendarClock
  }
];

const notifications = [
  "3 leads calientes esperando respuesta",
  "2 comprobantes pueden convertirse hoy",
  "1 automatizacion lista para publicar"
];

export default async function AdminCrmPage() {
  await requireAdmin();
  const highlightedLead = stages[0].leads[0];
  const leadCount = stages.reduce((total, stage) => total + stage.leads.length, 0);
  const weightedPipeline = stages.reduce((total, stage) => total + Number(stage.value.replace(/[^0-9]/g, "")), 0);

  return (
    <section className="space-y-8">
      <PageHeader
        eyebrow="AI CRM"
        title="Automations command center"
        description="Pipeline visual, senales de IA y automatizaciones comerciales para operar leads sin agregar complejidad al backend actual."
        actions={
          <>
            <button type="button" className="inline-flex min-h-10 items-center gap-2 rounded-md border border-line-subtle bg-surface-base px-4 py-2 text-sm font-semibold text-ink-secondary shadow-soft">
              <Bell aria-hidden className="h-4 w-4" />
              Notificaciones
            </button>
            <button type="button" className="inline-flex min-h-10 items-center gap-2 rounded-md bg-ink-primary px-4 py-2 text-sm font-semibold text-surface-base shadow-soft">
              <Plus aria-hidden className="h-4 w-4" />
              Nueva automatizacion
            </button>
          </>
        }
      />

      <section className="overflow-hidden rounded-lg border border-white/10 bg-slate-950 text-white shadow-float">
        <div className="grid gap-px bg-white/10 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="bg-[radial-gradient(circle_at_20%_12%,rgba(20,184,166,0.24),transparent_30%),radial-gradient(circle_at_88%_22%,rgba(99,102,241,0.24),transparent_28%),linear-gradient(145deg,#020617,#0f172a)] p-5 sm:p-6">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="inline-flex items-center gap-2 rounded-md border border-white/10 bg-white/[0.06] px-3 py-1.5 text-xs font-semibold text-brand-accent">
                  <Sparkles aria-hidden className="h-4 w-4" />
                  AI-first sales workspace
                </p>
                <h2 className="mt-5 max-w-2xl text-3xl font-semibold leading-tight sm:text-4xl">
                  Convierte conversaciones, pagos y senales de aprendizaje en acciones.
                </h2>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">
                  Una capa premium para imaginar el CRM nativo del SaaS: scoring, contexto, reminders y automatizaciones listas para activar.
                </p>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/[0.06] p-4 text-sm text-slate-300">
                <p className="text-xs font-semibold uppercase tracking-normal text-slate-500">Pipeline mock</p>
                <p className="mt-2 text-3xl font-semibold text-white">${weightedPipeline}k</p>
                <p className="mt-1">Valor ponderado en oportunidades</p>
              </div>
            </div>

            <div className="mt-8 grid gap-3 md:grid-cols-3">
              <DarkMetric icon={UsersRound} label="Leads activos" value={leadCount.toString()} detail="+12% esta semana" />
              <DarkMetric icon={Target} label="Intent score" value="86%" detail="Promedio AI" />
              <DarkMetric icon={Play} label="Automations" value="3" detail="2 activas" />
            </div>
          </div>

          <aside className="bg-slate-950 p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-normal text-brand-accent">Notifications center</p>
                <h3 className="mt-1 text-lg font-semibold">Senales criticas</h3>
              </div>
              <span className="rounded-md bg-white/[0.08] px-2.5 py-1 text-xs font-semibold text-slate-300">Live</span>
            </div>
            <div className="mt-5 space-y-3">
              {notifications.map((notification) => (
                <div key={notification} className="flex items-start gap-3 rounded-md border border-white/10 bg-white/[0.04] p-3">
                  <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-brand-accent" />
                  <p className="text-sm leading-6 text-slate-300">{notification}</p>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.55fr_0.9fr]">
        <div className="space-y-6">
          <section className="rounded-lg border border-line-subtle bg-surface-base p-4 shadow-soft sm:p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-normal text-brand-primary">Leads pipeline</p>
                <h2 className="mt-1 text-lg font-semibold text-ink-primary">Oportunidades priorizadas por IA</h2>
              </div>
              <button type="button" className="inline-flex w-fit min-h-9 items-center gap-2 rounded-md border border-line-subtle bg-surface-raised px-3 py-2 text-sm font-semibold text-ink-secondary">
                Ver filtros
                <ArrowRight aria-hidden className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-3">
              {stages.map((stage) => (
                <PipelineColumn key={stage.id} stage={stage} />
              ))}
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <AutomationOverview />
            <ActivityFeed />
          </section>
        </div>

        <aside className="space-y-6">
          <LeadDetail lead={highlightedLead} />
          <RemindersPanel />
          <AiInsightsPanel />
        </aside>
      </section>
    </section>
  );
}

function PipelineColumn({ stage }: { stage: LeadStage }) {
  return (
    <div className="rounded-lg border border-line-subtle bg-surface-muted p-3">
      <div className={`rounded-md bg-gradient-to-br ${stage.tone} border border-white/70 p-3`}>
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-semibold text-ink-primary">{stage.title}</h3>
          <span className="rounded-md bg-surface-base/80 px-2 py-1 text-xs font-semibold text-ink-secondary">{stage.value}</span>
        </div>
        <p className="mt-1 text-xs text-ink-muted">{stage.leads.length} oportunidades</p>
      </div>
      <div className="mt-3 space-y-3">
        {stage.leads.map((lead) => (
          <LeadCard key={lead.id} lead={lead} />
        ))}
      </div>
    </div>
  );
}

function LeadCard({ lead }: { lead: Lead }) {
  return (
    <article className="rounded-md border border-line-subtle bg-surface-base p-3 shadow-soft transition hover:border-brand-primary/40">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h4 className="truncate text-sm font-semibold text-ink-primary">{lead.name}</h4>
          <p className="truncate text-xs text-ink-muted">{lead.company}</p>
        </div>
        <span className={`rounded-md px-2 py-1 text-[0.68rem] font-semibold ${lead.intent === "Hot" ? "bg-rose-50 text-rose-700" : lead.intent === "Warm" ? "bg-amber-50 text-amber-700" : "bg-surface-muted text-ink-muted"}`}>
          {lead.intent}
        </span>
      </div>
      <p className="mt-3 line-clamp-2 text-sm leading-5 text-ink-secondary">{lead.status}</p>
      <div className="mt-4 flex items-center justify-between gap-3 text-xs">
        <span className="font-semibold text-brand-primary">Score {lead.score}</span>
        <span className="text-ink-muted">{lead.lastTouch}</span>
      </div>
    </article>
  );
}

function AutomationOverview() {
  return (
    <section className="rounded-lg border border-line-subtle bg-surface-base p-5 shadow-soft">
      <div>
        <p className="text-xs font-semibold uppercase tracking-normal text-brand-primary">Automations overview</p>
        <h2 className="mt-1 text-lg font-semibold text-ink-primary">Flujos inteligentes</h2>
      </div>
      <div className="mt-5 space-y-3">
        {automations.map((automation) => {
          const Icon = automation.icon;
          return (
            <article key={automation.id} className="rounded-md border border-line-subtle bg-surface-raised p-4">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-brand-primary/10 text-brand-primary">
                  <Icon aria-hidden className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-sm font-semibold text-ink-primary">{automation.title}</h3>
                    <span className="rounded-md bg-surface-muted px-2 py-1 text-xs font-semibold text-ink-muted">{automation.status}</span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-ink-secondary">{automation.description}</p>
                  <p className="mt-3 text-xs font-semibold text-brand-primary">{automation.metric}</p>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function ActivityFeed() {
  return (
    <section className="rounded-lg border border-line-subtle bg-surface-base p-5 shadow-soft">
      <div>
        <p className="text-xs font-semibold uppercase tracking-normal text-brand-primary">AI activity feed</p>
        <h2 className="mt-1 text-lg font-semibold text-ink-primary">Contexto en tiempo real</h2>
      </div>
      <ol className="mt-5 space-y-4">
        {activities.map((activity) => {
          const Icon = activity.icon;
          return (
            <li key={activity.id} className="flex gap-3">
              <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-surface-muted text-brand-primary">
                <Icon aria-hidden className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1 rounded-md border border-line-subtle bg-surface-raised p-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-ink-primary">{activity.title}</p>
                  <span className="text-xs text-ink-muted">{activity.time}</span>
                </div>
                <p className="mt-2 text-sm leading-6 text-ink-secondary">{activity.body}</p>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

function LeadDetail({ lead }: { lead: Lead }) {
  return (
    <section className="rounded-lg border border-line-subtle bg-surface-base p-5 shadow-float xl:sticky xl:top-24">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-normal text-brand-primary">Lead detail drawer</p>
          <h2 className="mt-1 text-lg font-semibold text-ink-primary">{lead.name}</h2>
          <p className="text-sm text-ink-muted">{lead.company}</p>
        </div>
        <span className="rounded-md bg-brand-primary/10 px-2.5 py-1 text-xs font-semibold text-brand-primary">Score {lead.score}</span>
      </div>

      <div className="mt-5 rounded-lg border border-line-subtle bg-surface-muted p-4">
        <p className="text-sm font-semibold text-ink-primary">{lead.course}</p>
        <p className="mt-2 text-sm leading-6 text-ink-secondary">
          La IA detecta urgencia alta: reviso pricing, checkout y contenido de pago manual en la misma sesion.
        </p>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
        <ContactAction icon={Mail} label="Email" />
        <ContactAction icon={MessageSquareText} label="WhatsApp" />
        <ContactAction icon={Phone} label="Llamada" />
      </div>

      <div className="mt-5 rounded-lg border border-line-subtle bg-surface-base p-4">
        <p className="text-sm font-semibold text-ink-primary">Conversation preview</p>
        <div className="mt-3 space-y-3 text-sm leading-6">
          <p className="rounded-md bg-surface-muted p-3 text-ink-secondary">Quiero saber si el acceso queda activo despues de enviar mi comprobante.</p>
          <p className="rounded-md bg-ink-primary p-3 text-surface-base">AI draft: Claro, el equipo valida tu comprobante y activa el acceso manualmente.</p>
        </div>
      </div>
    </section>
  );
}

function RemindersPanel() {
  return (
    <section className="rounded-lg border border-line-subtle bg-surface-base p-5 shadow-soft">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-normal text-brand-primary">Reminders</p>
          <h2 className="mt-1 text-lg font-semibold text-ink-primary">Siguientes acciones</h2>
        </div>
        <CalendarClock aria-hidden className="h-5 w-5 text-brand-primary" />
      </div>
      <div className="mt-5 space-y-3">
        <ReminderItem title="Responder a Mariana" detail="Enviar comparativa de plan y link de checkout." />
        <ReminderItem title="Revisar pago de Carlos" detail="Comprobante pendiente de claridad visual." />
        <ReminderItem title="Nurture de Sofia" detail="Mandar caso de exito y modulo preview." />
      </div>
    </section>
  );
}

function AiInsightsPanel() {
  return (
    <section className="rounded-lg border border-line-subtle bg-surface-base p-5 shadow-soft">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-md bg-brand-accent/10 text-brand-accent">
          <Bot aria-hidden className="h-5 w-5" />
        </span>
        <div>
          <p className="text-xs font-semibold uppercase tracking-normal text-brand-primary">AI insights</p>
          <h2 className="text-lg font-semibold text-ink-primary">Recomendacion</h2>
        </div>
      </div>
      <p className="mt-4 text-sm leading-6 text-ink-secondary">
        Prioriza leads con pago manual visto y score mayor a 80. El mayor desbloqueo visual esta en responder dudas de confianza antes de enviar comprobante.
      </p>
      <div className="mt-5 rounded-md border border-dashed border-line-strong bg-surface-muted p-4 text-sm text-ink-secondary">
        Empty state premium listo para cuando no existan senales suficientes.
      </div>
    </section>
  );
}

function DarkMetric({
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

function ContactAction({
  icon: Icon,
  label
}: {
  icon: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  label: string;
}) {
  return (
    <button type="button" className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-line-subtle bg-surface-raised px-3 py-2 text-sm font-semibold text-ink-secondary shadow-soft">
      <Icon aria-hidden className="h-4 w-4" />
      {label}
    </button>
  );
}

function ReminderItem({ detail, title }: { detail: string; title: string }) {
  return (
    <div className="flex gap-3 rounded-md border border-line-subtle bg-surface-raised p-3">
      <CircleDot aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-brand-primary" />
      <div>
        <p className="text-sm font-semibold text-ink-primary">{title}</p>
        <p className="mt-1 text-sm leading-5 text-ink-secondary">{detail}</p>
      </div>
    </div>
  );
}
