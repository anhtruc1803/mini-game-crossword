/**
 * Programs — write operations.
 * All mutations go through this file (single source of truth).
 */

import { prisma } from "@/lib/db/prisma";
import { Prisma } from "@prisma/client";
import { AppError } from "@/lib/security/errors";
import { mapPrismaToProgram } from "./mapper";
import type { Program, ProgramStatus } from "./types";
import type { CreateProgramInput, UpdateProgramInput } from "./schemas";

function normalizeProgramMutationError(error: unknown): never {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      throw new AppError(
        "Slug already exists. Please choose another URL slug.",
        "program_slug_taken",
        409
      );
    }

    if (error.code === "P2021" || error.code === "P2022") {
      throw new AppError(
        "Database schema is outdated. Run prisma migrate deploy on the server.",
        "database_schema_outdated",
        500
      );
    }
  }

  if (error instanceof Error && error.message.toLowerCase().includes("readonly")) {
    throw new AppError(
      "Database is read-only. Check write permissions for the SQLite file.",
      "database_readonly",
      500
    );
  }

  throw error;
}

export async function insertProgram(input: CreateProgramInput): Promise<Program> {
  try {
    const row = await prisma.program.create({
      data: {
        title: input.title,
        slug: input.slug,
        description: input.description ?? null,
        imageUrl: input.imageUrl ?? null,
        startAt: input.startAt ? new Date(input.startAt) : null,
        endAt: input.endAt ? new Date(input.endAt) : null,
      },
    });
    return mapPrismaToProgram(row);
  } catch (error) {
    return normalizeProgramMutationError(error);
  }
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

  if (input.imageUrl !== undefined) data.imageUrl = input.imageUrl;

  try {
    const row = await prisma.program.update({
      where: { id },
      data,
    });
    return mapPrismaToProgram(row);
  } catch (error) {
    return normalizeProgramMutationError(error);
  }
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
