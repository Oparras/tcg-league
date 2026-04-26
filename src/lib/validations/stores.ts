import { z } from "zod";

const optionalMessage = z
  .string()
  .trim()
  .max(240, "El mensaje no puede superar los 240 caracteres")
  .optional()
  .or(z.literal(""))
  .transform((value) => value || undefined);

const optionalUrl = z
  .string()
  .trim()
  .url("Introduce una URL valida.")
  .optional()
  .or(z.literal(""))
  .transform((value) => value || undefined);

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `No puede superar los ${max} caracteres`)
    .optional()
    .or(z.literal(""))
    .transform((value) => value || undefined);

export const storeFiltersSchema = z.object({
  query: z.string().optional().default(""),
  city: z.string().optional().default(""),
  region: z.string().optional().default(""),
  country: z.string().optional().default(""),
  game: z.string().optional().default(""),
  verifiedOnly: z
    .enum(["", "true", "false"])
    .optional()
    .default("")
    .transform((value) => value === "true"),
  activePlayersOnly: z
    .enum(["", "true", "false"])
    .optional()
    .default("")
    .transform((value) => value === "true"),
});

export const createStoreJoinRequestSchema = z.object({
  storeId: z.string().min(1, "No hemos encontrado la tienda."),
  message: optionalMessage,
});

export const reviewStoreJoinRequestSchema = z.object({
  requestId: z.string().min(1, "No hemos encontrado la solicitud."),
  decision: z.enum(["accept", "reject"]),
});

export const updateStorePublicProfileSchema = z.object({
  storeId: z.string().min(1, "No hemos encontrado la tienda."),
  city: z.string().trim().min(2, "La ciudad es obligatoria.").max(50, "La ciudad no puede superar los 50 caracteres."),
  region: optionalText(60),
  country: optionalText(60),
  address: z.string().trim().min(4, "La direccion es obligatoria.").max(140, "La direccion no puede superar los 140 caracteres."),
  description: optionalText(500),
  logoUrl: optionalUrl,
  bannerUrl: optionalUrl,
  websiteUrl: optionalUrl,
  officialLocatorUrl: optionalUrl,
  googleMapsUrl: optionalUrl,
  discordUrl: optionalUrl,
  instagramUrl: optionalUrl,
  gameIds: z
    .array(z.string().min(1, "Selecciona un juego"))
    .min(1, "Selecciona al menos un juego soportado"),
});

export type StoreFiltersValues = z.output<typeof storeFiltersSchema>;
