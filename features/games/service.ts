/**
 * Games business logic and orchestration.
 * All game state transitions must go through this service.
 */

import { APP_CONFIG } from "@/lib/constants/app-config";
import { AppError } from "@/lib/security/errors";
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
  insertGameEvent,
  insertRow,
  resetAllRows,
  updateGameAnnouncement,
  updateGameCurrentRow,
  updateGameStatus,
  updateGameTotalRows,
  updateRowById,
  updateRowStatus,
} from "./mutations";

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

async function resequenceRows(gameId: string) {
  const rows = await getGameRows(gameId);

  await Promise.all(
    rows.map((row, index) => {
      if (row.rowOrder === index) return Promise.resolve(row);
      return updateRowById(row.id, { rowOrder: index });
    })
  );

  return getGameRows(gameId);
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

  await updateGameTotalRows(gameId, rows.length);
  await updateGameCurrentRow(gameId, 0);

  const updated = await updateGameStatus(gameId, GAME_STATUS.LIVE as GameStatus);
  await insertGameEvent(gameId, EVENT_TYPES.GAME_STARTED, "Game đã bắt đầu");
  return updated;
}

export async function pauseGame(gameId: string): Promise<Game> {
  const game = await requireGame(gameId);
  assertGameTransition(game.gameStatus, GAME_STATUS.PAUSED);

  const updated = await updateGameStatus(gameId, GAME_STATUS.PAUSED as GameStatus);
  await insertGameEvent(gameId, EVENT_TYPES.GAME_PAUSED, "Game tạm dừng");
  return updated;
}

export async function resumeGame(gameId: string): Promise<Game> {
  const game = await requireGame(gameId);
  assertGameTransition(game.gameStatus, GAME_STATUS.LIVE);

  const updated = await updateGameStatus(gameId, GAME_STATUS.LIVE as GameStatus);
  await insertGameEvent(gameId, EVENT_TYPES.GAME_RESUMED, "Game tiếp tục");
  return updated;
}

export async function endGame(gameId: string): Promise<Game> {
  const game = await requireGame(gameId);
  assertGameTransition(game.gameStatus, GAME_STATUS.ENDED);

  const updated = await updateGameStatus(gameId, GAME_STATUS.ENDED as GameStatus);
  await insertGameEvent(gameId, EVENT_TYPES.GAME_ENDED, "Game đã kết thúc");
  return updated;
}

export async function resetGame(gameId: string): Promise<Game> {
  const game = await requireGame(gameId);
  assertGameTransition(game.gameStatus, GAME_STATUS.DRAFT);

  await resetAllRows(gameId);
  await updateGameCurrentRow(gameId, null);
  await updateGameAnnouncement(gameId, null);

  const updated = await updateGameStatus(gameId, GAME_STATUS.DRAFT as GameStatus);
  await insertGameEvent(gameId, EVENT_TYPES.GAME_RESET, "Game đã được reset");
  return updated;
}

export async function deleteGame(gameId: string): Promise<void> {
  const game = await requireGame(gameId);
  if (game.gameStatus === GAME_STATUS.LIVE) {
    throw new AppError("Cannot delete a live game. End it first.");
  }

  return deleteGameById(gameId);
}

export async function revealClue(gameId: string): Promise<CrosswordRow> {
  const game = await requireGame(gameId);
  if (game.gameStatus !== GAME_STATUS.LIVE) {
    throw new AppError("Game must be live to reveal clue");
  }

  const rows = await getGameRows(gameId);
  const currentRow = getCurrentRow(rows, game.currentRowIndex);
  assertRowTransition(currentRow.rowStatus, ROW_STATUS.CLUE_VISIBLE);

  const updated = await updateRowStatus(currentRow.id, ROW_STATUS.CLUE_VISIBLE as RowStatus);
  await insertGameEvent(
    gameId,
    EVENT_TYPES.CLUE_OPENED,
    `Câu ${currentRow.rowOrder + 1} đã mở`,
    { rowId: currentRow.id, rowOrder: currentRow.rowOrder }
  );
  return updated;
}

export async function revealAnswer(gameId: string): Promise<CrosswordRow> {
  const game = await requireGame(gameId);
  if (game.gameStatus !== GAME_STATUS.LIVE) {
    throw new AppError("Game must be live to reveal answer");
  }

  const rows = await getGameRows(gameId);
  const currentRow = getCurrentRow(rows, game.currentRowIndex);
  assertRowTransition(currentRow.rowStatus, ROW_STATUS.ANSWER_REVEALED);

  const updated = await updateRowStatus(currentRow.id, ROW_STATUS.ANSWER_REVEALED as RowStatus);
  await insertGameEvent(
    gameId,
    EVENT_TYPES.ANSWER_REVEALED,
    `Đáp án câu ${currentRow.rowOrder + 1}: ${currentRow.answerText}`,
    { rowId: currentRow.id, rowOrder: currentRow.rowOrder, answer: currentRow.answerText }
  );
  return updated;
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

  const updated = await updateGameCurrentRow(gameId, nextIndex);
  await insertGameEvent(
    gameId,
    EVENT_TYPES.ROW_ADVANCED,
    `Chuyển sang câu ${nextIndex + 1}`,
    { rowIndex: nextIndex }
  );
  return updated;
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
  const updated = await updateGameCurrentRow(gameId, previousIndex);
  await insertGameEvent(
    gameId,
    EVENT_TYPES.ROW_REWOUND,
    `Quay lại câu ${previousIndex + 1}`,
    { rowIndex: previousIndex }
  );
  return updated;
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
  const updated = await updateGameAnnouncement(gameId, normalizedText);
  await insertGameEvent(
    gameId,
    EVENT_TYPES.ANNOUNCEMENT_UPDATED,
    normalizedText ? `Thông báo: ${normalizedText}` : "Đã xóa thông báo",
    normalizedText ? { text: normalizedText } : { text: null }
  );
  return updated;
}

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
  await updateGameTotalRows(validated.gameId, existingRows.length + 1);

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

  await deleteRowById(id);
  const rows = await resequenceRows(row.gameId);
  await updateGameTotalRows(row.gameId, rows.length);

  if (game.currentRowIndex !== null) {
    const nextCurrentRow =
      rows.length === 0 ? null : Math.min(game.currentRowIndex, rows.length - 1);
    await updateGameCurrentRow(row.gameId, nextCurrentRow);
  }
}
