import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  CheckCircle2,
  CreditCard,
  Layers3,
  LockKeyhole,
  PlayCircle,
  Sparkles,
  Users
} from "lucide-react";

import { LandingMobileMenu } from "@/components/landing/landing-mobile-menu";
import { PublicFooter } from "@/components/legal/public-footer";
import { getActiveBrandSettings } from "@/lib/engines/branding/service";
import { formatMxn } from "@/lib/engines/catalog/helpers";
import { listPublicProducts } from "@/lib/engines/catalog/service";
import type { Product } from "@/lib/engines/catalog/types";

const navLinks = [
  { href: "#plataforma", label: "Plataforma" },
  { href: "#experiencia", label: "Experiencia" },
  { href: "#cursos", label: "Cursos" },
  { href: "#prueba", label: "Resultados" }
];

const features = [
  {
    icon: BookOpen,
    title: "Cursos con estructura real",
    description: "Modulos, lecciones, recursos, portada y estado editorial en una experiencia limpia."
  },
  {
    icon: CreditCard,
    title: "Pagos manuales LATAM",
    description: "Transferencia, DIMO y comprobantes con revision operativa desde el admin."
  },
  {
    icon: LockKeyhole,
    title: "Acceso protegido",
    description: "Enrollments, RLS y player privado para alumnos con permisos activos."
  }
];

const testimonials = [
  {
    quote: "La plataforma se siente como producto, no como plantilla. Eso cambia la venta desde el primer click.",
    author: "Founder, Academia digital"
  },
  {
    quote: "El flujo manual de pagos nos deja operar Mexico y Latam sin esperar una integracion compleja.",
    author: "Ops Lead, Programa cohort-based"
  },
  {
    quote: "El alumno entra y sabe exactamente donde continuar. Menos soporte, mas consumo de contenido.",
    author: "Course Designer"
  }
];

function statLabel(count: number, fallback: string) {
  return count > 0 ? count.toString() : fallback;
}

