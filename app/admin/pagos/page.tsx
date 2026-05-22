import Link from "next/link";

import { PageHeader } from "@/components/layout/page-header";
import { RejectPaymentForm } from "@/components/commerce/reject-payment-form";
import { approvePaymentAction } from "@/lib/engines/commerce/actions";
import { createSignedPaymentProofReadUrl, listPaymentsForAdmin } from "@/lib/engines/commerce/service";
import { requireAdmin } from "@/lib/engines/auth/helpers";
import { formatMxn } from "@/lib/engines/catalog/helpers";

export default async function AdminPaymentsPage() {
  await requireAdmin();
  const payments = await listPaymentsForAdmin();
  const proofUrls = new Map<string, string>();
  await Promise.all(payments.map(async (payment) => {
    if (payment.proofUrl) proofUrls.set(payment.id, await createSignedPaymentProofReadUrl(payment.proofUrl));
  }));

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow="Commerce"
        title="Pagos"
        description="Revisa comprobantes manuales, aprueba accesos y conserva trazabilidad operativa."
      />
      {payments.length === 0 ? (
        <div className="rounded-lg border border-dashed border-line-strong bg-surface-base p-6 text-sm text-ink-secondary shadow-soft">No hay pagos todavia.</div>
      ) : (
        <div className="space-y-4">
          {payments.map((payment) => (
            <article key={payment.id} className="space-y-4 rounded-lg border border-line-subtle bg-surface-base p-4 shadow-soft">
              <div className="grid gap-3 md:grid-cols-[1fr_auto]">
                <div>
                  <h2 className="font-semibold text-ink-primary">{payment.order.product?.title ?? payment.order.productId}</h2>
                  <p className="text-sm text-ink-secondary">{payment.order.student?.email ?? payment.order.userId}</p>
                  <p className="text-sm text-ink-secondary">{payment.method} - {payment.status} - {formatMxn(payment.order.totalMxnCents)}</p>
                </div>
                {payment.proofUrl ? <a className="text-sm font-medium text-brand-primary" href={proofUrls.get(payment.id)} target="_blank" rel="noreferrer">Ver comprobante</a> : null}
              </div>
              {payment.status === "pending_review" ? (
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                  <form action={approvePaymentAction}>
                    <input type="hidden" name="paymentId" value={payment.id} />
                    <button type="submit" className="min-h-10 rounded-md bg-brand-primary px-3 py-2 text-sm font-semibold text-white">Aprobar y desbloquear</button>
                  </form>
                  <RejectPaymentForm paymentId={payment.id} />
                </div>
              ) : null}
              {payment.status === "rejected" ? <p className="text-sm text-red-700">{payment.rejectionReason}</p> : null}
              {payment.order.product ? <Link className="text-sm font-medium text-brand-primary" href={`/admin/productos/${payment.order.product.id}`}>Ver producto</Link> : null}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
