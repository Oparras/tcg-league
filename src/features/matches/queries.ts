import { MatchConfirmationStatus, MatchStatus, UserRole } from "@prisma/client";

import { getDb } from "@/lib/db";

export async function getMatchPageData(input: {
  matchId: string;
  viewerId: string;
  viewerRole: UserRole;
}) {
  const db = getDb();
  const ownedStoreIds =
    input.viewerRole === UserRole.ADMIN
      ? []
      : (
          await db.store.findMany({
            where: {
              ownerId: input.viewerId,
            },
            select: {
              id: true,
            },
          })
        ).map((store) => store.id);

  const match = await db.match.findUnique({
    where: {
      id: input.matchId,
    },
    include: {
      game: true,
      challenge: {
        select: {
          id: true,
          status: true,
          message: true,
        },
      },
      playerA: {
        select: {
          id: true,
          playerProfile: {
            select: {
              displayName: true,
              nick: true,
              avatarUrl: true,
              city: true,
              primaryStoreId: true,
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
              nick: true,
              avatarUrl: true,
              city: true,
              primaryStoreId: true,
            },
          },
        },
      },
      winner: {
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
      loser: {
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
      reportedBy: {
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
      storeA: {
        select: {
          id: true,
          slug: true,
          name: true,
          ownerId: true,
        },
      },
      storeB: {
        select: {
          id: true,
          slug: true,
          name: true,
          ownerId: true,
        },
      },
      confirmations: {
        orderBy: {
          createdAt: "asc",
        },
        include: {
          user: {
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
        },
      },
      disputes: {
        orderBy: {
          createdAt: "desc",
        },
        include: {
          raisedBy: {
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
          resolvedBy: {
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
        },
      },
    },
  });

  if (!match) {
    return null;
  }

  const isParticipant =
    match.playerAId === input.viewerId || match.playerBId === input.viewerId;
  const isAdmin = input.viewerRole === UserRole.ADMIN;
  const isOwnedStoreMatch =
    ownedStoreIds.includes(match.storeAId ?? "") ||
    ownedStoreIds.includes(match.storeBId ?? "");
  const canView = isParticipant || isAdmin || isOwnedStoreMatch;
  const viewerConfirmation = match.confirmations.find(
    (confirmation) => confirmation.userId === input.viewerId,
  );
  const pendingConfirmation = viewerConfirmation?.status === MatchConfirmationStatus.PENDING;
  const canReport =
    isParticipant &&
    (match.status === MatchStatus.ACCEPTED ||
      (match.status === MatchStatus.PLAYED_PENDING_CONFIRMATION &&
        match.reportedById === input.viewerId));
  const canReviewPendingResult =
    isParticipant &&
    match.status === MatchStatus.PLAYED_PENDING_CONFIRMATION &&
    match.reportedById !== input.viewerId &&
    pendingConfirmation;
  const canResolveDispute =
    match.status === MatchStatus.DISPUTED && (isAdmin || isOwnedStoreMatch);

  return {
    match,
    permissions: {
      canView,
      isParticipant,
      isAdmin,
      isOwnedStoreMatch,
      canReport,
      canReviewPendingResult,
      canResolveDispute,
    },
    viewerConfirmation,
  };
}
