/**
 * Themes — data mapping between DB rows and domain types.
 */

import type { Theme } from "./types";

export function mapDbRowToTheme(row: Record<string, unknown>): Theme {
  return {
    id: row.id as string,
    name: row.name as string,
    logoUrl: (row.logo_url as string) ?? null,
    bannerUrl: (row.banner_url as string) ?? null,
    desktopBgUrl: (row.desktop_bg_url as string) ?? null,
    mobileBgUrl: (row.mobile_bg_url as string) ?? null,
    primaryColor: row.primary_color as string,
    secondaryColor: row.secondary_color as string,
    accentColor: row.accent_color as string,
    overlayOpacity: row.overlay_opacity as number,
    fontHeading: (row.font_heading as string) ?? null,
    fontBody: (row.font_body as string) ?? null,
    customCssJson: (row.custom_css_json as Record<string, string>) ?? null,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}
