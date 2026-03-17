import { z } from "zod";
import { GAME_STATUS, ROW_STATUS } from "./constants";

const normalizedAnswerSchema = z
  .string()
  .trim()
  .min(1)
  .max(50)
  .transform((value) => value.toUpperCase());

const highlightedIndexesSchema = z.array(z.number().int().min(0));

export const gameStatusSchema = z.enum([
  GAME_STATUS.DRAFT,
  GAME_STATUS.LIVE,
  GAME_STATUS.PAUSED,
  GAME_STATUS.ENDED,
]);

export const rowStatusSchema = z.enum([
  ROW_STATUS.HIDDEN,
  ROW_STATUS.CLUE_VISIBLE,
  ROW_STATUS.ANSWER_REVEALED,
]);

export const createGameSchema = z.object({
  programId: z.string().uuid(),
  title: z.string().trim().min(1).max(200),
  subtitle: z.string().trim().max(200).optional(),
  finalKeyword: normalizedAnswerSchema.optional(),
});

export const createRowSchema = z
  .object({
    gameId: z.string().uuid(),
    rowOrder: z.number().int().min(0).optional(),
    clueText: z.string().trim().min(1).max(500),
    answerText: normalizedAnswerSchema,
    highlightedIndexes: highlightedIndexesSchema,
    noteText: z.string().trim().max(200).optional(),
  })
  .superRefine((data, ctx) => {
    for (const index of data.highlightedIndexes) {
      if (index >= data.answerText.length) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Highlighted index is outside the answer length",
          path: ["highlightedIndexes"],
        });
      }
    }
  });

export const updateRowSchema = z
  .object({
    rowOrder: z.number().int().min(0).optional(),
    clueText: z.string().trim().min(1).max(500).optional(),
    answerText: normalizedAnswerSchema.optional(),
    highlightedIndexes: highlightedIndexesSchema.optional(),
    noteText: z.string().trim().max(200).nullable().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.answerText && data.highlightedIndexes) {
      for (const index of data.highlightedIndexes) {
        if (index >= data.answerText.length) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Highlighted index is outside the answer length",
            path: ["highlightedIndexes"],
          });
        }
      }
    }
  });

export type CreateGameInput = z.infer<typeof createGameSchema>;
export type CreateRowInput = z.infer<typeof createRowSchema>;
export type UpdateRowInput = z.infer<typeof updateRowSchema>;
