import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { trackViewerActivity } from "@/features/analytics/service";
import { AppError } from "@/lib/security/errors";
import { getClientIp, getUserAgent } from "@/lib/security/request";
import { assertRateLimit } from "@/lib/security/rate-limit";

const viewerAnalyticsSchema = z.object({
  programSlug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/),
  sessionId: z.string().min(16).max(128).regex(/^[a-zA-Z0-9-]+$/),
  pathname: z.string().min(1).max(200).optional().nullable(),
  eventType: z.enum(["pageview", "heartbeat"]),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = viewerAnalyticsSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid analytics payload" }, { status: 400 });
    }

    await assertRateLimit({
      namespace: "viewer:analytics",
      key: `${getClientIp(request.headers)}:${parsed.data.programSlug}`,
      limit: 240,
      windowSeconds: 60,
    });

    await trackViewerActivity({
      ...parsed.data,
      ipAddress: getClientIp(request.headers),
      userAgent: getUserAgent(request.headers),
    });

    return NextResponse.json({ ok: true }, { status: 202 });
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(
        { error: error.expose ? error.message : "Internal error" },
        { status: error.status }
      );
    }

    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
