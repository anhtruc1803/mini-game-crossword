import { prisma } from "@/lib/db/prisma";
import type { ProgramAnalyticsSummary } from "./types";

const ONLINE_VIEWER_WINDOW_MS = 45_000;

function emptySummary(programId: string): ProgramAnalyticsSummary {
  return {
    programId,
    totalViewers: 0,
    totalPageViews: 0,
    onlineViewers: 0,
    lastSeenAt: null,
  };
}

export async function listProgramAnalytics(
  programIds: string[]
): Promise<Record<string, ProgramAnalyticsSummary>> {
  if (programIds.length === 0) return {};

  const uniqueProgramIds = [...new Set(programIds)];
  const onlineThreshold = new Date(Date.now() - ONLINE_VIEWER_WINDOW_MS);

  const [totals, online] = await Promise.all([
    prisma.viewerSession.groupBy({
      by: ["programId"],
      where: { programId: { in: uniqueProgramIds } },
      _count: { _all: true },
      _sum: { pageViews: true },
      _max: { lastSeenAt: true },
    }),
    prisma.viewerSession.groupBy({
      by: ["programId"],
      where: {
        programId: { in: uniqueProgramIds },
        lastSeenAt: { gte: onlineThreshold },
      },
      _count: { _all: true },
    }),
  ]);

  const summaries: Record<string, ProgramAnalyticsSummary> = Object.fromEntries(
    uniqueProgramIds.map((programId) => [programId, emptySummary(programId)])
  );

  for (const total of totals) {
    summaries[total.programId] = {
      programId: total.programId,
      totalViewers: total._count._all,
      totalPageViews: total._sum.pageViews ?? 0,
      onlineViewers: summaries[total.programId]?.onlineViewers ?? 0,
      lastSeenAt: total._max.lastSeenAt?.toISOString() ?? null,
    };
  }

  for (const active of online) {
    const existing = summaries[active.programId] ?? emptySummary(active.programId);
    summaries[active.programId] = {
      ...existing,
      onlineViewers: active._count._all,
    };
  }

  return summaries;
}

export async function getProgramAnalytics(
  programId: string
): Promise<ProgramAnalyticsSummary> {
  const result = await listProgramAnalytics([programId]);
  return result[programId] ?? emptySummary(programId);
}
