"use client";

import { useTranslation } from "@/lib/i18n";
import { LanguageSwitcher } from "./language-switcher";

export function ViewerFooter() {
  const { t } = useTranslation();

  return (
    <footer className="mt-10 flex items-center justify-center gap-3 pb-4 text-xs text-white/42">
      <span>{t.viewer.footer}</span>
      <LanguageSwitcher />
    </footer>
  );
}
