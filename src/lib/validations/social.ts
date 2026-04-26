import { z } from "zod";

export const sendFriendRequestSchema = z.object({
  targetUserId: z.string().min(1, "No hemos podido identificar al jugador."),
});

export const respondFriendRequestSchema = z.object({
  friendshipId: z.string().min(1, "No hemos podido identificar la solicitud."),
  decision: z.enum(["accept", "reject"]),
});
