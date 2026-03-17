import { describe, it, expect } from "vitest";
import { mapDbRowToProgram } from "@/features/programs/mapper";
import { mapDbRowToGame, mapDbRowToCrosswordRow, mapDbRowToGameEvent } from "@/features/games/mapper";
import { mapDbRowToTheme } from "@/features/themes/mapper";

describe("mapDbRowToProgram", () => {
  it("maps snake_case DB row to camelCase domain type", () => {
    const dbRow = {
      id: "abc-123",
      slug: "test-prog",
      title: "Test Program",
      description: "A test",
      status: "draft",
      start_at: "2024-01-01T00:00:00Z",
      end_at: null,
      theme_id: "theme-1",
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-02T00:00:00Z",
    };
    const result = mapDbRowToProgram(dbRow);
    expect(result).toEqual({
      id: "abc-123",
      slug: "test-prog",
      title: "Test Program",
      description: "A test",
      status: "draft",
      startAt: "2024-01-01T00:00:00Z",
      endAt: null,
      themeId: "theme-1",
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-02T00:00:00Z",
    });
  });

  it("handles null description and theme_id", () => {
    const dbRow = {
      id: "abc",
      slug: "s",
      title: "T",
      description: null,
      status: "live",
      start_at: null,
      end_at: null,
      theme_id: null,
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
    };
    const result = mapDbRowToProgram(dbRow);
    expect(result.description).toBeNull();
    expect(result.themeId).toBeNull();
  });
});

describe("mapDbRowToGame", () => {
  it("maps game DB row correctly", () => {
    const dbRow = {
      id: "game-1",
      program_id: "prog-1",
      title: "Game Title",
      subtitle: null,
      final_keyword: "CODE",
      total_rows: 5,
      current_row_index: 2,
      game_status: "live",
      announcement_text: "Hello!",
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
    };
    const result = mapDbRowToGame(dbRow);
    expect(result.programId).toBe("prog-1");
    expect(result.finalKeyword).toBe("CODE");
    expect(result.totalRows).toBe(5);
    expect(result.currentRowIndex).toBe(2);
    expect(result.gameStatus).toBe("live");
    expect(result.announcementText).toBe("Hello!");
  });
});

describe("mapDbRowToCrosswordRow", () => {
  it("maps crossword row with highlighted indexes", () => {
    const dbRow = {
      id: "row-1",
      game_id: "game-1",
      row_order: 0,
      clue_text: "A question",
      answer_text: "ANSWER",
      answer_length: 6,
      highlighted_indexes_json: [1, 3],
      row_status: "hidden",
      note_text: null,
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
    };
    const result = mapDbRowToCrosswordRow(dbRow);
    expect(result.highlightedIndexes).toEqual([1, 3]);
    expect(result.answerLength).toBe(6);
    expect(result.rowStatus).toBe("hidden");
  });

  it("defaults highlighted_indexes_json to empty array", () => {
    const dbRow = {
      id: "row-1",
      game_id: "game-1",
      row_order: 0,
      clue_text: "Q",
      answer_text: "A",
      answer_length: 1,
      highlighted_indexes_json: null,
      row_status: "hidden",
      note_text: null,
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
    };
    const result = mapDbRowToCrosswordRow(dbRow);
    expect(result.highlightedIndexes).toEqual([]);
  });
});

describe("mapDbRowToGameEvent", () => {
  it("maps event row correctly", () => {
    const dbRow = {
      id: "evt-1",
      game_id: "game-1",
      event_type: "clue_opened",
      message: "Câu 1 đã mở",
      payload_json: { rowId: "row-1" },
      created_at: "2024-01-01T00:00:00Z",
      created_by: "user-1",
    };
    const result = mapDbRowToGameEvent(dbRow);
    expect(result.eventType).toBe("clue_opened");
    expect(result.payloadJson).toEqual({ rowId: "row-1" });
    expect(result.createdBy).toBe("user-1");
  });
});

describe("mapDbRowToTheme", () => {
  it("maps theme with all fields", () => {
    const dbRow = {
      id: "theme-1",
      name: "Test Theme",
      logo_url: "https://example.com/logo.png",
      banner_url: null,
      desktop_bg_url: null,
      mobile_bg_url: null,
      primary_color: "#6366f1",
      secondary_color: "#8b5cf6",
      accent_color: "#f59e0b",
      overlay_opacity: 0.5,
      font_heading: null,
      font_body: null,
      custom_css_json: null,
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
    };
    const result = mapDbRowToTheme(dbRow);
    expect(result.logoUrl).toBe("https://example.com/logo.png");
    expect(result.primaryColor).toBe("#6366f1");
    expect(result.overlayOpacity).toBe(0.5);
    expect(result.bannerUrl).toBeNull();
  });
});
