/** Domain types for games and crossword rows. */

export type GameStatus = "draft" | "live" | "paused" | "ended";
export type RowStatus = "hidden" | "clue_visible" | "answer_revealed";

export interface Game {
  id: string;
  programId: string;
  title: string;
  subtitle: string | null;
  finalKeyword: string | null;
  totalRows: number;
  currentRowIndex: number | null;
  gameStatus: GameStatus;
  announcementText: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CrosswordRow {
  id: string;
  gameId: string;
  rowOrder: number;
  clueText: string;
  answerText: string;
  answerLength: number;
  /** Indexes of highlighted characters (0-based). */
  highlightedIndexes: number[];
  rowStatus: RowStatus;
  noteText: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface GameEvent {
  id: string;
  gameId: string;
  eventType: string;
  message: string;
  payloadJson: Record<string, unknown> | null;
  createdAt: string;
  createdBy: string | null;
}
