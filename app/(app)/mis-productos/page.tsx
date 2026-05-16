import Image from "next/image";
import Link from "next/link";

import { requireUser } from "@/lib/engines/auth/helpers";
import { listStudentProducts } from "@/lib/engines/learning/service";
import { listPaymentsForStudent } from "@/lib/engines/commerce/service";

export default async function MyProductsPage() {
  const auth = await requireUser();
  const [products, payments] = await Promise.all([
    listStudentProducts(auth),
    listPaymentsForStudent(auth.user.id)
  ]);

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <p className="text-sm font-medium uppercase tracking-normal text-brand-primary">Cuenta</p>
        <h1 className="text-2xl font-semibold text-slate-950">Mis productos</h1>
        <p className="max-w-2xl text-sm leading-6 text-slate-600">
          Hola{auth.profile.fullName ? `, ${auth.profile.fullName}` : ""}. Continua aprendiendo desde tu
          ultimo avance.
        </p>
      </div>
      {products.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-600">
          No tienes productos activos todavia.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {products.map(({ product, progress }) => {
            const continueHref = progress.lastViewedLessonSlug
              ? `/aprender/${product.slug}/${progress.lastViewedLessonSlug}`
              : `/aprender/${product.slug}`;

            return (
              <article key={product.id} className="overflow-hidden rounded-lg border border-slate-200 bg-white">
                <div className="relative aspect-[16/9] bg-slate-200">
                  {product.coverImageUrl ? (
                    <Image src={product.coverImageUrl} alt="" fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
                  ) : null}
                </div>
                <div className="space-y-4 p-4">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-950">{product.title}</h2>
                    {product.subtitle ? <p className="mt-1 text-sm text-slate-600">{product.subtitle}</p> : null}
                  </div>
                  <div>
                    <div className="h-2 overflow-hidden rounded bg-slate-200">
                      <div className="h-full bg-brand-primary" style={{ width: `${progress.progressPercentage}%` }} />
                    </div>
                    <p className="mt-2 text-sm text-slate-600">
                      {progress.progressPercentage}% completado
                    </p>
                  </div>
                  <Link
                    href={continueHref}
                    className="inline-flex min-h-11 items-center rounded-md bg-brand-primary px-4 py-2 text-sm font-semibold text-white"
                  >
                    Continuar aprendiendo
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-950">Pagos</h2>
        {payments.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-300 bg-white p-4 text-sm text-slate-600">
            No tienes pagos registrados.
          </div>
        ) : (
          <div className="grid gap-3">
            {payments.map((payment) => (
              <article key={payment.id} className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-600">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-semibold text-slate-950">{payment.order.product?.title ?? payment.order.productId}</p>
                    <p>{payment.method} · {payment.status}</p>
                    {payment.rejectionReason ? <p className="text-red-700">{payment.rejectionReason}</p> : null}
                  </div>
                  {payment.status === "rejected" && payment.order.product ? (
                    <Link
                      href={`/checkout/${payment.order.product.slug}`}
                      className="inline-flex min-h-10 items-center rounded-md border border-slate-300 px-3 py-2 font-semibold text-slate-800"
                    >
                      Reintentar comprobante
                    </Link>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </section>
  );
}
