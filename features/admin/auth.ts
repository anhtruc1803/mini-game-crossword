"use server";

/**
 * Admin authentication helpers.
 */

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { ROUTES } from "@/lib/constants/routes";
import { createSupabaseServer } from "@/lib/supabase/server";
import { toErrorMessage } from "@/lib/security/errors";
import { getClientIp } from "@/lib/security/request";
import { assertRateLimit } from "@/lib/security/rate-limit";
import { isAdmin } from "./permissions";

const signInSchema = z.object({
  email: z.string().email().max(320),
  password: z.string().min(8).max(200),
});

export async function signIn(email: string, password: string) {
  try {
    const validated = signInSchema.parse({ email, password });
    const requestHeaders = await headers();

    await assertRateLimit({
      namespace: "auth:sign-in",
      key: `${getClientIp(requestHeaders)}:${validated.email.toLowerCase()}`,
      limit: 10,
      windowSeconds: 60,
    });

    const supabase = await createSupabaseServer();
    const { error } = await supabase.auth.signInWithPassword(validated);

    if (error) {
      return { error: "Invalid email or password." };
    }

    const hasAdminAccess = await isAdmin();

    if (!hasAdminAccess) {
      await supabase.auth.signOut();
      return { error: "This account does not have admin access." };
    }

    redirect(ROUTES.admin.programs);
  } catch (error) {
    return { error: toErrorMessage(error, "Unable to sign in.") };
  }
}

export async function signOut() {
  const supabase = await createSupabaseServer();
  await supabase.auth.signOut();
  redirect(ROUTES.admin.login);
}

export async function getCurrentAdmin() {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  return (await isAdmin()) ? user : null;
}
