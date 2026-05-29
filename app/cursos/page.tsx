import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Clapperboard,
  Compass,
  CreditCard,
  Flame,
  PlayCircle,
  Search,
  ShieldCheck,
  Sparkles,
  Users
} from "lucide-react";

import { CourseCard } from "@/components/catalog/course-card";
import { LandingMobileMenu } from "@/components/landing/landing-mobile-menu";
import { getActiveBrandSettings } from "@/lib/engines/branding/service";
import { listPublicStorefrontCourses, type PublicCourseSummary } from "@/lib/courses/storefront";

export const dynamic = "force-dynamic";

const navLinks = [
  { href: "/", label: "Inicio" },
  { href: "#destacados", label: "Destacados" },
  { href: "#catalogo", label: "Catalogo" },
  { href: "#experiencia", label: "Experiencia" }
];

const categories = [
  { label: "Launch", icon: Flame, description: "Oferta, ventas y go-to-market" },
  { label: "Contenido", icon: Clapperboard, description: "Lecciones, recursos y player" },
  { label: "Operaciones", icon: CreditCard, description: "Pagos, enrollments y acceso" },
  { label: "Growth", icon: Sparkles, description: "Percepcion premium y retencion" }
];

const fallbackCourses = [
  {
    title: "Launch System",
    category: "Launch",
    description: "Crea una oferta premium, prepara tu storefront y activa pagos manuales.",
    meta: "8 modulos"
  },
  {
    title: "Content Studio",
    category: "Contenido",
    description: "Diseña lecciones, recursos y una experiencia tipo app para alumnos.",
    meta: "12 lecciones"
  },
  {
    title: "Ops Academy",
    category: "Operaciones",
    description: "Gestiona comprobantes, enrollments y acceso con seguridad.",
    meta: "LATAM ready"
  }
];

async function listPublicStorefrontCoursesSafely(): Promise<{
  courses: PublicCourseSummary[];
  hasCatalogError: boolean;
}> {
  try {
    return {
      courses: await listPublicStorefrontCourses(),
      hasCatalogError: false
    };
  } catch (error) {
    console.error("Unable to load public storefront courses.", error);
    return {
      courses: [],
      hasCatalogError: true
    };
  }
}

