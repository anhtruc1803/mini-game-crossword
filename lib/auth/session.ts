import { createSupabaseServer } from "@/lib/supabase/server";

/**
 * Get the current authenticated user session.
 * Returns null if not authenticated.
 */
export async function getSession() {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}
