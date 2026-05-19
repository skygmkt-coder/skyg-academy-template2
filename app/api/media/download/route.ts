import { NextResponse } from "next/server";

import { createSignedMediaReadUrl } from "@/lib/courses/media";
import { requireUser } from "@/lib/engines/auth/helpers";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const bucket = url.searchParams.get("bucket") ?? "";
  const path = url.searchParams.get("path") ?? "";
  const courseId = url.searchParams.get("courseId") ?? "";

  if (!bucket || !path || !courseId) {
    return NextResponse.json({ message: "Archivo invalido." }, { status: 400 });
  }

  try {
    const auth = await requireUser();
    const signedUrl = await createSignedMediaReadUrl({ auth, bucket, path, courseId });
    return NextResponse.redirect(signedUrl);
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "No pudimos abrir el archivo." },
      { status: 403 }
    );
  }
}
