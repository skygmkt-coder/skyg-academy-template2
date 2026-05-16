import { notFound } from "next/navigation";
import Link from "next/link";

import { CheckoutForm } from "@/components/commerce/checkout-form";
import { requireUser } from "@/lib/engines/auth/helpers";
import { formatMxn } from "@/lib/engines/catalog/helpers";
import { getCheckoutIntent } from "@/lib/engines/commerce/service";

export default async function CheckoutPage({ params }: { params: Promise<{ slug: string }> }) {
  const auth = await requireUser();
  const { slug } = await params;
  const intent = await getCheckoutIntent(auth, slug);
  if (!intent) notFound();

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <section className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="space-y-4 rounded-lg border border-slate-200 bg-white p-4">
          <Link href={`/productos/${intent.product.slug}`} className="text-sm font-medium text-brand-primary">Volver</Link>
          <h1 className="text-2xl font-semibold text-slate-950">Checkout</h1>
          <div>
            <h2 className="font-semibold text-slate-950">{intent.product.title}</h2>
            <p className="mt-1 text-sm text-slate-600">{intent.product.subtitle}</p>
            <p className="mt-4 text-2xl font-semibold text-slate-950">{formatMxn(intent.product.priceMxnCents)}</p>
          </div>
          {intent.payments.length > 0 ? (
            <div className="space-y-2 border-t border-slate-200 pt-4 text-sm text-slate-600">
              <p className="font-medium text-slate-950">Pagos enviados</p>
              {intent.payments.map((payment) => (
                <p key={payment.id}>{payment.method}: {payment.status}{payment.rejectionReason ? ` - ${payment.rejectionReason}` : ""}</p>
              ))}
            </div>
          ) : null}
        </div>
        <CheckoutForm productId={intent.product.id} productSlug={intent.product.slug} />
      </section>
    </main>
  );
}
