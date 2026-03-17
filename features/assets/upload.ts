/**
 * Assets file upload logic — local filesystem storage.
 */

import fs from "fs/promises";
import path from "path";
import { AppError } from "@/lib/security/errors";

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(["image/png", "image/jpeg", "image/webp"]);
const SAFE_BUCKET_PATTERN = /^[a-z0-9][a-z0-9-_]*$/i;

/** Root directory for uploaded files (relative to project root). */
const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads");
const DATA_UPLOADS_DIR = path.join(process.cwd(), "data", "uploads");

function validateImage(file: File) {
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    throw new AppError("Only PNG, JPEG, and WebP images are allowed.");
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    throw new AppError("Image exceeds the 5MB upload limit.");
  }
}

async function ensureDir(dir: string) {
  await fs.mkdir(dir, { recursive: true });
}

function resolveUploadPaths(bucket: string, filePath: string) {
  if (!SAFE_BUCKET_PATTERN.test(bucket)) {
    throw new AppError("Invalid upload bucket.", "invalid_bucket", 400);
  }

  const roots = [UPLOADS_DIR, DATA_UPLOADS_DIR].map((root) => path.resolve(root, bucket));
  const targets = roots.map((bucketRoot) => {
    const targetPath = path.resolve(bucketRoot, filePath);

    if (!targetPath.startsWith(`${bucketRoot}${path.sep}`) && targetPath !== bucketRoot) {
      throw new AppError("Invalid upload path.", "invalid_upload_path", 400);
    }

    return {
      bucketRoot,
      targetPath,
    };
  });

  return targets;
}

export async function uploadImage(file: File, bucket: string, filePath: string): Promise<string> {
  validateImage(file);

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  for (const { bucketRoot, targetPath } of resolveUploadPaths(bucket, filePath)) {
    const fullDir = path.join(bucketRoot, path.dirname(filePath));
    await ensureDir(fullDir);
    await fs.writeFile(targetPath, buffer);
  }

  return `/media/${bucket}/${filePath}`;
}

export async function deleteImage(bucket: string, filePath: string): Promise<void> {
  for (const { targetPath } of resolveUploadPaths(bucket, filePath)) {
    try {
      await fs.unlink(targetPath);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
        throw new AppError(`Failed to delete image: ${(error as Error).message}`, "delete_failed", 500, false);
      }
    }
  }
}
