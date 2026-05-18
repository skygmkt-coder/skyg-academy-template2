import { z } from "zod";

export const productTypeSchema = z.enum(["curso", "taller"]);

export const slugSchema = z
  .string()
  .trim()
  .min(1, "El slug es obligatorio")
  .max(120, "El slug es demasiado largo")
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Usa solo minusculas, numeros y guiones");

export const nullableUrlSchema = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value ? value : null))
  .pipe(z.string().url("URL invalida").nullable());

export const productFormSchema = z.object({
  id: z.string().uuid(),
  title: z.string().trim().min(2, "El titulo es obligatorio").max(160),
  slug: slugSchema,
  type: productTypeSchema,
  subtitle: z
    .string()
    .trim()
    .max(220)
    .optional()
    .transform((value) => (value ? value : null)),
  description: z
    .string()
    .trim()
    .max(8000)
    .optional()
    .transform((value) => (value ? value : null)),
  coverImageUrl: nullableUrlSchema,
  priceMxnCents: z.coerce.number().int().min(0, "El precio no puede ser negativo")
});

export const productIdSchema = z.object({
  id: z.string().uuid()
});

export const lessonFormSchema = z.object({
  productId: z.string().uuid(),
  title: z.string().trim().min(2, "El titulo de la leccion es obligatorio").max(160),
  slug: slugSchema,
  description: z
    .string()
    .trim()
    .max(4000)
    .optional()
    .transform((value) => (value ? value : null)),
  videoUrl: nullableUrlSchema,
  isPreview: z.boolean()
});

export const lessonReorderSchema = z.object({
  productId: z.string().uuid(),
  lessonId: z.string().uuid(),
  direction: z.enum(["up", "down"])
});

export const resourceFormSchema = z.object({
  productId: z.string().uuid(),
  lessonId: z.string().uuid(),
  title: z.string().trim().min(2, "El titulo del recurso es obligatorio").max(160),
  fileUrl: z.string().trim().url("URL invalida")
});

const catalogUploadRules = {
  "cover-image": {
    contentTypes: ["image/jpeg", "image/png", "image/webp"],
    extensions: ["jpg", "jpeg", "png", "webp"]
  },
  "lesson-resource": {
    contentTypes: ["application/pdf", "application/zip", "text/plain"],
    extensions: ["pdf", "zip", "txt"]
  }
} as const;

function extensionFromFileName(fileName: string): string {
  return fileName.split(".").pop()?.toLowerCase() ?? "";
}

export const signedUploadSchema = z
  .object({
    intent: z.enum(["cover-image", "lesson-resource"]),
    fileName: z.string().trim().min(1).max(180),
    contentType: z.string().trim().min(1).max(120),
    size: z.number().int().positive().max(50 * 1024 * 1024).optional()
  })
  .superRefine((value, context) => {
    const rules = catalogUploadRules[value.intent];
    const extension = extensionFromFileName(value.fileName);

    if (!rules.contentTypes.includes(value.contentType as never)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Tipo de archivo no permitido.",
        path: ["contentType"]
      });
    }

    if (!rules.extensions.includes(extension as never)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Extension de archivo no permitida.",
        path: ["fileName"]
      });
    }
  });

export type ProductFormInput = z.infer<typeof productFormSchema>;
export type LessonFormInput = z.infer<typeof lessonFormSchema>;
export type LessonReorderInput = z.infer<typeof lessonReorderSchema>;
export type ResourceFormInput = z.infer<typeof resourceFormSchema>;
export type SignedUploadInput = z.infer<typeof signedUploadSchema>;
