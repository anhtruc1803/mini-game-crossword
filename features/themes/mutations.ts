/**
 * Themes — write operations.
 */

import { createSupabaseServer } from "@/lib/supabase/server";
import { mapDbRowToTheme } from "./mapper";
import type { Theme } from "./types";
import type { CreateThemeInput, UpdateThemeInput } from "./schemas";

export async function insertTheme(input: CreateThemeInput): Promise<Theme> {
  const supabase = await createSupabaseServer();
  const { data, error } = await supabase
    .from("themes")
    .insert({
      name: input.name,
      logo_url: input.logoUrl ?? null,
      banner_url: input.bannerUrl ?? null,
      desktop_bg_url: input.desktopBgUrl ?? null,
      mobile_bg_url: input.mobileBgUrl ?? null,
      primary_color: input.primaryColor,
      secondary_color: input.secondaryColor,
      accent_color: input.accentColor,
      overlay_opacity: input.overlayOpacity,
      font_heading: input.fontHeading ?? null,
      font_body: input.fontBody ?? null,
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to create theme: ${error.message}`);
  return mapDbRowToTheme(data);
}

export async function updateThemeById(
  id: string,
  input: UpdateThemeInput
): Promise<Theme> {
  const supabase = await createSupabaseServer();

  const updateData: Record<string, unknown> = {};
  if (input.name !== undefined) updateData.name = input.name;
  if (input.logoUrl !== undefined) updateData.logo_url = input.logoUrl;
  if (input.bannerUrl !== undefined) updateData.banner_url = input.bannerUrl;
  if (input.desktopBgUrl !== undefined) updateData.desktop_bg_url = input.desktopBgUrl;
  if (input.mobileBgUrl !== undefined) updateData.mobile_bg_url = input.mobileBgUrl;
  if (input.primaryColor !== undefined) updateData.primary_color = input.primaryColor;
  if (input.secondaryColor !== undefined) updateData.secondary_color = input.secondaryColor;
  if (input.accentColor !== undefined) updateData.accent_color = input.accentColor;
  if (input.overlayOpacity !== undefined) updateData.overlay_opacity = input.overlayOpacity;
  if (input.fontHeading !== undefined) updateData.font_heading = input.fontHeading;
  if (input.fontBody !== undefined) updateData.font_body = input.fontBody;

  const { data, error } = await supabase
    .from("themes")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(`Failed to update theme: ${error.message}`);
  return mapDbRowToTheme(data);
}

export async function deleteThemeById(id: string): Promise<void> {
  const supabase = await createSupabaseServer();
  const { error } = await supabase.from("themes").delete().eq("id", id);
  if (error) throw new Error(`Failed to delete theme: ${error.message}`);
}
