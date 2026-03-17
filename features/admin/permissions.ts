/**
 * Admin permission checks.
 * All admin routes and mutations must verify permissions through this module.
 */

import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";
import { AppError } from "@/lib/security/errors";
import { ROUTES } from "@/lib/constants/routes";
import { redirect } from "next/navigation";

export async function isAdmin() {
  const session = await getSession();
  if (!session) return false;

  const adminUser = await prisma.adminUser.findUnique({
    where: { id: session.userId },
    select: { id: true, role: true, isActive: true },
  });

  if (!adminUser || !adminUser.isActive) return false;
  return adminUser.role === "admin";
}

export async function requireAdmin() {
  const session = await getSession();
  if (!session) {
    throw new AppError("Authentication required", "unauthorized", 401);
  }

  const adminUser = await prisma.adminUser.findUnique({
    where: { id: session.userId },
    select: { id: true, email: true, role: true, isActive: true },
  });

  if (!adminUser || !adminUser.isActive) {
    throw new AppError("Authentication required", "unauthorized", 401);
  }

  if (adminUser.role !== "admin") {
    throw new AppError("Admin access required", "forbidden", 403);
  }

  return { id: adminUser.id, email: adminUser.email };
}

export async function requireAdminPageAccess() {
  try {
    return await requireAdmin();
  } catch (error) {
    if (
      error instanceof AppError &&
      (error.status === 401 || error.status === 403)
    ) {
      redirect(ROUTES.admin.login);
    }

    throw error;
  }
}
