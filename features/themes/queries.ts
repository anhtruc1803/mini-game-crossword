/**
 * Themes — read operations.
 */

import { createSupabaseServer } from "@/lib/supabase/server";
import { mapDbRowToTheme } from "./mapper";
import type { Theme } from "./types";

export async function listThemes(): Promise<Theme[]> {
  const supabase = await createSupabaseServer();
  const { data, error } = await supabase
    .from("themes")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Failed to list themes: ${error.message}`);
  return (data ?? []).map(mapDbRowToTheme);
}

export async function getThemeById(id: string): Promise<Theme | null> {
  const supabase = await createSupabaseServer();
  const { data, error } = await supabase
    .from("themes")
    .select("*")
    .eq("id", id)
    .single();

  if (error && error.code !== "PGRST116") {
    throw new Error(`Failed to get theme: ${error.message}`);
  }
  return data ? mapDbRowToTheme(data) : null;
}
