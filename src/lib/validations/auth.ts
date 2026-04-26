import { z } from "zod";

const optionalUrl = z
  .string()
  .trim()
  .url("Introduce una URL valida para el avatar")
  .optional()
  .or(z.literal(""))
  .transform((value) => value || undefined);

export const loginSchema = z.object({
  email: z.string().trim().email("Introduce un email valido"),
  password: z.string().min(8, "La password debe tener al menos 8 caracteres"),
});

export const registerSchema = z.object({
  email: z.string().trim().email("Introduce un email valido"),
  password: z
    .string()
    .min(8, "La password debe tener al menos 8 caracteres")
    .regex(/[A-Z]/, "Incluye una mayuscula")
    .regex(/[a-z]/, "Incluye una minuscula")
    .regex(/[0-9]/, "Incluye un numero"),
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
  city: z
    .string()
    .trim()
    .min(2, "La ciudad debe tener al menos 2 caracteres")
    .max(50, "La ciudad no puede superar los 50 caracteres"),
  avatarUrl: optionalUrl,
  primaryStoreId: z
    .string()
    .optional()
    .or(z.literal(""))
    .transform((value) => value || undefined),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.input<typeof registerSchema>;
export type RegisterPayload = z.output<typeof registerSchema>;
