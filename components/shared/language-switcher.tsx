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
      className={`glass-pill inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-white/85 transition hover:bg-white/12 ${className}`}
      title={locale === "vi" ? "Switch to English" : "Chuyển sang Tiếng Việt"}
    >
      <span className={locale === "vi" ? "font-bold text-white" : "opacity-60"}>
        {localeLabels.vi}
      </span>
      <span className="opacity-30">/</span>
      <span className={locale === "en" ? "font-bold text-white" : "opacity-60"}>
        {localeLabels.en}
      </span>
    </button>
  );
}
