/**
 * Games — write operations.
 */

import { createSupabaseServer } from "@/lib/supabase/server";
import { mapDbRowToGame, mapDbRowToCrosswordRow, mapDbRowToGameEvent } from "./mapper";
import type { Game, CrosswordRow, GameEvent, GameStatus, RowStatus } from "./types";
import type { CreateGameInput, CreateRowInput, UpdateRowInput } from "./schemas";

// ── Game mutations ──────────────────────────────────────────

export async function insertGame(input: CreateGameInput): Promise<Game> {
  const supabase = await createSupabaseServer();
  const { data, error } = await supabase
    .from("games")
    .insert({
      program_id: input.programId,
      title: input.title,
      subtitle: input.subtitle ?? null,
      final_keyword: input.finalKeyword ?? null,
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to create game: ${error.message}`);
  return mapDbRowToGame(data);
}

export async function updateGameStatus(
  id: string,
  status: GameStatus
): Promise<Game> {
  const supabase = await createSupabaseServer();
  const { data, error } = await supabase
    .from("games")
    .update({ game_status: status })
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(`Failed to update game status: ${error.message}`);
  return mapDbRowToGame(data);
}

export async function updateGameCurrentRow(
  id: string,
  rowIndex: number | null
): Promise<Game> {
  const supabase = await createSupabaseServer();
  const { data, error } = await supabase
    .from("games")
    .update({ current_row_index: rowIndex })
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(`Failed to update current row: ${error.message}`);
  return mapDbRowToGame(data);
}

export async function updateGameAnnouncement(
  id: string,
  text: string | null
): Promise<Game> {
  const supabase = await createSupabaseServer();
  const { data, error } = await supabase
    .from("games")
    .update({ announcement_text: text })
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(`Failed to update announcement: ${error.message}`);
  return mapDbRowToGame(data);
}

export async function updateGameTotalRows(
  id: string,
  totalRows: number
): Promise<Game> {
  const supabase = await createSupabaseServer();
  const { data, error } = await supabase
    .from("games")
    .update({ total_rows: totalRows })
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(`Failed to update total rows: ${error.message}`);
  return mapDbRowToGame(data);
}

export async function deleteGameById(id: string): Promise<void> {
  const supabase = await createSupabaseServer();
  const { error } = await supabase.from("games").delete().eq("id", id);
  if (error) throw new Error(`Failed to delete game: ${error.message}`);
}

// ── Row mutations ───────────────────────────────────────────

export async function insertRow(input: CreateRowInput): Promise<CrosswordRow> {
  const supabase = await createSupabaseServer();
  const { data, error } = await supabase
    .from("crossword_rows")
    .insert({
      game_id: input.gameId,
      row_order: input.rowOrder ?? 0,
      clue_text: input.clueText,
      answer_text: input.answerText,
      answer_length: input.answerText.length,
      highlighted_indexes_json: input.highlightedIndexes,
      note_text: input.noteText ?? null,
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to create row: ${error.message}`);
  return mapDbRowToCrosswordRow(data);
}

export async function updateRowById(
  id: string,
  input: UpdateRowInput
): Promise<CrosswordRow> {
  const supabase = await createSupabaseServer();

  const updateData: Record<string, unknown> = {};
  if (input.rowOrder !== undefined) updateData.row_order = input.rowOrder;
  if (input.clueText !== undefined) updateData.clue_text = input.clueText;
  if (input.answerText !== undefined) {
    updateData.answer_text = input.answerText;
    updateData.answer_length = input.answerText.length;
  }
  if (input.highlightedIndexes !== undefined) {
    updateData.highlighted_indexes_json = input.highlightedIndexes;
  }
  if (input.noteText !== undefined) updateData.note_text = input.noteText;

  const { data, error } = await supabase
    .from("crossword_rows")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(`Failed to update row: ${error.message}`);
  return mapDbRowToCrosswordRow(data);
}

export async function updateRowStatus(
  id: string,
  status: RowStatus
): Promise<CrosswordRow> {
  const supabase = await createSupabaseServer();
  const { data, error } = await supabase
    .from("crossword_rows")
    .update({ row_status: status })
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(`Failed to update row status: ${error.message}`);
  return mapDbRowToCrosswordRow(data);
}

export async function resetAllRows(gameId: string): Promise<void> {
  const supabase = await createSupabaseServer();
  const { error } = await supabase
    .from("crossword_rows")
    .update({ row_status: "hidden" })
    .eq("game_id", gameId);

  if (error) throw new Error(`Failed to reset rows: ${error.message}`);
}

export async function deleteRowById(id: string): Promise<void> {
  const supabase = await createSupabaseServer();
  const { error } = await supabase.from("crossword_rows").delete().eq("id", id);
  if (error) throw new Error(`Failed to delete row: ${error.message}`);
}

// ── Event mutations ─────────────────────────────────────────

export async function insertGameEvent(
  gameId: string,
  eventType: string,
  message: string,
  payload?: Record<string, unknown>
): Promise<GameEvent> {
  const supabase = await createSupabaseServer();
  const { data, error } = await supabase
    .from("game_events")
    .insert({
      game_id: gameId,
      event_type: eventType,
      message,
      payload_json: payload ?? null,
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to create event: ${error.message}`);
  return mapDbRowToGameEvent(data);
}
