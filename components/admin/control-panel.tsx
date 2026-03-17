"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  advanceRowAction,
  endGameAction,
  pauseGameAction,
  previousRowAction,
  resetGameAction,
  resumeGameAction,
  revealAnswerAction,
  revealClueAction,
  startGameAction,
  updateAnnouncementAction,
} from "@/features/admin/actions";
import { GAME_STATUS, ROW_STATUS } from "@/features/games/constants";
import type { Game, CrosswordRow } from "@/features/games/types";
import { useTranslation } from "@/lib/i18n";

interface ControlPanelProps {
  programId: string;
  game: Game;
  rows: CrosswordRow[];
}

export function ControlPanel({ programId, game, rows }: ControlPanelProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState(game.announcementText ?? "");

  const isLive = game.gameStatus === GAME_STATUS.LIVE;
  const isPaused = game.gameStatus === GAME_STATUS.PAUSED;
  const isDraft = game.gameStatus === GAME_STATUS.DRAFT;
  const isEnded = game.gameStatus === GAME_STATUS.ENDED;
  const currentRow = game.currentRowIndex !== null ? rows[game.currentRowIndex] : null;
  const canRewind =
    (isLive || isPaused) &&
    (game.currentRowIndex ?? 0) > 0 &&
    currentRow?.rowStatus === ROW_STATUS.HIDDEN;

  async function exec(action: () => Promise<{ error?: string; success?: boolean }>) {
    setLoading(true);
    setError(null);
    const result = await action();
    if (result?.error) {
      setError(result.error);
    } else {
      router.refresh();
    }
    setLoading(false);
  }

  const statusLabel = isLive
    ? t.status.live
    : isPaused
      ? t.status.paused
      : isEnded
        ? t.status.ended
        : t.status.draft;

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-lg bg-red-500/10 px-4 py-2 text-sm text-red-400">{error}</div>
      )}

      <div className="flex items-center gap-4">
        <span className="text-sm text-[var(--muted-foreground)]">{t.game.statusLabel}</span>
        <span
          className={`rounded-full px-3 py-1 text-sm font-medium text-white ${
            isLive
              ? "bg-green-500"
              : isPaused
                ? "bg-yellow-500"
                : isEnded
                  ? "bg-red-500"
                  : "bg-gray-500"
          }`}
        >
          {statusLabel}
        </span>
        {currentRow && (
          <span className="text-sm text-[var(--muted-foreground)]">
            {t.game.currentQuestion} #{(game.currentRowIndex ?? 0) + 1} / {game.totalRows}
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {isDraft && (
          <button
            onClick={() => exec(() => startGameAction(game.id, programId))}
            disabled={loading || rows.length === 0}
            className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
          >
            {t.game.startGame}
          </button>
        )}

        {isLive && (
          <>
            <button
              onClick={() => exec(() => revealClueAction(game.id, programId))}
              disabled={loading || !currentRow || currentRow.rowStatus !== ROW_STATUS.HIDDEN}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
            >
              {t.game.openQuestion}
            </button>
            <button
              onClick={() => exec(() => revealAnswerAction(game.id, programId))}
              disabled={loading || !currentRow || currentRow.rowStatus !== ROW_STATUS.CLUE_VISIBLE}
              className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
            >
              {t.game.showAnswer}
            </button>
            <button
              onClick={() => exec(() => advanceRowAction(game.id, programId))}
              disabled={loading || (game.currentRowIndex ?? 0) >= game.totalRows - 1}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
            >
              {t.game.nextQuestion}
            </button>
            <button
              onClick={() => exec(() => previousRowAction(game.id, programId))}
              disabled={loading || !canRewind}
              className="rounded-lg bg-slate-600 px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
            >
              {t.game.previousQuestion}
            </button>
            <button
              onClick={() => exec(() => pauseGameAction(game.id, programId))}
              disabled={loading}
              className="rounded-lg bg-yellow-600 px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
            >
              {t.game.pause}
            </button>
            <button
              onClick={() => exec(() => endGameAction(game.id, programId))}
              disabled={loading}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
            >
              {t.game.endGame}
            </button>
          </>
        )}

        {isPaused && (
          <>
            <button
              onClick={() => exec(() => previousRowAction(game.id, programId))}
              disabled={loading || !canRewind}
              className="rounded-lg bg-slate-600 px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
            >
              {t.game.previousQuestion}
            </button>
            <button
              onClick={() => exec(() => resumeGameAction(game.id, programId))}
              disabled={loading}
              className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
            >
              {t.game.resume}
            </button>
            <button
              onClick={() => exec(() => endGameAction(game.id, programId))}
              disabled={loading}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
            >
              {t.game.endGame}
            </button>
          </>
        )}

        {isEnded && (
          <button
            onClick={() => exec(() => resetGameAction(game.id, programId))}
            disabled={loading}
            className="rounded-lg bg-gray-600 px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
          >
            {t.game.resetGame}
          </button>
        )}
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">{t.game.announcement}</label>
        <div className="flex gap-2">
          <input
            value={announcement}
            onChange={(e) => setAnnouncement(e.target.value)}
            className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:ring-2 focus:ring-[var(--ring)]"
            placeholder={t.game.announcementPlaceholder}
          />
          <button
            onClick={() =>
              exec(() => updateAnnouncementAction(game.id, programId, announcement || null))
            }
            disabled={loading}
            className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
          >
            {t.common.update}
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <h4 className="text-sm font-medium">{t.game.questionsOverview}</h4>
        <div className="space-y-1">
          {rows.map((row, i) => (
            <div
              key={row.id}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm ${
                i === game.currentRowIndex
                  ? "bg-[var(--primary)]/10 border border-[var(--primary)]/30"
                  : "bg-[var(--background)]"
              }`}
            >
              <span className="w-8 text-center font-mono text-xs">#{i + 1}</span>
              <span className="flex-1 truncate">{row.clueText}</span>
              <span
                className={`rounded-full px-2 py-0.5 text-xs ${
                  row.rowStatus === ROW_STATUS.ANSWER_REVEALED
                    ? "bg-green-500/20 text-green-400"
                    : row.rowStatus === ROW_STATUS.CLUE_VISIBLE
                      ? "bg-blue-500/20 text-blue-400"
                      : "bg-gray-500/20 text-gray-400"
                }`}
              >
                {row.rowStatus === ROW_STATUS.ANSWER_REVEALED
                  ? row.answerText
                  : row.rowStatus === ROW_STATUS.CLUE_VISIBLE
                    ? t.game.opened
                    : t.status.hidden}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
