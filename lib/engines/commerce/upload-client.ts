"use client";

import { createClient } from "@/lib/supabase/client";
import { APP_ROUTES } from "@/src/config";

export async function uploadPaymentProof(file: File): Promise<string> {
  const response = await fetch(APP_ROUTES.uploadPaymentProof, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ fileName: file.name, contentType: file.type, size: file.size })
  });

  if (!response.ok) throw new Error("No pudimos preparar la carga del comprobante.");
  const payload = (await response.json()) as { bucket: string; path: string; token: string; proofUrl: string };
  const supabase = createClient();
  const { error } = await supabase.storage.from(payload.bucket).uploadToSignedUrl(payload.path, payload.token, file, { contentType: file.type });
  if (error) throw new Error(error.message);
  return payload.proofUrl;
}
