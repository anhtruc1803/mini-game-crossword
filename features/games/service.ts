/**
 * Games business logic and orchestration.
 * All game state transitions must go through this service.
 *
 * Multi-step mutations use Prisma interactive transactions to ensure
 * atomicity and prevent race conditions.
 */

import { prisma } from "@/lib/db/prisma";
import { APP_CONFIG } from "@/lib/constants/app-config";
import { AppError } from "@/lib/security/errors";
import { mapPrismaToGame, mapPrismaToCrosswordRow } from "./mapper";
import {
  createGameSchema,
  createRowSchema,
  updateRowSchema,
} from "./schemas";
import type { CreateGameInput, CreateRowInput, UpdateRowInput } from "./schemas";
import type { CrosswordRow, Game, GameStatus, RowStatus } from "./types";
import {
  EVENT_TYPES,
  GAME_STATUS,
  GAME_STATUS_TRANSITIONS,
  ROW_STATUS,
  ROW_STATUS_TRANSITIONS,
} from "./constants";
import { getGameById, getGameRows, getRowById } from "./queries";
import {
  deleteGameById,
  deleteRowById,
  insertGame,
  insertRow,
  updateRowById,
} from "./mutations";

/** Maximum number of events to keep per game. */
const MAX_EVENTS_PER_GAME = 500;

function assertGameTransition(current: string, next: string) {
  const allowed = GAME_STATUS_TRANSITIONS[current];
  if (!allowed?.includes(next)) {
    throw new AppError(`Invalid game transition: "${current}" -> "${next}"`);
  }
}

function assertRowTransition(current: string, next: string) {
  const allowed = ROW_STATUS_TRANSITIONS[current];
  if (!allowed?.includes(next)) {
    throw new AppError(`Invalid row transition: "${current}" -> "${next}"`);
  }
}

async function requireGame(id: string) {
  const game = await getGameById(id);
  if (!game) {
    throw new AppError("Game not found", "game_not_found", 404);
  }

  return game;
}

function getCurrentRow(rows: CrosswordRow[], currentRowIndex: number | null) {
  if (currentRowIndex === null) {
    throw new AppError("No active row set");
  }

  const currentRow = rows[currentRowIndex];
  if (!currentRow) {
    throw new AppError("Current row not found", "current_row_not_found", 409);
  }

  return currentRow;
}

/**
 * Insert a game event inside a transaction and prune old events
 * if the count exceeds MAX_EVENTS_PER_GAME.
 */
async function insertEventAndPrune(
  tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0],
  gameId: string,
  eventType: string,
  message: string,
  payload?: Record<string, unknown>
) {
  await tx.gameEvent.create({
    data: {
      gameId,
      eventType,
      message,
      payloadJson: payload ? JSON.stringify(payload) : null,
    },
  });

  const count = await tx.gameEvent.count({ where: { gameId } });
  if (count > MAX_EVENTS_PER_GAME) {
    const oldest = await tx.gameEvent.findMany({
      where: { gameId },
      orderBy: { createdAt: "asc" },
      take: count - MAX_EVENTS_PER_GAME,
      select: { id: true },
    });
    await tx.gameEvent.deleteMany({
      where: { id: { in: oldest.map((e) => e.id) } },
    });
  }
}

/**
 * Resequence row orders inside a transaction (fix 3.2).
 */
async function resequenceRowsTx(
  tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0],
  gameId: string
) {
  const rows = await tx.crosswordRow.findMany({
    where: { gameId },
    orderBy: { rowOrder: "asc" },
  });

  for (let i = 0; i < rows.length; i++) {
    if (rows[i].rowOrder !== i) {
      await tx.crosswordRow.update({
        where: { id: rows[i].id },
        data: { rowOrder: i },
      });
    }
  }

  return rows.length;
}

// ── Game lifecycle ──────────────────────────────────────────

export async function createGame(input: CreateGameInput): Promise<Game> {
  const validated = createGameSchema.parse(input);
  return insertGame(validated);
}

export async function startGame(gameId: string): Promise<Game> {
  const game = await requireGame(gameId);
  assertGameTransition(game.gameStatus, GAME_STATUS.LIVE);

  const rows = await getGameRows(gameId);
  if (rows.length === 0) {
    throw new AppError("Cannot start game with no rows");
  }

  return prisma.$transaction(async (tx) => {
    const updated = await tx.game.update({
      where: { id: gameId },
      data: {
        totalRows: rows.length,
        currentRowIndex: 0,
        gameStatus: GAME_STATUS.LIVE,
      },
    });

    await insertEventAndPrune(tx, gameId, EVENT_TYPES.GAME_STARTED, "Game đã bắt đầu");
    return mapPrismaToGame(updated);
  });
}

export async function pauseGame(gameId: string): Promise<Game> {
  const game = await requireGame(gameId);
  assertGameTransition(game.gameStatus, GAME_STATUS.PAUSED);

  return prisma.$transaction(async (tx) => {
    const updated = await tx.game.update({
      where: { id: gameId },
      data: { gameStatus: GAME_STATUS.PAUSED },
    });

    await insertEventAndPrune(tx, gameId, EVENT_TYPES.GAME_PAUSED, "Game tạm dừng");
    return mapPrismaToGame(updated);
  });
}

