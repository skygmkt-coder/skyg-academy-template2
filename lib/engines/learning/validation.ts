import { z } from "zod";

export const enrollmentStatusSchema = z.enum(["active", "expired", "revoked"]);
export const paymentTypeSchema = z.enum(["free", "transfer", "dimo", "mixed"]);

const optionalTrimmed = (maxLength: number, message: string) =>
  z
    .string()
    .trim()
    .max(maxLength, message)
    .optional()
    .transform((value) => (value ? value : null));

export const grantEnrollmentSchema = z.object({
  productId: z.string().uuid(),
  userId: z.string().uuid(),
  expiresAt: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value ? value : null)),
  grantedReason: optionalTrimmed(500, "El motivo es demasiado largo")
});

export const revokeEnrollmentSchema = z.object({
  productId: z.string().uuid(),
  enrollmentId: z.string().uuid()
});

export const completeLessonSchema = z.object({
  productSlug: z.string().min(1),
  lessonSlug: z.string().min(1),
  productId: z.string().uuid(),
  lessonId: z.string().uuid()
});

export const completeCoursePlayerLessonSchema = z.object({
  courseId: z.string().uuid(),
  lessonId: z.string().uuid()
});

export const enrollUserToCourseSchema = z.object({
  courseId: z.string().uuid(),
  userId: z.string().uuid(),
  expiresAt: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value ? value : null)),
  paymentProvider: z
    .string()
    .trim()
    .max(80, "El proveedor es demasiado largo")
    .optional()
    .transform((value) => (value ? value : "manual")),
  paymentReference: optionalTrimmed(180, "La referencia es demasiado larga")
});

export const revokeCourseAccessSchema = z.object({
  courseId: z.string().uuid(),
  enrollmentId: z.string().uuid()
});

export const updateCoursePaymentSettingsSchema = z.object({
  courseId: z.string().uuid(),
  paymentType: paymentTypeSchema,
  dimoUrl: optionalTrimmed(500, "La URL de DIMO es demasiado larga"),
  transferBank: optionalTrimmed(160, "El banco es demasiado largo"),
  transferClabe: optionalTrimmed(32, "La CLABE es demasiado larga"),
  transferOwner: optionalTrimmed(160, "El titular es demasiado largo"),
  paymentNotes: optionalTrimmed(1000, "Las notas son demasiado largas")
});

export const updateCourseStorefrontSettingsSchema = z.object({
  courseId: z.string().uuid(),
  showOnLanding: z.boolean(),
  shortDescription: optionalTrimmed(280, "La descripcion corta es demasiado larga"),
  thumbnailUrl: optionalTrimmed(500, "La URL de thumbnail es demasiado larga"),
  instructorName: optionalTrimmed(160, "El instructor es demasiado largo")
});

export const submitCoursePaymentProofSchema = z.object({
  courseId: z.string().uuid(),
  imageUrl: z.string().trim().min(1, "Sube un comprobante."),
  notes: optionalTrimmed(1000, "Las notas son demasiado largas")
});

export const reviewCoursePaymentProofSchema = z.object({
  courseId: z.string().uuid(),
  proofId: z.string().uuid()
});

export const enrollFreeCourseSchema = z.object({
  courseId: z.string().uuid()
});

export type GrantEnrollmentInput = z.infer<typeof grantEnrollmentSchema>;
export type RevokeEnrollmentInput = z.infer<typeof revokeEnrollmentSchema>;
export type CompleteLessonInput = z.infer<typeof completeLessonSchema>;
export type CompleteCoursePlayerLessonInput = z.infer<typeof completeCoursePlayerLessonSchema>;
export type EnrollUserToCourseInput = z.infer<typeof enrollUserToCourseSchema>;
export type RevokeCourseAccessInput = z.infer<typeof revokeCourseAccessSchema>;
export type UpdateCoursePaymentSettingsInput = z.infer<typeof updateCoursePaymentSettingsSchema>;
export type UpdateCourseStorefrontSettingsInput = z.infer<typeof updateCourseStorefrontSettingsSchema>;
export type SubmitCoursePaymentProofInput = z.infer<typeof submitCoursePaymentProofSchema>;
export type ReviewCoursePaymentProofInput = z.infer<typeof reviewCoursePaymentProofSchema>;
export type EnrollFreeCourseInput = z.infer<typeof enrollFreeCourseSchema>;
