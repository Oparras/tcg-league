"use server";

import { FriendshipStatus, NotificationType } from "@prisma/client";
import { revalidatePath } from "next/cache";

import { requireAuth } from "@/lib/auth/permissions";
import { normalizeDirectChatParticipants } from "@/lib/chat";
import { getDb } from "@/lib/db";
import {
  respondFriendRequestSchema,
  sendFriendRequestSchema,
} from "@/lib/validations/social";
import type { FormActionState } from "@/types/action-state";

export async function sendFriendRequestAction(
  _previousState: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  const session = await requireAuth();
  const parsed = sendFriendRequestSchema.safeParse({
    targetUserId: formData.get("targetUserId"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "No hemos podido enviar la solicitud.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  if (parsed.data.targetUserId === session.user.id) {
    return {
      status: "error",
      message: "No puedes enviarte solicitud de amistad a ti mismo.",
    };
  }

  const db = getDb();
  const [actor, target, existingFriendship] = await Promise.all([
    db.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        playerProfile: {
          select: {
            displayName: true,
            nick: true,
          },
        },
      },
    }),
    db.user.findUnique({
      where: { id: parsed.data.targetUserId },
      select: {
        id: true,
        playerProfile: {
          select: {
            displayName: true,
            nick: true,
          },
        },
      },
    }),
    db.friendship.findFirst({
      where: {
        OR: [
          {
            requesterId: session.user.id,
            addresseeId: parsed.data.targetUserId,
          },
          {
            requesterId: parsed.data.targetUserId,
            addresseeId: session.user.id,
          },
        ],
      },
      orderBy: {
        updatedAt: "desc",
      },
    }),
  ]);

  if (!actor?.playerProfile || !target?.playerProfile) {
    return {
      status: "error",
      message: "No hemos podido identificar a ambos jugadores.",
    };
  }

  const actorDisplayName = actor.playerProfile.displayName;

  if (existingFriendship?.status === FriendshipStatus.ACCEPTED) {
    return {
      status: "error",
      message: "Ya sois amigos.",
    };
  }

  if (existingFriendship?.status === FriendshipStatus.PENDING) {
    if (existingFriendship.requesterId === session.user.id) {
      return {
        status: "error",
        message: "Ya has enviado una solicitud de amistad pendiente.",
      };
    }

    return {
      status: "error",
      message: "Este jugador ya te ha enviado una solicitud pendiente.",
    };
  }

  if (
    existingFriendship?.status === FriendshipStatus.BLOCKED &&
    existingFriendship.requesterId === parsed.data.targetUserId
  ) {
    return {
      status: "error",
      message: "No puedes enviar solicitud a este jugador en este momento.",
    };
  }

  const now = new Date();

  await db.$transaction(async (tx) => {
    if (existingFriendship) {
      await tx.friendship.update({
        where: {
          id: existingFriendship.id,
        },
        data: {
          requesterId: session.user.id,
          addresseeId: parsed.data.targetUserId,
          status: FriendshipStatus.PENDING,
          respondedAt: null,
          updatedAt: now,
        },
      });
    } else {
      await tx.friendship.create({
        data: {
          requesterId: session.user.id,
          addresseeId: parsed.data.targetUserId,
          status: FriendshipStatus.PENDING,
        },
      });
    }

    await tx.notification.create({
      data: {
        userId: parsed.data.targetUserId,
        actorId: session.user.id,
        type: NotificationType.FRIEND_REQUEST,
        title: "Nueva solicitud de amistad",
        body: `${actorDisplayName} te ha enviado una solicitud de amistad.`,
        link: `/profile/${session.user.id}`,
      },
    });
  });

  revalidatePath(`/profile/${session.user.id}`);
  revalidatePath(`/profile/${parsed.data.targetUserId}`);
  revalidatePath("/dashboard");
  revalidatePath("/chat");

  return {
    status: "success",
    message: "Solicitud de amistad enviada.",
  };
}

export async function respondFriendRequestAction(
  _previousState: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  const session = await requireAuth();
  const parsed = respondFriendRequestSchema.safeParse({
    friendshipId: formData.get("friendshipId"),
    decision: formData.get("decision"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "No hemos podido procesar la solicitud de amistad.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const db = getDb();
  const friendship = await db.friendship.findUnique({
    where: {
      id: parsed.data.friendshipId,
    },
    include: {
      requester: {
        select: {
          id: true,
          playerProfile: {
            select: {
              displayName: true,
              nick: true,
            },
          },
        },
      },
      addressee: {
        select: {
          id: true,
        },
      },
    },
  });

  if (!friendship) {
    return {
      status: "error",
      message: "La solicitud ya no existe.",
    };
  }

  if (friendship.addresseeId !== session.user.id) {
    return {
      status: "error",
      message: "Solo el destinatario puede responder esta solicitud.",
    };
  }

  if (friendship.status !== FriendshipStatus.PENDING) {
    return {
      status: "error",
      message: "Esta solicitud ya fue respondida.",
    };
  }

  const respondedAt = new Date();

  await db.$transaction(async (tx) => {
    if (parsed.data.decision === "accept") {
      await tx.friendship.update({
        where: {
          id: friendship.id,
        },
        data: {
          status: FriendshipStatus.ACCEPTED,
          respondedAt,
        },
      });

      const participants = normalizeDirectChatParticipants(
        friendship.requesterId,
        friendship.addresseeId,
      );

      await tx.chat.upsert({
        where: {
          userAId_userBId: participants,
        },
        update: {},
        create: participants,
      });

      await tx.notification.create({
        data: {
          userId: friendship.requesterId,
          actorId: session.user.id,
          type: NotificationType.FRIEND_REQUEST_ACCEPTED,
          title: "Solicitud de amistad aceptada",
          body: "Tu solicitud de amistad fue aceptada. Ya podéis chatear.",
          link: `/chat?with=${session.user.id}`,
        },
      });

      return;
    }

    await tx.friendship.update({
      where: {
        id: friendship.id,
      },
      data: {
        status: FriendshipStatus.REJECTED,
        respondedAt,
      },
    });
  });

  revalidatePath(`/profile/${session.user.id}`);
  revalidatePath(`/profile/${friendship.requesterId}`);
  revalidatePath("/dashboard");
  revalidatePath("/chat");

  return {
    status: "success",
    message:
      parsed.data.decision === "accept"
        ? "Solicitud aceptada. Ya puedes chatear."
        : "Solicitud rechazada.",
  };
}
