"use client";

import { useState } from "react";
import { createProgramAction, updateProgramAction } from "@/features/admin/actions";
import type { Program } from "@/features/programs/types";
import { useTranslation } from "@/lib/i18n";

interface ProgramFormProps {
  program?: Program;
}

export function ProgramForm({ program }: ProgramFormProps) {
  const { t } = useTranslation();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const isEditing = !!program;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    try {
      const result = isEditing
        ? await updateProgramAction(program.id, formData)
        : await createProgramAction(formData);

      if (result?.error) {
        setError(result.error);
      }
    } catch {
      // redirect throws in server actions — this is expected
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl space-y-5">
      {error && (
        <div className="rounded-lg bg-red-500/10 px-4 py-2 text-sm text-red-400">
          {error}
        </div>
      )}

      <div>
        <label className="mb-1 block text-sm font-medium">{t.programForm.nameLabel}</label>
        <input
          name="title"
          defaultValue={program?.title ?? ""}
          required
          className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-2 text-[var(--foreground)] outline-none focus:ring-2 focus:ring-[var(--ring)]"
          placeholder={t.programForm.namePlaceholder}
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">{t.programForm.slugLabel}</label>
        <input
          name="slug"
          defaultValue={program?.slug ?? ""}
          required
          pattern="^[a-z0-9-]+$"
          className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-2 text-[var(--foreground)] outline-none focus:ring-2 focus:ring-[var(--ring)]"
          placeholder={t.programForm.slugPlaceholder}
        />
        <p className="mt-1 text-xs text-[var(--muted-foreground)]">
          {t.programForm.slugHelp}
        </p>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">{t.programForm.descriptionLabel}</label>
        <textarea
          name="description"
          defaultValue={program?.description ?? ""}
          rows={3}
          className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-2 text-[var(--foreground)] outline-none focus:ring-2 focus:ring-[var(--ring)]"
          placeholder={t.programForm.descriptionPlaceholder}
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-[var(--primary)] px-6 py-2.5 font-medium text-white transition hover:opacity-90 disabled:opacity-50"
      >
        {loading
          ? t.common.processing
          : isEditing
            ? t.common.update
            : t.admin.createProgram}
      </button>
    </form>
  );
}
