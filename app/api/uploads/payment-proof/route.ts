import { NextResponse } from "next/server";

import { requireUser } from "@/lib/engines/auth/helpers";
import { createSignedPaymentProofUpload } from "@/lib/engines/commerce/service";
import { paymentProofUploadSchema } from "@/lib/engines/commerce/validation";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const auth = await requireUser();
  const body: unknown = await request.json();
  const parsed = paymentProofUploadSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ message: "Payload invalido." }, { status: 400 });
  try {
    return NextResponse.json(await createSignedPaymentProofUpload(auth, parsed.data));
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : "No pudimos crear la carga." }, { status: 500 });
  }
}
