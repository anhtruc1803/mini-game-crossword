"use client";

import type { GameEvent } from "@/features/games/types";
import { useTranslation } from "@/lib/i18n";
import { cn } from "@/lib/utils/cn";

function formatEventMessage(
  event: GameEvent,
  locale: "vi" | "en",
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

  const isVi = locale === "vi";

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
      if (rowOrder) return isVi ? `Câu ${rowOrder} đã mở` : `Question ${rowOrder} opened`;
      return t.game.eventClueOpened;
    case "answer_revealed":
      if (rowOrder && answer) return isVi ? `Đáp án câu ${rowOrder}: ${answer}` : `Answer for question ${rowOrder}: ${answer}`;
      if (answer) return `${t.game.eventAnswerRevealed}: ${answer}`;
      return t.game.eventAnswerRevealed;
    case "row_advanced":
      if (rowOrder) return isVi ? `Chuyển sang câu ${rowOrder}` : `Moved to question ${rowOrder}`;
      return t.game.eventRowAdvanced;
    case "row_rewound":
      if (rowOrder) return isVi ? `Quay lại câu ${rowOrder}` : `Moved back to question ${rowOrder}`;
      return t.game.eventRowRewound;
    case "announcement_updated":
      if (!text) return t.game.announcementRemoved;
      return isVi ? `Thông báo: ${text}` : `Announcement: ${text}`;
    default:
      return event.message;
  }
}

function formatEventType(eventType: string, t: ReturnType<typeof useTranslation>["t"]) {
  const labels: Record<string, string> = {
    game_started: t.game.eventGameStarted,
    game_paused: t.game.eventGamePaused,
    game_resumed: t.game.eventGameResumed,
    game_ended: t.game.eventGameEnded,
    game_reset: t.game.eventGameReset,
    clue_opened: t.game.eventClueOpened,
    answer_revealed: t.game.eventAnswerRevealed,
    row_advanced: t.game.eventRowAdvanced,
    row_rewound: t.game.eventRowRewound,
    announcement_updated: t.game.announcement,
  };

  return labels[eventType] ?? eventType.replaceAll("_", " ");
}

function eventTone(eventType: string) {
  if (eventType.includes("answer")) return "bg-[var(--accent)]/20 text-[var(--accent)] border-[var(--accent)]/25";
  if (eventType.includes("clue") || eventType.includes("row")) return "bg-[var(--primary)]/14 text-[var(--primary)] border-[var(--primary)]/25";
  if (eventType.includes("pause") || eventType.includes("end")) return "bg-[var(--celebration)]/14 text-[var(--celebration)] border-[var(--celebration)]/25";
  return "bg-white/6 text-white/70 border-white/10";
}

export function EventLog({ events }: { events: GameEvent[] }) {
  const { locale, t } = useTranslation();

  if (events.length === 0) {
    return <p className="text-sm leading-7 text-white/56">{t.game.noEventsYet}</p>;
  }

  return (
    <div className="max-h-[42rem] space-y-3 overflow-y-auto pr-1">
      {events.map((event) => (
        <article key={event.id} className="glass-panel-soft soft-hover rounded-[24px] p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 space-y-3">
              <span
                className={cn(
                  "inline-flex rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em]",
                  eventTone(event.eventType)
                )}
              >
                {formatEventType(event.eventType, t)}
              </span>
              <p className="text-sm leading-7 text-white/88">
                {formatEventMessage(event, locale, t)}
              </p>
            </div>

            <time className="shrink-0 text-xs text-white/40">
              {new Date(event.createdAt).toLocaleString(locale === "vi" ? "vi-VN" : "en-US")}
            </time>
          </div>
        </article>
      ))}
    </div>
  );
}
