"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createRowAction } from "@/features/admin/actions";
import { useTranslation } from "@/lib/i18n";

interface RowEditorProps {
  gameId: string;
  nextOrder: number;
}

export function RowEditor({ gameId, nextOrder }: RowEditorProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const [clueText, setClueText] = useState("");
  const [answerText, setAnswerText] = useState("");
  const [highlightedIndexes, setHighlightedIndexes] = useState<number[]>([]);
  const [noteText, setNoteText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upperAnswer = answerText.toUpperCase();

  function toggleHighlight(index: number) {
    setHighlightedIndexes((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!clueText || !answerText) return;

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.set("gameId", gameId);
    formData.set("rowOrder", String(nextOrder));
    formData.set("clueText", clueText);
    formData.set("answerText", upperAnswer);
    formData.set("highlightedIndexes", JSON.stringify(highlightedIndexes));
    formData.set("noteText", noteText);

    const result = await createRowAction(formData);
    if (result?.error) {
      setError(result.error);
    } else {
      setClueText("");
      setAnswerText("");
      setHighlightedIndexes([]);
      setNoteText("");
      router.refresh();
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">{error}</div>
      )}

      <div>
        <label className="mb-1 block text-sm font-medium">{t.rows.questionLabel}</label>
        <textarea
          value={clueText}
          onChange={(e) => setClueText(e.target.value)}
          required
          rows={2}
          className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:ring-2 focus:ring-[var(--ring)]"
          placeholder={t.rows.questionPlaceholder}
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">{t.rows.answerLabel}</label>
        <input
          value={answerText}
          onChange={(e) => {
            setAnswerText(e.target.value);
            setHighlightedIndexes([]);
          }}
          required
          className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm font-mono uppercase text-[var(--foreground)] outline-none focus:ring-2 focus:ring-[var(--ring)]"
          placeholder={t.rows.answerPlaceholder}
        />
      </div>

      {upperAnswer.length > 0 && (
        <div>
          <label className="mb-2 block text-sm font-medium">
            {t.rows.selectHighlight}
          </label>
          <div className="flex flex-wrap gap-1">
            {upperAnswer.split("").map((char, i) => {
              const isSelected = highlightedIndexes.includes(i);
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => toggleHighlight(i)}
                  className={`flex h-9 w-9 items-center justify-center rounded border text-sm font-bold transition ${
                    isSelected
                      ? "border-[var(--accent)] bg-[var(--accent)]/20 text-[var(--accent)]"
                      : "border-[var(--border)] text-[var(--foreground)] hover:border-[var(--accent)]"
                  }`}
                >
                  {char}
                </button>
              );
            })}
          </div>
          <p className="mt-1 text-xs text-[var(--muted-foreground)]">
            {t.rows.selected}{" "}
            {highlightedIndexes.length > 0
              ? highlightedIndexes.map((i) => upperAnswer[i]).join(", ")
              : t.rows.notSelected}
          </p>
        </div>
      )}

      <div>
        <label className="mb-1 block text-sm font-medium">{t.rows.noteOptional}</label>
        <input
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:ring-2 focus:ring-[var(--ring)]"
          placeholder={t.rows.notePlaceholder}
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-[var(--primary)] py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
      >
        {loading ? t.rows.adding : `${t.rows.addQuestionNum}${nextOrder + 1}`}
      </button>
    </form>
  );
}
