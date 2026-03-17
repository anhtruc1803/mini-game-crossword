"use client";

import { useTranslation } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";

const localeLabels: Record<Locale, string> = {
  vi: "VI",
  en: "EN",
};

export function LanguageSwitcher({ className = "" }: { className?: string }) {
  const { locale, setLocale } = useTranslation();

  const toggle = () => {
    setLocale(locale === "vi" ? "en" : "vi");
  };

  return (
    <button
      onClick={toggle}
      className={`inline-flex items-center gap-1 rounded-md border border-white/20 bg-white/10 px-2 py-1 text-xs font-medium backdrop-blur-sm transition-colors hover:bg-white/20 ${className}`}
      title={locale === "vi" ? "Switch to English" : "Chuyển sang Tiếng Việt"}
    >
      <span className={locale === "vi" ? "font-bold" : "opacity-60"}>
        {localeLabels.vi}
      </span>
      <span className="opacity-40">|</span>
      <span className={locale === "en" ? "font-bold" : "opacity-60"}>
        {localeLabels.en}
      </span>
    </button>
  );
}
