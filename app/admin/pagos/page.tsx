import Link from "next/link";

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
      <div>
        <p className="text-sm font-medium uppercase tracking-normal text-brand-primary">Commerce</p>
        <h1 className="text-2xl font-semibold text-slate-950">Pagos</h1>
      </div>
      {payments.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-600">No hay pagos todavia.</div>
      ) : (
        <div className="space-y-4">
          {payments.map((payment) => (
            <article key={payment.id} className="space-y-4 rounded-lg border border-slate-200 bg-white p-4">
              <div className="grid gap-3 md:grid-cols-[1fr_auto]">
                <div>
                  <h2 className="font-semibold text-slate-950">{payment.order.product?.title ?? payment.order.productId}</h2>
                  <p className="text-sm text-slate-600">{payment.order.student?.email ?? payment.order.userId}</p>
                  <p className="text-sm text-slate-600">{payment.method} · {payment.status} · {formatMxn(payment.order.totalMxnCents)}</p>
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
