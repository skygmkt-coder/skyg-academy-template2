import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { formatMxn } from "@/lib/engines/catalog/helpers";
import { getPublicProductPage } from "@/lib/engines/catalog/service";

export default async function PublicProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getPublicProductPage(slug);

  if (!product) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="mx-auto grid max-w-6xl gap-8 px-4 py-10 md:grid-cols-[0.9fr_1.1fr]">
        <div className="relative aspect-[16/10] overflow-hidden rounded-lg bg-slate-200">
          {product.coverImageUrl ? (
            <Image src={product.coverImageUrl} alt="" fill sizes="(min-width: 768px) 45vw, 100vw" className="object-cover" priority />
          ) : null}
        </div>
        <div className="space-y-5">
          <Link href="/" className="text-sm font-medium text-brand-primary">
            Volver al catalogo
          </Link>
          <div className="space-y-3">
            <p className="text-sm font-medium uppercase tracking-normal text-brand-primary">{product.type}</p>
            <h1 className="text-3xl font-semibold text-slate-950 md:text-5xl">{product.title}</h1>
            {product.subtitle ? <p className="text-lg leading-7 text-slate-600">{product.subtitle}</p> : null}
          </div>
          {product.description ? <p className="whitespace-pre-line text-sm leading-7 text-slate-700">{product.description}</p> : null}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <span className="text-2xl font-semibold text-slate-950">{formatMxn(product.priceMxnCents)}</span>
            <Link className="inline-flex min-h-11 items-center justify-center rounded-md bg-brand-primary px-5 py-2 text-sm font-semibold text-white" href={`/checkout/${product.slug}`}>
              Comprar
            </Link>
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-4 pb-14">
        <h2 className="text-2xl font-semibold text-slate-950">Lecciones</h2>
        {product.lessons.length === 0 ? (
          <div className="mt-4 rounded-lg border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-600">
            Las lecciones se publicaran pronto.
          </div>
        ) : (
          <ol className="mt-4 divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white">
            {product.lessons.map((lesson, index) => (
              <li key={lesson.id} className="flex items-start justify-between gap-4 p-4">
                <div>
                  <p className="text-sm font-medium text-slate-500">Leccion {index + 1}</p>
                  <h3 className="mt-1 font-semibold text-slate-950">{lesson.title}</h3>
                  {lesson.description ? <p className="mt-1 text-sm leading-6 text-slate-600">{lesson.description}</p> : null}
                </div>
                {lesson.isPreview ? (
                  <span className="rounded bg-brand-accent/10 px-2 py-1 text-xs font-medium text-slate-700">
                    Preview
                  </span>
                ) : null}
              </li>
            ))}
          </ol>
        )}
      </section>
    </main>
  );
}
