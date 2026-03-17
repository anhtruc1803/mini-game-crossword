/**
 * Themes — read operations.
 */

import { prisma } from "@/lib/db/prisma";
import { mapPrismaToTheme } from "./mapper";
import type { Theme } from "./types";

export async function listThemes(): Promise<Theme[]> {
  const rows = await prisma.theme.findMany({
    orderBy: { createdAt: "desc" },
  });
  return rows.map(mapPrismaToTheme);
}

export async function getThemeById(id: string): Promise<Theme | null> {
  const row = await prisma.theme.findUnique({ where: { id } });
  return row ? mapPrismaToTheme(row) : null;
}
