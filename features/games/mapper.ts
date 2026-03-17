/**
 * Games — data mapping between DB rows and domain types.
 *
 * DB uses snake_case, domain uses camelCase.
 */

import type { Game, CrosswordRow, GameEvent } from "./types";

export function mapDbRowToGame(row: Record<string, unknown>): Game {
  return {
    id: row.id as string,
    programId: row.program_id as string,
    title: row.title as string,
    subtitle: (row.subtitle as string) ?? null,
    finalKeyword: (row.final_keyword as string) ?? null,
    totalRows: row.total_rows as number,
    currentRowIndex: (row.current_row_index as number) ?? null,
    gameStatus: row.game_status as Game["gameStatus"],
    announcementText: (row.announcement_text as string) ?? null,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export function mapDbRowToCrosswordRow(row: Record<string, unknown>): CrosswordRow {
  return {
    id: row.id as string,
    gameId: row.game_id as string,
    rowOrder: row.row_order as number,
    clueText: row.clue_text as string,
    answerText: row.answer_text as string,
    answerLength: row.answer_length as number,
    highlightedIndexes: (row.highlighted_indexes_json as number[]) ?? [],
    rowStatus: row.row_status as CrosswordRow["rowStatus"],
    noteText: (row.note_text as string) ?? null,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export function mapDbRowToGameEvent(row: Record<string, unknown>): GameEvent {
  return {
    id: row.id as string,
    gameId: row.game_id as string,
    eventType: row.event_type as string,
    message: row.message as string,
    payloadJson: (row.payload_json as Record<string, unknown>) ?? null,
    createdAt: row.created_at as string,
    createdBy: (row.created_by as string) ?? null,
  };
}
