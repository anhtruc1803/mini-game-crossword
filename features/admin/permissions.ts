/**
 * Admin permission checks.
 * All admin routes and mutations must verify permissions through this module.
 */

import { createSupabaseServer } from "@/lib/supabase/server";
import { AppError } from "@/lib/security/errors";

export async function isAdmin() {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return false;
  }

  const { data, error } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    throw new AppError(
      "Failed to verify admin permissions",
      "admin_check_failed",
      500,
      false
    );
  }

  return Boolean(data);
}

export async function requireAdmin() {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new AppError("Authentication required", "unauthorized", 401);
  }

  const { data, error } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    throw new AppError(
      "Failed to verify admin permissions",
      "admin_check_failed",
      500,
      false
    );
  }

  if (!data) {
    throw new AppError("Admin access required", "forbidden", 403);
  }

  return user;
}
