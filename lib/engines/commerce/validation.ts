import { z } from "zod";

export const paymentMethodSchema = z.enum(["transferencia", "dimo"]);

export const submitManualPaymentSchema = z.object({
  productId: z.string().uuid(),
  productSlug: z.string().min(1),
  method: paymentMethodSchema,
  proofUrl: z.string().trim().min(1, "Sube tu comprobante")
});

export const approvePaymentSchema = z.object({
  paymentId: z.string().uuid()
});

export const rejectPaymentSchema = z.object({
  paymentId: z.string().uuid(),
  rejectionReason: z.string().trim().min(3, "Agrega un motivo").max(500)
});

const paymentProofContentTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf"
] as const;

export const paymentProofUploadSchema = z.object({
  fileName: z.string().trim().min(1).max(180),
  contentType: z.enum(paymentProofContentTypes, {
    errorMap: () => ({ message: "Formato de comprobante no permitido" })
  })
});

export type SubmitManualPaymentInput = z.infer<typeof submitManualPaymentSchema>;
export type ApprovePaymentInput = z.infer<typeof approvePaymentSchema>;
export type RejectPaymentInput = z.infer<typeof rejectPaymentSchema>;
export type PaymentProofUploadInput = z.infer<typeof paymentProofUploadSchema>;
