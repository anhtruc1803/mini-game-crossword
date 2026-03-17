/**
 * Games — data mapping between Prisma models and domain types.
 *
 * With Prisma's @map directives, most fields are already camelCase.
 * The mapper handles JSON string fields that need parsing.
 */

import type { Game as PrismaGame, CrosswordRow as PrismaRow, GameEvent as PrismaEvent } from "@prisma/client";
import type { Game, CrosswordRow, GameEvent } from "./types";

export function mapPrismaToGame(row: PrismaGame): Game {
  return {
    id: row.id,
    programId: row.programId,
    title: row.title,
    subtitle: row.subtitle,
    finalKeyword: row.finalKeyword,
    totalRows: row.totalRows,
    currentRowIndex: row.currentRowIndex,
    gameStatus: row.gameStatus as Game["gameStatus"],
    announcementText: row.announcementText,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function mapPrismaToCrosswordRow(row: PrismaRow): CrosswordRow {
  let indexes: number[] = [];
  try {
    indexes = JSON.parse(row.highlightedIndexesJson) as number[];
  } catch {
    indexes = [];
  }

  return {
    id: row.id,
    gameId: row.gameId,
    rowOrder: row.rowOrder,
    clueText: row.clueText,
    answerText: row.answerText,
    answerLength: row.answerLength,
    highlightedIndexes: indexes,
    rowStatus: row.rowStatus as CrosswordRow["rowStatus"],
    noteText: row.noteText,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function mapPrismaToGameEvent(row: PrismaEvent): GameEvent {
  let payload: Record<string, unknown> | null = null;
  try {
    if (row.payloadJson) {
      payload = JSON.parse(row.payloadJson) as Record<string, unknown>;
    }
  } catch {
    payload = null;
  }

  return {
    id: row.id,
    gameId: row.gameId,
    eventType: row.eventType,
    message: row.message,
    payloadJson: payload,
    createdAt: row.createdAt.toISOString(),
    createdBy: row.createdBy,
  };
}

// Keep legacy aliases for backward compatibility with tests
export const mapDbRowToGame = mapPrismaToGame as (row: unknown) => Game;
export const mapDbRowToCrosswordRow = mapPrismaToCrosswordRow as (row: unknown) => CrosswordRow;
export const mapDbRowToGameEvent = mapPrismaToGameEvent as (row: unknown) => GameEvent;
