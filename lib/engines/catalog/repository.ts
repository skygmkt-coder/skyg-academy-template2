import { createClient } from "@/lib/supabase/server";
import type { Lesson, LessonResource, Product, ProductWithLessons } from "@/lib/engines/catalog/types";

type ProductRow = {
  id: string;
  title: string;
  slug: string;
  type: string;
  subtitle: string | null;
  description: string | null;
  cover_image_url: string | null;
  price_mxn_cents: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
};

type LessonRow = {
  id: string;
  product_id: string;
  title: string;
  slug: string;
  description: string | null;
  video_url: string | null;
  display_order: number;
  is_preview: boolean;
};

type ResourceRow = {
  id: string;
  lesson_id: string;
  title: string;
  file_url: string;
  display_order: number;
};

function mapProduct(row: ProductRow): Product {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    type: row.type === "taller" ? "taller" : "curso",
    subtitle: row.subtitle,
    description: row.description,
    coverImageUrl: row.cover_image_url,
    priceMxnCents: row.price_mxn_cents,
    isPublished: row.is_published,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function mapLesson(row: LessonRow): Lesson {
  return {
    id: row.id,
    productId: row.product_id,
    title: row.title,
    slug: row.slug,
    description: row.description,
    videoUrl: row.video_url,
    displayOrder: row.display_order,
    isPreview: row.is_preview
  };
}

function mapResource(row: ResourceRow): LessonResource {
  return {
    id: row.id,
    lessonId: row.lesson_id,
    title: row.title,
    fileUrl: row.file_url,
    displayOrder: row.display_order
  };
}

const productColumns =
  "id,title,slug,type,subtitle,description,cover_image_url,price_mxn_cents,is_published,created_at,updated_at";
const lessonColumns = "id,product_id,title,slug,description,video_url,display_order,is_preview";
const resourceColumns = "id,lesson_id,title,file_url,display_order";

export async function listProductsForAdmin(): Promise<Product[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(productColumns)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Unable to list products: ${error.message}`);
  }

  return data.map(mapProduct);
}

export async function listPublishedProducts(): Promise<Product[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(productColumns)
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Unable to list published products: ${error.message}`);
  }

  return data.map(mapProduct);
}

export async function getProductById(productId: string): Promise<Product | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(productColumns)
    .eq("id", productId)
    .maybeSingle();

  if (error) {
    throw new Error(`Unable to load product: ${error.message}`);
  }

  return data ? mapProduct(data) : null;
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(productColumns)
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();

  if (error) {
    throw new Error(`Unable to load product: ${error.message}`);
  }

  return data ? mapProduct(data) : null;
}

export async function getAnyProductBySlug(slug: string): Promise<Product | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(productColumns)
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    throw new Error(`Unable to load product: ${error.message}`);
  }

  return data ? mapProduct(data) : null;
}

export async function listLessonsByProductId(productId: string): Promise<Lesson[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("lessons")
    .select(lessonColumns)
    .eq("product_id", productId)
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(`Unable to list lessons: ${error.message}`);
  }

  return data.map(mapLesson);
}

export async function listResourcesByLessonIds(lessonIds: string[]): Promise<LessonResource[]> {
  if (lessonIds.length === 0) {
    return [];
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("lesson_resources")
    .select(resourceColumns)
    .in("lesson_id", lessonIds)
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(`Unable to list resources: ${error.message}`);
  }

  return data.map(mapResource);
}

export async function getProductWithLessonsById(productId: string): Promise<ProductWithLessons | null> {
  const product = await getProductById(productId);

  if (!product) {
    return null;
  }

  return attachLessons(product);
}

export async function getPublishedProductWithLessonsBySlug(slug: string): Promise<ProductWithLessons | null> {
  const product = await getProductBySlug(slug);

  if (!product) {
    return null;
  }

  return attachLessons(product);
}

export async function getAnyProductWithLessonsBySlug(slug: string): Promise<ProductWithLessons | null> {
  const product = await getAnyProductBySlug(slug);

  if (!product) {
    return null;
  }

  return attachLessons(product);
}

async function attachLessons(product: Product): Promise<ProductWithLessons> {
  const lessons = await listLessonsByProductId(product.id);
  const resources = await listResourcesByLessonIds(lessons.map((lesson) => lesson.id));

  return {
    ...product,
    lessons: lessons.map((lesson) => ({
      ...lesson,
      resources: resources.filter((resource) => resource.lessonId === lesson.id)
    }))
  };
}

export async function createProductDraft(input: {
  title: string;
  slug: string;
  type: string;
}): Promise<Product> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .insert({
      title: input.title,
      slug: input.slug,
      type: input.type,
      is_published: false
    })
    .select(productColumns)
    .single();

  if (error) {
    throw new Error(`Unable to create product: ${error.message}`);
  }

  return mapProduct(data);
}

export async function updateProduct(input: {
  id: string;
  title: string;
  slug: string;
  type: string;
  subtitle: string | null;
  description: string | null;
  coverImageUrl: string | null;
  priceMxnCents: number;
}): Promise<Product> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .update({
      title: input.title,
      slug: input.slug,
      type: input.type,
      subtitle: input.subtitle,
      description: input.description,
      cover_image_url: input.coverImageUrl,
      price_mxn_cents: input.priceMxnCents
    })
    .eq("id", input.id)
    .select(productColumns)
    .single();

  if (error) {
    throw new Error(`Unable to update product: ${error.message}`);
  }

  return mapProduct(data);
}

export async function setProductPublished(productId: string, isPublished: boolean): Promise<Product> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .update({ is_published: isPublished })
    .eq("id", productId)
    .select(productColumns)
    .single();

  if (error) {
    throw new Error(`Unable to update publish state: ${error.message}`);
  }

  return mapProduct(data);
}

export async function createLesson(input: {
  productId: string;
  title: string;
  slug: string;
  description: string | null;
  videoUrl: string | null;
  isPreview: boolean;
  displayOrder: number;
}): Promise<Lesson> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("lessons")
    .insert({
      product_id: input.productId,
      title: input.title,
      slug: input.slug,
      description: input.description,
      video_url: input.videoUrl,
      is_preview: input.isPreview,
      display_order: input.displayOrder
    })
    .select(lessonColumns)
    .single();

  if (error) {
    throw new Error(`Unable to create lesson: ${error.message}`);
  }

  return mapLesson(data);
}

export async function updateLessonOrder(lessonId: string, displayOrder: number): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("lessons")
    .update({ display_order: displayOrder })
    .eq("id", lessonId);

  if (error) {
    throw new Error(`Unable to update lesson order: ${error.message}`);
  }
}

export async function createLessonResource(input: {
  lessonId: string;
  title: string;
  fileUrl: string;
  displayOrder: number;
}): Promise<LessonResource> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("lesson_resources")
    .insert({
      lesson_id: input.lessonId,
      title: input.title,
      file_url: input.fileUrl,
      display_order: input.displayOrder
    })
    .select(resourceColumns)
    .single();

  if (error) {
    throw new Error(`Unable to create resource: ${error.message}`);
  }

  return mapResource(data);
}
