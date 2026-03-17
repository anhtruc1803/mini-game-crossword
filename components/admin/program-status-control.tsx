"use client";

import { useState } from "react";
import {
  changeProgramStatusAction,
  deleteProgramAction,
} from "@/features/admin/actions";
import type { Program } from "@/features/programs/types";
import type { ProgramStatus } from "@/features/programs/types";
import { useTranslation } from "@/lib/i18n";

export function ProgramStatusControl({ program }: { program: Program }) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const nextStatusMap: Record<string, { label: string; status: ProgramStatus; color: string } | null> = {
    draft: { label: t.programStatus.publish, status: "live", color: "bg-green-600" },
    live: { label: t.programStatus.end, status: "ended", color: "bg-red-600" },
    ended: { label: t.programStatus.toDraft, status: "draft", color: "bg-gray-600" },
  };

  const statusBadges: Record<string, { label: string; color: string }> = {
    draft: { label: t.status.draft, color: "bg-gray-500" },
    live: { label: t.status.live, color: "bg-green-500" },
    ended: { label: t.status.ended, color: "bg-red-500" },
  };

  const badge = statusBadges[program.status];
  const nextAction = nextStatusMap[program.status];

  async function handleStatusChange() {
    if (!nextAction) return;
    setLoading(true);
    setError(null);

    const result = await changeProgramStatusAction(program.id, nextAction.status);
    if (result?.error) setError(result.error);
    setLoading(false);
  }

  async function handleDelete() {
    if (!confirm(t.programStatus.confirmDelete)) return;
    setLoading(true);
    try {
      const result = await deleteProgramAction(program.id);
      if (result?.error) setError(result.error);
    } catch {
      // redirect
    }
    setLoading(false);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <span className="text-sm text-[var(--muted-foreground)]">{t.programStatus.currentStatus}</span>
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium text-white ${badge?.color}`}>
          {badge?.label}
        </span>
      </div>

      {error && (
        <div className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">{error}</div>
      )}

      <div className="flex gap-2">
        {nextAction && (
          <button
            onClick={handleStatusChange}
            disabled={loading}
            className={`rounded-lg px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50 ${nextAction.color}`}
          >
            {nextAction.label}
          </button>
        )}

        {program.status !== "live" && (
          <button
            onClick={handleDelete}
            disabled={loading}
            className="rounded-lg border border-red-500/30 px-4 py-2 text-sm text-red-400 transition hover:bg-red-500/10 disabled:opacity-50"
          >
            {t.common.delete}
          </button>
        )}
      </div>
    </div>
  );
}
