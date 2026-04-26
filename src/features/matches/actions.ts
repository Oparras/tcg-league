"use server";

import {
  DisputeStatus,
  MatchConfirmationStatus,
  MatchStatus,
  NotificationType,
  UserRole,
  type Prisma,
} from "@prisma/client";
import { revalidatePath } from "next/cache";

import { calculateEloResult, calculateWinRate, DEFAULT_ELO } from "@/lib/elo";
import { getSeriesMarginFactor, validateSeriesScore } from "@/lib/match-format";
import { requireAuth } from "@/lib/auth/permissions";
import { getDb } from "@/lib/db";
import {
  reportMatchResultSchema,
  resolveDisputeSchema,
  reviewMatchResultSchema,
} from "@/lib/validations/matches";
import type { FormActionState } from "@/types/action-state";

function getOpponentId(match: { playerAId: string; playerBId: string }, userId: string) {
  return match.playerAId === userId ? match.playerBId : match.playerAId;
}

async function applyConfirmedResult(
  tx: Prisma.TransactionClient,
  input: {
    matchId: string;
    resolverId: string;
    resolutionNote?: string;
  },
) {
  const match = await tx.match.findUnique({
    where: { id: input.matchId },
    include: {
      confirmations: true,
      disputes: {
        where: {
          status: {
            in: [DisputeStatus.OPEN, DisputeStatus.UNDER_REVIEW],
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  if (!match) {
    throw new Error("MATCH_NOT_FOUND");
  }

  if (match.status === MatchStatus.CONFIRMED || match.confirmedAt) {
    throw new Error("MATCH_ALREADY_CONFIRMED");
  }

  if (!match.winnerId || !match.loserId) {
    throw new Error("MATCH_RESULT_MISSING");
  }

  const [playerAProfile, playerBProfile] = await Promise.all([
    tx.playerProfile.findUnique({
      where: { userId: match.playerAId },
      select: {
        id: true,
        eloGlobal: true,
        matchesPlayed: true,
        wins: true,
        losses: true,
      },
    }),
    tx.playerProfile.findUnique({
      where: { userId: match.playerBId },
      select: {
        id: true,
        eloGlobal: true,
        matchesPlayed: true,
        wins: true,
        losses: true,
      },
    }),
  ]);

  if (!playerAProfile || !playerBProfile) {
    throw new Error("PLAYER_PROFILE_NOT_FOUND");
  }

  const [playerAGameStat, playerBGameStat] = await Promise.all([
    tx.playerGameStat.findUnique({
      where: {
        playerProfileId_gameId: {
          playerProfileId: playerAProfile.id,
          gameId: match.gameId,
        },
      },
      select: {
        id: true,
        elo: true,
        matchesPlayed: true,
        wins: true,
        losses: true,
      },
    }),
    tx.playerGameStat.findUnique({
      where: {
        playerProfileId_gameId: {
          playerProfileId: playerBProfile.id,
          gameId: match.gameId,
        },
      },
      select: {
        id: true,
        elo: true,
        matchesPlayed: true,
        wins: true,
        losses: true,
      },
    }),
  ]);

  const playerAEloBefore =
    typeof match.playerAEloBefore === "number" && match.playerAEloBefore > 0
      ? match.playerAEloBefore
      : playerAProfile.eloGlobal ?? DEFAULT_ELO;
  const playerBEloBefore =
    typeof match.playerBEloBefore === "number" && match.playerBEloBefore > 0
      ? match.playerBEloBefore
      : playerBProfile.eloGlobal ?? DEFAULT_ELO;
  const playerAIsWinner = match.winnerId === match.playerAId;
  const validatedSeries = validateSeriesScore({
    format: match.format,
    playerAScore: match.playerAScore ?? -1,
    playerBScore: match.playerBScore ?? -1,
  });
  const winnerScore = playerAIsWinner
    ? match.playerAScore ?? 1
    : match.playerBScore ?? 1;
  const loserScore = playerAIsWinner
    ? match.playerBScore ?? 0
    : match.playerAScore ?? 0;
  const marginFactor = validatedSeries.isValid
    ? getSeriesMarginFactor({
        format: match.format,
        winnerScore,
        loserScore,
      })
    : 1;

  if (match.playerAEloBefore <= 0 || match.playerBEloBefore <= 0) {
    console.warn("[ELO] Invalid elo snapshot in match. Falling back to profile elo.", {
      matchId: match.id,
      storedPlayerAEloBefore: match.playerAEloBefore,
      storedPlayerBEloBefore: match.playerBEloBefore,
      fallbackPlayerAEloBefore: playerAEloBefore,
      fallbackPlayerBEloBefore: playerBEloBefore,
    });
  }

  if (!validatedSeries.isValid) {
    console.warn("[ELO] Invalid series score for match confirmation. Using neutral factor.", {
      matchId: match.id,
      format: match.format,
      playerAScore: match.playerAScore,
      playerBScore: match.playerBScore,
      reason: validatedSeries.reason,
    });
  }

  const eloResult = calculateEloResult({
    eloA: playerAEloBefore,
    eloB: playerBEloBefore,
    scoreA: playerAIsWinner ? 1 : 0,
    marginFactor,
  });

  console.info("[ELO] Match confirmation calculation", {
    matchId: match.id,
    playerAId: match.playerAId,
    playerBId: match.playerBId,
    playerAEloBefore,
    playerBEloBefore,
    playerAScore: match.playerAScore,
    playerBScore: match.playerBScore,
    marginFactor,
    playerAEloAfter: eloResult.newA,
    playerBEloAfter: eloResult.newB,
  });

  const nextAProfileMatches = playerAProfile.matchesPlayed + 1;
  const nextAWins = playerAProfile.wins + (playerAIsWinner ? 1 : 0);
  const nextALosses = playerAProfile.losses + (playerAIsWinner ? 0 : 1);
  const nextBProfileMatches = playerBProfile.matchesPlayed + 1;
  const nextBWins = playerBProfile.wins + (playerAIsWinner ? 0 : 1);
  const nextBLosses = playerBProfile.losses + (playerAIsWinner ? 1 : 0);

  await Promise.all([
    tx.playerProfile.update({
      where: { userId: match.playerAId },
      data: {
        eloGlobal: eloResult.newA,
        matchesPlayed: nextAProfileMatches,
        wins: nextAWins,
        losses: nextALosses,
        winRate: calculateWinRate(nextAWins, nextAProfileMatches),
      },
    }),
    tx.playerProfile.update({
      where: { userId: match.playerBId },
      data: {
        eloGlobal: eloResult.newB,
        matchesPlayed: nextBProfileMatches,
        wins: nextBWins,
        losses: nextBLosses,
        winRate: calculateWinRate(nextBWins, nextBProfileMatches),
      },
    }),
    tx.playerGameStat.upsert({
      where: {
        playerProfileId_gameId: {
          playerProfileId: playerAProfile.id,
          gameId: match.gameId,
        },
      },
      update: {
        elo: eloResult.newA,
        matchesPlayed: (playerAGameStat?.matchesPlayed ?? 0) + 1,
        wins: (playerAGameStat?.wins ?? 0) + (playerAIsWinner ? 1 : 0),
        losses: (playerAGameStat?.losses ?? 0) + (playerAIsWinner ? 0 : 1),
        winRate: calculateWinRate(
          (playerAGameStat?.wins ?? 0) + (playerAIsWinner ? 1 : 0),
          (playerAGameStat?.matchesPlayed ?? 0) + 1,
        ),
      },
      create: {
        playerProfileId: playerAProfile.id,
        gameId: match.gameId,
        elo: eloResult.newA,
        matchesPlayed: 1,
        wins: playerAIsWinner ? 1 : 0,
        losses: playerAIsWinner ? 0 : 1,
        winRate: calculateWinRate(playerAIsWinner ? 1 : 0, 1),
      },
    }),
    tx.playerGameStat.upsert({
      where: {
        playerProfileId_gameId: {
          playerProfileId: playerBProfile.id,
          gameId: match.gameId,
        },
      },
      update: {
        elo: eloResult.newB,
        matchesPlayed: (playerBGameStat?.matchesPlayed ?? 0) + 1,
        wins: (playerBGameStat?.wins ?? 0) + (playerAIsWinner ? 0 : 1),
        losses: (playerBGameStat?.losses ?? 0) + (playerAIsWinner ? 1 : 0),
        winRate: calculateWinRate(
          (playerBGameStat?.wins ?? 0) + (playerAIsWinner ? 0 : 1),
          (playerBGameStat?.matchesPlayed ?? 0) + 1,
        ),
      },
      create: {
        playerProfileId: playerBProfile.id,
        gameId: match.gameId,
        elo: eloResult.newB,
        matchesPlayed: 1,
        wins: playerAIsWinner ? 0 : 1,
        losses: playerAIsWinner ? 1 : 0,
        winRate: calculateWinRate(playerAIsWinner ? 0 : 1, 1),
      },
    }),
    tx.match.update({
      where: { id: match.id },
      data: {
        status: MatchStatus.CONFIRMED,
        confirmedAt: new Date(),
        playerAEloBefore,
        playerAEloAfter: eloResult.newA,
        playerBEloBefore,
        playerBEloAfter: eloResult.newB,
      },
    }),
    tx.matchResultConfirmation.updateMany({
      where: {
        matchId: match.id,
      },
      data: {
        status: MatchConfirmationStatus.CONFIRMED,
      },
    }),
  ]);

  const activeDispute = match.disputes[0];

  if (activeDispute) {
    await tx.dispute.update({
      where: { id: activeDispute.id },
      data: {
        status: DisputeStatus.RESOLVED,
        resolvedById: input.resolverId,
        resolvedAt: new Date(),
        resolutionNote:
          input.resolutionNote ?? "Resultado confirmado desde el panel de resolucion.",
      },
    });
  }

  return {
    match,
    eloResult,
  };
}

export async function reportMatchResultAction(
  _previousState: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  const session = await requireAuth();
  const parsed = reportMatchResultSchema.safeParse({
    matchId: formData.get("matchId"),
    playerAScore: formData.get("playerAScore"),
    playerBScore: formData.get("playerBScore"),
    proofImageUrl: formData.get("proofImageUrl"),
    note: formData.get("note"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "No hemos podido reportar el resultado.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const db = getDb();
  const match = await db.match.findUnique({
    where: { id: parsed.data.matchId },
    include: {
      game: {
        select: {
          name: true,
        },
      },
      playerA: {
        select: {
          id: true,
          playerProfile: {
            select: {
              displayName: true,
            },
          },
        },
      },
      playerB: {
        select: {
          id: true,
          playerProfile: {
            select: {
              displayName: true,
            },
          },
        },
      },
    },
  });

  if (!match) {
    return {
      status: "error",
      message: "La partida ya no existe.",
    };
  }

  const isParticipant =
    match.playerAId === session.user.id || match.playerBId === session.user.id;

  if (!isParticipant) {
    return {
      status: "error",
      message: "Solo los participantes pueden reportar el resultado.",
    };
  }

  const canEditExistingReport =
    match.status === MatchStatus.PLAYED_PENDING_CONFIRMATION &&
    match.reportedById === session.user.id;

  if (match.status !== MatchStatus.ACCEPTED && !canEditExistingReport) {
    return {
      status: "error",
      message: "Esta partida ya no admite un nuevo reporte de resultado.",
    };
  }

  const validatedSeries = validateSeriesScore({
    format: match.format,
    playerAScore: parsed.data.playerAScore,
    playerBScore: parsed.data.playerBScore,
  });

  if (!validatedSeries.isValid || !validatedSeries.winner) {
    return {
      status: "error",
      message:
        validatedSeries.reason ??
        "El marcador no es valido para el formato de esta partida.",
      fieldErrors: {
        playerAScore: [validatedSeries.reason ?? "Marcador invalido."],
        playerBScore: [validatedSeries.reason ?? "Marcador invalido."],
      },
    };
  }

  const winnerId =
    validatedSeries.winner === "A" ? match.playerAId : match.playerBId;
  const loserId = winnerId === match.playerAId ? match.playerBId : match.playerAId;
  const opponentId = getOpponentId(match, session.user.id);

  await db.$transaction(async (tx) => {
    await tx.match.update({
      where: { id: match.id },
      data: {
        winnerId,
        loserId,
        playerAScore: parsed.data.playerAScore,
        playerBScore: parsed.data.playerBScore,
        reportedById: session.user.id,
        proofImageUrl: parsed.data.proofImageUrl,
        playedAt: new Date(),
        status: MatchStatus.PLAYED_PENDING_CONFIRMATION,
      },
    });

    await tx.matchResultConfirmation.upsert({
      where: {
        matchId_userId: {
          matchId: match.id,
          userId: session.user.id,
        },
      },
      update: {
        status: MatchConfirmationStatus.CONFIRMED,
        note: parsed.data.note,
      },
      create: {
        matchId: match.id,
        userId: session.user.id,
        status: MatchConfirmationStatus.CONFIRMED,
        note: parsed.data.note,
      },
    });

    await tx.matchResultConfirmation.upsert({
      where: {
        matchId_userId: {
          matchId: match.id,
          userId: opponentId,
        },
      },
      update: {
        status: MatchConfirmationStatus.PENDING,
        note: null,
      },
      create: {
        matchId: match.id,
        userId: opponentId,
        status: MatchConfirmationStatus.PENDING,
      },
    });

    await tx.notification.create({
      data: {
        userId: opponentId,
        actorId: session.user.id,
        type: NotificationType.MATCH_RESULT_PENDING,
        title: "Resultado pendiente de confirmacion",
        body: `Ya puedes revisar el resultado reportado para ${match.game.name}.`,
        link: `/matches/${match.id}`,
      },
    });
  });

  revalidatePath(`/matches/${match.id}`);
  revalidatePath("/challenges");
  revalidatePath("/dashboard");

  return {
    status: "success",
    message: "Resultado reportado correctamente.",
  };
}

export async function reviewMatchResultAction(
  _previousState: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  const session = await requireAuth();
  const parsed = reviewMatchResultSchema.safeParse({
    matchId: formData.get("matchId"),
    intent: formData.get("intent"),
    reason: formData.get("reason"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "No hemos podido revisar el resultado.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  if (parsed.data.intent === "dispute" && !parsed.data.reason) {
    return {
      status: "error",
      message: "Escribe el motivo de la disputa.",
      fieldErrors: {
        reason: ["Escribe el motivo de la disputa."],
      },
    };
  }

  const db = getDb();
  const match = await db.match.findUnique({
    where: { id: parsed.data.matchId },
    include: {
      confirmations: true,
      disputes: {
        where: {
          status: {
            in: [DisputeStatus.OPEN, DisputeStatus.UNDER_REVIEW],
          },
        },
      },
      storeA: {
        select: {
          ownerId: true,
        },
      },
      storeB: {
        select: {
          ownerId: true,
        },
      },
    },
  });

  if (!match) {
    return {
      status: "error",
      message: "La partida ya no existe.",
    };
  }

  const isParticipant =
    match.playerAId === session.user.id || match.playerBId === session.user.id;

  if (!isParticipant) {
    return {
      status: "error",
      message: "Solo los participantes pueden revisar este resultado.",
    };
  }

  if (match.reportedById === session.user.id) {
    return {
      status: "error",
      message: "No puedes confirmar tu propio reporte.",
    };
  }

  if (match.status !== MatchStatus.PLAYED_PENDING_CONFIRMATION) {
    return {
      status: "error",
      message: "Esta partida ya no tiene un resultado pendiente de revision.",
    };
  }

  const viewerConfirmation = match.confirmations.find(
    (confirmation) => confirmation.userId === session.user.id,
  );

  if (!viewerConfirmation || viewerConfirmation.status !== MatchConfirmationStatus.PENDING) {
    return {
      status: "error",
      message: "No tienes una confirmacion pendiente sobre esta partida.",
    };
  }

  if (parsed.data.intent === "confirm") {
    try {
      await db.$transaction(async (tx) => {
        await tx.matchResultConfirmation.update({
          where: { id: viewerConfirmation.id },
          data: {
            status: MatchConfirmationStatus.CONFIRMED,
          },
        });

        await applyConfirmedResult(tx, {
          matchId: match.id,
          resolverId: session.user.id,
        });

        await tx.notification.createMany({
          data: [
            {
              userId: match.playerAId,
              actorId: session.user.id,
              type: NotificationType.MATCH_CONFIRMED,
              title: "Match confirmado",
              body: "El resultado del match ya ha sido confirmado y el ELO se ha actualizado.",
              link: `/matches/${match.id}`,
            },
            {
              userId: match.playerBId,
              actorId: session.user.id,
              type: NotificationType.MATCH_CONFIRMED,
              title: "Match confirmado",
              body: "El resultado del match ya ha sido confirmado y el ELO se ha actualizado.",
              link: `/matches/${match.id}`,
            },
          ],
        });
      });
    } catch (error) {
      console.error(error);

      return {
        status: "error",
        message: "No hemos podido confirmar el match.",
      };
    }

    revalidatePath(`/matches/${match.id}`);
    revalidatePath("/dashboard");
    revalidatePath("/rankings");
    revalidatePath("/challenges");

    return {
      status: "success",
      message: "Resultado confirmado y ELO actualizado.",
    };
  }

  if (match.disputes.length) {
    return {
      status: "error",
      message: "Esta partida ya tiene una disputa abierta.",
    };
  }

  const admins = await db.user.findMany({
    where: {
      role: UserRole.ADMIN,
    },
    select: {
      id: true,
    },
  });

  const notificationRecipients = Array.from(
    new Set(
      [
        ...admins.map((admin) => admin.id),
        match.storeA?.ownerId,
        match.storeB?.ownerId,
      ].filter(Boolean),
    ),
  ) as string[];

  await db.$transaction(async (tx) => {
    await tx.matchResultConfirmation.update({
      where: { id: viewerConfirmation.id },
      data: {
        status: MatchConfirmationStatus.DISPUTED,
        note: parsed.data.reason,
      },
    });

    await tx.match.update({
      where: { id: match.id },
      data: {
        status: MatchStatus.DISPUTED,
      },
    });

    await tx.dispute.create({
      data: {
        matchId: match.id,
        raisedById: session.user.id,
        assignedToId: admins[0]?.id,
        reason: parsed.data.reason!,
        status: admins.length ? DisputeStatus.UNDER_REVIEW : DisputeStatus.OPEN,
      },
    });

    if (notificationRecipients.length) {
      await tx.notification.createMany({
        data: notificationRecipients.map((userId) => ({
          userId,
          actorId: session.user.id,
          type: NotificationType.MATCH_DISPUTED,
          title: "Nueva disputa de match",
          body: "Un jugador ha disputado el resultado y necesita revision.",
          link: `/matches/${match.id}`,
        })),
      });
    }
  });

  revalidatePath(`/matches/${match.id}`);
  revalidatePath("/dashboard");
  revalidatePath("/admin");

  return {
    status: "success",
    message: "Disputa creada correctamente.",
  };
}

export async function resolveDisputeAction(
  _previousState: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  const session = await requireAuth();
  const parsed = resolveDisputeSchema.safeParse({
    disputeId: formData.get("disputeId"),
    intent: formData.get("intent"),
    resolutionNote: formData.get("resolutionNote"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "No hemos podido resolver la disputa.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const db = getDb();
  const dispute = await db.dispute.findUnique({
    where: { id: parsed.data.disputeId },
    include: {
      match: {
        select: {
          id: true,
          playerAId: true,
          playerBId: true,
          storeAId: true,
          storeBId: true,
        },
      },
    },
  });

  if (!dispute) {
    return {
      status: "error",
      message: "La disputa ya no existe.",
    };
  }

  const viewerOwnedStore = await db.store.findFirst({
    where: {
      ownerId: session.user.id,
      id: {
        in: [dispute.match.storeAId, dispute.match.storeBId].filter(Boolean) as string[],
      },
    },
    select: {
      id: true,
    },
  });

  const canResolve =
    session.user.role === UserRole.ADMIN || Boolean(viewerOwnedStore);
  const resolvableDisputeStatuses: DisputeStatus[] = [
    DisputeStatus.OPEN,
    DisputeStatus.UNDER_REVIEW,
  ];

  if (!canResolve) {
    return {
      status: "error",
      message: "No tienes permisos para resolver esta disputa.",
    };
  }

  if (!resolvableDisputeStatuses.includes(dispute.status)) {
    return {
      status: "error",
      message: "Esta disputa ya fue resuelta.",
    };
  }

  try {
    await db.$transaction(async (tx) => {
      if (parsed.data.intent === "confirm_result") {
        await applyConfirmedResult(tx, {
          matchId: dispute.matchId,
          resolverId: session.user.id,
          resolutionNote: parsed.data.resolutionNote,
        });

        await tx.notification.createMany({
          data: [
            {
              userId: dispute.match.playerAId,
              actorId: session.user.id,
              type: NotificationType.MATCH_CONFIRMED,
              title: "Disputa resuelta",
              body: "La disputa ha sido resuelta confirmando el resultado reportado.",
              link: `/matches/${dispute.matchId}`,
            },
            {
              userId: dispute.match.playerBId,
              actorId: session.user.id,
              type: NotificationType.MATCH_CONFIRMED,
              title: "Disputa resuelta",
              body: "La disputa ha sido resuelta confirmando el resultado reportado.",
              link: `/matches/${dispute.matchId}`,
            },
          ],
        });
      } else {
        await tx.match.update({
          where: { id: dispute.matchId },
          data: {
            status: MatchStatus.CANCELLED,
          },
        });

        await tx.dispute.update({
          where: { id: dispute.id },
          data: {
            status: DisputeStatus.RESOLVED,
            resolvedById: session.user.id,
            resolvedAt: new Date(),
            resolutionNote:
              parsed.data.resolutionNote ?? "Partida cancelada tras revisar la disputa.",
          },
        });

        await tx.notification.createMany({
          data: [
            {
              userId: dispute.match.playerAId,
              actorId: session.user.id,
              type: NotificationType.SYSTEM,
              title: "Match cancelado",
              body: "La disputa se ha cerrado cancelando la partida.",
              link: `/matches/${dispute.matchId}`,
            },
            {
              userId: dispute.match.playerBId,
              actorId: session.user.id,
              type: NotificationType.SYSTEM,
              title: "Match cancelado",
              body: "La disputa se ha cerrado cancelando la partida.",
              link: `/matches/${dispute.matchId}`,
            },
          ],
        });
      }
    });
  } catch (error) {
    console.error(error);

    return {
      status: "error",
      message: "No hemos podido cerrar la disputa.",
    };
  }

  revalidatePath(`/matches/${dispute.matchId}`);
  revalidatePath("/admin");
  revalidatePath("/dashboard");
  revalidatePath("/rankings");
  revalidatePath("/challenges");

  return {
    status: "success",
    message:
      parsed.data.intent === "confirm_result"
        ? "Disputa resuelta confirmando el resultado."
        : "Disputa resuelta cancelando la partida.",
  };
}
