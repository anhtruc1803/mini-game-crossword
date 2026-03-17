/**
 * Programs — data mapping between Prisma models and domain types.
 */

import type { Program as PrismaProgram } from "@prisma/client";
import { normalizeAssetUrl } from "@/lib/assets/urls";
import type { Program } from "./types";

export function mapPrismaToProgram(row: PrismaProgram): Program {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    imageUrl: normalizeAssetUrl(row.imageUrl),
    status: row.status as Program["status"],
    startAt: row.startAt?.toISOString() ?? null,
    endAt: row.endAt?.toISOString() ?? null,
    themeId: row.themeId,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

// Legacy alias for backward compatibility
export const mapDbRowToProgram = mapPrismaToProgram as (row: unknown) => Program;
