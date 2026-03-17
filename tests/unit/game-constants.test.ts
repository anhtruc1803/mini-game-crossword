import { describe, it, expect } from "vitest";
import {
  GAME_STATUS,
  ROW_STATUS,
  GAME_STATUS_TRANSITIONS,
  ROW_STATUS_TRANSITIONS,
  EVENT_TYPES,
} from "@/features/games/constants";

describe("GAME_STATUS", () => {
  it("has exactly 4 statuses", () => {
    const values = Object.values(GAME_STATUS);
    expect(values).toHaveLength(4);
    expect(values).toContain("draft");
    expect(values).toContain("live");
    expect(values).toContain("paused");
    expect(values).toContain("ended");
  });
});

describe("ROW_STATUS", () => {
  it("has exactly 3 statuses", () => {
    const values = Object.values(ROW_STATUS);
    expect(values).toHaveLength(3);
    expect(values).toContain("hidden");
    expect(values).toContain("clue_visible");
    expect(values).toContain("answer_revealed");
  });
});

describe("GAME_STATUS_TRANSITIONS", () => {
  it("draft can only go to live", () => {
    expect(GAME_STATUS_TRANSITIONS[GAME_STATUS.DRAFT]).toEqual([GAME_STATUS.LIVE]);
  });

  it("live can go to paused or ended", () => {
    const transitions = GAME_STATUS_TRANSITIONS[GAME_STATUS.LIVE];
    expect(transitions).toContain(GAME_STATUS.PAUSED);
    expect(transitions).toContain(GAME_STATUS.ENDED);
    expect(transitions).toHaveLength(2);
  });

  it("paused can go to live or ended", () => {
    const transitions = GAME_STATUS_TRANSITIONS[GAME_STATUS.PAUSED];
    expect(transitions).toContain(GAME_STATUS.LIVE);
    expect(transitions).toContain(GAME_STATUS.ENDED);
    expect(transitions).toHaveLength(2);
  });

  it("ended can only go to draft (reset)", () => {
    expect(GAME_STATUS_TRANSITIONS[GAME_STATUS.ENDED]).toEqual([GAME_STATUS.DRAFT]);
  });

  it("every status has a transition entry", () => {
    for (const status of Object.values(GAME_STATUS)) {
      expect(GAME_STATUS_TRANSITIONS[status]).toBeDefined();
    }
  });
});

describe("ROW_STATUS_TRANSITIONS", () => {
  it("hidden can only go to clue_visible", () => {
    expect(ROW_STATUS_TRANSITIONS[ROW_STATUS.HIDDEN]).toEqual([ROW_STATUS.CLUE_VISIBLE]);
  });

  it("clue_visible can only go to answer_revealed", () => {
    expect(ROW_STATUS_TRANSITIONS[ROW_STATUS.CLUE_VISIBLE]).toEqual([ROW_STATUS.ANSWER_REVEALED]);
  });

  it("answer_revealed can only go to hidden (reset)", () => {
    expect(ROW_STATUS_TRANSITIONS[ROW_STATUS.ANSWER_REVEALED]).toEqual([ROW_STATUS.HIDDEN]);
  });

  it("rows cannot skip from hidden to answer_revealed", () => {
    const hiddenTransitions = ROW_STATUS_TRANSITIONS[ROW_STATUS.HIDDEN];
    expect(hiddenTransitions).not.toContain(ROW_STATUS.ANSWER_REVEALED);
  });
});

describe("EVENT_TYPES", () => {
  it("has all required event types", () => {
    expect(EVENT_TYPES.GAME_STARTED).toBe("game_started");
    expect(EVENT_TYPES.GAME_PAUSED).toBe("game_paused");
    expect(EVENT_TYPES.GAME_ENDED).toBe("game_ended");
    expect(EVENT_TYPES.GAME_RESET).toBe("game_reset");
    expect(EVENT_TYPES.CLUE_OPENED).toBe("clue_opened");
    expect(EVENT_TYPES.ANSWER_REVEALED).toBe("answer_revealed");
    expect(EVENT_TYPES.ANNOUNCEMENT_UPDATED).toBe("announcement_updated");
    expect(EVENT_TYPES.ROW_ADVANCED).toBe("row_advanced");
  });
});
