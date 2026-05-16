import { notFound } from "next/navigation";
import { ArrowDown, ArrowUp } from "lucide-react";

import { EnrollmentPanel } from "@/components/learning/enrollment-panel";
import { LessonForm } from "@/components/catalog/lesson-form";
import { ProductForm } from "@/components/catalog/product-form";
import { ResourceForm } from "@/components/catalog/resource-form";
import { publishProductAction, reorderLessonAction } from "@/lib/engines/catalog/actions";
import { getAdminProductEditor } from "@/lib/engines/catalog/service";
import { requireAdmin } from "@/lib/engines/auth/helpers";
import { revokeEnrollmentAction } from "@/lib/engines/learning/actions";
import { getAdminEnrollmentPanel } from "@/lib/engines/learning/service";

export default async function AdminProductEditorPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const [product, enrollmentPanel] = await Promise.all([
    getAdminProductEditor(id),
    getAdminEnrollmentPanel(id)
  ]);

  if (!product) {
    notFound();
  }

  return (
    <section className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-normal text-brand-primary">Editor</p>
          <h1 className="text-2xl font-semibold text-slate-950">{product.title}</h1>
          <p className="mt-1 text-sm text-slate-600">{product.isPublished ? "Publicado" : "Draft"}</p>
        </div>
        <form action={publishProductAction}>
          <input type="hidden" name="id" value={product.id} />
          <input type="hidden" name="isPublished" value={product.isPublished ? "" : "on"} />
          <button type="submit" className="min-h-11 rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800">
            {product.isPublished ? "Despublicar" : "Publicar"}
          </button>
        </form>
      </div>
      <ProductForm product={product} />
      <EnrollmentPanel
        productId={product.id}
        students={enrollmentPanel.students}
        enrollments={enrollmentPanel.enrollments}
        revokeAction={revokeEnrollmentAction}
      />
      <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-950">Lecciones</h2>
            <p className="mt-1 text-sm text-slate-600">Lista plana ordenada.</p>
          </div>
          {product.lessons.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-600">
              No hay lecciones todavia.
            </div>
          ) : (
            <div className="space-y-4">
              {product.lessons.map((lesson, index) => (
                <article key={lesson.id} className="space-y-4 rounded-lg border border-slate-200 bg-white p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm text-slate-500">Orden {lesson.displayOrder}</p>
                      <h3 className="font-semibold text-slate-950">{lesson.title}</h3>
                      <p className="text-sm text-slate-600">/{lesson.slug}</p>
                    </div>
                    <div className="flex gap-2">
                      <form action={reorderLessonAction}>
                        <input type="hidden" name="productId" value={product.id} />
                        <input type="hidden" name="lessonId" value={lesson.id} />
                        <input type="hidden" name="direction" value="up" />
                        <button disabled={index === 0} className="rounded border border-slate-300 p-2 disabled:opacity-40" type="submit" aria-label="Subir leccion">
                          <ArrowUp aria-hidden className="h-4 w-4" />
                        </button>
                      </form>
                      <form action={reorderLessonAction}>
                        <input type="hidden" name="productId" value={product.id} />
                        <input type="hidden" name="lessonId" value={lesson.id} />
                        <input type="hidden" name="direction" value="down" />
                        <button disabled={index === product.lessons.length - 1} className="rounded border border-slate-300 p-2 disabled:opacity-40" type="submit" aria-label="Bajar leccion">
                          <ArrowDown aria-hidden className="h-4 w-4" />
                        </button>
                      </form>
                    </div>
                  </div>
                  {lesson.isPreview ? <span className="inline-flex rounded bg-brand-accent/10 px-2 py-1 text-xs font-medium">Preview</span> : null}
                  {lesson.resources.length > 0 ? (
                    <ul className="space-y-1 text-sm text-slate-600">
                      {lesson.resources.map((resource) => (
                        <li key={resource.id}>{resource.title}</li>
                      ))}
                    </ul>
                  ) : null}
                  <ResourceForm productId={product.id} lessonId={lesson.id} />
                </article>
              ))}
            </div>
          )}
        </section>
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-950">Agregar leccion</h2>
          <LessonForm productId={product.id} />
        </section>
      </div>
    </section>
  );
}
