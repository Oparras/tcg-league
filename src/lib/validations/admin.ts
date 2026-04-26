import { UserRole } from "@prisma/client";
import { z } from "zod";

const optionalDescription = z
  .string()
  .trim()
  .max(500, "La descripcion no puede superar los 500 caracteres")
  .optional()
  .or(z.literal(""))
  .transform((value) => value || undefined);

const optionalUrl = z
  .string()
  .trim()
  .url("Introduce una URL valida")
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

const optionalOwnerId = z
  .string()
  .trim()
  .optional()
  .or(z.literal(""))
  .transform((value) => value || undefined);

const requiredGameIds = z
  .array(z.string().min(1, "Selecciona un juego"))
  .min(1, "Selecciona al menos un juego soportado");

const storeBaseSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .max(80, "El nombre no puede superar los 80 caracteres"),
  city: z
    .string()
    .trim()
    .min(2, "La ciudad debe tener al menos 2 caracteres")
    .max(50, "La ciudad no puede superar los 50 caracteres"),
  region: optionalText(60),
  country: optionalText(60),
  address: z
    .string()
    .trim()
    .min(4, "La direccion debe tener al menos 4 caracteres")
    .max(120, "La direccion no puede superar los 120 caracteres"),
  description: optionalDescription,
  logoUrl: optionalUrl,
  bannerUrl: optionalUrl,
  websiteUrl: optionalUrl,
  officialLocatorUrl: optionalUrl,
  googleMapsUrl: optionalUrl,
  discordUrl: optionalUrl,
  instagramUrl: optionalUrl,
  ownerId: optionalOwnerId,
  gameIds: requiredGameIds,
});

export const updateUserRoleSchema = z.object({
  userId: z.string().min(1, "No hemos encontrado el usuario."),
  role: z.nativeEnum(UserRole),
});

export const assignStoreOwnerSchema = z.object({
  storeId: z.string().min(1, "No hemos encontrado la tienda."),
  ownerId: optionalOwnerId,
});

export const toggleStoreVerificationSchema = z.object({
  storeId: z.string().min(1, "No hemos encontrado la tienda."),
  isVerified: z.enum(["true", "false"]).transform((value) => value === "true"),
});

export const createAdminStoreSchema = storeBaseSchema;

export const updateAdminStoreSchema = storeBaseSchema.extend({
  storeId: z.string().min(1, "No hemos encontrado la tienda."),
  isVerified: z.enum(["true", "false"]).transform((value) => value === "true"),
});
