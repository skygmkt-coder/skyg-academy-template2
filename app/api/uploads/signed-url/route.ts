import { NextResponse } from "next/server";

import { createSignedCatalogUpload } from "@/lib/engines/catalog/upload-service";
import { signedUploadSchema } from "@/lib/engines/catalog/validation";

export async function POST(request: Request) {
  const body: unknown = await request.json();
  const parsed = signedUploadSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ message: "Payload invalido." }, { status: 400 });
  }

  try {
    const upload = await createSignedCatalogUpload(parsed.data);
    return NextResponse.json(upload);
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "No pudimos crear la carga." },
      { status: 500 }
    );
  }
}
