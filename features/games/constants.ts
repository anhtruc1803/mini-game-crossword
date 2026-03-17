/**
 * Centralized status constants for games and rows.
 * Use these instead of magic strings throughout the codebase.
 */

export const GAME_STATUS = {
  DRAFT: "draft",
  LIVE: "live",
  PAUSED: "paused",
  ENDED: "ended",
} as const;

export const ROW_STATUS = {
  HIDDEN: "hidden",
  CLUE_VISIBLE: "clue_visible",
  ANSWER_REVEALED: "answer_revealed",
} as const;

/** Valid transitions for game status. */
export const GAME_STATUS_TRANSITIONS: Record<string, string[]> = {
  [GAME_STATUS.DRAFT]: [GAME_STATUS.LIVE],
  [GAME_STATUS.LIVE]: [GAME_STATUS.PAUSED, GAME_STATUS.ENDED],
  [GAME_STATUS.PAUSED]: [GAME_STATUS.LIVE, GAME_STATUS.ENDED],
  [GAME_STATUS.ENDED]: [GAME_STATUS.DRAFT], // reset
};

/** Valid transitions for row status. */
export const ROW_STATUS_TRANSITIONS: Record<string, string[]> = {
  [ROW_STATUS.HIDDEN]: [ROW_STATUS.CLUE_VISIBLE],
  [ROW_STATUS.CLUE_VISIBLE]: [ROW_STATUS.ANSWER_REVEALED],
  [ROW_STATUS.ANSWER_REVEALED]: [ROW_STATUS.HIDDEN], // reset
};

export const EVENT_TYPES = {
  GAME_STARTED: "game_started",
  GAME_PAUSED: "game_paused",
  GAME_ENDED: "game_ended",
  GAME_RESET: "game_reset",
  CLUE_OPENED: "clue_opened",
  ANSWER_REVEALED: "answer_revealed",
  ANNOUNCEMENT_UPDATED: "announcement_updated",
  ROW_ADVANCED: "row_advanced",
} as const;
