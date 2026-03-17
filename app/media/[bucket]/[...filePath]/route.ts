import fs from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";

const MIME_TYPES: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
};

function resolveCandidatePaths(bucket: string, filePath: string) {
  const safeRelativePath = filePath.replace(/\\/g, "/");
  const roots = [
    path.join(process.cwd(), "data", "uploads", bucket),
    path.join(process.cwd(), "public", "uploads", bucket),
  ];

  return roots.map((bucketRoot) => {
    const resolvedRoot = path.resolve(bucketRoot);
    const absolutePath = path.resolve(resolvedRoot, safeRelativePath);

    if (!absolutePath.startsWith(`${resolvedRoot}${path.sep}`) && absolutePath !== resolvedRoot) {
      throw new Error("Invalid asset path");
    }

    return absolutePath;
  });
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ bucket: string; filePath: string[] }> }
) {
  const { bucket, filePath } = await context.params;
  const joinedPath = filePath.join("/");

  try {
    const candidates = resolveCandidatePaths(bucket, joinedPath);

    for (const candidate of candidates) {
      try {
        const file = await fs.readFile(candidate);
        const ext = path.extname(candidate).toLowerCase();

        return new NextResponse(file, {
          headers: {
            "Content-Type": MIME_TYPES[ext] ?? "application/octet-stream",
            "Cache-Control": "public, max-age=31536000, immutable",
          },
        });
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
          throw error;
        }
      }
    }

    return new NextResponse("Not Found", { status: 404 });
  } catch {
    return new NextResponse("Not Found", { status: 404 });
  }
}
