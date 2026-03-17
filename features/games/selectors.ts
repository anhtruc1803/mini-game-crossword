/**
 * Games derived data selectors.
 * Pure functions that compute view data from game state.
 */

import type { CrosswordRow } from "./types";
import { ROW_STATUS } from "./constants";

type HintRow = Pick<CrosswordRow, "answerText" | "highlightedIndexes" | "rowStatus">;

export function buildFinalKeywordHint(rows: HintRow[]): (string | null)[] {
  return rows.flatMap((row) => {
    const safeIndexes = row.highlightedIndexes.filter(
      (i) => i >= 0 && i < row.answerText.length
    );

    if (safeIndexes.length === 0) {
      return [null];
    }

    if (row.rowStatus !== ROW_STATUS.ANSWER_REVEALED) {
      return safeIndexes.map(() => null);
    }

    return safeIndexes.map((i) => row.answerText[i] ?? null);
  });
}

export function countRowsByStatus(rows: CrosswordRow[]) {
  return {
    hidden: rows.filter((r) => r.rowStatus === ROW_STATUS.HIDDEN).length,
    clueVisible: rows.filter((r) => r.rowStatus === ROW_STATUS.CLUE_VISIBLE).length,
    answerRevealed: rows.filter((r) => r.rowStatus === ROW_STATUS.ANSWER_REVEALED).length,
  };
}
