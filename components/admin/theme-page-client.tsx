"use client";

import Link from "next/link";
import { ROUTES } from "@/lib/constants/routes";
import { SectionCard } from "@/components/shared/section-card";
import { ThemeForm } from "@/components/admin/theme-form";
import { useTranslation } from "@/lib/i18n";
import type { Program } from "@/features/programs/types";
import type { Theme } from "@/features/themes/types";

interface ThemePageClientProps {
  program: Program;
  theme: Theme | null;
}

export function ThemePageClient({ program, theme }: ThemePageClientProps) {
  const { t } = useTranslation();
  const programId = program.id;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href={ROUTES.admin.program(programId)}
          className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
        >
          &larr; {t.common.back}
        </Link>
        <h2 className="text-xl font-bold">{t.theme.themeTitle} — {program.title}</h2>
      </div>

      <SectionCard title={theme ? t.theme.editTheme : t.theme.createNewTheme}>
        <ThemeForm programId={programId} theme={theme} />
      </SectionCard>

      {theme && (
        <SectionCard title={t.theme.colorPreview}>
          <div className="flex gap-4">
            <div className="space-y-1 text-center">
              <div
                className="h-16 w-16 rounded-lg border border-[var(--border)]"
                style={{ backgroundColor: theme.primaryColor }}
              />
              <p className="text-xs">{t.theme.primary}</p>
            </div>
            <div className="space-y-1 text-center">
              <div
                className="h-16 w-16 rounded-lg border border-[var(--border)]"
                style={{ backgroundColor: theme.secondaryColor }}
              />
              <p className="text-xs">{t.theme.secondary}</p>
            </div>
            <div className="space-y-1 text-center">
              <div
                className="h-16 w-16 rounded-lg border border-[var(--border)]"
                style={{ backgroundColor: theme.accentColor }}
              />
              <p className="text-xs">{t.theme.accent}</p>
            </div>
          </div>
        </SectionCard>
      )}
    </div>
  );
}
