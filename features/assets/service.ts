/**
 * Assets service layer for local filesystem-backed theme assets.
 */

import { deleteImage, uploadImage } from "./upload";

export async function uploadThemeAsset(file: File, bucket: string, path: string) {
  const publicUrl = await uploadImage(file, bucket, path);

  return {
    path,
    signedUrl: publicUrl,
  };
}

export async function removeThemeAsset(bucket: string, path: string) {
  await deleteImage(bucket, path);
}

export async function getSignedAssetUrl(bucket: string, path: string) {
  return `/media/${bucket}/${path}`;
}
