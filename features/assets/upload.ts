/**
 * Assets file upload logic for Supabase Storage.
 */

import { createSupabaseServiceRole } from "@/lib/supabase/service-role";
import { AppError } from "@/lib/security/errors";

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(["image/png", "image/jpeg", "image/webp"]);

function validateImage(file: File) {
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    throw new AppError("Only PNG, JPEG, and WebP images are allowed.");
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    throw new AppError("Image exceeds the 5MB upload limit.");
  }
}

export async function uploadImage(file: File, bucket: string, path: string) {
  validateImage(file);

  const supabase = createSupabaseServiceRole();
  const arrayBuffer = await file.arrayBuffer();
  const { error } = await supabase.storage.from(bucket).upload(path, arrayBuffer, {
    contentType: file.type,
    cacheControl: "3600",
    upsert: false,
  });

  if (error) {
    throw new AppError(`Failed to upload image: ${error.message}`, "upload_failed", 500, false);
  }

  return path;
}

export async function deleteImage(bucket: string, path: string) {
  const supabase = createSupabaseServiceRole();
  const { error } = await supabase.storage.from(bucket).remove([path]);

  if (error) {
    throw new AppError(`Failed to delete image: ${error.message}`, "delete_failed", 500, false);
  }
}
