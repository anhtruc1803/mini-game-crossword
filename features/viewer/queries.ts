/**
 * Viewer queries assemble the full public game snapshot for display.
 * Public snapshots must never expose unrevealed answers or the final keyword early.
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

  const prismaProgram = await prisma.program.findUnique({
    where: { slug: programSlug },
  });

  if (!prismaProgram) {
    viewerSnapshotCache.set(programSlug, {
      expiresAt: Date.now() + VIEWER_SNAPSHOT_CACHE_TTL_MS,
      snapshot: null,
    });
    return null;
  }

  const program = mapPrismaToProgram(prismaProgram);

  let theme = null;
  if (prismaProgram.themeId) {
    const prismaTheme = await prisma.theme.findUnique({
      where: { id: prismaProgram.themeId },
    });
    theme = prismaTheme ? mapPrismaToTheme(prismaTheme) : null;
  }

  const prismaGame = await prisma.game.findFirst({
    where: { programId: prismaProgram.id },
    orderBy: { createdAt: "desc" },
  });

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

  const prismaRows = await prisma.crosswordRow.findMany({
    where: { gameId: prismaGame.id },
    orderBy: { rowOrder: "asc" },
  });
  const rows = prismaRows.map(mapPrismaToCrosswordRow);

  const prismaEvents = await prisma.gameEvent.findMany({
    where: { gameId: prismaGame.id },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
  const events = prismaEvents.map(mapPrismaToGameEvent);

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
