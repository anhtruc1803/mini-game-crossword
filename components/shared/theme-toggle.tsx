"use client";

import { useEffect, useState } from "react";
import { flushSync } from "react-dom";

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
          duration: 750,
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
