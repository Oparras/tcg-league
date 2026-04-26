import { z } from "zod";

export const sendChatMessageSchema = z.object({
  chatId: z.string().min(1, "No hemos podido identificar el chat."),
  content: z
    .string()
    .trim()
    .min(1, "Escribe un mensaje.")
    .max(1200, "El mensaje no puede superar los 1200 caracteres."),
});
