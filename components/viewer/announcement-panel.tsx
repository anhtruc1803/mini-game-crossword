"use client";

import type { GameEvent } from "@/features/games/types";
import { useTranslation } from "@/lib/i18n";
import { cn } from "@/lib/utils/cn";

interface AnnouncementPanelProps {
  announcementText: string | null;
  events: GameEvent[];
}

function getEventLabel(
  eventType: string,
  t: ReturnType<typeof useTranslation>["t"]
) {
  const labels: Record<string, string> = {
    game_started: t.viewer.eventGameStarted,
    game_paused: t.viewer.eventGamePaused,
    game_resumed: t.viewer.eventGameResumed,
    game_ended: t.viewer.eventGameEnded,
    clue_opened: t.viewer.eventClueOpened,
    answer_revealed: t.viewer.eventAnswerRevealed,
    row_advanced: t.viewer.eventRowAdvanced,
  };

  return labels[eventType] ?? eventType.replaceAll("_", " ");
}

function formatEventTime(dateString: string, locale: "vi" | "en") {
  const date = new Date(dateString);
  const diffSeconds = Math.round((date.getTime() - Date.now()) / 1000);
  const absSeconds = Math.abs(diffSeconds);

  if (absSeconds < 10) {
    return locale === "vi" ? "Vừa xong" : "Just now";
  }

  const formatter = new Intl.RelativeTimeFormat(locale === "vi" ? "vi-VN" : "en-US", {
    numeric: "auto",
  });

  if (absSeconds < 60) return formatter.format(diffSeconds, "second");

  const diffMinutes = Math.round(diffSeconds / 60);
  if (Math.abs(diffMinutes) < 60) return formatter.format(diffMinutes, "minute");

  const diffHours = Math.round(diffMinutes / 60);
  return formatter.format(diffHours, "hour");
}

function eventTone(eventType: string) {
  if (eventType.includes("answer")) return "bg-amber-300 shadow-[0_0_18px_rgba(252,211,77,0.55)]";
  if (eventType.includes("clue") || eventType.includes("row")) return "bg-cyan-300 shadow-[0_0_18px_rgba(103,232,249,0.5)]";
  if (eventType.includes("pause") || eventType.includes("end")) return "bg-rose-300 shadow-[0_0_18px_rgba(253,164,175,0.45)]";
  return "bg-white/45";
}

export function AnnouncementPanel({
  announcementText,
  events,
}: AnnouncementPanelProps) {
  const { locale, t } = useTranslation();

  return (
    <section className="glass-panel rounded-[28px] p-4 sm:p-5">
      <div className="mb-4">
        <p className="text-xs uppercase tracking-[0.24em] text-white/42">
          {t.viewer.updates}
        </p>
        <h3 className="mt-2 text-2xl font-semibold text-white">{t.viewer.updates}</h3>
        <p className="mt-2 text-sm leading-6 text-white/56">{t.viewer.updatesSubtitle}</p>
      </div>

      {announcementText && (
        <div className="mb-4 rounded-[24px] border border-[var(--primary)]/24 bg-[var(--primary)]/10 p-4 shadow-[0_18px_36px_rgba(2,6,23,0.2)]">
          <p className="text-xs uppercase tracking-[0.24em] text-white/48">
            {t.viewer.announcementLabel}
          </p>
          <p className="mt-2 text-sm leading-6 text-white/90">{announcementText}</p>
        </div>
      )}

      {events.length > 0 ? (
        <div className="max-h-[28rem] space-y-3 overflow-y-auto pr-1">
          {events.map((event) => (
            <div
              key={event.id}
              className="glass-panel-soft rounded-[24px] p-4"
            >
              <div className="flex items-start gap-3">
                <div className={cn("mt-1 h-3 w-3 rounded-full", eventTone(event.eventType))} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-medium leading-6 text-white/88">{event.message}</p>
                    <span className="text-xs text-white/44">
                      {formatEventTime(event.createdAt, locale)}
                    </span>
                  </div>
                  <p className="mt-2 text-xs uppercase tracking-[0.24em] text-white/35">
                    {getEventLabel(event.eventType, t)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-[24px] border border-dashed border-white/12 bg-white/4 px-4 py-8 text-center text-sm leading-6 text-white/50">
          {t.viewer.noUpdatesYet}
        </div>
      )}
    </section>
  );
}
