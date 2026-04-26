import { z } from "zod";

const optionalUrl = z
  .string()
  .trim()
  .url("Introduce una URL valida para la prueba")
  .optional()
  .or(z.literal(""))
  .transform((value) => value || undefined);

const optionalNote = z
  .string()
  .trim()
  .max(300, "La nota no puede superar los 300 caracteres")
  .optional()
  .or(z.literal(""))
  .transform((value) => value || undefined);

export const reportMatchResultSchema = z.object({
  matchId: z.string().min(1, "No hemos encontrado la partida."),
  playerAScore: z.coerce
    .number()
    .int("El marcador debe ser un numero entero.")
    .min(0, "El marcador no puede ser negativo."),
  playerBScore: z.coerce
    .number()
    .int("El marcador debe ser un numero entero.")
    .min(0, "El marcador no puede ser negativo."),
  proofImageUrl: optionalUrl,
  note: optionalNote,
});

export const reviewMatchResultSchema = z.object({
  matchId: z.string().min(1, "No hemos encontrado la partida."),
  intent: z.enum(["confirm", "dispute"]),
  reason: optionalNote,
});

export const resolveDisputeSchema = z.object({
  disputeId: z.string().min(1, "No hemos encontrado la disputa."),
  intent: z.enum(["confirm_result", "cancel_match"]),
  resolutionNote: optionalNote,
});
