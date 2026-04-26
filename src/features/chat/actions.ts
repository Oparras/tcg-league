"use server";

import { FriendshipStatus, NotificationType } from "@prisma/client";
import { revalidatePath } from "next/cache";

import { requireAuth } from "@/lib/auth/permissions";
import { getDb } from "@/lib/db";
import { sendChatMessageSchema } from "@/lib/validations/chat";
import type { FormActionState } from "@/types/action-state";

export async function sendChatMessageAction(
  _previousState: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  const session = await requireAuth();
  const parsed = sendChatMessageSchema.safeParse({
    chatId: formData.get("chatId"),
    content: formData.get("content"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "No hemos podido enviar el mensaje.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const db = getDb();
  const chat = await db.chat.findUnique({
    where: {
      id: parsed.data.chatId,
    },
    select: {
      id: true,
      userAId: true,
      userBId: true,
    },
  });

  if (!chat) {
    return {
      status: "error",
      message: "El chat ya no existe.",
    };
  }

  if (chat.userAId !== session.user.id && chat.userBId !== session.user.id) {
    return {
      status: "error",
      message: "No puedes enviar mensajes en chats ajenos.",
    };
  }

  const otherUserId = chat.userAId === session.user.id ? chat.userBId : chat.userAId;

  const friendship = await db.friendship.findFirst({
    where: {
      status: FriendshipStatus.ACCEPTED,
      OR: [
        {
          requesterId: session.user.id,
          addresseeId: otherUserId,
        },
        {
          requesterId: otherUserId,
          addresseeId: session.user.id,
        },
      ],
    },
    select: {
      id: true,
    },
  });

  if (!friendship) {
    return {
      status: "error",
      message: "Debes ser amigo para enviar mensajes.",
    };
  }

  const sender = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      playerProfile: {
        select: {
          displayName: true,
          nick: true,
        },
      },
    },
  });

  await db.$transaction(async (tx) => {
    await tx.message.create({
      data: {
        chatId: chat.id,
        senderId: session.user.id,
        content: parsed.data.content,
      },
    });

    await tx.chat.update({
      where: {
        id: chat.id,
      },
      data: {
        lastMessageAt: new Date(),
      },
    });

    await tx.notification.create({
      data: {
        userId: otherUserId,
        actorId: session.user.id,
        type: NotificationType.NEW_MESSAGE,
        title: "Mensaje nuevo",
        body: `${sender?.playerProfile?.displayName ?? sender?.playerProfile?.nick ?? "Tu amigo"} te ha enviado un mensaje.`,
        link: `/chat?chat=${chat.id}`,
      },
    });
  });

  revalidatePath("/chat");
  revalidatePath("/dashboard");

  return {
    status: "success",
    message: "Mensaje enviado.",
  };
}
