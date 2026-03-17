/**
 * Programs — data mapping between DB rows and domain types.
 *
 * Example:
 *   DB row:  { id, slug, title, description, status, start_at, end_at, theme_id, created_at, updated_at }
 *   Domain:  { id, slug, title, description, status, startAt,  endAt,  themeId,  createdAt,  updatedAt  }
 */

import type { Program } from "./types";

/** Map a Supabase DB row to domain Program. */
export function mapDbRowToProgram(row: Record<string, unknown>): Program {
  return {
    id: row.id as string,
    slug: row.slug as string,
    title: row.title as string,
    description: (row.description as string) ?? null,
    status: row.status as Program["status"],
    startAt: (row.start_at as string) ?? null,
    endAt: (row.end_at as string) ?? null,
    themeId: (row.theme_id as string) ?? null,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}
