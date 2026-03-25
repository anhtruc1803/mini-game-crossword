import { createHash } from "crypto";
import { prisma } from "@/lib/db/prisma";

type TrackViewerActivityInput = {
  programSlug: string;
  sessionId: string;
  pathname?: string | null;
  eventType: "pageview" | "heartbeat";
  userAgent?: string | null;
  ipAddress?: string | null;
};

function hashIpAddress(ipAddress: string | null | undefined) {
  if (!ipAddress || ipAddress === "unknown") return null;
  return createHash("sha256").update(ipAddress).digest("hex");
}

export async function trackViewerActivity(input: TrackViewerActivityInput) {
  const program = await prisma.program.findUnique({
    where: { slug: input.programSlug },
    select: { id: true },
  });

  if (!program) return null;

  const now = new Date();
  const sessionKey = {
    programId_sessionId: {
      programId: program.id,
      sessionId: input.sessionId,
    },
  };

  const existingSession = await prisma.viewerSession.findUnique({
    where: sessionKey,
    select: { id: true },
  });

  const sharedData = {
    lastSeenAt: now,
    lastPath: input.pathname?.slice(0, 255) ?? null,
    userAgent: input.userAgent?.slice(0, 255) ?? null,
    ipHash: hashIpAddress(input.ipAddress),
  };

  if (existingSession) {
    await prisma.viewerSession.update({
      where: sessionKey,
      data: {
        ...sharedData,
        ...(input.eventType === "pageview" ? { pageViews: { increment: 1 } } : {}),
      },
    });
  } else {
    await prisma.viewerSession.create({
      data: {
        programId: program.id,
        sessionId: input.sessionId,
        pageViews: 1,
        firstSeenAt: now,
        ...sharedData,
      },
    });
  }

  if (input.eventType === "pageview") {
    await prisma.viewerPageview.create({
      data: {
        programId: program.id,
        sessionId: input.sessionId,
        path: input.pathname?.slice(0, 255) ?? null,
        createdAt: now,
      },
    });
  }

  return program.id;
}
