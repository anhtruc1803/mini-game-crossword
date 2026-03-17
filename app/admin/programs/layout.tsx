import type { ReactNode } from "react";
import { requireAdminPageAccess } from "@/features/admin/permissions";

export default async function AdminProgramsLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireAdminPageAccess();

  return children;
}
