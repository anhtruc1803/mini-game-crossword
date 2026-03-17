"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  createThemeAction,
  setProgramThemeAction,
  updateThemeAction,
} from "@/features/admin/actions";
import type { Theme } from "@/features/themes/types";
import { useTranslation } from "@/lib/i18n";

interface ThemeFormProps {
  programId: string;
  theme: Theme | null;
}

export function ThemeForm({ programId, theme }: ThemeFormProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    const formData = new FormData(e.currentTarget);

    try {
      if (theme) {
        const result = await updateThemeAction(theme.id, formData);
        if (result?.error) {
          setError(result.error);
        } else {
          setSuccess(true);
          router.refresh();
        }
      } else {
        const result = await createThemeAction(formData);
        if (result?.error) {
          setError(result.error);
        } else if (result?.themeId) {
          const linkResult = await setProgramThemeAction(programId, result.themeId);
          if (linkResult?.error) {
            setError(linkResult.error);
          } else {
            setSuccess(true);
            router.refresh();
          }
        }
      }
    } catch {
      setError(t.common.error);
    }

    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl space-y-5">
      {error && (
        <div className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">{error}</div>
      )}
      {success && (
        <div className="rounded-lg bg-green-500/10 px-3 py-2 text-sm text-green-400">
          {t.theme.savedSuccess}
        </div>
      )}

      <div>
        <label className="mb-1 block text-sm font-medium">{t.theme.nameLabel}</label>
        <input
          name="name"
          defaultValue={theme?.name ?? ""}
          required
          className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-2 text-[var(--foreground)] outline-none focus:ring-2 focus:ring-[var(--ring)]"
          placeholder={t.theme.namePlaceholder}
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium">{t.theme.primary}</label>
          <input
            name="primaryColor"
            type="color"
            defaultValue={theme?.primaryColor ?? "#6366f1"}
            className="h-10 w-full cursor-pointer rounded-lg border border-[var(--border)]"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">{t.theme.secondary}</label>
          <input
            name="secondaryColor"
            type="color"
            defaultValue={theme?.secondaryColor ?? "#8b5cf6"}
            className="h-10 w-full cursor-pointer rounded-lg border border-[var(--border)]"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">{t.theme.accent}</label>
          <input
            name="accentColor"
            type="color"
            defaultValue={theme?.accentColor ?? "#f59e0b"}
            className="h-10 w-full cursor-pointer rounded-lg border border-[var(--border)]"
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">
          {t.theme.overlayOpacity} ({theme?.overlayOpacity ?? 0.5})
        </label>
        <input
          name="overlayOpacity"
          type="range"
          min="0"
          max="1"
          step="0.1"
          defaultValue={theme?.overlayOpacity ?? 0.5}
          className="w-full"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-[var(--primary)] px-6 py-2.5 font-medium text-white transition hover:opacity-90 disabled:opacity-50"
      >
        {loading ? t.common.saving : theme ? t.theme.updateTheme : t.theme.createTheme}
      </button>
    </form>
  );
}
