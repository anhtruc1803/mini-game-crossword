"use client";

import type { GameEvent } from "@/features/games/types";
import { useTranslation } from "@/lib/i18n";

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
          <p className="text-sm">{event.message}</p>
          <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">
            {new Date(event.createdAt).toLocaleString(locale === "vi" ? "vi-VN" : "en-US")}
          </p>
        </div>
      ))}
    </div>
  );
}
