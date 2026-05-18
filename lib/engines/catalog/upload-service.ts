import crypto from "node:crypto";

import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/engines/auth/helpers";
import type { SignedUploadInput } from "@/lib/engines/catalog/validation";

const bucket = "catalog-assets";

const extensionByContentType: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "application/pdf": "pdf",
  "application/zip": "zip",
  "text/plain": "txt"
};

export async function createSignedCatalogUpload(input: SignedUploadInput): Promise<{
  bucket: string;
  path: string;
  token: string;
  signedUrl: string;
  publicUrl: string;
}> {
  await requireAdmin();

  const supabase = await createClient();
  const extension = extensionByContentType[input.contentType];

  if (!extension) {
    throw new Error("Tipo de archivo no permitido.");
  }

  const folder = input.intent === "cover-image" ? "covers" : "resources";
  const path = `${folder}/${crypto.randomUUID()}.${extension}`;

  const { data, error } = await supabase.storage.from(bucket).createSignedUploadUrl(path);

  if (error || !data) {
    throw new Error(error?.message ?? "No pudimos crear la URL de carga.");
  }

  const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(path);

  return {
    bucket,
    path,
    token: data.token,
    signedUrl: data.signedUrl,
    publicUrl: publicUrlData.publicUrl
  };
}
