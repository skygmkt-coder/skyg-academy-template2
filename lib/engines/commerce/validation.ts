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

const paymentProofExtensions = ["jpg", "jpeg", "png", "webp", "pdf"] as const;

function extensionFromFileName(fileName: string): string {
  return fileName.split(".").pop()?.toLowerCase() ?? "";
}

export const paymentProofUploadSchema = z
  .object({
    fileName: z.string().trim().min(1).max(180),
    contentType: z.enum(paymentProofContentTypes, {
      errorMap: () => ({ message: "Formato de comprobante no permitido" })
    }),
    size: z.number().int().positive().max(10 * 1024 * 1024).optional()
  })
  .superRefine((value, context) => {
    const extension = extensionFromFileName(value.fileName);

    if (!paymentProofExtensions.includes(extension as never)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Extension de comprobante no permitida",
        path: ["fileName"]
      });
    }
  });

export type SubmitManualPaymentInput = z.infer<typeof submitManualPaymentSchema>;
export type ApprovePaymentInput = z.infer<typeof approvePaymentSchema>;
export type RejectPaymentInput = z.infer<typeof rejectPaymentSchema>;
export type PaymentProofUploadInput = z.infer<typeof paymentProofUploadSchema>;
