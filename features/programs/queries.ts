/**
 * Programs — read operations.
 * All queries go through this file (single source of truth).
 */

import { prisma } from "@/lib/db/prisma";
import { mapPrismaToProgram } from "./mapper";
import type { Program } from "./types";

export async function listPrograms(): Promise<Program[]> {
  const rows = await prisma.program.findMany({
    orderBy: { createdAt: "desc" },
  });
  return rows.map(mapPrismaToProgram);
}

export async function getProgramById(id: string): Promise<Program | null> {
  const row = await prisma.program.findUnique({ where: { id } });
  return row ? mapPrismaToProgram(row) : null;
}

export async function getProgramBySlug(slug: string): Promise<Program | null> {
  const row = await prisma.program.findUnique({ where: { slug } });
  return row ? mapPrismaToProgram(row) : null;
}
