"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
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
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const isEditing = !!program;

  useEffect(() => {
    return () => {
      if (previewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  function handleImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    setPreviewUrl((currentValue) => {
      if (currentValue?.startsWith("blob:")) {
        URL.revokeObjectURL(currentValue);
      }

      return file ? URL.createObjectURL(file) : null;
    });
  }

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
      // Redirects thrown by server actions are expected here.
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
      <section className="glass-panel rounded-[30px] p-6 sm:p-7">
        <div className="mb-6 space-y-3">
          <span className="glass-pill inline-flex rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-white/76">
            {isEditing ? t.common.update : t.admin.createProgram}
          </span>
          <div>
            <h3 className="text-2xl font-semibold text-white">{t.admin.createNewProgram}</h3>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-white/58">
              {t.programForm.imageHelp}
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-[22px] border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {error}
          </div>
        )}

        <div className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-white/84">
              {t.programForm.nameLabel}
            </label>
            <input
              name="title"
              defaultValue={program?.title ?? ""}
              required
              className="min-h-14 w-full rounded-[20px] border border-white/10 bg-[rgba(8,15,29,0.66)] px-4 py-3 text-[var(--foreground)] outline-none transition placeholder:text-white/28 focus:border-[var(--primary)]/30 focus:ring-2 focus:ring-[var(--primary)]/20"
              placeholder={t.programForm.namePlaceholder}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-white/84">
              {t.programForm.slugLabel}
            </label>
            <input
              name="slug"
              defaultValue={program?.slug ?? ""}
              required
              pattern="^[a-z0-9-]+$"
              className="min-h-14 w-full rounded-[20px] border border-white/10 bg-[rgba(8,15,29,0.66)] px-4 py-3 text-[var(--foreground)] outline-none transition placeholder:text-white/28 focus:border-[var(--primary)]/30 focus:ring-2 focus:ring-[var(--primary)]/20"
              placeholder={t.programForm.slugPlaceholder}
            />
            <p className="mt-2 text-xs leading-6 text-white/44">{t.programForm.slugHelp}</p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-white/84">
              {t.programForm.descriptionLabel}
            </label>
            <textarea
              name="description"
              defaultValue={program?.description ?? ""}
              rows={4}
              className="w-full rounded-[20px] border border-white/10 bg-[rgba(8,15,29,0.66)] px-4 py-3 text-[var(--foreground)] outline-none transition placeholder:text-white/28 focus:border-[var(--primary)]/30 focus:ring-2 focus:ring-[var(--primary)]/20"
              placeholder={t.programForm.descriptionPlaceholder}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-white/84">
              {t.programForm.imageLabel}
            </label>
            <div className="rounded-[22px] border border-white/10 bg-white/[0.03] p-4">
              <input
                type="file"
                name="imageFile"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleImageChange}
                className="block w-full text-sm text-white/76 file:mr-3 file:rounded-2xl file:border-0 file:bg-[var(--primary)]/85 file:px-4 file:py-2.5 file:text-sm file:font-semibold file:text-white"
              />
              <p className="mt-3 text-xs leading-6 text-white/44">{t.programForm.imageHelp}</p>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="inet-button min-h-14 rounded-[20px] px-6 text-white disabled:cursor-not-allowed disabled:opacity-45"
          >
            {loading ? t.common.processing : isEditing ? t.common.update : t.admin.createProgram}
          </button>
        </div>
      </section>

      <aside className="glass-panel rounded-[30px] p-6">
        <div className="space-y-4">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-white/40">
              {t.programForm.currentImage}
            </p>
            <h3 className="mt-2 text-xl font-semibold text-white">{program?.title ?? "Preview"}</h3>
          </div>

          <div className="overflow-hidden rounded-[26px] border border-white/10 bg-[linear-gradient(180deg,rgba(251,191,36,0.06),rgba(251,113,133,0.04))] p-3 shadow-[0_0_0_1px_rgba(251,113,133,0.05),0_20px_50px_rgba(2,6,23,0.22)]">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[22px] bg-[rgba(8,15,29,0.74)]">
              {previewUrl || program?.imageUrl ? (
                <Image
                  src={previewUrl ?? program!.imageUrl!}
                  alt={t.programForm.imagePreviewAlt}
                  fill
                  className="object-cover"
                  unoptimized={previewUrl?.startsWith("blob:")}
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-[radial-gradient(circle_at_top,rgba(251,191,36,0.16),transparent_40%),linear-gradient(180deg,rgba(8,15,29,0.9),rgba(15,23,42,0.88))]">
                  <div className="text-center">
                    <p className="text-xs uppercase tracking-[0.24em] text-white/40">iNET</p>
                    <p className="mt-3 text-3xl font-black text-white">Mini Game</p>
                  </div>
                </div>
              )}

              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-[linear-gradient(180deg,transparent,rgba(4,10,20,0.88))]" />
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <p className="text-xs uppercase tracking-[0.24em] text-white/48">
                  {t.programForm.imageLabel}
                </p>
                <p className="mt-2 text-lg font-semibold text-white">
                  {program?.title ?? t.admin.createNewProgram}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-[22px] border border-white/10 bg-white/[0.03] p-4 text-sm leading-7 text-white/56">
            {t.programForm.imageHelp}
          </div>
        </div>
      </aside>
    </form>
  );
}
