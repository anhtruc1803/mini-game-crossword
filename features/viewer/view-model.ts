/**
 * Viewer view model types.
 * These types represent the sanitized data that the public UI is allowed to render.
 */

import type { GameEvent, GameStatus, RowStatus } from "@/features/games/types";
import type { Theme } from "@/features/themes/types";
import type { Program } from "@/features/programs/types";

export interface PublicGame {
  id: string;
  title: string;
  subtitle: string | null;
  gameStatus: GameStatus;
  announcementText: string | null;
}

export interface PublicCrosswordRow {
  id: string;
  rowOrder: number;
  clueText: string;
  answerText: string;
  answerLength: number;
  highlightedIndexes: number[];
  rowStatus: RowStatus;
}

export interface PublicViewerSnapshot {
  program: Program;
  theme: Theme | null;
  game: PublicGame | null;
  rows: PublicCrosswordRow[];
  activeRowIndex: number | null;
  events: GameEvent[];
  finalKeywordHint: (string | null)[];
  finalKeyword: string | null;
}
