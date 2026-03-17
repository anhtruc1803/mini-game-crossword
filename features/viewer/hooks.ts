"use client";

import { startTransition, useCallback, useEffect, useRef, useState } from "react";
import { APP_CONFIG } from "@/lib/constants/app-config";
import type { PublicViewerSnapshot } from "./view-model";

export function useGameRealtime(initialSnapshot: PublicViewerSnapshot) {
  const [snapshot, setSnapshot] = useState(initialSnapshot);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const refreshInFlightRef = useRef(false);

  const programSlug = snapshot.program.slug;

  const refreshSnapshot = useCallback(async () => {
    if (refreshInFlightRef.current) return;
    refreshInFlightRef.current = true;

    try {
      const response = await fetch(
        `/api/viewer-snapshot?slug=${encodeURIComponent(programSlug)}`,
        { cache: "no-store" }
      );

      if (!response.ok) return;

      const data = (await response.json()) as { snapshot?: PublicViewerSnapshot };
      if (data.snapshot) {
        startTransition(() => {
          setSnapshot(data.snapshot as PublicViewerSnapshot);
        });
      }
    } finally {
      refreshInFlightRef.current = false;
    }
  }, [programSlug]);

  // Polling only — no Supabase Realtime
  useEffect(() => {
    pollingRef.current = setInterval(() => {
      if (typeof document !== "undefined" && document.visibilityState === "hidden") {
        return;
      }

      void refreshSnapshot();
    }, APP_CONFIG.pollingIntervalMs);

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, [refreshSnapshot]);

  return snapshot;
}
