import { MatchMode } from "@prisma/client";
import { z } from "zod";

import { MATCH_FORMAT_VALUES } from "@/lib/match-format";

const optionalMessage = z
  .string()
  .trim()
  .max(240, "El mensaje no puede superar los 240 caracteres")
  .optional()
  .or(z.literal(""))
  .transform((value) => value || undefined);

const optionalValue = z
  .string()
  .trim()
  .optional()
  .or(z.literal(""))
  .transform((value) => value || undefined);

const futureDateValue = z
  .string()
  .min(1, "Selecciona una fecha y hora")
  .transform((value) => new Date(value))
  .refine((value) => !Number.isNaN(value.getTime()), "La fecha no es valida")
  .refine((value) => value.getTime() > Date.now(), "La fecha debe estar en el futuro");

export const challengeFiltersSchema = z.object({
  query: z.string().optional().default(""),
  store: z.string().optional().default(""),
  game: z.string().optional().default(""),
  opponent: z.string().optional().default(""),
});

export const createChallengeSchema = z.object({
  challengedId: z.string().min(1, "Selecciona un rival"),
  gameId: z.string().min(1, "Selecciona un juego"),
  format: z.enum(MATCH_FORMAT_VALUES),
  mode: z.nativeEnum(MatchMode),
  storeId: optionalValue,
  locationLabel: optionalValue,
  scheduledFor: futureDateValue,
  message: optionalMessage,
});

export const respondChallengeSchema = z.object({
  challengeId: z.string().min(1, "No hemos encontrado el reto."),
  intent: z.enum([
    "accept",
    "reject",
    "counter",
    "acceptCounter",
    "cancel",
  ]),
  counterProposedFor: optionalValue,
});

export type ChallengeFiltersValues = z.output<typeof challengeFiltersSchema>;
