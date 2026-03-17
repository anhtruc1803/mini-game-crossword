import { describe, it, expect } from "vitest";
import { buildFinalKeywordHint, countRowsByStatus } from "@/features/games/selectors";
import type { CrosswordRow } from "@/features/games/types";

function makeRow(overrides: Partial<CrosswordRow>): CrosswordRow {
  return {
    id: "test-id",
    gameId: "game-id",
    rowOrder: 0,
    clueText: "test clue",
    answerText: "HELLO",
    answerLength: 5,
    highlightedIndexes: [0],
    rowStatus: "hidden",
    noteText: null,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
    ...overrides,
  };
}

describe("buildFinalKeywordHint", () => {
  it("returns null for hidden rows", () => {
    const rows = [makeRow({ rowStatus: "hidden", answerText: "HELLO", highlightedIndexes: [0] })];
    expect(buildFinalKeywordHint(rows)).toEqual([null]);
  });

  it("returns null for clue_visible rows", () => {
    const rows = [makeRow({ rowStatus: "clue_visible", answerText: "HELLO", highlightedIndexes: [0] })];
    expect(buildFinalKeywordHint(rows)).toEqual([null]);
  });

  it("returns highlighted character for answer_revealed rows", () => {
    const rows = [
      makeRow({ rowStatus: "answer_revealed", answerText: "HELLO", highlightedIndexes: [1] }),
    ];
    expect(buildFinalKeywordHint(rows)).toEqual(["E"]);
  });

  it("handles multiple highlighted indexes in one row", () => {
    const rows = [
      makeRow({ rowStatus: "answer_revealed", answerText: "HELLO", highlightedIndexes: [0, 4] }),
    ];
    expect(buildFinalKeywordHint(rows)).toEqual(["H", "O"]);
  });

  it("handles mixed row statuses", () => {
    const rows = [
      makeRow({ rowStatus: "answer_revealed", answerText: "JAVASCRIPT", highlightedIndexes: [4] }),
      makeRow({ rowStatus: "hidden", answerText: "LINUX", highlightedIndexes: [0] }),
      makeRow({ rowStatus: "answer_revealed", answerText: "GIT", highlightedIndexes: [2] }),
    ];
    const result = buildFinalKeywordHint(rows);
    expect(result).toEqual(["S", null, "T"]);
  });

  it("returns empty array for no rows", () => {
    expect(buildFinalKeywordHint([])).toEqual([]);
  });

  it("ignores out-of-bound highlighted indexes", () => {
    const rows = [
      makeRow({ rowStatus: "answer_revealed", answerText: "AB", highlightedIndexes: [5, 10] }),
    ];
    expect(buildFinalKeywordHint(rows)).toEqual([null]);
  });

  it("creates one placeholder per hidden highlighted letter", () => {
    const rows = [
      makeRow({ rowStatus: "hidden", answerText: "BIRTHDAY", highlightedIndexes: [0, 2, 4] }),
    ];
    expect(buildFinalKeywordHint(rows)).toEqual([null, null, null]);
  });
});

describe("countRowsByStatus", () => {
  it("counts rows correctly", () => {
    const rows = [
      makeRow({ rowStatus: "hidden" }),
      makeRow({ rowStatus: "hidden" }),
      makeRow({ rowStatus: "clue_visible" }),
      makeRow({ rowStatus: "answer_revealed" }),
      makeRow({ rowStatus: "answer_revealed" }),
      makeRow({ rowStatus: "answer_revealed" }),
    ];
    const counts = countRowsByStatus(rows);
    expect(counts).toEqual({
      hidden: 2,
      clueVisible: 1,
      answerRevealed: 3,
    });
  });

  it("returns zeros for empty array", () => {
    expect(countRowsByStatus([])).toEqual({
      hidden: 0,
      clueVisible: 0,
      answerRevealed: 0,
    });
  });
});
