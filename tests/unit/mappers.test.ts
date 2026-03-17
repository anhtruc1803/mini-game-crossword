import { describe, it, expect } from "vitest";
import type {
  Program as PrismaProgram,
  Game as PrismaGame,
  CrosswordRow as PrismaCrosswordRow,
  GameEvent as PrismaGameEvent,
  Theme as PrismaTheme,
} from "@prisma/client";
import { mapPrismaToProgram } from "@/features/programs/mapper";
import { mapPrismaToGame, mapPrismaToCrosswordRow, mapPrismaToGameEvent } from "@/features/games/mapper";
import { mapPrismaToTheme } from "@/features/themes/mapper";

describe("mapPrismaToProgram", () => {
  it("maps Prisma row to camelCase domain type", () => {
    const row: PrismaProgram = {
      id: "abc-123",
      slug: "test-prog",
      title: "Test Program",
      description: "A test",
      imageUrl: "/uploads/programs/abc-123/cover.webp",
      status: "draft",
      startAt: new Date("2024-01-01T00:00:00Z"),
      endAt: null,
      themeId: "theme-1",
      createdAt: new Date("2024-01-01T00:00:00Z"),
      updatedAt: new Date("2024-01-02T00:00:00Z"),
    };
    const result = mapPrismaToProgram(row);
    expect(result).toEqual({
      id: "abc-123",
      slug: "test-prog",
      title: "Test Program",
      description: "A test",
      imageUrl: "/uploads/programs/abc-123/cover.webp",
      status: "draft",
      startAt: "2024-01-01T00:00:00.000Z",
      endAt: null,
      themeId: "theme-1",
      createdAt: "2024-01-01T00:00:00.000Z",
      updatedAt: "2024-01-02T00:00:00.000Z",
    });
  });

  it("handles null description and themeId", () => {
    const row: PrismaProgram = {
      id: "abc",
      slug: "s",
      title: "T",
      description: null,
      imageUrl: null,
      status: "live",
      startAt: null,
      endAt: null,
      themeId: null,
      createdAt: new Date("2024-01-01T00:00:00Z"),
      updatedAt: new Date("2024-01-01T00:00:00Z"),
    };
    const result = mapPrismaToProgram(row);
    expect(result.description).toBeNull();
    expect(result.imageUrl).toBeNull();
    expect(result.themeId).toBeNull();
  });
});

describe("mapPrismaToGame", () => {
  it("maps game row correctly", () => {
    const row: PrismaGame = {
      id: "game-1",
      programId: "prog-1",
      title: "Game Title",
      subtitle: null,
      finalKeyword: "CODE",
      totalRows: 5,
      currentRowIndex: 2,
      gameStatus: "live",
      announcementText: "Hello!",
      createdAt: new Date("2024-01-01T00:00:00Z"),
      updatedAt: new Date("2024-01-01T00:00:00Z"),
    };
    const result = mapPrismaToGame(row);
    expect(result.programId).toBe("prog-1");
    expect(result.finalKeyword).toBe("CODE");
    expect(result.totalRows).toBe(5);
    expect(result.currentRowIndex).toBe(2);
    expect(result.gameStatus).toBe("live");
    expect(result.announcementText).toBe("Hello!");
  });
});

describe("mapPrismaToCrosswordRow", () => {
  it("maps crossword row with highlighted indexes", () => {
    const row: PrismaCrosswordRow = {
      id: "row-1",
      gameId: "game-1",
      rowOrder: 0,
      clueText: "A question",
      answerText: "ANSWER",
      answerLength: 6,
      highlightedIndexesJson: "[1,3]",
      rowStatus: "hidden",
      noteText: null,
      createdAt: new Date("2024-01-01T00:00:00Z"),
      updatedAt: new Date("2024-01-01T00:00:00Z"),
    };
    const result = mapPrismaToCrosswordRow(row);
    expect(result.highlightedIndexes).toEqual([1, 3]);
    expect(result.answerLength).toBe(6);
    expect(result.rowStatus).toBe("hidden");
  });

  it("defaults highlightedIndexesJson to empty array on invalid JSON", () => {
    const row: PrismaCrosswordRow = {
      id: "row-1",
      gameId: "game-1",
      rowOrder: 0,
      clueText: "Q",
      answerText: "A",
      answerLength: 1,
      highlightedIndexesJson: "",
      rowStatus: "hidden",
      noteText: null,
      createdAt: new Date("2024-01-01T00:00:00Z"),
      updatedAt: new Date("2024-01-01T00:00:00Z"),
    };
    const result = mapPrismaToCrosswordRow(row);
    expect(result.highlightedIndexes).toEqual([]);
  });
});

describe("mapPrismaToGameEvent", () => {
  it("maps event row correctly", () => {
    const row: PrismaGameEvent = {
      id: "evt-1",
      gameId: "game-1",
      eventType: "clue_opened",
      message: "Câu 1 đã mở",
      payloadJson: JSON.stringify({ rowId: "row-1" }),
      createdAt: new Date("2024-01-01T00:00:00Z"),
      createdBy: "user-1",
    };
    const result = mapPrismaToGameEvent(row);
    expect(result.eventType).toBe("clue_opened");
    expect(result.payloadJson).toEqual({ rowId: "row-1" });
    expect(result.createdBy).toBe("user-1");
  });
});

describe("mapPrismaToTheme", () => {
  it("maps theme with all fields", () => {
    const row: PrismaTheme = {
      id: "theme-1",
      name: "Test Theme",
      logoUrl: "https://example.com/logo.png",
      bannerUrl: null,
      desktopBgUrl: null,
      mobileBgUrl: null,
      primaryColor: "#6366f1",
      secondaryColor: "#8b5cf6",
      accentColor: "#f59e0b",
      overlayOpacity: 0.5,
      fontHeading: null,
      fontBody: null,
      customCssJson: null,
      createdAt: new Date("2024-01-01T00:00:00Z"),
      updatedAt: new Date("2024-01-01T00:00:00Z"),
    };
    const result = mapPrismaToTheme(row);
    expect(result.logoUrl).toBe("https://example.com/logo.png");
    expect(result.primaryColor).toBe("#6366f1");
    expect(result.overlayOpacity).toBe(0.5);
    expect(result.bannerUrl).toBeNull();
  });
});
