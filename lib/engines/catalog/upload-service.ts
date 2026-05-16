import crypto from "node:crypto";

import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/engines/auth/helpers";
import type { SignedUploadInput } from "@/lib/engines/catalog/validation";

const bucket = "catalog-assets";

export async function createSignedCatalogUpload(input: SignedUploadInput): Promise<{
  bucket: string;
  path: string;
  token: string;
  signedUrl: string;
  publicUrl: string;
}> {
  await requireAdmin();

  const supabase = await createClient();
  const extension = input.fileName.split(".").pop()?.toLowerCase() ?? "bin";
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
