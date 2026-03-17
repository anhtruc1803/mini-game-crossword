/**
 * Viewer queries assemble the full public game snapshot for display.
 * Public viewer data must always be sanitized before reaching the client.
 */

import { z } from "zod";
import { createSupabaseServer } from "@/lib/supabase/server";
import { buildFinalKeywordHint } from "@/features/games/selectors";
import type { PublicViewerSnapshot } from "./view-model";

const publicViewerSnapshotSchema = z.object({
  program: z.object({
    id: z.string(),
    slug: z.string(),
    title: z.string(),
    description: z.string().nullable(),
    status: z.enum(["draft", "live", "ended"]),
    startAt: z.string().nullable(),
    endAt: z.string().nullable(),
    themeId: z.string().nullable(),
    createdAt: z.string(),
    updatedAt: z.string(),
  }),
  theme: z
    .object({
      id: z.string(),
      name: z.string(),
      logoUrl: z.string().nullable(),
      bannerUrl: z.string().nullable(),
      desktopBgUrl: z.string().nullable(),
      mobileBgUrl: z.string().nullable(),
      primaryColor: z.string(),
      secondaryColor: z.string(),
      accentColor: z.string(),
      overlayOpacity: z.number(),
      fontHeading: z.string().nullable(),
      fontBody: z.string().nullable(),
      customCssJson: z.record(z.string(), z.string()).nullable(),
      createdAt: z.string(),
      updatedAt: z.string(),
    })
    .nullable(),
  game: z
    .object({
      id: z.string(),
      title: z.string(),
      subtitle: z.string().nullable(),
      gameStatus: z.enum(["draft", "live", "paused", "ended"]),
      announcementText: z.string().nullable(),
    })
    .nullable(),
  rows: z.array(
    z.object({
      id: z.string(),
      rowOrder: z.number().int().min(0),
      clueText: z.string(),
      answerText: z.string(),
      answerLength: z.number().int().min(0),
      highlightedIndexes: z.array(z.number().int().min(0)),
      rowStatus: z.enum(["hidden", "clue_visible", "answer_revealed"]),
    })
  ),
  activeRowIndex: z.number().int().min(0).nullable(),
  events: z.array(
    z.object({
      id: z.string(),
      gameId: z.string(),
      eventType: z.string(),
      message: z.string(),
      payloadJson: z.record(z.string(), z.unknown()).nullable(),
      createdAt: z.string(),
      createdBy: z.string().nullable(),
    })
  ),
  finalKeyword: z.string().nullable(),
});

export async function getViewerSnapshot(
  programSlug: string
): Promise<PublicViewerSnapshot | null> {
  const supabase = await createSupabaseServer();
  const { data, error } = await supabase.rpc("get_public_viewer_snapshot", {
    p_program_slug: programSlug,
  });

  if (error) {
    throw new Error(`Failed to get public viewer snapshot: ${error.message}`);
  }

  if (!data) {
    return null;
  }

  const parsed = publicViewerSnapshotSchema.parse(data);

  return {
    ...parsed,
    finalKeywordHint: buildFinalKeywordHint(parsed.rows),
  };
}
