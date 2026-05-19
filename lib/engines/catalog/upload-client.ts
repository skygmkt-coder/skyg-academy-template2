"use client";

import { createClient } from "@/lib/supabase/client";
import type { SignedUploadIntent } from "@/lib/engines/catalog/types";
import { APP_ROUTES } from "@/src/config";

export async function uploadCatalogAsset(input: {
  intent: SignedUploadIntent;
  file: File;
}): Promise<string> {
  const response = await fetch(APP_ROUTES.uploadCatalogAsset, {
    method: "POST",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify({
      intent: input.intent,
      fileName: input.file.name,
      contentType: input.file.type,
      size: input.file.size
    })
  });

  if (!response.ok) {
    throw new Error("No pudimos preparar la carga del archivo.");
  }

  const payload = (await response.json()) as {
    bucket: string;
    path: string;
    token: string;
    publicUrl: string;
  };

  const supabase = createClient();
  const { error } = await supabase.storage
    .from(payload.bucket)
    .uploadToSignedUrl(payload.path, payload.token, input.file, {
      contentType: input.file.type
    });

  if (error) {
    throw new Error(error.message);
  }

  return payload.publicUrl;
}
