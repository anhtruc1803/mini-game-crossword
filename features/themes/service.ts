/**
 * Themes — business logic / orchestration.
 */

import { createThemeSchema, updateThemeSchema } from "./schemas";
import type { CreateThemeInput, UpdateThemeInput } from "./schemas";
import type { Theme } from "./types";
import { insertTheme, updateThemeById, deleteThemeById } from "./mutations";

export async function createTheme(input: CreateThemeInput): Promise<Theme> {
  const validated = createThemeSchema.parse(input);
  return insertTheme(validated);
}

export async function updateTheme(
  id: string,
  input: UpdateThemeInput
): Promise<Theme> {
  const validated = updateThemeSchema.parse(input);
  return updateThemeById(id, validated);
}

export async function deleteTheme(id: string): Promise<void> {
  return deleteThemeById(id);
}
