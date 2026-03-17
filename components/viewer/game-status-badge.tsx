"use client";

import { cn } from "@/lib/utils/cn";
import { GAME_STATUS } from "@/features/games/constants";
import { useTranslation } from "@/lib/i18n";

const BADGE_STYLES: Record<string, string> = {
  [GAME_STATUS.DRAFT]: "bg-gray-500/20 text-gray-300 border-gray-500/30",
  [GAME_STATUS.LIVE]: "bg-green-500/20 text-green-400 border-green-500/30 animate-pulse",
  [GAME_STATUS.PAUSED]: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  [GAME_STATUS.ENDED]: "bg-red-500/20 text-red-400 border-red-500/30",
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
        "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold",
        style,
        className
      )}
    >
      {status === GAME_STATUS.LIVE && (
        <span className="mr-1.5 h-2 w-2 rounded-full bg-green-400" />
      )}
      {label}
    </span>
  );
}
