import { describe, it, expect } from "vitest";
import { createProgramSchema } from "@/features/programs/schemas";
import { createGameSchema, createRowSchema } from "@/features/games/schemas";
import { createThemeSchema } from "@/features/themes/schemas";

describe("createProgramSchema", () => {
  it("accepts valid input", () => {
    const result = createProgramSchema.safeParse({
      title: "Test Program",
      slug: "test-program",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty title", () => {
    const result = createProgramSchema.safeParse({
      title: "",
      slug: "test",
    });
    expect(result.success).toBe(false);
  });

  it("rejects slug with uppercase", () => {
    const result = createProgramSchema.safeParse({
      title: "Test",
      slug: "Test-Slug",
    });
    expect(result.success).toBe(false);
  });

  it("rejects slug with spaces", () => {
    const result = createProgramSchema.safeParse({
      title: "Test",
      slug: "test slug",
    });
    expect(result.success).toBe(false);
  });

  it("accepts slug with numbers and hyphens", () => {
    const result = createProgramSchema.safeParse({
      title: "Test",
      slug: "test-2024-event",
    });
    expect(result.success).toBe(true);
  });
});

describe("createGameSchema", () => {
  it("accepts valid game input", () => {
    const result = createGameSchema.safeParse({
      programId: "550e8400-e29b-41d4-a716-446655440000",
      title: "Ô Chữ Công Nghệ",
    });
    expect(result.success).toBe(true);
  });

  it("rejects non-UUID programId", () => {
    const result = createGameSchema.safeParse({
      programId: "not-a-uuid",
      title: "Test",
    });
    expect(result.success).toBe(false);
  });

  it("accepts optional finalKeyword", () => {
    const result = createGameSchema.safeParse({
      programId: "550e8400-e29b-41d4-a716-446655440000",
      title: "Test",
      finalKeyword: "CODING",
    });
    expect(result.success).toBe(true);
  });
});

describe("createRowSchema", () => {
  it("accepts valid row input", () => {
    const result = createRowSchema.safeParse({
      gameId: "550e8400-e29b-41d4-a716-446655440000",
      rowOrder: 0,
      clueText: "What is JavaScript?",
      answerText: "JAVASCRIPT",
      highlightedIndexes: [4],
    });
    expect(result.success).toBe(true);
  });

  it("rejects negative rowOrder", () => {
    const result = createRowSchema.safeParse({
      gameId: "550e8400-e29b-41d4-a716-446655440000",
      rowOrder: -1,
      clueText: "Q",
      answerText: "A",
      highlightedIndexes: [],
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty clueText", () => {
    const result = createRowSchema.safeParse({
      gameId: "550e8400-e29b-41d4-a716-446655440000",
      rowOrder: 0,
      clueText: "",
      answerText: "A",
      highlightedIndexes: [],
    });
    expect(result.success).toBe(false);
  });
});

describe("createThemeSchema", () => {
  it("accepts valid theme input", () => {
    const result = createThemeSchema.safeParse({
      name: "Theme 1",
    });
    expect(result.success).toBe(true);
  });

  it("applies default colors", () => {
    const result = createThemeSchema.parse({ name: "Theme 1" });
    expect(result.primaryColor).toBe("#6366f1");
    expect(result.secondaryColor).toBe("#8b5cf6");
    expect(result.accentColor).toBe("#f59e0b");
  });

  it("rejects invalid hex color", () => {
    const result = createThemeSchema.safeParse({
      name: "Theme",
      primaryColor: "red",
    });
    expect(result.success).toBe(false);
  });

  it("rejects overlayOpacity > 1", () => {
    const result = createThemeSchema.safeParse({
      name: "Theme",
      overlayOpacity: 1.5,
    });
    expect(result.success).toBe(false);
  });
});
