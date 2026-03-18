"use client";

import { cn } from "@/lib/utils/cn";
import { GAME_STATUS } from "@/features/games/constants";
import { useTranslation } from "@/lib/i18n";

const BADGE_STYLES: Record<string, string> = {
  [GAME_STATUS.DRAFT]:
    "border-white/12 bg-white/8 text-white/74",
  [GAME_STATUS.LIVE]:
    "live-pill border-emerald-400/24 bg-emerald-400/14 text-emerald-200 shadow-[0_0_28px_rgba(16,185,129,0.18)]",
  [GAME_STATUS.PAUSED]:
    "border-amber-400/24 bg-amber-400/14 text-amber-100 shadow-[0_0_24px_rgba(245,158,11,0.15)]",
  [GAME_STATUS.ENDED]:
    "border-rose-400/24 bg-rose-400/14 text-rose-100 shadow-[0_0_24px_rgba(244,63,94,0.14)]",
};

interface GameStatusBadgeProps {
  status: string;
  className?: string;
}

export function GameStatusBadge({ status, className }: GameStatusBadgeProps) {
  const { t } = useTranslation();

  const badgeLabels: Record<string, string> = {
    [GAME_STATUS.DRAFT]: t.viewer.aboutToStart,
    [GAME_STATUS.LIVE]: t.viewer.happening,
    [GAME_STATUS.PAUSED]: t.status.paused,
    [GAME_STATUS.ENDED]: t.status.ended,
  };

  const style = BADGE_STYLES[status] ?? BADGE_STYLES[GAME_STATUS.DRAFT];
  const label = badgeLabels[status] ?? badgeLabels[GAME_STATUS.DRAFT];

  return (
    <span
      className={cn(
        "glass-pill inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold",
        style,
        className
      )}
    >
      <span
        className={cn(
          "mr-2 h-2.5 w-2.5 rounded-full",
          status === GAME_STATUS.LIVE
            ? "live-dot bg-emerald-300 shadow-[0_0_16px_rgba(110,231,183,0.75)]"
            : status === GAME_STATUS.PAUSED
              ? "bg-amber-300"
              : status === GAME_STATUS.ENDED
                ? "bg-rose-300"
                : "bg-white/55"
        )}
      />
      {label}
    </span>
  );
}
