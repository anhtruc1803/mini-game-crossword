/**
 * Themes — write operations.
 */

import { prisma } from "@/lib/db/prisma";
import { mapPrismaToTheme } from "./mapper";
import type { Theme } from "./types";
import type { CreateThemeInput, UpdateThemeInput } from "./schemas";

export async function insertTheme(input: CreateThemeInput): Promise<Theme> {
  const row = await prisma.theme.create({
    data: {
      name: input.name,
      logoUrl: input.logoUrl ?? null,
      bannerUrl: input.bannerUrl ?? null,
      desktopBgUrl: input.desktopBgUrl ?? null,
      mobileBgUrl: input.mobileBgUrl ?? null,
      primaryColor: input.primaryColor,
      secondaryColor: input.secondaryColor,
      accentColor: input.accentColor,
      overlayOpacity: input.overlayOpacity,
      fontHeading: input.fontHeading ?? null,
      fontBody: input.fontBody ?? null,
    },
  });
  return mapPrismaToTheme(row);
}

export async function updateThemeById(
  id: string,
  input: UpdateThemeInput
): Promise<Theme> {
  const data: Record<string, unknown> = {};
  if (input.name !== undefined) data.name = input.name;
  if (input.logoUrl !== undefined) data.logoUrl = input.logoUrl;
  if (input.bannerUrl !== undefined) data.bannerUrl = input.bannerUrl;
  if (input.desktopBgUrl !== undefined) data.desktopBgUrl = input.desktopBgUrl;
  if (input.mobileBgUrl !== undefined) data.mobileBgUrl = input.mobileBgUrl;
  if (input.primaryColor !== undefined) data.primaryColor = input.primaryColor;
  if (input.secondaryColor !== undefined) data.secondaryColor = input.secondaryColor;
  if (input.accentColor !== undefined) data.accentColor = input.accentColor;
  if (input.overlayOpacity !== undefined) data.overlayOpacity = input.overlayOpacity;
  if (input.fontHeading !== undefined) data.fontHeading = input.fontHeading;
  if (input.fontBody !== undefined) data.fontBody = input.fontBody;

  const row = await prisma.theme.update({
    where: { id },
    data,
  });
  return mapPrismaToTheme(row);
}

export async function deleteThemeById(id: string): Promise<void> {
  await prisma.theme.delete({ where: { id } });
}
