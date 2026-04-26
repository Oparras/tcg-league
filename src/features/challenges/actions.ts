"use server";

import {
  ChallengeStatus,
  DisputeStatus,
  MatchStatus,
  NotificationType,
} from "@prisma/client";
import { revalidatePath } from "next/cache";

import { requireAuth } from "@/lib/auth/permissions";
import { getDb } from "@/lib/db";
import { DEFAULT_ELO } from "@/lib/elo";
import {
  createChallengeSchema,
  respondChallengeSchema,
} from "@/lib/validations/challenges";
import type { FormActionState } from "@/types/action-state";

async function getCurrentPrimaryStoreId(userId: string) {
  const profile = await getDb().playerProfile.findUnique({
    where: { userId },
    select: {
      primaryStoreId: true,
    },
  });

  return profile?.primaryStoreId ?? null;
}

export async function createChallengeAction(
  _previousState: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  const session = await requireAuth();
  const parsed = createChallengeSchema.safeParse({
    challengedId: formData.get("challengedId"),
    gameId: formData.get("gameId"),
    format: formData.get("format"),
    mode: formData.get("mode"),
    storeId: formData.get("storeId"),
    locationLabel: formData.get("locationLabel"),
    scheduledFor: formData.get("scheduledFor"),
    message: formData.get("message"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "No hemos podido crear el reto.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  if (session.user.id === parsed.data.challengedId) {
    return {
      status: "error",
      message: "No puedes retarte a ti mismo.",
    };
  }

  const db = getDb();
  const activeMatchStatuses: MatchStatus[] = [
    MatchStatus.ACCEPTED,
    MatchStatus.PLAYED_PENDING_CONFIRMATION,
  ];
  const [challenger, challenged, game, venueStore, activeChallenges] =
    await Promise.all([
      db.user.findUnique({
        where: { id: session.user.id },
        include: {
          playerProfile: true,
        },
      }),
      db.user.findUnique({
        where: { id: parsed.data.challengedId },
        include: {
          playerProfile: true,
        },
      }),
      db.game.findUnique({
        where: { id: parsed.data.gameId },
        select: {
          id: true,
          name: true,
        },
      }),
      parsed.data.storeId
        ? db.store.findUnique({
            where: { id: parsed.data.storeId },
            select: {
              id: true,
              name: true,
              slug: true,
            },
          })
        : Promise.resolve(null),
      db.challenge.findMany({
        where: {
          gameId: parsed.data.gameId,
          status: {
            in: [
              ChallengeStatus.PENDING,
              ChallengeStatus.COUNTER_PROPOSED,
              ChallengeStatus.ACCEPTED,
            ],
          },
          OR: [
            {
              challengerId: session.user.id,
              challengedId: parsed.data.challengedId,
            },
            {
              challengerId: parsed.data.challengedId,
              challengedId: session.user.id,
            },
          ],
        },
        include: {
          match: {
            select: {
              id: true,
              status: true,
              disputes: {
                where: {
                  status: {
                    in: [DisputeStatus.OPEN, DisputeStatus.UNDER_REVIEW],
                  },
                },
                select: {
                  id: true,
                },
                take: 1,
              },
            },
          },
        },
      }),
    ]);

  if (!challenger?.playerProfile || !challenged?.playerProfile) {
    return {
      status: "error",
      message: "No hemos podido identificar a ambos jugadores.",
    };
  }

  if (!game) {
    return {
      status: "error",
      message: "El juego seleccionado no existe.",
    };
  }

  if (parsed.data.storeId && !venueStore) {
    return {
      status: "error",
      message: "La tienda seleccionada no existe.",
    };
  }

  const hasActiveChallenge = activeChallenges.some((activeChallenge) => {
    if (
      activeChallenge.status === ChallengeStatus.PENDING ||
      activeChallenge.status === ChallengeStatus.COUNTER_PROPOSED
    ) {
      return true;
    }

    if (activeChallenge.status !== ChallengeStatus.ACCEPTED) {
      return false;
    }

    if (!activeChallenge.match) {
      return true;
    }

    if (activeMatchStatuses.includes(activeChallenge.match.status)) {
      return true;
    }

    if (activeChallenge.match.status === MatchStatus.DISPUTED) {
      return activeChallenge.match.disputes.length > 0;
    }

    return false;
  });

  if (hasActiveChallenge) {
    return {
      status: "error",
      message: "Ya existe un reto activo entre estos jugadores para este juego.",
    };
  }

  await db.challenge.create({
    data: {
      challengerId: session.user.id,
      challengedId: parsed.data.challengedId,
      gameId: parsed.data.gameId,
      storeId: parsed.data.storeId,
      format: parsed.data.format,
      mode: parsed.data.mode,
      locationLabel: parsed.data.locationLabel,
      scheduledFor: parsed.data.scheduledFor,
      message: parsed.data.message,
      status: ChallengeStatus.PENDING,
    },
  });

  await db.notification.create({
    data: {
      userId: challenged.id,
      actorId: session.user.id,
      type: NotificationType.CHALLENGE_RECEIVED,
      title: "Nuevo reto recibido",
      body: `${challenger.playerProfile.displayName} te ha retado a ${game.name}.`,
      link: "/challenges?tab=received",
    },
  });

  revalidatePath("/challenges");
  revalidatePath("/dashboard");
  revalidatePath(`/profile/${challenged.id}`);
  revalidatePath(`/profile/${session.user.id}`);

  return {
    status: "success",
    message: "Reto enviado correctamente.",
  };
}

export async function respondChallengeAction(
  _previousState: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  const session = await requireAuth();
  const parsed = respondChallengeSchema.safeParse({
    challengeId: formData.get("challengeId"),
    intent: formData.get("intent"),
    counterProposedFor: formData.get("counterProposedFor"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "No hemos podido actualizar el reto.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const db = getDb();
  const challenge = await db.challenge.findUnique({
    where: { id: parsed.data.challengeId },
    include: {
      game: {
        select: {
          id: true,
          name: true,
        },
      },
      challenger: {
        select: {
          id: true,
          playerProfile: {
            select: {
              displayName: true,
              eloGlobal: true,
            },
          },
        },
      },
      challenged: {
        select: {
          id: true,
          playerProfile: {
            select: {
              displayName: true,
              eloGlobal: true,
            },
          },
        },
      },
      match: {
        select: {
          id: true,
          status: true,
        },
      },
    },
  });

  if (!challenge) {
    return {
      status: "error",
      message: "El reto ya no existe.",
    };
  }

  const isChallenger = challenge.challengerId === session.user.id;
  const isChallenged = challenge.challengedId === session.user.id;
  const isAdmin = session.user.role === "ADMIN";

  if (!isChallenger && !isChallenged && !isAdmin) {
    return {
      status: "error",
      message: "No puedes modificar este reto.",
    };
  }

  const counterDate =
    parsed.data.counterProposedFor &&
    parsed.data.intent === "counter"
      ? new Date(parsed.data.counterProposedFor)
      : null;

  if (parsed.data.intent === "counter") {
    if (!isChallenged && !isAdmin) {
      return {
        status: "error",
        message: "Solo el jugador retado puede proponer una nueva fecha.",
      };
    }

    if (
      !counterDate ||
      Number.isNaN(counterDate.getTime()) ||
      counterDate.getTime() <= Date.now()
    ) {
      return {
        status: "error",
        message: "Selecciona una fecha futura para la contraoferta.",
      };
    }
  }

  if (parsed.data.intent === "accept" && !isChallenged && !isAdmin) {
    return {
      status: "error",
      message: "Solo el jugador retado puede aceptar este reto.",
    };
  }

  if (parsed.data.intent === "reject" && !isChallenged && !isAdmin) {
    return {
      status: "error",
      message: "Solo el jugador retado puede rechazar este reto.",
    };
  }

  if (parsed.data.intent === "acceptCounter" && !isChallenger && !isAdmin) {
    return {
      status: "error",
      message: "Solo el retador puede aceptar una contraoferta.",
    };
  }

  if (parsed.data.intent === "cancel" && !isChallenger && !isAdmin) {
    return {
      status: "error",
      message: "Solo el retador o un admin pueden cancelar este reto.",
    };
  }

  const acceptedStatuses: ChallengeStatus[] = [
    ChallengeStatus.PENDING,
    ChallengeStatus.COUNTER_PROPOSED,
  ];

  if (
    ["accept", "reject", "counter", "cancel", "acceptCounter"].includes(
      parsed.data.intent,
    ) &&
    !acceptedStatuses.includes(challenge.status)
  ) {
    return {
      status: "error",
      message: "Este reto ya no admite cambios.",
    };
  }

  const [playerAStoreId, playerBStoreId] = await Promise.all([
    getCurrentPrimaryStoreId(challenge.challengerId),
    getCurrentPrimaryStoreId(challenge.challengedId),
  ]);
  const playerAEloBefore =
    challenge.challenger.playerProfile?.eloGlobal ?? DEFAULT_ELO;
  const playerBEloBefore =
    challenge.challenged.playerProfile?.eloGlobal ?? DEFAULT_ELO;

  if (!challenge.challenger.playerProfile || !challenge.challenged.playerProfile) {
    console.warn("[ELO] Missing player profile while creating match snapshot", {
      challengeId: challenge.id,
      challengerId: challenge.challengerId,
      challengedId: challenge.challengedId,
      fallback: DEFAULT_ELO,
    });
  }

  let successMessage = "Reto actualizado.";

  await db.$transaction(async (tx) => {
    if (parsed.data.intent === "accept") {
      const match =
        challenge.match ??
        (await tx.match.create({
          data: {
            challengeId: challenge.id,
            playerAId: challenge.challengerId,
            playerBId: challenge.challengedId,
            gameId: challenge.gameId,
            format: challenge.format,
            mode: challenge.mode,
            locationLabel: challenge.locationLabel,
            storeAId: playerAStoreId,
            storeBId: playerBStoreId,
            scheduledFor: challenge.scheduledFor,
            status: MatchStatus.ACCEPTED,
            playerAEloBefore,
            playerBEloBefore,
          },
          select: {
            id: true,
            status: true,
          },
        }));

      await tx.challenge.update({
        where: { id: challenge.id },
        data: {
          status: ChallengeStatus.ACCEPTED,
          respondedAt: new Date(),
        },
      });

      await tx.notification.create({
        data: {
          userId: challenge.challengerId,
          actorId: session.user.id,
          type: NotificationType.CHALLENGE_UPDATED,
          title: "Reto aceptado",
          body: `${challenge.challenged.playerProfile?.displayName ?? "Tu rival"} ha aceptado el reto.`,
          link: `/matches/${match.id}`,
        },
      });

      successMessage = "Reto aceptado y match creado correctamente.";
    }

    if (parsed.data.intent === "reject") {
      await tx.challenge.update({
        where: { id: challenge.id },
        data: {
          status: ChallengeStatus.REJECTED,
          respondedAt: new Date(),
        },
      });

      await tx.notification.create({
        data: {
          userId: challenge.challengerId,
          actorId: session.user.id,
          type: NotificationType.CHALLENGE_UPDATED,
          title: "Reto rechazado",
          body: `${challenge.challenged.playerProfile?.displayName ?? "Tu rival"} ha rechazado el reto.`,
          link: "/challenges?tab=history",
        },
      });

      successMessage = "Reto rechazado.";
    }

    if (parsed.data.intent === "counter" && counterDate) {
      await tx.challenge.update({
        where: { id: challenge.id },
        data: {
          status: ChallengeStatus.COUNTER_PROPOSED,
          counterProposedFor: counterDate,
          respondedAt: new Date(),
        },
      });

      await tx.notification.create({
        data: {
          userId: challenge.challengerId,
          actorId: session.user.id,
          type: NotificationType.CHALLENGE_UPDATED,
          title: "Nueva propuesta de fecha",
          body: `${challenge.challenged.playerProfile?.displayName ?? "Tu rival"} ha propuesto otra fecha para ${challenge.game.name}.`,
          link: "/challenges?tab=sent",
        },
      });

      successMessage = "Contraoferta enviada.";
    }

    if (parsed.data.intent === "acceptCounter") {
      const scheduledFor = challenge.counterProposedFor ?? challenge.scheduledFor;
      const match =
        challenge.match ??
        (await tx.match.create({
          data: {
            challengeId: challenge.id,
            playerAId: challenge.challengerId,
            playerBId: challenge.challengedId,
            gameId: challenge.gameId,
            format: challenge.format,
            mode: challenge.mode,
            locationLabel: challenge.locationLabel,
            storeAId: playerAStoreId,
            storeBId: playerBStoreId,
            scheduledFor,
            status: MatchStatus.ACCEPTED,
            playerAEloBefore,
            playerBEloBefore,
          },
          select: {
            id: true,
            status: true,
          },
        }));

      await tx.challenge.update({
        where: { id: challenge.id },
        data: {
          status: ChallengeStatus.ACCEPTED,
          scheduledFor,
          counterProposedFor: null,
          respondedAt: new Date(),
        },
      });

      await tx.match.update({
        where: { id: match.id },
        data: {
          scheduledFor,
          status: MatchStatus.ACCEPTED,
          locationLabel: challenge.locationLabel,
          storeAId: playerAStoreId,
          storeBId: playerBStoreId,
        },
      });

      await tx.notification.create({
        data: {
          userId: challenge.challengedId,
          actorId: session.user.id,
          type: NotificationType.CHALLENGE_UPDATED,
          title: "Contraoferta aceptada",
          body: `${challenge.challenger.playerProfile?.displayName ?? "Tu rival"} ha aceptado la nueva fecha del reto.`,
          link: `/matches/${match.id}`,
        },
      });

      successMessage = "Nueva fecha aceptada y match programado.";
    }

    if (parsed.data.intent === "cancel") {
      await tx.challenge.update({
        where: { id: challenge.id },
        data: {
          status: ChallengeStatus.CANCELLED,
        },
      });

      if (challenge.match) {
        await tx.match.update({
          where: { id: challenge.match.id },
          data: {
            status: MatchStatus.CANCELLED,
          },
        });
      }

      await tx.notification.create({
        data: {
          userId: isChallenger ? challenge.challengedId : challenge.challengerId,
          actorId: session.user.id,
          type: NotificationType.CHALLENGE_UPDATED,
          title: "Reto cancelado",
          body: "El reto ya no sigue adelante.",
          link: "/challenges?tab=history",
        },
      });

      successMessage = "Reto cancelado.";
    }
  });

  if (parsed.data.intent === "accept" || parsed.data.intent === "acceptCounter") {
    console.info("[ELO] Match created with elo snapshot", {
      challengeId: challenge.id,
      playerAId: challenge.challengerId,
      playerBId: challenge.challengedId,
      playerAEloBefore,
      playerBEloBefore,
    });
  }

  revalidatePath("/challenges");
  revalidatePath("/dashboard");
  if (challenge.match) {
    revalidatePath(`/matches/${challenge.match.id}`);
  }

  return {
    status: "success",
    message: successMessage,
  };
}
