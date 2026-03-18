"use client";

import { useEffect, useState } from "react";

type ThemeMode = "dark" | "light";

const STORAGE_KEY = "mini-game-theme";

function applyTheme(theme: ThemeMode) {
  document.documentElement.dataset.theme = theme;
}

export function ThemeToggle({ className = "" }: { className?: string }) {
  const [theme, setTheme] = useState<ThemeMode>(() => {
    if (typeof window === "undefined") return "dark";
    return window.localStorage.getItem(STORAGE_KEY) === "light" ? "light" : "dark";
  });

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  function toggleTheme() {
    const nextTheme: ThemeMode = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    window.localStorage.setItem(STORAGE_KEY, nextTheme);
    applyTheme(nextTheme);
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`glass-pill inline-flex items-center gap-1 rounded-full p-1 text-xs font-medium text-white/85 transition hover:bg-white/12 ${className}`}
      title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
    >
      <span
        className={
          theme === "dark"
            ? "rounded-full bg-white/16 px-3 py-1.5 font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
            : "rounded-full px-3 py-1.5 text-white/55"
        }
      >
        Dark
      </span>
      <span
        className={
          theme === "light"
            ? "rounded-full bg-white/16 px-3 py-1.5 font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
            : "rounded-full px-3 py-1.5 text-white/55"
        }
      >
        Light
      </span>
    </button>
  );
}
