export type ProductType = "curso" | "taller";

export type Product = {
  id: string;
  title: string;
  slug: string;
  type: ProductType;
  subtitle: string | null;
  description: string | null;
  coverImageUrl: string | null;
  priceMxnCents: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Lesson = {
  id: string;
  productId: string;
  title: string;
  slug: string;
  description: string | null;
  videoUrl: string | null;
  displayOrder: number;
  isPreview: boolean;
};

export type LessonResource = {
  id: string;
  lessonId: string;
  title: string;
  fileUrl: string;
  displayOrder: number;
};

export type ProductWithLessons = Product & {
  lessons: Array<Lesson & { resources: LessonResource[] }>;
};

export type CatalogActionState = {
  status: "idle" | "success" | "error";
  message: string;
};

export type SignedUploadIntent = "cover-image" | "lesson-resource";
