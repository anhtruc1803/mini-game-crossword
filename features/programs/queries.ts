/**
 * Programs — read operations.
 * All queries go through this file (single source of truth).
 */

import { createSupabaseServer } from "@/lib/supabase/server";
import { mapDbRowToProgram } from "./mapper";
import type { Program } from "./types";

export async function listPrograms(): Promise<Program[]> {
  const supabase = await createSupabaseServer();
  const { data, error } = await supabase
    .from("programs")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Failed to list programs: ${error.message}`);
  return (data ?? []).map(mapDbRowToProgram);
}

export async function getProgramById(id: string): Promise<Program | null> {
  const supabase = await createSupabaseServer();
  const { data, error } = await supabase
    .from("programs")
    .select("*")
    .eq("id", id)
    .single();

  if (error && error.code !== "PGRST116") {
    throw new Error(`Failed to get program: ${error.message}`);
  }
  return data ? mapDbRowToProgram(data) : null;
}

export async function getProgramBySlug(slug: string): Promise<Program | null> {
  const supabase = await createSupabaseServer();
  const { data, error } = await supabase
    .from("programs")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error && error.code !== "PGRST116") {
    throw new Error(`Failed to get program by slug: ${error.message}`);
  }
  return data ? mapDbRowToProgram(data) : null;
}
