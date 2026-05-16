"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdmin } from "@/lib/engines/auth/helpers";
import {
  addLessonToProduct,
  addResourceToLesson,
  createDraftProductFromTitle,
  reorderLesson,
  saveProduct,
  updateProductPublishState
} from "@/lib/engines/catalog/service";
import { booleanFromForm, stringFromForm } from "@/lib/engines/catalog/helpers";
import type { CatalogActionState } from "@/lib/engines/catalog/types";
import {
  lessonFormSchema,
  lessonReorderSchema,
  productFormSchema,
  productIdSchema,
  resourceFormSchema
} from "@/lib/engines/catalog/validation";

const successState = (message: string): CatalogActionState => ({ status: "success", message });
const errorState = (message: string): CatalogActionState => ({ status: "error", message });

export async function createProductDraftAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const title = stringFromForm(formData, "title");

  if (title.trim().length < 2) {
    throw new Error("El titulo es obligatorio.");
  }

  const product = await createDraftProductFromTitle(title);
  revalidatePath("/admin/productos");
  redirect(`/admin/productos/${product.id}`);
}

export async function saveProductAction(
  _previousState: CatalogActionState,
  formData: FormData
): Promise<CatalogActionState> {
  await requireAdmin();
  const parsed = productFormSchema.safeParse({
    id: stringFromForm(formData, "id"),
    title: stringFromForm(formData, "title"),
    slug: stringFromForm(formData, "slug"),
    type: stringFromForm(formData, "type"),
    subtitle: stringFromForm(formData, "subtitle"),
    description: stringFromForm(formData, "description"),
    coverImageUrl: stringFromForm(formData, "coverImageUrl"),
    priceMxnCents: stringFromForm(formData, "priceMxnCents")
  });

  if (!parsed.success) {
    return errorState(parsed.error.errors[0]?.message ?? "Datos invalidos.");
  }

  try {
    await saveProduct(parsed.data);
  } catch (error) {
    return errorState(error instanceof Error ? error.message : "No pudimos guardar el producto.");
  }

  revalidatePath("/admin/productos");
  revalidatePath(`/admin/productos/${parsed.data.id}`);
  revalidatePath("/");
  revalidatePath(`/productos/${parsed.data.slug}`);
  return successState("Producto guardado y validado en base de datos.");
}

export async function publishProductAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const parsed = productIdSchema.safeParse({ id: stringFromForm(formData, "id") });

  if (!parsed.success) {
    throw new Error("Producto invalido.");
  }

  await updateProductPublishState(parsed.data.id, booleanFromForm(formData, "isPublished"));
  revalidatePath("/admin/productos");
  revalidatePath(`/admin/productos/${parsed.data.id}`);
  revalidatePath("/");
}

export async function addLessonAction(
  _previousState: CatalogActionState,
  formData: FormData
): Promise<CatalogActionState> {
  await requireAdmin();
  const parsed = lessonFormSchema.safeParse({
    productId: stringFromForm(formData, "productId"),
    title: stringFromForm(formData, "title"),
    slug: stringFromForm(formData, "slug"),
    description: stringFromForm(formData, "description"),
    videoUrl: stringFromForm(formData, "videoUrl"),
    isPreview: booleanFromForm(formData, "isPreview")
  });

  if (!parsed.success) {
    return errorState(parsed.error.errors[0]?.message ?? "Datos invalidos.");
  }

  try {
    await addLessonToProduct(parsed.data);
  } catch (error) {
    return errorState(error instanceof Error ? error.message : "No pudimos agregar la leccion.");
  }

  revalidatePath(`/admin/productos/${parsed.data.productId}`);
  return successState("Leccion agregada y orden validado.");
}

export async function reorderLessonAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const parsed = lessonReorderSchema.safeParse({
    productId: stringFromForm(formData, "productId"),
    lessonId: stringFromForm(formData, "lessonId"),
    direction: stringFromForm(formData, "direction")
  });

  if (!parsed.success) {
    throw new Error("Orden invalido.");
  }

  await reorderLesson(parsed.data);
  revalidatePath(`/admin/productos/${parsed.data.productId}`);
}

export async function addResourceAction(
  _previousState: CatalogActionState,
  formData: FormData
): Promise<CatalogActionState> {
  await requireAdmin();
  const parsed = resourceFormSchema.safeParse({
    productId: stringFromForm(formData, "productId"),
    lessonId: stringFromForm(formData, "lessonId"),
    title: stringFromForm(formData, "title"),
    fileUrl: stringFromForm(formData, "fileUrl")
  });

  if (!parsed.success) {
    return errorState(parsed.error.errors[0]?.message ?? "Datos invalidos.");
  }

  try {
    await addResourceToLesson(parsed.data);
  } catch (error) {
    return errorState(error instanceof Error ? error.message : "No pudimos agregar el recurso.");
  }

  revalidatePath(`/admin/productos/${parsed.data.productId}`);
  return successState("Recurso agregado.");
}