export default async function HomePage() {
  const [brand, products] = await Promise.all([getActiveBrandSettings(), listPublicProducts()]);
  const showcaseProducts = products.slice(0, 3);
  const publishedCount = products.length;

  return (
    <main className="min-h-screen overflow-hidden bg-slate-950 text-white">
      <section className="relative min-h-screen">
        <div aria-hidden className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_12%,rgba(20,184,166,0.28),transparent_28%),radial-gradient(circle_at_82%_18%,rgba(59,130,246,0.24),transparent_30%),linear-gradient(145deg,#020617_0%,#08111f_48%,#020617_100%)]" />
          <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-slate-950 to-transparent" />
          <div className="absolute left-1/2 top-24 h-[32rem] w-[32rem] -translate-x-1/2 rounded-full border border-white/10 bg-white/[0.03] blur-3xl" />
        </div>

        <header className="relative z-20 px-4 pt-4 sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-7xl items-center justify-between rounded-lg border border-white/10 bg-white/[0.06] px-4 py-3 shadow-float backdrop-blur-xl">
            <Link href="/" className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-md bg-white text-sm font-semibold text-slate-950">
                {brand.brandName.slice(0, 1).toUpperCase()}
              </span>
              <span className="text-sm font-semibold text-white">{brand.brandName}</span>
            </Link>
            <nav aria-label="Navegacion principal" className="hidden items-center gap-6 text-sm font-medium text-slate-300 md:flex">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href} className="transition hover:text-white">
                  {link.label}
                </Link>
              ))}
            </nav>
            <div className="hidden items-center gap-2 md:flex">
              <Link href="/login" className="rounded-md px-3 py-2 text-sm font-semibold text-slate-300 transition hover:text-white">
                Entrar
              </Link>
              <Link href="/cursos" className="inline-flex min-h-10 items-center gap-2 rounded-md bg-white px-4 py-2 text-sm font-semibold text-slate-950">
                Ver cursos
                <ArrowRight aria-hidden className="h-4 w-4" />
              </Link>
            </div>
            <LandingMobileMenu links={navLinks} />
          </div>
        </header>

        <div className="relative z-10 mx-auto grid max-w-7xl gap-12 px-4 pb-20 pt-16 sm:px-6 lg:grid-cols-[0.92fr_1.08fr] lg:items-center lg:px-8 lg:pb-28 lg:pt-24">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-xs font-semibold text-slate-200 shadow-soft backdrop-blur">
              <Sparkles aria-hidden className="h-3.5 w-3.5 text-brand-accent" />
              Academy commerce stack for modern creators
            </div>
            <h1 className="mt-7 max-w-4xl text-5xl font-semibold leading-[0.98] tracking-normal text-white sm:text-6xl lg:text-7xl">
              Cursos digitales con presencia de SaaS premium.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
              Lanza una academia con storefront, pagos manuales LATAM, player privado y dashboards que se sienten como producto de alto valor desde el primer scroll.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/cursos" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-white px-5 py-3 text-sm font-semibold text-slate-950 shadow-float">
                Explorar cursos
                <ArrowRight aria-hidden className="h-4 w-4" />
              </Link>
              <Link href="/login" className="inline-flex min-h-12 items-center justify-center rounded-md border border-white/12 bg-white/[0.06] px-5 py-3 text-sm font-semibold text-white backdrop-blur">
                Entrar al dashboard
              </Link>
            </div>
          </div>

          <HeroProductVisual productCount={publishedCount} />
        </div>
      </section>

      <section id="plataforma" className="relative border-y border-white/10 bg-slate-950 px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-3">
          <StatCard value={statLabel(publishedCount, "Live")} label="Cursos publicados" detail="Catalogo conectado a Supabase" />
          <StatCard value="RLS" label="Acceso seguro" detail="Auth, enrollments y storage privado" />
          <StatCard value="MX/LATAM" label="Pagos manuales" detail="Transferencias, DIMO y comprobantes" />
        </div>
      </section>

      <section id="experiencia" className="bg-surface-canvas px-4 py-24 text-ink-primary sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-normal text-brand-primary">Product Design First</p>
            <h2 className="mt-3 text-3xl font-semibold leading-tight sm:text-5xl">
              Una academia que vende antes de explicar.
            </h2>
            <p className="mt-4 text-base leading-8 text-ink-secondary">
              La experiencia publica, el admin y el player trabajan juntos para reducir friccion: descubrir, pagar, acceder y continuar.
            </p>
          </div>

          <div className="mt-12 grid gap-4 lg:grid-cols-3">
            {features.map((feature) => (
              <article key={feature.title} className="rounded-lg border border-line-subtle bg-surface-base p-6 shadow-soft">
                <span className="flex h-11 w-11 items-center justify-center rounded-md bg-brand-primary/10 text-brand-primary">
                  <feature.icon aria-hidden className="h-5 w-5" />
                </span>
                <h3 className="mt-6 text-lg font-semibold text-ink-primary">{feature.title}</h3>
                <p className="mt-3 text-sm leading-7 text-ink-secondary">{feature.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-24 text-ink-primary sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-normal text-brand-primary">Storytelling operativo</p>
            <h2 className="mt-3 text-3xl font-semibold leading-tight sm:text-5xl">
              Del primer pago al primer play, sin perder control.
            </h2>
            <p className="mt-4 text-base leading-8 text-ink-secondary">
              Diseñado para equipos que venden conocimiento en Mexico y Latam: pagos comprobables, accesos inmediatos y aprendizaje guiado.
            </p>
          </div>
          <div className="grid gap-3">
            <ProcessStep icon={CreditCard} title="Pago manual" description="El alumno ve instrucciones claras y sube comprobante." />
            <ProcessStep icon={CheckCircle2} title="Aprobacion admin" description="El equipo valida y activa enrollment desde el dashboard." />
            <ProcessStep icon={PlayCircle} title="Player privado" description="El alumno entra a su curso y continua justo donde lo dejo." />
          </div>
        </div>
      </section>

      <section id="cursos" className="bg-slate-950 px-4 py-24 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-normal text-brand-accent">Course showcase</p>
              <h2 className="mt-3 text-3xl font-semibold leading-tight sm:text-5xl">Programas listos para comprar.</h2>
            </div>
            <Link href="/cursos" className="inline-flex min-h-11 w-fit items-center gap-2 rounded-md bg-white px-4 py-2 text-sm font-semibold text-slate-950">
              Ver catalogo
              <ArrowRight aria-hidden className="h-4 w-4" />
            </Link>
          </div>

          {showcaseProducts.length > 0 ? (
            <div className="mt-12 grid gap-4 lg:grid-cols-3">
              {showcaseProducts.map((product) => (
                <CourseShowcaseCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="mt-12 rounded-lg border border-dashed border-white/16 bg-white/[0.04] p-8 text-sm text-slate-300">
              El catalogo publico aparecera aqui cuando existan cursos publicados.
            </div>
          )}
        </div>
      </section>

      <section id="prueba" className="bg-surface-canvas px-4 py-24 text-ink-primary sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-normal text-brand-primary">Social proof</p>
            <h2 className="mt-3 text-3xl font-semibold leading-tight sm:text-5xl">
              Hecho para que tu oferta se sienta inevitable.
            </h2>
          </div>
          <div className="mt-12 grid gap-4 lg:grid-cols-3">
            {testimonials.map((testimonial) => (
              <article key={testimonial.author} className="rounded-lg border border-line-subtle bg-surface-base p-6 shadow-soft">
                <p className="text-base leading-8 text-ink-secondary">&quot;{testimonial.quote}&quot;</p>
                <p className="mt-6 text-sm font-semibold text-ink-primary">{testimonial.author}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-20 text-ink-primary sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl rounded-lg border border-line-subtle bg-slate-950 p-8 text-center text-white shadow-float sm:p-12">
          <p className="text-xs font-semibold uppercase tracking-normal text-brand-accent">Launch-ready</p>
          <h2 className="mt-3 text-3xl font-semibold leading-tight sm:text-5xl">
            Convierte tu conocimiento en una experiencia premium.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-300">
            Storefront, acceso, player y dashboards conectados en una base SaaS lista para crecer.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/cursos" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-white px-5 py-2 text-sm font-semibold text-slate-950">
              Ver cursos
              <ArrowRight aria-hidden className="h-4 w-4" />
            </Link>
            <Link href="/login" className="inline-flex min-h-11 items-center justify-center rounded-md border border-white/12 px-5 py-2 text-sm font-semibold text-white">
              Entrar
            </Link>
          </div>
        </div>
      </section>

      <PublicFooter brand={brand} navigationLinks={navLinks} />
    </main>
  );
}

function HeroProductVisual({ productCount }: { productCount: number }) {
  return (
    <div className="relative">
      <div className="absolute -inset-6 rounded-[2rem] bg-brand-accent/20 blur-3xl" aria-hidden />
      <div className="relative overflow-hidden rounded-lg border border-white/12 bg-white/[0.08] p-3 shadow-float backdrop-blur-xl">
        <div className="rounded-md border border-white/10 bg-slate-950/80 p-4">
          <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <p className="text-xs text-slate-400">Academy cockpit</p>
              <h2 className="mt-1 text-lg font-semibold text-white">Launch board</h2>
            </div>
            <span className="rounded-md bg-emerald-400/10 px-2.5 py-1 text-xs font-semibold text-emerald-300">Live</span>
          </div>
          <div className="grid gap-3 py-4 sm:grid-cols-3">
            <MiniMetric icon={BookOpen} value={statLabel(productCount, "Ready")} label="Cursos" />
            <MiniMetric icon={Users} value="1.2k" label="Alumnos" />
            <MiniMetric icon={BarChart3} value="84%" label="Progreso" />
          </div>
          <div className="grid gap-3 lg:grid-cols-[1fr_0.72fr]">
            <div className="rounded-md border border-white/10 bg-white/[0.04] p-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-md bg-brand-primary text-white">
                  <PlayCircle aria-hidden className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-white">Student player</p>
                  <p className="text-xs text-slate-400">Ultima leccion sincronizada</p>
                </div>
              </div>
              <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10">
                <div className="h-full w-2/3 rounded-full bg-brand-accent" />
              </div>
              <div className="mt-5 grid gap-2">
                {["Modulo 01 - Oferta premium", "Modulo 02 - Payment flow", "Modulo 03 - Launch assets"].map((item, index) => (
                  <div key={item} className="flex items-center justify-between rounded-md bg-white/[0.04] px-3 py-2 text-sm">
                    <span className="text-slate-200">{item}</span>
                    <span className={index === 0 ? "text-emerald-300" : "text-slate-500"}>{index === 0 ? "Done" : "Next"}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-md border border-white/10 bg-white/[0.04] p-4">
              <p className="text-sm font-semibold text-white">Manual payments</p>
              <div className="mt-4 space-y-3">
                <PaymentChip label="Transfer" status="Approved" />
                <PaymentChip label="DIMO" status="Review" />
                <PaymentChip label="Enrollment" status="Active" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MiniMetric({ icon: Icon, value, label }: { icon: typeof BookOpen; value: string; label: string }) {
  return (
    <div className="rounded-md border border-white/10 bg-white/[0.04] p-3">
      <Icon aria-hidden className="h-4 w-4 text-brand-accent" />
      <p className="mt-3 text-xl font-semibold text-white">{value}</p>
      <p className="text-xs text-slate-400">{label}</p>
    </div>
  );
}

function PaymentChip({ label, status }: { label: string; status: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-md bg-white/[0.04] px-3 py-2 text-sm">
      <span className="text-slate-300">{label}</span>
      <span className="text-brand-accent">{status}</span>
    </div>
  );
}

function StatCard({ value, label, detail }: { value: string; label: string; detail: string }) {
  return (
    <article className="rounded-lg border border-white/10 bg-white/[0.04] p-5 shadow-soft">
      <p className="text-3xl font-semibold text-white">{value}</p>
      <h2 className="mt-3 text-sm font-semibold text-slate-200">{label}</h2>
      <p className="mt-1 text-sm text-slate-400">{detail}</p>
    </article>
  );
}

function ProcessStep({ icon: Icon, title, description }: { icon: typeof BookOpen; title: string; description: string }) {
  return (
    <article className="flex gap-4 rounded-lg border border-line-subtle bg-surface-base p-5 shadow-soft">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-brand-primary/10 text-brand-primary">
        <Icon aria-hidden className="h-5 w-5" />
      </span>
      <div>
        <h3 className="font-semibold text-ink-primary">{title}</h3>
        <p className="mt-2 text-sm leading-7 text-ink-secondary">{description}</p>
      </div>
    </article>
  );
}

function CourseShowcaseCard({ product }: { product: Product }) {
  return (
    <article className="overflow-hidden rounded-lg border border-white/12 bg-white/[0.05] shadow-soft">
      <div className="relative aspect-[16/10] bg-white/[0.04]">
        {product.coverImageUrl ? (
          <Image src={product.coverImageUrl} alt="" fill sizes="(min-width: 1024px) 30vw, 100vw" className="object-cover" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-[radial-gradient(circle_at_30%_20%,rgba(20,184,166,0.28),transparent_32%),linear-gradient(135deg,rgba(255,255,255,0.12),rgba(255,255,255,0.03))]">
            <Layers3 aria-hidden className="h-12 w-12 text-white/45" />
          </div>
        )}
      </div>
      <div className="p-5">
        <p className="text-xs font-semibold uppercase tracking-normal text-brand-accent">{product.type}</p>
        <h3 className="mt-2 text-lg font-semibold text-white">{product.title}</h3>
        {product.subtitle ? <p className="mt-2 text-sm leading-6 text-slate-300">{product.subtitle}</p> : null}
        <div className="mt-5 flex items-center justify-between gap-3">
          <span className="text-sm font-semibold text-white">{formatMxn(product.priceMxnCents)}</span>
          <Link href={`/productos/${product.slug}`} className="inline-flex min-h-9 items-center gap-1 rounded-md bg-white px-3 py-2 text-sm font-semibold text-slate-950">
            Ver
            <ArrowRight aria-hidden className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </article>
  );
}
