/**
 * Programs — write operations.
 * All mutations go through this file (single source of truth).
 */

import { prisma } from "@/lib/db/prisma";
import { mapPrismaToProgram } from "./mapper";
import type { Program, ProgramStatus } from "./types";
import type { CreateProgramInput, UpdateProgramInput } from "./schemas";

export async function insertProgram(input: CreateProgramInput): Promise<Program> {
  const row = await prisma.program.create({
    data: {
      title: input.title,
      slug: input.slug,
      description: input.description ?? null,
      startAt: input.startAt ? new Date(input.startAt) : null,
      endAt: input.endAt ? new Date(input.endAt) : null,
    },
  });
  return mapPrismaToProgram(row);
}

export async function updateProgramById(
  id: string,
  input: UpdateProgramInput
): Promise<Program> {
  const data: Record<string, unknown> = {};
  if (input.title !== undefined) data.title = input.title;
  if (input.slug !== undefined) data.slug = input.slug;
  if (input.description !== undefined) data.description = input.description;
  if (input.startAt !== undefined) data.startAt = input.startAt ? new Date(input.startAt) : null;
  if (input.endAt !== undefined) data.endAt = input.endAt ? new Date(input.endAt) : null;

  const row = await prisma.program.update({
    where: { id },
    data,
  });
  return mapPrismaToProgram(row);
}

export async function updateProgramStatus(
  id: string,
  status: ProgramStatus
): Promise<Program> {
  const row = await prisma.program.update({
    where: { id },
    data: { status },
  });
  return mapPrismaToProgram(row);
}

export async function updateProgramTheme(
  id: string,
  themeId: string | null
): Promise<Program> {
  const row = await prisma.program.update({
    where: { id },
    data: { themeId },
  });
  return mapPrismaToProgram(row);
}

export async function deleteProgramById(id: string): Promise<void> {
  await prisma.program.delete({ where: { id } });
}
