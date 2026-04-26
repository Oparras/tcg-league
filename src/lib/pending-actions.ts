import {
  ChallengeStatus,
  DisputeStatus,
  FriendshipStatus,
  MatchConfirmationStatus,
  MatchStatus,
  StoreJoinRequestStatus,
  UserRole,
} from "@prisma/client";

import { getDb } from "@/lib/db";

export type PendingActionType =
  | "challenge_received"
  | "counter_proposal"
  | "match_confirmation"
  | "store_join_request"
  | "dispute"
  | "friend_request";

export type PendingActionItem = {
  type: PendingActionType;
  title: string;
  description: string;
  href: string;
  createdAt: Date;
  priority?: number;
};

export type PendingActionSummary = {
  total: number;
  challengesReceived: number;
  counterProposals: number;
  matchConfirmations: number;
  storeJoinRequests: number;
  disputes: number;
  friendRequests: number;
  items: PendingActionItem[];
};

function sortPendingItems(items: PendingActionItem[]) {
  return [...items].sort((a, b) => {
    const priorityDiff = (b.priority ?? 0) - (a.priority ?? 0);

    if (priorityDiff !== 0) {
      return priorityDiff;
    }

    return b.createdAt.getTime() - a.createdAt.getTime();
  });
}

export async function getPendingActionSummary(
  userId: string,
): Promise<PendingActionSummary> {
  const db = getDb();
  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      role: true,
      ownedStores: {
        select: {
          id: true,
          slug: true,
          name: true,
        },
      },
    },
  });

  if (!user) {
    return {
      total: 0,
      challengesReceived: 0,
      counterProposals: 0,
      matchConfirmations: 0,
      storeJoinRequests: 0,
      disputes: 0,
      friendRequests: 0,
      items: [],
    };
  }

  const isAdmin = user.role === UserRole.ADMIN;
  const ownedStores = user.ownedStores;
  const ownedStoreIds = ownedStores.map((store) => store.id);
  const unresolvedDisputeStatuses: DisputeStatus[] = [
    DisputeStatus.OPEN,
    DisputeStatus.UNDER_REVIEW,
  ];

  const [
    challengesReceivedCount,
    counterProposalsCount,
    matchConfirmationsCount,
    storeJoinRequestsCount,
    disputesCount,
    friendRequestsCount,
    receivedChallenges,
    counterProposals,
    pendingMatchConfirmations,
    pendingStoreRequests,
    pendingDisputes,
    pendingFriendRequests,
  ] = await Promise.all([
    db.challenge.count({
      where: {
        challengedId: userId,
        status: ChallengeStatus.PENDING,
      },
    }),
    db.challenge.count({
      where: {
        challengerId: userId,
        status: ChallengeStatus.COUNTER_PROPOSED,
      },
    }),
    db.matchResultConfirmation.count({
      where: {
        userId,
        status: MatchConfirmationStatus.PENDING,
        match: {
          status: MatchStatus.PLAYED_PENDING_CONFIRMATION,
        },
      },
    }),
    ownedStoreIds.length
      ? db.storeJoinRequest.count({
          where: {
            status: StoreJoinRequestStatus.PENDING,
            storeId: {
              in: ownedStoreIds,
            },
          },
        })
      : Promise.resolve(0),
    isAdmin
      ? db.dispute.count({
          where: {
            status: {
              in: unresolvedDisputeStatuses,
            },
          },
        })
      : ownedStoreIds.length
        ? db.dispute.count({
            where: {
              status: {
                in: unresolvedDisputeStatuses,
              },
              match: {
                OR: [
                  {
                    storeAId: {
                      in: ownedStoreIds,
                    },
                  },
                  {
                    storeBId: {
                      in: ownedStoreIds,
                    },
                  },
                ],
              },
            },
          })
        : Promise.resolve(0),
    db.friendship.count({
      where: {
        addresseeId: userId,
        status: FriendshipStatus.PENDING,
      },
    }),
    db.challenge.findMany({
      where: {
        challengedId: userId,
        status: ChallengeStatus.PENDING,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
      include: {
        challenger: {
          select: {
            playerProfile: {
              select: {
                nick: true,
                displayName: true,
              },
            },
          },
        },
        game: {
          select: {
            name: true,
          },
        },
      },
    }),
    db.challenge.findMany({
      where: {
        challengerId: userId,
        status: ChallengeStatus.COUNTER_PROPOSED,
      },
      orderBy: {
        updatedAt: "desc",
      },
      take: 5,
      include: {
        challenged: {
          select: {
            playerProfile: {
              select: {
                nick: true,
                displayName: true,
              },
            },
          },
        },
        game: {
          select: {
            name: true,
          },
        },
      },
    }),
    db.matchResultConfirmation.findMany({
      where: {
        userId,
        status: MatchConfirmationStatus.PENDING,
        match: {
          status: MatchStatus.PLAYED_PENDING_CONFIRMATION,
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
      take: 5,
      include: {
        match: {
          select: {
            id: true,
            game: {
              select: {
                name: true,
              },
            },
            playerA: {
              select: {
                playerProfile: {
                  select: {
                    nick: true,
                  },
                },
              },
            },
            playerB: {
              select: {
                playerProfile: {
                  select: {
                    nick: true,
                  },
                },
              },
            },
          },
        },
      },
    }),
    ownedStoreIds.length
      ? db.storeJoinRequest.findMany({
          where: {
            status: StoreJoinRequestStatus.PENDING,
            storeId: {
              in: ownedStoreIds,
            },
          },
          orderBy: {
            requestedAt: "desc",
          },
          take: 5,
          include: {
            store: {
              select: {
                id: true,
                slug: true,
                name: true,
              },
            },
            user: {
              select: {
                playerProfile: {
                  select: {
                    nick: true,
                    displayName: true,
                  },
                },
              },
            },
          },
        })
      : Promise.resolve([]),
    isAdmin
      ? db.dispute.findMany({
          where: {
            status: {
              in: unresolvedDisputeStatuses,
            },
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 5,
          include: {
            match: {
              select: {
                id: true,
                game: {
                  select: {
                    name: true,
                  },
                },
                playerA: {
                  select: {
                    playerProfile: {
                      select: {
                        nick: true,
                      },
                    },
                  },
                },
                playerB: {
                  select: {
                    playerProfile: {
                      select: {
                        nick: true,
                      },
                    },
                  },
                },
              },
            },
          },
        })
      : ownedStoreIds.length
        ? db.dispute.findMany({
            where: {
              status: {
                in: unresolvedDisputeStatuses,
              },
              match: {
                OR: [
                  {
                    storeAId: {
                      in: ownedStoreIds,
                    },
                  },
                  {
                    storeBId: {
                      in: ownedStoreIds,
                    },
                  },
                ],
              },
            },
            orderBy: {
              createdAt: "desc",
            },
            take: 5,
            include: {
              match: {
                select: {
                  id: true,
                  game: {
                    select: {
                      name: true,
                    },
                  },
                  playerA: {
                    select: {
                      playerProfile: {
                        select: {
                          nick: true,
                        },
                      },
                    },
                  },
                  playerB: {
                    select: {
                      playerProfile: {
                        select: {
                          nick: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          })
        : Promise.resolve([]),
    db.friendship.findMany({
      where: {
        addresseeId: userId,
        status: FriendshipStatus.PENDING,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
      include: {
        requester: {
          select: {
            playerProfile: {
              select: {
                nick: true,
                displayName: true,
              },
            },
          },
        },
      },
    }),
  ]);

  const items: PendingActionItem[] = [
    ...receivedChallenges.map((challenge) => ({
      type: "challenge_received" as const,
      title: "Reto recibido",
      description: `${challenge.challenger.playerProfile?.displayName ?? challenge.challenger.playerProfile?.nick ?? "Jugador"} te reta a ${challenge.game.name}.`,
      href: "/challenges?tab=received",
      createdAt: challenge.createdAt,
      priority: 2,
    })),
    ...counterProposals.map((challenge) => ({
      type: "counter_proposal" as const,
      title: "Contraoferta pendiente",
      description: `${challenge.challenged.playerProfile?.displayName ?? challenge.challenged.playerProfile?.nick ?? "Tu rival"} propuso nueva fecha para ${challenge.game.name}.`,
      href: "/challenges?tab=sent",
      createdAt: challenge.updatedAt,
      priority: 2,
    })),
    ...pendingMatchConfirmations.map((confirmation) => ({
      type: "match_confirmation" as const,
      title: "Resultado por confirmar",
      description: `${confirmation.match.playerA.playerProfile?.nick ?? "Player A"} vs ${confirmation.match.playerB.playerProfile?.nick ?? "Player B"} (${confirmation.match.game.name}).`,
      href: `/matches/${confirmation.match.id}`,
      createdAt: confirmation.updatedAt,
      priority: 3,
    })),
    ...pendingStoreRequests.map((request) => ({
      type: "store_join_request" as const,
      title: "Solicitud de tienda",
      description: `${request.user.playerProfile?.displayName ?? request.user.playerProfile?.nick ?? "Jugador"} quiere unirse a ${request.store.name}.`,
      href: `/stores/${request.store.slug}/requests`,
      createdAt: request.requestedAt,
      priority: 2,
    })),
    ...pendingDisputes.map((dispute) => ({
      type: "dispute" as const,
      title: "Disputa abierta",
      description: `${dispute.match.playerA.playerProfile?.nick ?? "Player A"} vs ${dispute.match.playerB.playerProfile?.nick ?? "Player B"} (${dispute.match.game.name}).`,
      href: `/matches/${dispute.match.id}`,
      createdAt: dispute.createdAt,
      priority: 4,
    })),
    ...pendingFriendRequests.map((request) => ({
      type: "friend_request" as const,
      title: "Solicitud de amistad",
      description: `${request.requester.playerProfile?.displayName ?? request.requester.playerProfile?.nick ?? "Jugador"} quiere agregarte.`,
      href: "/chat",
      createdAt: request.createdAt,
      priority: 2,
    })),
  ];

  return {
    total:
      challengesReceivedCount +
      counterProposalsCount +
      matchConfirmationsCount +
      storeJoinRequestsCount +
      disputesCount +
      friendRequestsCount,
    challengesReceived: challengesReceivedCount,
    counterProposals: counterProposalsCount,
    matchConfirmations: matchConfirmationsCount,
    storeJoinRequests: storeJoinRequestsCount,
    disputes: disputesCount,
    friendRequests: friendRequestsCount,
    items: sortPendingItems(items).slice(0, 12),
  };
}
