import { getServerSupabaseClient } from "@/src/services/supabase";

export type SignedUploadResult = {
  token: string;
  signedUrl: string;
};

export async function createStorageSignedUpload(input: {
  bucket: string;
  path: string;
  errorMessage: string;
}): Promise<SignedUploadResult> {
  const supabase = await getServerSupabaseClient();
  const { data, error } = await supabase.storage.from(input.bucket).createSignedUploadUrl(input.path);

  if (error || !data) {
    throw new Error(error?.message ?? input.errorMessage);
  }

  return { token: data.token, signedUrl: data.signedUrl };
}

export async function createStorageSignedReadUrl(input: {
  bucket: string;
  path: string;
  expiresIn: number;
  errorMessage: string;
}): Promise<string> {
  const supabase = await getServerSupabaseClient();
  const { data, error } = await supabase.storage.from(input.bucket).createSignedUrl(input.path, input.expiresIn);

  if (error || !data) {
    throw new Error(error?.message ?? input.errorMessage);
  }

  return data.signedUrl;
}

export async function removeStorageObjects(input: {
  bucket: string;
  paths: string[];
}): Promise<void> {
  const supabase = await getServerSupabaseClient();
  const { error } = await supabase.storage.from(input.bucket).remove(input.paths);

  if (error) {
    throw new Error(error.message);
  }
}

export async function getPublicStorageUrl(input: { bucket: string; path: string }): Promise<string> {
  const supabase = await getServerSupabaseClient();
  return supabase.storage.from(input.bucket).getPublicUrl(input.path).data.publicUrl;
}