export async function resumeGame(gameId: string): Promise<Game> {
  const game = await requireGame(gameId);
  assertGameTransition(game.gameStatus, GAME_STATUS.LIVE);

  return prisma.$transaction(async (tx) => {
    const updated = await tx.game.update({
      where: { id: gameId },
      data: { gameStatus: GAME_STATUS.LIVE },
    });

    await insertEventAndPrune(tx, gameId, EVENT_TYPES.GAME_RESUMED, "Game tiếp tục");
    return mapPrismaToGame(updated);
  });
}

export async function endGame(gameId: string): Promise<Game> {
  const game = await requireGame(gameId);
  assertGameTransition(game.gameStatus, GAME_STATUS.ENDED);

  return prisma.$transaction(async (tx) => {
    const updated = await tx.game.update({
      where: { id: gameId },
      data: { gameStatus: GAME_STATUS.ENDED },
    });

    await insertEventAndPrune(tx, gameId, EVENT_TYPES.GAME_ENDED, "Game đã kết thúc");
    return mapPrismaToGame(updated);
  });
}

export async function resetGame(gameId: string): Promise<Game> {
  const game = await requireGame(gameId);
  assertGameTransition(game.gameStatus, GAME_STATUS.DRAFT);

  return prisma.$transaction(async (tx) => {
    await tx.crosswordRow.updateMany({
      where: { gameId },
      data: { rowStatus: "hidden" },
    });

    const updated = await tx.game.update({
      where: { id: gameId },
      data: {
        currentRowIndex: null,
        announcementText: null,
        gameStatus: GAME_STATUS.DRAFT,
      },
    });

    await insertEventAndPrune(tx, gameId, EVENT_TYPES.GAME_RESET, "Game đã được reset");
    return mapPrismaToGame(updated);
  });
}

export async function deleteGame(gameId: string): Promise<void> {
  const game = await requireGame(gameId);
  if (game.gameStatus === GAME_STATUS.LIVE) {
    throw new AppError("Cannot delete a live game. End it first.");
  }

  return deleteGameById(gameId);
}

// ── Row state transitions ───────────────────────────────────

export async function revealClue(gameId: string): Promise<CrosswordRow> {
  const game = await requireGame(gameId);
  if (game.gameStatus !== GAME_STATUS.LIVE) {
    throw new AppError("Game must be live to reveal clue");
  }

  const rows = await getGameRows(gameId);
  const currentRow = getCurrentRow(rows, game.currentRowIndex);
  assertRowTransition(currentRow.rowStatus, ROW_STATUS.CLUE_VISIBLE);

  return prisma.$transaction(async (tx) => {
    const updated = await tx.crosswordRow.update({
      where: { id: currentRow.id },
      data: { rowStatus: ROW_STATUS.CLUE_VISIBLE },
    });

    await insertEventAndPrune(
      tx,
      gameId,
      EVENT_TYPES.CLUE_OPENED,
      `Câu ${currentRow.rowOrder + 1} đã mở`,
      { rowId: currentRow.id, rowOrder: currentRow.rowOrder }
    );
    return mapPrismaToCrosswordRow(updated);
  });
}

export async function revealAnswer(gameId: string): Promise<CrosswordRow> {
  const game = await requireGame(gameId);
  if (game.gameStatus !== GAME_STATUS.LIVE) {
    throw new AppError("Game must be live to reveal answer");
  }

  const rows = await getGameRows(gameId);
  const currentRow = getCurrentRow(rows, game.currentRowIndex);
  assertRowTransition(currentRow.rowStatus, ROW_STATUS.ANSWER_REVEALED);

  return prisma.$transaction(async (tx) => {
    const updated = await tx.crosswordRow.update({
      where: { id: currentRow.id },
      data: { rowStatus: ROW_STATUS.ANSWER_REVEALED },
    });

    await insertEventAndPrune(
      tx,
      gameId,
      EVENT_TYPES.ANSWER_REVEALED,
      `Đáp án câu ${currentRow.rowOrder + 1}: ${currentRow.answerText}`,
      { rowId: currentRow.id, rowOrder: currentRow.rowOrder, answer: currentRow.answerText }
    );
    return mapPrismaToCrosswordRow(updated);
  });
}

export async function advanceToNextRow(gameId: string): Promise<Game> {
  const game = await requireGame(gameId);
  if (game.gameStatus !== GAME_STATUS.LIVE) {
    throw new AppError("Game must be live to advance row");
  }

  const nextIndex = (game.currentRowIndex ?? -1) + 1;
  if (nextIndex >= game.totalRows) {
    throw new AppError("Already at the last row");
  }

  return prisma.$transaction(async (tx) => {
    const updated = await tx.game.update({
      where: { id: gameId },
      data: { currentRowIndex: nextIndex },
    });

    await insertEventAndPrune(
      tx,
      gameId,
      EVENT_TYPES.ROW_ADVANCED,
      `Chuyển sang câu ${nextIndex + 1}`,
      { rowIndex: nextIndex }
    );
    return mapPrismaToGame(updated);
  });
}

