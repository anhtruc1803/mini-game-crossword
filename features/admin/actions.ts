"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { ROUTES } from "@/lib/constants/routes";
import { toErrorMessage, isRedirectError } from "@/lib/security/errors";
import { getClientIp } from "@/lib/security/request";
import { assertRateLimit } from "@/lib/security/rate-limit";
import { requireAdmin } from "@/features/admin/permissions";
import { STORAGE_BUCKETS, programImagePath } from "@/features/assets/paths";
import { deleteImage, uploadImage } from "@/features/assets/upload";
import { getRowById } from "@/features/games/queries";
import * as gameService from "@/features/games/service";
import * as programQueries from "@/features/programs/queries";
import * as programService from "@/features/programs/service";
import * as themeService from "@/features/themes/service";
import type { ProgramStatus } from "@/features/programs/types";

type ActionResult = {
  success?: boolean;
  error?: string;
};

type ThemeActionResult = ActionResult & {
  themeId?: string;
};

function parseHighlightedIndexes(rawValue: FormDataEntryValue | null) {
  if (!rawValue) return [];

  const parsed = JSON.parse(String(rawValue));
  if (!Array.isArray(parsed) || parsed.some((value) => typeof value !== "number")) {
    throw new Error("Invalid highlighted indexes payload");
  }

  return parsed as number[];
}

function getImageExtension(file: File) {
  switch (file.type) {
    case "image/png":
      return "png";
    case "image/jpeg":
      return "jpg";
    case "image/webp":
      return "webp";
    default:
      throw new Error("Unsupported image type");
  }
}

function getOptionalImageFile(formData: FormData, fieldName: string) {
  const value = formData.get(fieldName);
  if (!(value instanceof File) || value.size === 0) {
    return null;
  }

  return value;
}

function getBucketFilePath(publicPath: string, bucket: string) {
  const prefix = `/uploads/${bucket}/`;
  if (!publicPath.startsWith(prefix)) {
    return null;
  }

  return publicPath.slice(prefix.length);
}

async function withAdminMutation<T>(name: string, fn: () => Promise<T>) {
  const admin = await requireAdmin();
  const requestHeaders = await headers();

  await assertRateLimit({
    namespace: "admin:mutation",
    key: `${admin.id}:${name}:${getClientIp(requestHeaders)}`,
    limit: 60,
    windowSeconds: 60,
  });

  return fn();
}

function actionError(error: unknown, fallback = "Unable to complete this action.") {
  if (isRedirectError(error)) throw error;
  return { error: toErrorMessage(error, fallback) };
}

function revalidateGamePages(programId: string) {
  revalidatePath(ROUTES.admin.program(programId));
  revalidatePath(ROUTES.admin.rows(programId));
  revalidatePath(ROUTES.admin.game(programId));
}

export async function createProgramAction(
  formData: FormData
): Promise<ActionResult | undefined> {
  try {
    return await withAdminMutation("create-program", async () => {
      const input = {
        title: formData.get("title") as string,
        slug: formData.get("slug") as string,
        description: (formData.get("description") as string) || undefined,
        startAt: (formData.get("startAt") as string) || undefined,
        endAt: (formData.get("endAt") as string) || undefined,
      };

      let program: Awaited<ReturnType<typeof programService.createProgram>> | null = null;
      let uploadedImagePath: string | null = null;

      try {
        program = await programService.createProgram(input);
        const imageFile = getOptionalImageFile(formData, "imageFile");

        if (imageFile) {
          const imagePath = programImagePath(program.id, getImageExtension(imageFile));
          uploadedImagePath = imagePath;

          const imageUrl = await uploadImage(
            imageFile,
            STORAGE_BUCKETS.PROGRAMS,
            imagePath
          );

          await programService.updateProgram(program.id, { imageUrl });
        }
      } catch (error) {
        if (uploadedImagePath) {
          await deleteImage(STORAGE_BUCKETS.PROGRAMS, uploadedImagePath).catch(() => undefined);
        }

        if (program) {
          await programService.deleteProgram(program.id).catch(() => undefined);
        }

        throw error;
      }

      if (!program) {
        return { error: "Unable to create program." };
      }

      revalidatePath(ROUTES.admin.programs);
      redirect(ROUTES.admin.program(program.id));
    });
  } catch (error) {
    return actionError(error, "Unable to create program.");
  }
}

