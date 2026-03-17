/**
 * Games — write operations.
 */

import { prisma } from "@/lib/db/prisma";
import { mapPrismaToGame, mapPrismaToCrosswordRow, mapPrismaToGameEvent } from "./mapper";
import type { Game, CrosswordRow, GameEvent, GameStatus, RowStatus } from "./types";
import type { CreateGameInput, CreateRowInput, UpdateRowInput } from "./schemas";

// ── Game mutations ──────────────────────────────────────────

export async function insertGame(input: CreateGameInput): Promise<Game> {
  const row = await prisma.game.create({
    data: {
      programId: input.programId,
      title: input.title,
      subtitle: input.subtitle ?? null,
      finalKeyword: input.finalKeyword ?? null,
    },
  });
  return mapPrismaToGame(row);
}

export async function updateGameStatus(
  id: string,
  status: GameStatus
): Promise<Game> {
  const row = await prisma.game.update({
    where: { id },
    data: { gameStatus: status },
  });
  return mapPrismaToGame(row);
}

export async function updateGameCurrentRow(
  id: string,
  rowIndex: number | null
): Promise<Game> {
  const row = await prisma.game.update({
    where: { id },
    data: { currentRowIndex: rowIndex },
  });
  return mapPrismaToGame(row);
}

export async function updateGameAnnouncement(
  id: string,
  text: string | null
): Promise<Game> {
  const row = await prisma.game.update({
    where: { id },
    data: { announcementText: text },
  });
  return mapPrismaToGame(row);
}

export async function updateGameTotalRows(
  id: string,
  totalRows: number
): Promise<Game> {
  const row = await prisma.game.update({
    where: { id },
    data: { totalRows },
  });
  return mapPrismaToGame(row);
}

export async function deleteGameById(id: string): Promise<void> {
  await prisma.game.delete({ where: { id } });
}

// ── Row mutations ───────────────────────────────────────────

export async function insertRow(input: CreateRowInput): Promise<CrosswordRow> {
  const row = await prisma.crosswordRow.create({
    data: {
      gameId: input.gameId,
      rowOrder: input.rowOrder ?? 0,
      clueText: input.clueText,
      answerText: input.answerText,
      answerLength: input.answerText.length,
      highlightedIndexesJson: JSON.stringify(input.highlightedIndexes),
      noteText: input.noteText ?? null,
    },
  });
  return mapPrismaToCrosswordRow(row);
}

export async function updateRowById(
  id: string,
  input: UpdateRowInput
): Promise<CrosswordRow> {
  const data: Record<string, unknown> = {};
  if (input.rowOrder !== undefined) data.rowOrder = input.rowOrder;
  if (input.clueText !== undefined) data.clueText = input.clueText;
  if (input.answerText !== undefined) {
    data.answerText = input.answerText;
    data.answerLength = input.answerText.length;
  }
  if (input.highlightedIndexes !== undefined) {
    data.highlightedIndexesJson = JSON.stringify(input.highlightedIndexes);
  }
  if (input.noteText !== undefined) data.noteText = input.noteText;

  const row = await prisma.crosswordRow.update({
    where: { id },
    data,
  });
  return mapPrismaToCrosswordRow(row);
}

export async function updateRowStatus(
  id: string,
  status: RowStatus
): Promise<CrosswordRow> {
  const row = await prisma.crosswordRow.update({
    where: { id },
    data: { rowStatus: status },
  });
  return mapPrismaToCrosswordRow(row);
}

export async function resetAllRows(gameId: string): Promise<void> {
  await prisma.crosswordRow.updateMany({
    where: { gameId },
    data: { rowStatus: "hidden" },
  });
}

export async function deleteRowById(id: string): Promise<void> {
  await prisma.crosswordRow.delete({ where: { id } });
}

// ── Event mutations ─────────────────────────────────────────

export async function insertGameEvent(
  gameId: string,
  eventType: string,
  message: string,
  payload?: Record<string, unknown>
): Promise<GameEvent> {
  const row = await prisma.gameEvent.create({
    data: {
      gameId,
      eventType,
      message,
      payloadJson: payload ? JSON.stringify(payload) : null,
    },
  });
  return mapPrismaToGameEvent(row);
}
