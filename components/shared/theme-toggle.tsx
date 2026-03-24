"use client";

import { useEffect, useState } from "react";
import { flushSync } from "react-dom";
import { useTranslation } from "@/lib/i18n";

type ThemeMode = "dark" | "light";

type ViewTransitionLike = {
  ready: Promise<void>;
};

const STORAGE_KEY = "mini-game-theme";

function applyTheme(theme: ThemeMode) {
  document.documentElement.dataset.theme = theme;
}

function getStoredTheme(): ThemeMode {
  if (typeof window === "undefined") return "dark";
  return window.localStorage.getItem(STORAGE_KEY) === "light" ? "light" : "dark";
}

function getRevealOrigin(target: HTMLButtonElement, clientX: number, clientY: number) {
  if (clientX > 0 || clientY > 0) {
    return { x: clientX, y: clientY };
  }

  const rect = target.getBoundingClientRect();
  return {
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2,
  };
}

function runCircularReveal(nextTheme: ThemeMode, x: number, y: number, onApply: () => void) {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const documentWithTransition = document as Document & {
    startViewTransition?: (callback: () => void | Promise<void>) => ViewTransitionLike;
  };

  if (!documentWithTransition.startViewTransition || prefersReducedMotion) {
    onApply();
    return;
  }

  const transition = documentWithTransition.startViewTransition(() => {
    flushSync(onApply);
  });

  transition.ready
    .then(() => {
      const maxX = Math.max(x, window.innerWidth - x);
      const maxY = Math.max(y, window.innerHeight - y);
      const endRadius = Math.hypot(maxX, maxY);

      document.documentElement.animate(
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${endRadius}px at ${x}px ${y}px)`,
          ],
        },
        {
          duration: 1150,
          easing: "cubic-bezier(0.22, 1, 0.36, 1)",
          fill: "both",
          pseudoElement: "::view-transition-new(root)",
        }
      );
    })
    .catch(() => {
      onApply();
    });
}

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { locale } = useTranslation();
  const [theme, setTheme] = useState<ThemeMode>(getStoredTheme);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  function toggleTheme(event: React.MouseEvent<HTMLButtonElement>) {
    const nextTheme: ThemeMode = theme === "dark" ? "light" : "dark";
    const origin = getRevealOrigin(event.currentTarget, event.clientX, event.clientY);

    runCircularReveal(nextTheme, origin.x, origin.y, () => {
      setTheme(nextTheme);
      window.localStorage.setItem(STORAGE_KEY, nextTheme);
      applyTheme(nextTheme);
    });
  }

  const labels =
    locale === "vi"
      ? {
          dark: "Tối",
          light: "Sáng",
          switchToLight: "Chuyển sang giao diện sáng",
          switchToDark: "Chuyển sang giao diện tối",
        }
      : {
          dark: "Dark",
          light: "Light",
          switchToLight: "Switch to light mode",
          switchToDark: "Switch to dark mode",
        };

  const isLight = theme === "light";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`glass-pill inline-flex items-center gap-1 rounded-full p-1 text-xs font-medium transition hover:bg-white/12 ${isLight ? "text-slate-700" : "text-white/85"} ${className}`}
      title={theme === "dark" ? labels.switchToLight : labels.switchToDark}
      aria-label={theme === "dark" ? labels.switchToLight : labels.switchToDark}
    >
      <span
        className={
          theme === "dark"
            ? "rounded-full bg-white/16 px-3 py-1.5 font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
            : "rounded-full px-3 py-1.5 text-slate-500"
        }
      >
        {labels.dark}
      </span>
      <span
        className={
          theme === "light"
            ? "rounded-full bg-white/65 px-3 py-1.5 font-semibold text-slate-800 shadow-[inset_0_1px_0_rgba(255,255,255,0.65),0_8px_20px_rgba(148,163,184,0.2)]"
            : "rounded-full px-3 py-1.5 text-white/55"
        }
      >
        {labels.light}
      </span>
    </button>
  );
}
