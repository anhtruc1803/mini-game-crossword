/**
 * Games — read operations.
 */

import { createSupabaseServer } from "@/lib/supabase/server";
import { mapDbRowToGame, mapDbRowToCrosswordRow, mapDbRowToGameEvent } from "./mapper";
import type { Game, CrosswordRow, GameEvent } from "./types";

export async function getGameByProgramId(programId: string): Promise<Game | null> {
  const supabase = await createSupabaseServer();
  const { data, error } = await supabase
    .from("games")
    .select("*")
    .eq("program_id", programId)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== "PGRST116") {
    throw new Error(`Failed to get game: ${error.message}`);
  }
  return data ? mapDbRowToGame(data) : null;
}

export async function getGameById(id: string): Promise<Game | null> {
  const supabase = await createSupabaseServer();
  const { data, error } = await supabase
    .from("games")
    .select("*")
    .eq("id", id)
    .single();

  if (error && error.code !== "PGRST116") {
    throw new Error(`Failed to get game: ${error.message}`);
  }
  return data ? mapDbRowToGame(data) : null;
}

export async function getGameRows(gameId: string): Promise<CrosswordRow[]> {
  const supabase = await createSupabaseServer();
  const { data, error } = await supabase
    .from("crossword_rows")
    .select("*")
    .eq("game_id", gameId)
    .order("row_order", { ascending: true });

  if (error) throw new Error(`Failed to get rows: ${error.message}`);
  return (data ?? []).map(mapDbRowToCrosswordRow);
}

export async function getRowById(id: string): Promise<CrosswordRow | null> {
  const supabase = await createSupabaseServer();
  const { data, error } = await supabase
    .from("crossword_rows")
    .select("*")
    .eq("id", id)
    .single();

  if (error && error.code !== "PGRST116") {
    throw new Error(`Failed to get row: ${error.message}`);
  }
  return data ? mapDbRowToCrosswordRow(data) : null;
}

export async function getGameEvents(
  gameId: string,
  limit = 20
): Promise<GameEvent[]> {
  const supabase = await createSupabaseServer();
  const { data, error } = await supabase
    .from("game_events")
    .select("*")
    .eq("game_id", gameId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(`Failed to get events: ${error.message}`);
  return (data ?? []).map(mapDbRowToGameEvent);
}