export async function updateProgramAction(
  id: string,
  formData: FormData
): Promise<ActionResult> {
  try {
    return await withAdminMutation("update-program", async () => {
      const currentProgram = await programQueries.getProgramById(id);
      if (!currentProgram) {
        return { error: "Program not found." };
      }

      const input: {
        title?: string;
        slug?: string;
        description?: string;
        imageUrl?: string;
      } = {
        title: (formData.get("title") as string) || undefined,
        slug: (formData.get("slug") as string) || undefined,
        description: (formData.get("description") as string) || undefined,
      };

      const imageFile = getOptionalImageFile(formData, "imageFile");
      const currentImagePath = currentProgram.imageUrl
        ? getBucketFilePath(currentProgram.imageUrl, STORAGE_BUCKETS.PROGRAMS)
        : null;
      const nextImagePath = imageFile
        ? programImagePath(id, getImageExtension(imageFile))
        : null;

      try {
        if (imageFile && nextImagePath) {
          input.imageUrl = await uploadImage(
            imageFile,
            STORAGE_BUCKETS.PROGRAMS,
            nextImagePath
          );
        }

        await programService.updateProgram(id, input);
      } catch (error) {
        if (nextImagePath && nextImagePath !== currentImagePath) {
          await deleteImage(STORAGE_BUCKETS.PROGRAMS, nextImagePath).catch(() => undefined);
        }

        throw error;
      }

      if (imageFile && currentProgram.imageUrl && currentProgram.imageUrl !== input.imageUrl) {
        if (currentImagePath) {
          await deleteImage(STORAGE_BUCKETS.PROGRAMS, currentImagePath).catch(() => undefined);
        }
      }

      revalidatePath(ROUTES.admin.program(id));
      revalidatePath(ROUTES.admin.programs);
      return { success: true };
    });
  } catch (error) {
    return actionError(error, "Unable to update program.");
  }
}

export async function deleteProgramAction(id: string): Promise<ActionResult | undefined> {
  try {
    return await withAdminMutation("delete-program", async () => {
      await programService.deleteProgram(id);
      revalidatePath(ROUTES.admin.programs);
      redirect(ROUTES.admin.programs);
    });
  } catch (error) {
    return actionError(error, "Unable to delete program.");
  }
}

export async function changeProgramStatusAction(
  id: string,
  newStatus: ProgramStatus
): Promise<ActionResult> {
  try {
    return await withAdminMutation("change-program-status", async () => {
      await programService.changeProgramStatus(id, newStatus);
      revalidatePath(ROUTES.admin.program(id));
      revalidatePath(ROUTES.admin.programs);
      return { success: true };
    });
  } catch (error) {
    return actionError(error, "Unable to change program status.");
  }
}

export async function createThemeAction(
  formData: FormData
): Promise<ThemeActionResult> {
  try {
    return await withAdminMutation("create-theme", async () => {
      const input = {
        name: formData.get("name") as string,
        primaryColor: (formData.get("primaryColor") as string) || "#6366f1",
        secondaryColor: (formData.get("secondaryColor") as string) || "#8b5cf6",
        accentColor: (formData.get("accentColor") as string) || "#f59e0b",
        overlayOpacity: parseFloat((formData.get("overlayOpacity") as string) || "0.5"),
      };

      const theme = await themeService.createTheme(input);
      return { success: true, themeId: theme.id };
    });
  } catch (error) {
    return actionError(error, "Unable to create theme.");
  }
}

export async function updateThemeAction(
  id: string,
  formData: FormData
): Promise<ActionResult> {
  try {
    return await withAdminMutation("update-theme", async () => {
      const input: Record<string, unknown> = {};
      const name = formData.get("name") as string;
      if (name) input.name = name;
      const primaryColor = formData.get("primaryColor") as string;
      if (primaryColor) input.primaryColor = primaryColor;
      const secondaryColor = formData.get("secondaryColor") as string;
      if (secondaryColor) input.secondaryColor = secondaryColor;
      const accentColor = formData.get("accentColor") as string;
      if (accentColor) input.accentColor = accentColor;
      const overlayOpacity = formData.get("overlayOpacity") as string;
      if (overlayOpacity) input.overlayOpacity = parseFloat(overlayOpacity);

      await themeService.updateTheme(id, input);
      return { success: true };
    });
  } catch (error) {
    return actionError(error, "Unable to update theme.");
  }
}

export async function setProgramThemeAction(
  programId: string,
  themeId: string | null
): Promise<ActionResult> {
  try {
    return await withAdminMutation("set-program-theme", async () => {
      const program = await programQueries.getProgramById(programId);
      if (!program) {
        return { error: "Program not found." };
      }

      await programService.setProgramTheme(programId, themeId);
      revalidatePath(ROUTES.admin.program(programId));
      revalidatePath(ROUTES.admin.theme(programId));
      return { success: true };
    });
  } catch (error) {
    return actionError(error, "Unable to set program theme.");
  }
}

export async function createGameAction(formData: FormData): Promise<ActionResult> {
  try {
    return await withAdminMutation("create-game", async () => {
      const input = {
        programId: formData.get("programId") as string,
        title: formData.get("title") as string,
        subtitle: (formData.get("subtitle") as string) || undefined,
        finalKeyword: (formData.get("finalKeyword") as string) || undefined,
      };

      await gameService.createGame(input);
      revalidatePath(ROUTES.admin.program(input.programId));
      revalidatePath(ROUTES.admin.game(input.programId));
      return { success: true };
    });
  } catch (error) {
    return actionError(error, "Unable to create game.");
  }
}

