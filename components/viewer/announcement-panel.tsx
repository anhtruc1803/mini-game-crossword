"use client";

import type { GameEvent } from "@/features/games/types";
import { useTranslation } from "@/lib/i18n";

interface AnnouncementPanelProps {
  announcementText: string | null;
  events: GameEvent[];
}

export function AnnouncementPanel({
  announcementText,
  events,
}: AnnouncementPanelProps) {
  const { locale, t } = useTranslation();

  return (
    <div className="space-y-4">
      {/* Current announcement */}
      {announcementText && (
        <div className="rounded-xl border border-[var(--accent)]/30 bg-[var(--accent)]/10 px-4 py-3">
          <p className="text-sm font-medium text-[var(--accent)]">
            {announcementText}
          </p>
        </div>
      )}

      {/* Event history */}
      {events.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
            {t.viewer.updates}
          </h3>
          <div className="max-h-48 space-y-1.5 overflow-y-auto md:max-h-64">
            {events.map((event) => (
              <div
                key={event.id}
                className="rounded-lg bg-[var(--card)]/50 px-3 py-2"
              >
                <p className="text-sm text-[var(--foreground)]">{event.message}</p>
                <p className="mt-0.5 text-[10px] text-[var(--muted-foreground)]">
                  {new Date(event.createdAt).toLocaleTimeString(locale === "vi" ? "vi-VN" : "en-US")}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
