"use server";

/**
 * Admin authentication helpers.
 * Uses bcrypt password verification with signed HTTP-only session cookies.
 */

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { ROUTES } from "@/lib/constants/routes";
import { prisma } from "@/lib/db/prisma";
import { verifyPassword } from "@/lib/auth/password";
import { createSession, getSession, destroySession } from "@/lib/auth/session";
import { isRedirectError, toErrorMessage } from "@/lib/security/errors";
import { getClientIp } from "@/lib/security/request";
import { assertRateLimit } from "@/lib/security/rate-limit";

const signInSchema = z.object({
  email: z.string().email().max(320),
  password: z.string().min(8).max(200),
});

export async function signIn(email: string, password: string) {
  try {
    const validated = signInSchema.parse({ email, password });
    const normalizedEmail = validated.email.toLowerCase();
    const requestHeaders = await headers();

    await assertRateLimit({
      namespace: "auth:sign-in",
      key: `${getClientIp(requestHeaders)}:${normalizedEmail}`,
      limit: 10,
      windowSeconds: 60,
    });

    const adminUser = await prisma.adminUser.findUnique({
      where: { email: normalizedEmail },
    });

    if (!adminUser || !adminUser.isActive) {
      return { error: "Invalid email or password." };
    }

    const validPassword = await verifyPassword(
      validated.password,
      adminUser.passwordHash
    );

    if (!validPassword) {
      return { error: "Invalid email or password." };
    }

    if (adminUser.role !== "admin") {
      return { error: "This account does not have admin access." };
    }

    await createSession(adminUser.id, adminUser.email);

    redirect(ROUTES.admin.programs);
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    return { error: toErrorMessage(error, "Unable to sign in.") };
  }
}

export async function signOut() {
  await destroySession();
  redirect(ROUTES.admin.login);
}

export async function getCurrentAdmin() {
  const session = await getSession();
  if (!session) return null;

  const adminUser = await prisma.adminUser.findUnique({
    where: { id: session.userId },
  });

  if (!adminUser || !adminUser.isActive || adminUser.role !== "admin") {
    return null;
  }

  return {
    id: adminUser.id,
    email: adminUser.email,
    username: adminUser.username,
    fullName: adminUser.fullName,
    role: adminUser.role,
  };
}
