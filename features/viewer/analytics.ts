"use client";

import { useEffect } from "react";

const VIEWER_SESSION_STORAGE_KEY = "mini-game-viewer-session-id";
const HEARTBEAT_INTERVAL_MS = 25_000;

function getOrCreateViewerSessionId() {
  if (typeof window === "undefined") return null;

  const existing = window.localStorage.getItem(VIEWER_SESSION_STORAGE_KEY);
  if (existing) return existing;

  const nextId =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `viewer-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

  window.localStorage.setItem(VIEWER_SESSION_STORAGE_KEY, nextId);
  return nextId;
}

async function postViewerActivity(
  sessionId: string,
  programSlug: string,
  eventType: "pageview" | "heartbeat"
) {
  await fetch("/api/viewer-analytics", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      sessionId,
      programSlug,
      pathname: window.location.pathname,
      eventType,
    }),
    cache: "no-store",
    keepalive: true,
  });
}

export function useViewerAnalytics(programSlug: string) {
  useEffect(() => {
    const sessionId = getOrCreateViewerSessionId();
    if (!sessionId) return;

    const safePost = (eventType: "pageview" | "heartbeat") => {
      void postViewerActivity(sessionId, programSlug, eventType).catch(() => {});
    };

    safePost("pageview");

    const intervalId = window.setInterval(() => {
      if (document.visibilityState === "hidden") return;
      safePost("heartbeat");
    }, HEARTBEAT_INTERVAL_MS);

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        safePost("heartbeat");
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [programSlug]);
}
