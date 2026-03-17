"use client";

import type { RealtimeChannel } from "@supabase/supabase-js";
import { createSupabaseBrowser } from "@/lib/supabase/client";

export type OnRealtimeChange = () => void;

export function subscribeToGame(
  gameId: string,
  onChange: OnRealtimeChange
): RealtimeChannel {
  const supabase = createSupabaseBrowser();

  return supabase
    .channel(`game-events-${gameId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "game_events",
        filter: `game_id=eq.${gameId}`,
      },
      () => onChange()
    )
    .subscribe();
}

export function unsubscribeFromGame(channel: RealtimeChannel): void {
  const supabase = createSupabaseBrowser();
  void supabase.removeChannel(channel);
}