export async function createRowAction(formData: FormData): Promise<ActionResult> {
  try {
    return await withAdminMutation("create-row", async () => {
      const gameId = formData.get("gameId") as string;
      const input = {
        gameId,
        clueText: formData.get("clueText") as string,
        answerText: formData.get("answerText") as string,
        highlightedIndexes: parseHighlightedIndexes(formData.get("highlightedIndexes")),
        noteText: (formData.get("noteText") as string) || undefined,
      };

      await gameService.createRow(input);
      revalidatePath(ROUTES.admin.rows(gameId));
      return { success: true };
    });
  } catch (error) {
    return actionError(error, "Unable to create row.");
  }
}

export async function updateRowAction(
  rowId: string,
  formData: FormData
): Promise<ActionResult> {
  try {
    return await withAdminMutation("update-row", async () => {
      const input: Record<string, unknown> = {};
      const clueText = formData.get("clueText") as string;
      if (clueText) input.clueText = clueText;
      const answerText = formData.get("answerText") as string;
      if (answerText) input.answerText = answerText;
      const highlightedIndexes = formData.get("highlightedIndexes");
      if (highlightedIndexes) input.highlightedIndexes = parseHighlightedIndexes(highlightedIndexes);
      const noteText = formData.get("noteText") as string | null;
      if (noteText !== null) input.noteText = noteText;

      await gameService.updateRow(rowId, input);
      return { success: true };
    });
  } catch (error) {
    return actionError(error, "Unable to update row.");
  }
}

export async function deleteRowAction(rowId: string): Promise<ActionResult> {
  try {
    return await withAdminMutation("delete-row", async () => {
      const row = await getRowById(rowId);
      if (!row) {
        return { error: "Row not found." };
      }

      await gameService.deleteRow(rowId);
      revalidatePath(ROUTES.admin.rows(row.gameId));
      return { success: true };
    });
  } catch (error) {
    return actionError(error, "Unable to delete row.");
  }
}

export async function startGameAction(
  gameId: string,
  programId: string
): Promise<ActionResult> {
  try {
    return await withAdminMutation("start-game", async () => {
      await gameService.startGame(gameId);
      revalidateGamePages(programId);
      return { success: true };
    });
  } catch (error) {
    return actionError(error, "Unable to start the game.");
  }
}

export async function pauseGameAction(
  gameId: string,
  programId: string
): Promise<ActionResult> {
  try {
    return await withAdminMutation("pause-game", async () => {
      await gameService.pauseGame(gameId);
      revalidateGamePages(programId);
      return { success: true };
    });
  } catch (error) {
    return actionError(error, "Unable to pause the game.");
  }
}

export async function resumeGameAction(
  gameId: string,
  programId: string
): Promise<ActionResult> {
  try {
    return await withAdminMutation("resume-game", async () => {
      await gameService.resumeGame(gameId);
      revalidateGamePages(programId);
      return { success: true };
    });
  } catch (error) {
    return actionError(error, "Unable to resume the game.");
  }
}

export async function endGameAction(
  gameId: string,
  programId: string
): Promise<ActionResult> {
  try {
    return await withAdminMutation("end-game", async () => {
      await gameService.endGame(gameId);
      revalidateGamePages(programId);
      return { success: true };
    });
  } catch (error) {
    return actionError(error, "Unable to end the game.");
  }
}

export async function resetGameAction(
  gameId: string,
  programId: string
): Promise<ActionResult> {
  try {
    return await withAdminMutation("reset-game", async () => {
      await gameService.resetGame(gameId);
      revalidateGamePages(programId);
      return { success: true };
    });
  } catch (error) {
    return actionError(error, "Unable to reset the game.");
  }
}

export async function revealClueAction(
  gameId: string,
  programId: string
): Promise<ActionResult> {
  try {
    return await withAdminMutation("reveal-clue", async () => {
      await gameService.revealClue(gameId);
      revalidateGamePages(programId);
      return { success: true };
    });
  } catch (error) {
    return actionError(error, "Unable to reveal the clue.");
  }
}

export async function revealAnswerAction(
  gameId: string,
  programId: string
): Promise<ActionResult> {
  try {
    return await withAdminMutation("reveal-answer", async () => {
      await gameService.revealAnswer(gameId);
      revalidateGamePages(programId);
      return { success: true };
    });
  } catch (error) {
    return actionError(error, "Unable to reveal the answer.");
  }
}

export async function advanceRowAction(
  gameId: string,
  programId: string
): Promise<ActionResult> {
  try {
    return await withAdminMutation("advance-row", async () => {
      await gameService.advanceToNextRow(gameId);
      revalidateGamePages(programId);
      return { success: true };
    });
  } catch (error) {
    return actionError(error, "Unable to advance the row.");
  }
}

export async function updateAnnouncementAction(
  gameId: string,
  programId: string,
  text: string | null
): Promise<ActionResult> {
  try {
    return await withAdminMutation("update-announcement", async () => {
      await gameService.updateAnnouncementText(gameId, text);
      revalidateGamePages(programId);
      return { success: true };
    });
  } catch (error) {
    return actionError(error, "Unable to update the announcement.");
  }
}
