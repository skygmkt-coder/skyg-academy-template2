import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Clock3, CreditCard, FileCheck2, LockKeyhole, ReceiptText, ShieldCheck, type LucideIcon } from "lucide-react";

import { CheckoutForm } from "@/components/commerce/checkout-form";
import { requireUser } from "@/lib/engines/auth/helpers";
import { formatMxn } from "@/lib/engines/catalog/helpers";
import { getCheckoutIntent } from "@/lib/engines/commerce/service";
import type { StudentPayment } from "@/lib/engines/commerce/types";

function statusLabel(status: StudentPayment["status"]): string {
  if (status === "approved") return "Aprobado";
  if (status === "rejected") return "Rechazado";
  return "En revision";
}

function statusClass(status: StudentPayment["status"]): string {
  if (status === "approved") return "bg-emerald-400/10 text-emerald-300";
  if (status === "rejected") return "bg-rose-400/10 text-rose-300";
  return "bg-amber-400/10 text-amber-300";
}

export default async function CheckoutPage({ params }: { params: Promise<{ slug: string }> }) {
  const auth = await requireUser();
  const { slug } = await params;
  const intent = await getCheckoutIntent(auth, slug);
  if (!intent) notFound();

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div aria-hidden className="fixed inset-0 bg-[radial-gradient(circle_at_18%_10%,rgba(20,184,166,0.24),transparent_28%),radial-gradient(circle_at_86%_16%,rgba(59,130,246,0.18),transparent_30%),linear-gradient(145deg,#020617_0%,#0f172a_48%,#020617_100%)]" />
      <section className="relative mx-auto grid min-h-screen max-w-7xl gap-8 px-4 py-6 sm:px-6 lg:grid-cols-[0.82fr_1.18fr] lg:px-8 lg:py-10">
        <aside className="space-y-6 lg:sticky lg:top-10 lg:self-start">
          <Link href={`/productos/${intent.product.slug}`} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-300 hover:text-white">
            <ArrowLeft aria-hidden className="h-4 w-4" />
            Volver al producto
          </Link>

          <div className="overflow-hidden rounded-lg border border-white/10 bg-white/[0.06] shadow-float backdrop-blur">
            <div className="border-b border-white/10 p-5 sm:p-6">
              <p className="text-xs font-semibold uppercase tracking-normal text-brand-accent">Secure checkout</p>
              <h1 className="mt-3 text-3xl font-semibold leading-tight text-white">Completa tu acceso.</h1>
              <p className="mt-3 text-sm leading-7 text-slate-300">
                Sube tu comprobante y el equipo activara tu acceso cuando el pago sea validado.
              </p>
            </div>

            <div className="p-5 sm:p-6">
              <div className="rounded-lg border border-white/10 bg-slate-950/60 p-4">
                <p className="text-sm text-slate-400">Producto</p>
                <h2 className="mt-2 text-xl font-semibold text-white">{intent.product.title}</h2>
                {intent.product.subtitle ? <p className="mt-2 text-sm leading-6 text-slate-300">{intent.product.subtitle}</p> : null}
                <p className="mt-5 text-4xl font-semibold text-white">{formatMxn(intent.product.priceMxnCents)}</p>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
                <TrustPill icon={ShieldCheck} label="Acceso protegido" />
                <TrustPill icon={LockKeyhole} label="Revision segura" />
                <TrustPill icon={ReceiptText} label="Comprobante" />
              </div>
            </div>
          </div>

          <PaymentHistory payments={intent.payments} />
        </aside>

        <div className="space-y-6">
          <CheckoutForm
            productId={intent.product.id}
            productSlug={intent.product.slug}
            productTitle={intent.product.title}
            priceLabel={formatMxn(intent.product.priceMxnCents)}
          />

          <section className="rounded-lg border border-white/10 bg-white/[0.06] p-5 shadow-soft backdrop-blur">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-md bg-white/[0.08] text-brand-accent">
                <FileCheck2 aria-hidden className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-semibold text-white">Despues de enviar</p>
                <p className="text-sm text-slate-400">Tu comprobante queda en revision manual.</p>
              </div>
            </div>
            <div className="mt-5 grid gap-3 md:grid-cols-3">
              <ProcessStep icon={CreditCard} title="Pago enviado" detail="Transferencia o DIMO" />
              <ProcessStep icon={Clock3} title="Revision" detail="Validacion del equipo" />
              <ProcessStep icon={CheckCircle2} title="Acceso" detail="Enrollment activo" />
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}

function TrustPill({ icon: Icon, label }: { icon: LucideIcon; label: string }) {
  return (
    <div className="flex items-center gap-2 rounded-md border border-white/10 bg-white/[0.05] px-3 py-2 text-xs font-semibold text-slate-200">
      <Icon aria-hidden className="h-4 w-4 text-brand-accent" />
      {label}
    </div>
  );
}

function PaymentHistory({ payments }: { payments: StudentPayment[] }) {
  return (
    <section className="rounded-lg border border-white/10 bg-white/[0.06] p-5 shadow-soft backdrop-blur">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-normal text-brand-accent">Billing history</p>
          <h2 className="mt-1 font-semibold text-white">Pagos enviados</h2>
        </div>
        <span className="rounded-md bg-white/[0.08] px-2.5 py-1 text-xs font-semibold text-slate-300">{payments.length}</span>
      </div>
      {payments.length === 0 ? (
        <div className="mt-5 rounded-lg border border-dashed border-white/14 bg-white/[0.04] p-5 text-sm leading-6 text-slate-300">
          Aun no hay comprobantes enviados para este producto.
        </div>
      ) : (
        <div className="mt-5 space-y-3">
          {payments.map((payment) => (
            <div key={payment.id} className="rounded-md border border-white/10 bg-white/[0.04] p-3 text-sm">
              <div className="flex items-center justify-between gap-3">
                <span className="font-semibold text-white">{payment.method}</span>
                <span className={`rounded-md px-2 py-1 text-xs font-semibold ${statusClass(payment.status)}`}>{statusLabel(payment.status)}</span>
              </div>
              {payment.rejectionReason ? <p className="mt-2 text-rose-300">{payment.rejectionReason}</p> : null}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function ProcessStep({ icon: Icon, title, detail }: { icon: LucideIcon; title: string; detail: string }) {
  return (
    <div className="rounded-md border border-white/10 bg-white/[0.04] p-4">
      <Icon aria-hidden className="h-5 w-5 text-brand-accent" />
      <p className="mt-3 text-sm font-semibold text-white">{title}</p>
      <p className="mt-1 text-xs text-slate-400">{detail}</p>
    </div>
  );
}
