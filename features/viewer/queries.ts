/**
 * Viewer queries assemble the full public game snapshot for display.
 * Public snapshots must never expose unrevealed answers or the final keyword early.
 *
 * Uses Prisma `include` to fetch program + theme + game + rows + events
 * in a single query instead of 5 sequential round-trips.
 */

import { prisma } from "@/lib/db/prisma";
import { GAME_STATUS, ROW_STATUS } from "@/features/games/constants";
import { mapPrismaToProgram } from "@/features/programs/mapper";
import { mapPrismaToTheme } from "@/features/themes/mapper";
import {
  mapPrismaToGame,
  mapPrismaToCrosswordRow,
  mapPrismaToGameEvent,
} from "@/features/games/mapper";
import { buildFinalKeywordHint } from "@/features/games/selectors";
import type { PublicViewerSnapshot } from "./view-model";

const VIEWER_SNAPSHOT_CACHE_TTL_MS = 2000;
const globalForViewerSnapshotCache = globalThis as typeof globalThis & {
  viewerSnapshotCache?: Map<
    string,
    { expiresAt: number; snapshot: PublicViewerSnapshot | null }
  >;
};

const viewerSnapshotCache =
  globalForViewerSnapshotCache.viewerSnapshotCache ??
  new Map<string, { expiresAt: number; snapshot: PublicViewerSnapshot | null }>();

if (!globalForViewerSnapshotCache.viewerSnapshotCache) {
  globalForViewerSnapshotCache.viewerSnapshotCache = viewerSnapshotCache;
}

export async function getViewerSnapshot(
  programSlug: string
): Promise<PublicViewerSnapshot | null> {
  const cachedSnapshot = viewerSnapshotCache.get(programSlug);
  if (cachedSnapshot && cachedSnapshot.expiresAt > Date.now()) {
    return cachedSnapshot.snapshot;
  }

  // Single query with JOINs instead of 5 sequential queries
  const prismaProgram = await prisma.program.findUnique({
    where: { slug: programSlug },
    include: {
      theme: true,
      games: {
        orderBy: { createdAt: "desc" },
        take: 1,
        include: {
          rows: { orderBy: { rowOrder: "asc" } },
          events: { orderBy: { createdAt: "desc" }, take: 20 },
        },
      },
    },
  });

  if (!prismaProgram) {
    viewerSnapshotCache.set(programSlug, {
      expiresAt: Date.now() + VIEWER_SNAPSHOT_CACHE_TTL_MS,
      snapshot: null,
    });
    return null;
  }

  const program = mapPrismaToProgram(prismaProgram);
  const theme = prismaProgram.theme ? mapPrismaToTheme(prismaProgram.theme) : null;
  const prismaGame = prismaProgram.games[0] ?? null;

  if (!prismaGame) {
    const emptySnapshot: PublicViewerSnapshot = {
      program,
      theme,
      game: null,
      rows: [],
      activeRowIndex: null,
      events: [],
      finalKeywordHint: [],
      finalKeyword: null,
    };

    viewerSnapshotCache.set(programSlug, {
      expiresAt: Date.now() + VIEWER_SNAPSHOT_CACHE_TTL_MS,
      snapshot: emptySnapshot,
    });

    return emptySnapshot;
  }

  const game = mapPrismaToGame(prismaGame);
  const rows = prismaGame.rows.map(mapPrismaToCrosswordRow);
  const events = prismaGame.events.map(mapPrismaToGameEvent);

  const snapshot: PublicViewerSnapshot = {
    program,
    theme,
    game: {
      id: game.id,
      title: game.title,
      subtitle: game.subtitle,
      gameStatus: game.gameStatus,
      announcementText: game.announcementText,
    },
    rows: rows.map((row) => ({
      id: row.id,
      rowOrder: row.rowOrder,
      clueText: row.clueText,
      answerText:
        row.rowStatus === ROW_STATUS.ANSWER_REVEALED ? row.answerText : null,
      answerLength: row.answerLength,
      highlightedIndexes: row.highlightedIndexes,
      rowStatus: row.rowStatus,
    })),
    activeRowIndex: game.currentRowIndex,
    events,
    finalKeywordHint: buildFinalKeywordHint(
      rows.map((row) => ({
        answerText:
          row.rowStatus === ROW_STATUS.ANSWER_REVEALED ? row.answerText : "",
        highlightedIndexes: row.highlightedIndexes,
        rowStatus: row.rowStatus,
      }))
    ),
    finalKeyword:
      game.gameStatus === GAME_STATUS.ENDED ? game.finalKeyword : null,
  };

  viewerSnapshotCache.set(programSlug, {
    expiresAt: Date.now() + VIEWER_SNAPSHOT_CACHE_TTL_MS,
    snapshot,
  });

  return snapshot;
}
