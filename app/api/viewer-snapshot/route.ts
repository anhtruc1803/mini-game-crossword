import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getViewerSnapshot } from "@/features/viewer/queries";
import { getClientIp } from "@/lib/security/request";
import { assertRateLimit } from "@/lib/security/rate-limit";

const viewerSnapshotSchema = z.object({
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/),
});

export async function GET(request: NextRequest) {
  const parsed = viewerSnapshotSchema.safeParse({
    slug: request.nextUrl.searchParams.get("slug"),
  });

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid slug" }, { status: 400 });
  }

  try {
    await assertRateLimit({
      namespace: "viewer:snapshot",
      key: `${getClientIp(request.headers)}:${parsed.data.slug}`,
      limit: 120,
      windowSeconds: 60,
    });

    const snapshot = await getViewerSnapshot(parsed.data.slug);
    if (!snapshot) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(
      { snapshot },
      {
        headers: {
          "Cache-Control": "public, s-maxage=2, stale-while-revalidate=5",
        },
      }
    );
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
