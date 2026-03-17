/**
 * Themes — data mapping between Prisma models and domain types.
 */

import type { Theme as PrismaTheme } from "@prisma/client";
import type { Theme } from "./types";

export function mapPrismaToTheme(row: PrismaTheme): Theme {
  let customCss: Record<string, string> | null = null;
  try {
    if (row.customCssJson) {
      customCss = JSON.parse(row.customCssJson) as Record<string, string>;
    }
  } catch {
    customCss = null;
  }

  return {
    id: row.id,
    name: row.name,
    logoUrl: row.logoUrl,
    bannerUrl: row.bannerUrl,
    desktopBgUrl: row.desktopBgUrl,
    mobileBgUrl: row.mobileBgUrl,
    primaryColor: row.primaryColor,
    secondaryColor: row.secondaryColor,
    accentColor: row.accentColor,
    overlayOpacity: row.overlayOpacity,
    fontHeading: row.fontHeading,
    fontBody: row.fontBody,
    customCssJson: customCss,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

// Legacy alias
export const mapDbRowToTheme = mapPrismaToTheme as (row: unknown) => Theme;
