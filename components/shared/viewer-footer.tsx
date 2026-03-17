"use client";

import { useTranslation } from "@/lib/i18n";
import { LanguageSwitcher } from "./language-switcher";

export function ViewerFooter() {
  const { t } = useTranslation();

  return (
    <footer className="mt-12 flex items-center justify-center gap-3 text-xs text-[var(--muted-foreground)]/50">
      <span>{t.viewer.footer}</span>
      <LanguageSwitcher />
    </footer>
  );
}
