/**
 * Games derived data selectors.
 * Pure functions that compute view data from game state.
 */

import type { CrosswordRow } from "./types";
import { ROW_STATUS } from "./constants";

type HintRow = Pick<CrosswordRow, "answerText" | "highlightedIndexes" | "rowStatus">;

export function buildFinalKeywordHint(rows: HintRow[]): (string | null)[] {
  return rows.map((row) => {
    if (row.rowStatus !== ROW_STATUS.ANSWER_REVEALED) return null;

    const chars = row.highlightedIndexes
      .filter((i) => i >= 0 && i < row.answerText.length)
      .map((i) => row.answerText[i]);

    return chars.length > 0 ? chars.join("") : null;
  });
}

export function countRowsByStatus(rows: CrosswordRow[]) {
  return {
    hidden: rows.filter((r) => r.rowStatus === ROW_STATUS.HIDDEN).length,
    clueVisible: rows.filter((r) => r.rowStatus === ROW_STATUS.CLUE_VISIBLE).length,
    answerRevealed: rows.filter((r) => r.rowStatus === ROW_STATUS.ANSWER_REVEALED).length,
  };
}