export default async function PublicCoursesPage() {
  const [brand, catalog] = await Promise.all([getActiveBrandSettings(), listPublicStorefrontCoursesSafely()]);
  const { courses, hasCatalogError } = catalog;
  const totalLessons = courses.reduce((total, course) => total + course.lessonCount, 0);
  const featuredCourse = courses[0] ?? null;
  const secondaryCourses = courses.slice(featuredCourse ? 1 : 0);

  return (
    <main className="min-h-screen overflow-hidden bg-slate-950 text-white">
      <section className="relative">
        <div aria-hidden className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_10%,rgba(20,184,166,0.26),transparent_28%),radial-gradient(circle_at_82%_18%,rgba(59,130,246,0.20),transparent_30%),linear-gradient(145deg,#020617_0%,#08111f_52%,#020617_100%)]" />
          <div className="absolute inset-x-0 bottom-0 h-52 bg-gradient-to-t from-slate-950 to-transparent" />
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
              <Link href="/mis-productos" className="rounded-md px-3 py-2 text-sm font-semibold text-slate-300 transition hover:text-white">
                Mis cursos
              </Link>
              <Link href="/login" className="inline-flex min-h-10 items-center rounded-md bg-white px-4 py-2 text-sm font-semibold text-slate-950">
                Entrar
              </Link>
            </div>
            <LandingMobileMenu links={navLinks} />
          </div>
        </header>

        <div className="relative z-10 mx-auto max-w-7xl px-4 pb-16 pt-16 sm:px-6 lg:px-8 lg:pb-24 lg:pt-24">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-xs font-semibold text-slate-200 shadow-soft backdrop-blur">
              <Compass aria-hidden className="h-3.5 w-3.5 text-brand-accent" />
              Curated academy storefront
            </div>
            <h1 className="mt-7 text-5xl font-semibold leading-[0.98] tracking-normal text-white sm:text-6xl lg:text-7xl">
              Explora programas que se sienten como producto premium.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
              Cursos publicados por {brand.brandName}, curados para comprar, acceder y continuar aprendiendo sin friccion.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="#catalogo" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-white px-5 py-3 text-sm font-semibold text-slate-950 shadow-float">
                Ver catalogo
                <ArrowRight aria-hidden className="h-4 w-4" />
              </Link>
              <Link href="/mis-productos" className="inline-flex min-h-12 items-center justify-center rounded-md border border-white/12 bg-white/[0.06] px-5 py-3 text-sm font-semibold text-white backdrop-blur">
                Continuar aprendiendo
              </Link>
            </div>
          </div>

          <div className="mt-12 grid gap-4 md:grid-cols-3">
            <HeroStat value={courses.length > 0 ? courses.length.toString() : "Curated"} label="Programas" detail={hasCatalogError ? "Fallback activo" : "Catalogo real"} />
            <HeroStat value={totalLessons > 0 ? totalLessons.toString() : "On-demand"} label="Lecciones" detail="Contenido estructurado" />
            <HeroStat value="MX/LATAM" label="Pagos" detail="Transferencia, DIMO y acceso" />
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-slate-950 px-4 py-5 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl gap-3 overflow-x-auto pb-1">
          {categories.map((category) => (
            <div key={category.label} className="flex min-w-64 items-center gap-3 rounded-lg border border-white/10 bg-white/[0.05] p-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-white/[0.08] text-brand-accent">
                <category.icon aria-hidden className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-semibold text-white">{category.label}</p>
                <p className="mt-1 text-xs text-slate-400">{category.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="destacados" className="bg-slate-950 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            eyebrow="Featured"
            title="El programa que abre la temporada."
            description="Una vista editorial para destacar el curso mas reciente sin perder acceso al catalogo completo."
          />
          <div className="mt-10">
            {featuredCourse ? <CourseCard course={featuredCourse} featured /> : <FeaturedFallback hasCatalogError={hasCatalogError} />}
          </div>
        </div>
      </section>

      <section id="catalogo" className="bg-surface-canvas px-4 py-20 text-ink-primary sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <SectionHeading
              eyebrow="Catalogo"
              title="Continua explorando."
              description="Programas visibles en landing, listos para descubrir desde una experiencia aspiracional."
              dark={false}
            />
            <div className="flex min-h-11 w-full items-center gap-2 rounded-md border border-line-subtle bg-surface-base px-3 text-sm text-ink-muted shadow-soft sm:w-72">
              <Search aria-hidden className="h-4 w-4" />
              <span>Buscar proximamente</span>
            </div>
          </div>

          {courses.length === 0 ? (
            <StorefrontEmptyState hasCatalogError={hasCatalogError} />
          ) : (
            <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {secondaryCourses.length > 0 ? secondaryCourses.map((course) => <CourseCard key={course.id} course={course} />) : courses.map((course) => <CourseCard key={course.id} course={course} />)}
            </div>
          )}
        </div>
      </section>

      <section id="experiencia" className="bg-white px-4 py-20 text-ink-primary sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            eyebrow="Experience"
            title="De explorar a aprender, sin perder momentum."
            description="El storefront conecta compra, acceso y player en una experiencia pensada para alumnos que quieren avanzar."
            dark={false}
          />
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            <ExperienceCard icon={ShieldCheck} title="Acceso validado" description="Enrollments y RLS mantienen el contenido protegido para alumnos activos." />
            <ExperienceCard icon={PlayCircle} title="Player inmersivo" description="Modulos, lecciones, recursos y progreso visual para continuar sin friccion." />
            <ExperienceCard icon={Users} title="Operable por equipos" description="Pagos manuales, comprobantes y alumnos conectados al dashboard premium." />
          </div>
        </div>
      </section>

      <section className="bg-slate-950 px-4 py-16 text-white sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-6 rounded-lg border border-white/10 bg-white/[0.06] p-6 shadow-float backdrop-blur sm:p-8 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-normal text-brand-accent">Ready to learn</p>
            <h2 className="mt-3 text-3xl font-semibold leading-tight">Encuentra tu siguiente programa.</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
              Explora cursos, revisa previews y entra al dashboard de alumno cuando tu acceso este activo.
            </p>
          </div>
          <Link href="/mis-productos" className="inline-flex min-h-11 w-fit items-center gap-2 rounded-md bg-white px-5 py-2 text-sm font-semibold text-slate-950">
            Ir a mis cursos
            <ArrowRight aria-hidden className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}

function HeroStat({ value, label, detail }: { value: string; label: string; detail: string }) {
  return (
    <article className="rounded-lg border border-white/10 bg-white/[0.06] p-5 shadow-soft backdrop-blur">
      <p className="text-3xl font-semibold text-white">{value}</p>
      <h2 className="mt-3 text-sm font-semibold text-slate-200">{label}</h2>
      <p className="mt-1 text-sm text-slate-400">{detail}</p>
    </article>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
  dark = true
}: {
  eyebrow: string;
  title: string;
  description: string;
  dark?: boolean;
}) {
  return (
    <div className="max-w-3xl">
      <p className={`text-xs font-semibold uppercase tracking-normal ${dark ? "text-brand-accent" : "text-brand-primary"}`}>{eyebrow}</p>
      <h2 className={`mt-3 text-3xl font-semibold leading-tight sm:text-5xl ${dark ? "text-white" : "text-ink-primary"}`}>{title}</h2>
      <p className={`mt-4 text-base leading-8 ${dark ? "text-slate-300" : "text-ink-secondary"}`}>{description}</p>
    </div>
  );
}

function FeaturedFallback({ hasCatalogError }: { hasCatalogError: boolean }) {
  return (
    <article className="overflow-hidden rounded-lg border border-white/12 bg-white/[0.06] shadow-soft lg:grid lg:grid-cols-[1.12fr_0.88fr]">
      <div className="relative min-h-80 bg-[radial-gradient(circle_at_28%_20%,rgba(20,184,166,0.34),transparent_30%),radial-gradient(circle_at_78%_18%,rgba(59,130,246,0.22),transparent_34%),linear-gradient(135deg,rgba(255,255,255,0.14),rgba(255,255,255,0.03))]">
        <div className="absolute inset-x-6 bottom-6 rounded-lg border border-white/10 bg-slate-950/65 p-4 backdrop-blur">
          <div className="h-2 w-2/3 rounded-full bg-white/35" />
          <div className="mt-4 h-2 rounded-full bg-white/10">
            <div className="h-full w-3/4 rounded-full bg-brand-accent" />
          </div>
        </div>
      </div>
      <div className="flex flex-col justify-between p-6 sm:p-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-normal text-brand-accent">
            {hasCatalogError ? "Fallback resiliente" : "Preview editorial"}
          </p>
          <h2 className="mt-3 text-3xl font-semibold leading-tight text-white sm:text-4xl">Premium Academy Operating System</h2>
          <p className="mt-4 text-base leading-8 text-slate-300">
            {hasCatalogError
              ? "El storefront sigue disponible aunque el catalogo no responda. Cuando Supabase entregue cursos, esta seccion se actualiza automaticamente."
              : "Publica cursos para reemplazar este preview con programas reales destacados."}
          </p>
        </div>
        <div className="mt-8 flex flex-wrap gap-2 text-xs text-slate-300">
          <span className="rounded-md bg-white/[0.06] px-2 py-1">Netflix-style</span>
          <span className="rounded-md bg-white/[0.06] px-2 py-1">Kajabi-ready</span>
          <span className="rounded-md bg-white/[0.06] px-2 py-1">LATAM payments</span>
        </div>
      </div>
    </article>
  );
}

function StorefrontEmptyState({ hasCatalogError }: { hasCatalogError: boolean }) {
  return (
    <div className="mt-10 space-y-4">
      <div className="rounded-lg border border-dashed border-line-strong bg-surface-base p-8 shadow-soft">
        <BookOpen aria-hidden className="h-10 w-10 text-brand-primary" />
        <h2 className="mt-4 text-xl font-semibold text-ink-primary">
          {hasCatalogError ? "Catalogo temporalmente no disponible" : "No hay cursos visibles todavia"}
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-secondary">
          {hasCatalogError
            ? "La experiencia publica no se bloquea. Mostramos previews premium mientras el catalogo vuelve a responder."
            : "Cuando publiques cursos y los marques para landing apareceran aqui con cards premium."}
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {fallbackCourses.map((course) => (
          <article key={course.title} className="rounded-lg border border-line-subtle bg-surface-base p-5 shadow-soft">
            <p className="text-xs font-semibold uppercase tracking-normal text-brand-primary">{course.category}</p>
            <h3 className="mt-2 text-lg font-semibold text-ink-primary">{course.title}</h3>
            <p className="mt-2 text-sm leading-6 text-ink-secondary">{course.description}</p>
            <span className="mt-5 inline-flex rounded-md bg-surface-muted px-2.5 py-1 text-xs font-semibold text-ink-muted">{course.meta}</span>
          </article>
        ))}
      </div>
    </div>
  );
}

function ExperienceCard({ icon: Icon, title, description }: { icon: typeof BookOpen; title: string; description: string }) {
  return (
    <article className="rounded-lg border border-line-subtle bg-surface-base p-6 shadow-soft">
      <span className="flex h-11 w-11 items-center justify-center rounded-md bg-brand-primary/10 text-brand-primary">
        <Icon aria-hidden className="h-5 w-5" />
      </span>
      <h3 className="mt-6 text-lg font-semibold text-ink-primary">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-ink-secondary">{description}</p>
    </article>
  );
}
