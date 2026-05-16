import {
  createLesson,
  createLessonResource,
  createProductDraft,
  getAnyProductWithLessonsBySlug,
  getProductWithLessonsById,
  getPublishedProductWithLessonsBySlug,
  listProductsForAdmin,
  listPublishedProducts,
  setProductPublished,
  updateLessonOrder,
  updateProduct
} from "@/lib/engines/catalog/repository";
import { slugify } from "@/lib/engines/catalog/helpers";
import type {
  LessonFormInput,
  LessonReorderInput,
  ProductFormInput,
  ResourceFormInput
} from "@/lib/engines/catalog/validation";
import type { Product, ProductWithLessons } from "@/lib/engines/catalog/types";

export async function listAdminProducts(): Promise<Product[]> {
  return listProductsForAdmin();
}

export async function listPublicProducts(): Promise<Product[]> {
  return listPublishedProducts();
}

export async function getAdminProductEditor(productId: string): Promise<ProductWithLessons | null> {
  return getProductWithLessonsById(productId);
}

export async function getPublicProductPage(slug: string): Promise<ProductWithLessons | null> {
  return getPublishedProductWithLessonsBySlug(slug);
}

export async function getProductForLearning(slug: string): Promise<ProductWithLessons | null> {
  return getAnyProductWithLessonsBySlug(slug);
}

export async function createDraftProductFromTitle(title: string): Promise<Product> {
  const normalizedTitle = title.trim();
  const slug = slugify(normalizedTitle);

  if (!slug) {
    throw new Error("El titulo no genera un slug valido.");
  }

  return createProductDraft({
    title: normalizedTitle,
    slug: `${slug}-${Date.now().toString(36)}`,
    type: "curso"
  });
}

export async function saveProduct(input: ProductFormInput): Promise<Product> {
  const product = await updateProduct(input);
  const persisted = await getProductWithLessonsById(product.id);

  if (!persisted || persisted.slug !== input.slug) {
    throw new Error("No pudimos validar la persistencia del producto.");
  }

  return product;
}

export async function updateProductPublishState(productId: string, isPublished: boolean): Promise<Product> {
  const product = await setProductPublished(productId, isPublished);

  if (product.isPublished !== isPublished) {
    throw new Error("No pudimos validar el estado de publicacion.");
  }

  return product;
}

export async function addLessonToProduct(input: LessonFormInput): Promise<void> {
  const product = await getProductWithLessonsById(input.productId);

  if (!product) {
    throw new Error("Producto no encontrado.");
  }

  const nextOrder =
    product.lessons.length === 0
      ? 0
      : Math.max(...product.lessons.map((lesson) => lesson.displayOrder)) + 1;

  await createLesson({
    ...input,
    displayOrder: nextOrder
  });

  await validateLessonOrdering(input.productId);
}

export async function reorderLesson(input: LessonReorderInput): Promise<void> {
  const product = await getProductWithLessonsById(input.productId);

  if (!product) {
    throw new Error("Producto no encontrado.");
  }

  const lessons = product.lessons.toSorted((first, second) => first.displayOrder - second.displayOrder);
  const currentIndex = lessons.findIndex((lesson) => lesson.id === input.lessonId);

  if (currentIndex < 0) {
    throw new Error("Leccion no encontrada.");
  }

  const targetIndex = input.direction === "up" ? currentIndex - 1 : currentIndex + 1;

  if (targetIndex < 0 || targetIndex >= lessons.length) {
    return;
  }

  const reordered = [...lessons];
  const [lesson] = reordered.splice(currentIndex, 1);
  reordered.splice(targetIndex, 0, lesson);

  await Promise.all(
    reordered.map((item, index) => updateLessonOrder(item.id, index))
  );
  await validateLessonOrdering(input.productId);
}

export async function addResourceToLesson(input: ResourceFormInput): Promise<void> {
  const product = await getProductWithLessonsById(input.productId);
  const lesson = product?.lessons.find((candidate) => candidate.id === input.lessonId);

  if (!product || !lesson) {
    throw new Error("Leccion no encontrada.");
  }

  const nextOrder =
    lesson.resources.length === 0
      ? 0
      : Math.max(...lesson.resources.map((resource) => resource.displayOrder)) + 1;

  await createLessonResource({
    lessonId: input.lessonId,
    title: input.title,
    fileUrl: input.fileUrl,
    displayOrder: nextOrder
  });
}

async function validateLessonOrdering(productId: string): Promise<void> {
  const product = await getProductWithLessonsById(productId);
  const ordered = product?.lessons.toSorted((first, second) => first.displayOrder - second.displayOrder) ?? [];
  const isContiguous = ordered.every((lesson, index) => lesson.displayOrder === index);

  if (!isContiguous) {
    await Promise.all(ordered.map((lesson, index) => updateLessonOrder(lesson.id, index)));
  }
}
