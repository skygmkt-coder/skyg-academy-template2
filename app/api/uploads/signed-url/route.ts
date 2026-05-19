import { NextResponse } from "next/server";

import { createSignedCatalogUpload } from "@/lib/engines/catalog/upload-service";
import { signedUploadSchema } from "@/lib/engines/catalog/validation";
import { readJsonBody, routeErrorResponse, validationErrorResponse } from "@/src/errors";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await readJsonBody(request);
    const parsed = signedUploadSchema.safeParse(body);

    if (!parsed.success) {
      return validationErrorResponse("Payload invalido.");
    }

    const upload = await createSignedCatalogUpload(parsed.data);
    return NextResponse.json(upload);
  } catch (error) {
    return routeErrorResponse(error, {
      context: { route: "POST /api/uploads/signed-url" },
      fallbackMessage: "No pudimos crear la carga."
    });
  }
}
