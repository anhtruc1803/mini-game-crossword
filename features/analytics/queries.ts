import { prisma } from "@/lib/db/prisma";
import type { ProgramAnalyticsSummary, ProgramTrafficPoint } from "./types";

const ONLINE_VIEWER_WINDOW_MS = 45_000;
const TRAFFIC_BUCKET_COUNT = 12;
const TRAFFIC_BUCKET_MINUTES = 10;

function emptyTrend(): ProgramTrafficPoint[] {
  const formatter = new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return Array.from({ length: TRAFFIC_BUCKET_COUNT }, (_, index) => {
    const bucketTime = new Date(
      Date.now() - (TRAFFIC_BUCKET_COUNT - index - 1) * TRAFFIC_BUCKET_MINUTES * 60_000
    );

    return {
      label: formatter.format(bucketTime),
      count: 0,
    };
  });
}

function emptySummary(programId: string): ProgramAnalyticsSummary {
  return {
    programId,
    totalViewers: 0,
    totalPageViews: 0,
    onlineViewers: 0,
    lastSeenAt: null,
    trafficTrend: emptyTrend(),
  };
}

function buildTrafficTrend(
  timestamps: Date[],
  formatter: Intl.DateTimeFormat
): ProgramTrafficPoint[] {
  const bucketDurationMs = TRAFFIC_BUCKET_MINUTES * 60_000;
  const rangeMs = TRAFFIC_BUCKET_COUNT * bucketDurationMs;
  const now = Date.now();
  const rangeStart = now - rangeMs;

  const buckets = Array.from({ length: TRAFFIC_BUCKET_COUNT }, (_, index) => {
    const bucketStart = new Date(rangeStart + index * bucketDurationMs);
    return {
      label: formatter.format(bucketStart),
      count: 0,
    };
  });

  for (const timestamp of timestamps) {
    const diff = timestamp.getTime() - rangeStart;
    if (diff < 0) continue;

    const bucketIndex = Math.min(
      Math.floor(diff / bucketDurationMs),
      TRAFFIC_BUCKET_COUNT - 1
    );

    if (bucketIndex >= 0) {
      buckets[bucketIndex].count += 1;
    }
  }

  return buckets;
}

export async function listProgramAnalytics(
  programIds: string[]
): Promise<Record<string, ProgramAnalyticsSummary>> {
  if (programIds.length === 0) return {};

  const uniqueProgramIds = [...new Set(programIds)];
  const onlineThreshold = new Date(Date.now() - ONLINE_VIEWER_WINDOW_MS);
  const trafficThreshold = new Date(
    Date.now() - TRAFFIC_BUCKET_COUNT * TRAFFIC_BUCKET_MINUTES * 60_000
  );
  const formatter = new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const [totals, online, pageviews] = await Promise.all([
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
    prisma.viewerPageview.findMany({
      where: {
        programId: { in: uniqueProgramIds },
        createdAt: { gte: trafficThreshold },
      },
      select: {
        programId: true,
        createdAt: true,
      },
      orderBy: { createdAt: "asc" },
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
      trafficTrend: summaries[total.programId]?.trafficTrend ?? emptyTrend(),
    };
  }

  for (const active of online) {
    const existing = summaries[active.programId] ?? emptySummary(active.programId);
    summaries[active.programId] = {
      ...existing,
      onlineViewers: active._count._all,
    };
  }

  const trafficByProgram = new Map<string, Date[]>();
  for (const pageview of pageviews) {
    const list = trafficByProgram.get(pageview.programId) ?? [];
    list.push(pageview.createdAt);
    trafficByProgram.set(pageview.programId, list);
  }

  for (const programId of uniqueProgramIds) {
    const existing = summaries[programId] ?? emptySummary(programId);
    summaries[programId] = {
      ...existing,
      trafficTrend: buildTrafficTrend(trafficByProgram.get(programId) ?? [], formatter),
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
