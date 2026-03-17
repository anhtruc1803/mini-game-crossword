"use client";

import type { GameEvent } from "@/features/games/types";
import { useTranslation } from "@/lib/i18n";

function formatEventMessage(
  event: GameEvent,
  t: ReturnType<typeof useTranslation>["t"]
) {
  const payload = event.payloadJson ?? {};
  const rowOrder =
    typeof payload.rowOrder === "number"
      ? payload.rowOrder + 1
      : typeof payload.rowIndex === "number"
        ? payload.rowIndex + 1
        : null;
  const answer = typeof payload.answer === "string" ? payload.answer : null;
  const text = typeof payload.text === "string" ? payload.text : null;

  switch (event.eventType) {
    case "game_started":
      return t.game.eventGameStarted;
    case "game_paused":
      return t.game.eventGamePaused;
    case "game_resumed":
      return t.game.eventGameResumed;
    case "game_ended":
      return t.game.eventGameEnded;
    case "game_reset":
      return t.game.eventGameReset;
    case "clue_opened":
      return rowOrder ? `Câu ${rowOrder} đã mở` : t.game.eventClueOpened;
    case "answer_revealed":
      return rowOrder && answer
        ? `Đáp án câu ${rowOrder}: ${answer}`
        : answer
          ? `${t.game.eventAnswerRevealed}: ${answer}`
          : t.game.eventAnswerRevealed;
    case "row_advanced":
      return rowOrder ? `Chuyển sang câu ${rowOrder}` : t.game.eventRowAdvanced;
    case "row_rewound":
      return rowOrder ? `Quay lại câu ${rowOrder}` : t.game.eventRowRewound;
    case "announcement_updated":
      return text ? `Thông báo: ${text}` : t.game.announcementRemoved;
    default:
      return event.message;
  }
}

export function EventLog({ events }: { events: GameEvent[] }) {
  const { locale, t } = useTranslation();

  if (events.length === 0) {
    return (
      <p className="text-sm text-[var(--muted-foreground)]">
        {t.game.noEventsYet}
      </p>
    );
  }

  return (
    <div className="max-h-96 space-y-2 overflow-y-auto">
      {events.map((event) => (
        <div
          key={event.id}
          className="rounded-lg bg-[var(--background)] px-3 py-2"
        >
          <p className="text-sm">{formatEventMessage(event, t)}</p>
          <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">
            {new Date(event.createdAt).toLocaleString(locale === "vi" ? "vi-VN" : "en-US")}
          </p>
        </div>
      ))}
    </div>
  );
}
