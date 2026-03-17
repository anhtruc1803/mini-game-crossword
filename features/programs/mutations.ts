/**
 * Programs — write operations.
 * All mutations go through this file (single source of truth).
 */

import { createSupabaseServer } from "@/lib/supabase/server";
import { mapDbRowToProgram } from "./mapper";
import type { Program, ProgramStatus } from "./types";
import type { CreateProgramInput, UpdateProgramInput } from "./schemas";

export async function insertProgram(input: CreateProgramInput): Promise<Program> {
  const supabase = await createSupabaseServer();
  const { data, error } = await supabase
    .from("programs")
    .insert({
      title: input.title,
      slug: input.slug,
      description: input.description ?? null,
      start_at: input.startAt ?? null,
      end_at: input.endAt ?? null,
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to create program: ${error.message}`);
  return mapDbRowToProgram(data);
}

export async function updateProgramById(
  id: string,
  input: UpdateProgramInput
): Promise<Program> {
  const supabase = await createSupabaseServer();

  const updateData: Record<string, unknown> = {};
  if (input.title !== undefined) updateData.title = input.title;
  if (input.slug !== undefined) updateData.slug = input.slug;
  if (input.description !== undefined) updateData.description = input.description;
  if (input.startAt !== undefined) updateData.start_at = input.startAt;
  if (input.endAt !== undefined) updateData.end_at = input.endAt;

  const { data, error } = await supabase
    .from("programs")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(`Failed to update program: ${error.message}`);
  return mapDbRowToProgram(data);
}

export async function updateProgramStatus(
  id: string,
  status: ProgramStatus
): Promise<Program> {
  const supabase = await createSupabaseServer();
  const { data, error } = await supabase
    .from("programs")
    .update({ status })
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(`Failed to update program status: ${error.message}`);
  return mapDbRowToProgram(data);
}

export async function updateProgramTheme(
  id: string,
  themeId: string | null
): Promise<Program> {
  const supabase = await createSupabaseServer();
  const { data, error } = await supabase
    .from("programs")
    .update({ theme_id: themeId })
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(`Failed to update program theme: ${error.message}`);
  return mapDbRowToProgram(data);
}

export async function deleteProgramById(id: string): Promise<void> {
  const supabase = await createSupabaseServer();
  const { error } = await supabase
    .from("programs")
    .delete()
    .eq("id", id);

  if (error) throw new Error(`Failed to delete program: ${error.message}`);
}
