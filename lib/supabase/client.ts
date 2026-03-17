import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./database.types";

/**
 * Supabase client for browser (Client Components).
 * Use this in "use client" components only.
 */
let browserClient: ReturnType<typeof createBrowserClient<Database>> | null = null;

export function createSupabaseBrowser() {
  if (!browserClient) {
    browserClient = createBrowserClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }

  return browserClient;
}
