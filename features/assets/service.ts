/**
 * Assets service layer for secure asset management.
 */

import { createSupabaseServiceRole } from "@/lib/supabase/service-role";
import { AppError } from "@/lib/security/errors";
import { deleteImage, uploadImage } from "./upload";

export async function uploadThemeAsset(file: File, bucket: string, path: string) {
  const storedPath = await uploadImage(file, bucket, path);
  const supabase = createSupabaseServiceRole();
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(storedPath, 60 * 60);

  if (error || !data?.signedUrl) {
    throw new AppError("Failed to create signed URL for uploaded asset", "signed_url_failed", 500, false);
  }

  return {
    path: storedPath,
    signedUrl: data.signedUrl,
  };
}

export async function removeThemeAsset(bucket: string, path: string) {
  await deleteImage(bucket, path);
}

export async function getSignedAssetUrl(bucket: string, path: string, expiresIn = 3600) {
  const supabase = createSupabaseServiceRole();
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, expiresIn);

  if (error || !data?.signedUrl) {
    throw new AppError("Failed to create signed asset URL", "signed_url_failed", 500, false);
  }

  return data.signedUrl;
}
