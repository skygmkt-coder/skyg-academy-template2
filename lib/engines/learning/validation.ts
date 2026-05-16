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

export type GrantEnrollmentInput = z.infer<typeof grantEnrollmentSchema>;
export type RevokeEnrollmentInput = z.infer<typeof revokeEnrollmentSchema>;
export type CompleteLessonInput = z.infer<typeof completeLessonSchema>;
