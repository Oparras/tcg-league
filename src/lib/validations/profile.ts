import { PresenceStatus } from "@prisma/client";
import { z } from "zod";

const optionalUrl = z
  .string()
  .trim()
  .url("Introduce una URL valida para el avatar")
  .optional()
  .or(z.literal(""))
  .transform((value) => value || undefined);

const optionalBio = z
  .string()
  .trim()
  .max(300, "La bio no puede superar los 300 caracteres")
  .optional()
  .or(z.literal(""))
  .transform((value) => value || undefined);

export const updateProfileSchema = z.object({
  nick: z
    .string()
    .trim()
    .min(3, "El nick debe tener al menos 3 caracteres")
    .max(20, "El nick no puede superar los 20 caracteres")
    .regex(/^[a-zA-Z0-9_.-]+$/, "Usa solo letras, numeros, puntos, guiones y guion bajo"),
  displayName: z
    .string()
    .trim()
    .min(2, "El nombre visible debe tener al menos 2 caracteres")
    .max(40, "El nombre visible no puede superar los 40 caracteres"),
  avatarUrl: optionalUrl,
  city: z
    .string()
    .trim()
    .min(2, "La ciudad debe tener al menos 2 caracteres")
    .max(50, "La ciudad no puede superar los 50 caracteres"),
  bio: optionalBio,
  mainGameId: z.string().min(1, "Selecciona un juego principal"),
  availabilityStatus: z.nativeEnum(PresenceStatus),
});

export type UpdateProfileValues = z.input<typeof updateProfileSchema>;
