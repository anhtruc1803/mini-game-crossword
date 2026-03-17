/**
 * Games — read operations.
 */

import { prisma } from "@/lib/db/prisma";
import { mapPrismaToGame, mapPrismaToCrosswordRow, mapPrismaToGameEvent } from "./mapper";
import type { Game, CrosswordRow, GameEvent } from "./types";

export async function getGameByProgramId(programId: string): Promise<Game | null> {
  const row = await prisma.game.findFirst({
    where: { programId },
    orderBy: { createdAt: "desc" },
  });
  return row ? mapPrismaToGame(row) : null;
}

export async function getGameById(id: string): Promise<Game | null> {
  const row = await prisma.game.findUnique({ where: { id } });
  return row ? mapPrismaToGame(row) : null;
}

export async function getGameRows(gameId: string): Promise<CrosswordRow[]> {
  const rows = await prisma.crosswordRow.findMany({
    where: { gameId },
    orderBy: { rowOrder: "asc" },
  });
  return rows.map(mapPrismaToCrosswordRow);
}

export async function getRowById(id: string): Promise<CrosswordRow | null> {
  const row = await prisma.crosswordRow.findUnique({ where: { id } });
  return row ? mapPrismaToCrosswordRow(row) : null;
}

export async function getGameEvents(
  gameId: string,
  limit = 20
): Promise<GameEvent[]> {
  const rows = await prisma.gameEvent.findMany({
    where: { gameId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
  return rows.map(mapPrismaToGameEvent);
}