export async function rewindToPreviousRow(gameId: string): Promise<Game> {
  const game = await requireGame(gameId);
  if (
    game.gameStatus !== GAME_STATUS.LIVE &&
    game.gameStatus !== GAME_STATUS.PAUSED
  ) {
    throw new AppError("Game must be live or paused to go back a row");
  }

  const currentIndex = game.currentRowIndex ?? 0;
  if (currentIndex <= 0) {
    throw new AppError("Already at the first row");
  }

  const rows = await getGameRows(gameId);
  const currentRow = getCurrentRow(rows, game.currentRowIndex);
  if (currentRow.rowStatus !== ROW_STATUS.HIDDEN) {
    throw new AppError("Only unopened next questions can be rewound");
  }

  const previousIndex = currentIndex - 1;

  return prisma.$transaction(async (tx) => {
    const updated = await tx.game.update({
      where: { id: gameId },
      data: { currentRowIndex: previousIndex },
    });

    await insertEventAndPrune(
      tx,
      gameId,
      EVENT_TYPES.ROW_REWOUND,
      `Quay lại câu ${previousIndex + 1}`,
      { rowIndex: previousIndex }
    );
    return mapPrismaToGame(updated);
  });
}

export async function updateAnnouncementText(
  gameId: string,
  text: string | null
): Promise<Game> {
  const game = await requireGame(gameId);
  if (
    game.gameStatus !== GAME_STATUS.LIVE &&
    game.gameStatus !== GAME_STATUS.PAUSED
  ) {
    throw new AppError("Announcements can only be updated while the game is live or paused");
  }

  const normalizedText = text?.trim() ? text.trim() : null;

  return prisma.$transaction(async (tx) => {
    const updated = await tx.game.update({
      where: { id: gameId },
      data: { announcementText: normalizedText },
    });

    await insertEventAndPrune(
      tx,
      gameId,
      EVENT_TYPES.ANNOUNCEMENT_UPDATED,
      normalizedText ? `Thông báo: ${normalizedText}` : "Đã xóa thông báo",
      normalizedText ? { text: normalizedText } : { text: null }
    );
    return mapPrismaToGame(updated);
  });
}

// ── Row CRUD ────────────────────────────────────────────────

export async function createRow(input: CreateRowInput): Promise<CrosswordRow> {
  const validated = createRowSchema.parse(input);
  const game = await requireGame(validated.gameId);
  if (game.gameStatus === GAME_STATUS.LIVE) {
    throw new AppError("Cannot edit rows while the game is live");
  }

  const existingRows = await getGameRows(validated.gameId);
  if (existingRows.length >= APP_CONFIG.maxRows) {
    throw new AppError(`A game can contain at most ${APP_CONFIG.maxRows} rows.`);
  }

  const nextRowOrder = existingRows.length;
  const row = await insertRow({ ...validated, rowOrder: nextRowOrder });
  await prisma.game.update({
    where: { id: validated.gameId },
    data: { totalRows: existingRows.length + 1 },
  });

  return row;
}

export async function updateRow(
  id: string,
  input: UpdateRowInput
): Promise<CrosswordRow> {
  const row = await getRowById(id);
  if (!row) {
    throw new AppError("Row not found", "row_not_found", 404);
  }

  const game = await requireGame(row.gameId);
  if (game.gameStatus === GAME_STATUS.LIVE) {
    throw new AppError("Cannot edit rows while the game is live");
  }

  const validated = updateRowSchema.parse(input);
  const nextAnswerText = validated.answerText;
  const nextHighlightedIndexes = validated.highlightedIndexes;
  if (
    nextAnswerText &&
    nextHighlightedIndexes &&
    nextHighlightedIndexes.some((index) => index >= nextAnswerText.length)
  ) {
    throw new AppError("Highlighted index is outside the answer length");
  }

  return updateRowById(id, validated);
}

export async function deleteRow(id: string): Promise<void> {
  const row = await getRowById(id);
  if (!row) {
    throw new AppError("Row not found", "row_not_found", 404);
  }

  const game = await requireGame(row.gameId);
  if (game.gameStatus === GAME_STATUS.LIVE) {
    throw new AppError("Cannot delete rows while the game is live");
  }

  await prisma.$transaction(async (tx) => {
    await tx.crosswordRow.delete({ where: { id } });

    const newCount = await resequenceRowsTx(tx, row.gameId);

    const updateData: Record<string, unknown> = { totalRows: newCount };
    if (game.currentRowIndex !== null) {
      updateData.currentRowIndex =
        newCount === 0 ? null : Math.min(game.currentRowIndex, newCount - 1);
    }

    await tx.game.update({
      where: { id: row.gameId },
      data: updateData,
    });
  });
}
