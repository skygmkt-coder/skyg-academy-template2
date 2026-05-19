import { NextResponse } from "next/server";

import { requireUser } from "@/lib/engines/auth/helpers";
import { createSignedPaymentProofUpload } from "@/lib/engines/commerce/service";
import { paymentProofUploadSchema } from "@/lib/engines/commerce/validation";
import { readJsonBody, routeErrorResponse, validationErrorResponse } from "@/src/errors";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const auth = await requireUser();
    const body = await readJsonBody(request);
    const parsed = paymentProofUploadSchema.safeParse(body);

    if (!parsed.success) {
      return validationErrorResponse("Payload invalido.");
    }

    return NextResponse.json(await createSignedPaymentProofUpload(auth, parsed.data));
  } catch (error) {
    return routeErrorResponse(error, {
      context: { route: "POST /api/uploads/payment-proof" },
      fallbackMessage: "No pudimos crear la carga."
    });
  }
}
