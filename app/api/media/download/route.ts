import { NextResponse } from "next/server";

import { createSignedMediaReadUrl } from "@/lib/courses/media";
import { requireUser } from "@/lib/engines/auth/helpers";
import { routeErrorResponse, ValidationError } from "@/src/errors";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const bucket = url.searchParams.get("bucket") ?? "";
    const path = url.searchParams.get("path") ?? "";
    const courseId = url.searchParams.get("courseId") ?? "";

    if (!bucket || !path || !courseId) {
      throw new ValidationError("Archivo invalido.");
    }

    const auth = await requireUser();
    const signedUrl = await createSignedMediaReadUrl({ auth, bucket, path, courseId });
    return NextResponse.redirect(signedUrl);
  } catch (error) {
    return routeErrorResponse(error, {
      context: { route: "GET /api/media/download" },
      fallbackMessage: "No pudimos abrir el archivo.",
      fallbackStatus: 403
    });
  }
}
