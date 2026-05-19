import { z } from "zod";

export const enrollmentStatusSchema = z.enum(["active", "expired", "revoked"]);

export const grantEnrollmentSchema = z.object({
  productId: z.string().uuid(),
  userId: z.string().uuid(),
  expiresAt: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value ? value : null)),
  grantedReason: z
    .string()
    .trim()
    .max(500, "El motivo es demasiado largo")
    .optional()
    .transform((value) => (value ? value : null))
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
  paymentReference: z
    .string()
    .trim()
    .max(180, "La referencia es demasiado larga")
    .optional()
    .transform((value) => (value ? value : null))
});

export const revokeCourseAccessSchema = z.object({
  courseId: z.string().uuid(),
  enrollmentId: z.string().uuid()
});

export type GrantEnrollmentInput = z.infer<typeof grantEnrollmentSchema>;
export type RevokeEnrollmentInput = z.infer<typeof revokeEnrollmentSchema>;
export type CompleteLessonInput = z.infer<typeof completeLessonSchema>;
export type CompleteCoursePlayerLessonInput = z.infer<typeof completeCoursePlayerLessonSchema>;
export type EnrollUserToCourseInput = z.infer<typeof enrollUserToCourseSchema>;
export type RevokeCourseAccessInput = z.infer<typeof revokeCourseAccessSchema>;
