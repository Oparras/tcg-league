import {
  ChallengeStatus,
  EventStatus,
  MatchStatus,
  MembershipStatus,
  Prisma,
  StoreJoinRequestStatus,
} from "@prisma/client";

import { getLatestChatPreviews } from "@/features/chat/queries";
import { getFriendNetwork } from "@/features/social/queries";
import { getDb } from "@/lib/db";
import { getPendingActionSummary } from "@/lib/pending-actions";

type DirectoryStoreSource = {
  id: string;
  slug: string;
  name: string;
  city: string;
  region: string | null;
  country: string | null;
  isVerified: boolean;
  websiteUrl: string | null;
  officialLocatorUrl: string | null;
  supportedGames: {
    id: string;
    game: {
      id: string;
      name: string;
    };
  }[];
  memberships: {
    userId: string;
    user: {
      playerProfile: {
        nick: string;
        displayName: string;
        eloGlobal: number;
      } | null;
    };
  }[];
};

function mapDirectoryStore(store: DirectoryStoreSource) {
  const topMembership = [...store.memberships].sort((left, right) => {
    return (
      (right.user.playerProfile?.eloGlobal ?? 0) -
      (left.user.playerProfile?.eloGlobal ?? 0)
    );
  })[0];

  return {
    id: store.id,
    slug: store.slug,
    name: store.name,
    city: store.city,
    region: store.region,
    country: store.country,
    isVerified: store.isVerified,
    websiteUrl: store.websiteUrl,
    officialLocatorUrl: store.officialLocatorUrl,
    activeMembersCount: store.memberships.length,
    supportedGames: store.supportedGames.map((item) => ({
      id: item.game.id,
      name: item.game.name,
    })),
    topPlayer: topMembership?.user.playerProfile
      ? {
          userId: topMembership.userId,
          nick: topMembership.user.playerProfile.nick,
          displayName: topMembership.user.playerProfile.displayName,
          eloGlobal: topMembership.user.playerProfile.eloGlobal,
        }
      : null,
  };
}

const directoryStoreQuery = {
  select: {
    id: true,
    slug: true,
    name: true,
    city: true,
    region: true,
    country: true,
    isVerified: true,
    websiteUrl: true,
    officialLocatorUrl: true,
    supportedGames: {
      include: {
        game: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: [{ isFeatured: "desc" }, { createdAt: "asc" }],
      take: 4,
    },
    memberships: {
      where: {
        status: MembershipStatus.ACTIVE,
      },
      select: {
        userId: true,
        user: {
          select: {
            playerProfile: {
              select: {
                nick: true,
                displayName: true,
                eloGlobal: true,
              },
            },
          },
        },
      },
      take: 50,
    },
  },
} satisfies Prisma.StoreDefaultArgs;

export async function getDashboardData(userId: string) {
  const db = getDb();
  const profile = await db.playerProfile.findUnique({
    where: { userId },
    include: {
      mainGame: true,
      primaryStore: true,
      gameStats: {
        include: { game: true },
        orderBy: { elo: "desc" },
        take: 4,
      },
    },
  });

  const preferredGameIds = profile
    ? Array.from(
        new Set([
          profile.mainGameId,
          ...profile.gameStats.map((stat) => stat.gameId),
        ].filter((gameId): gameId is string => Boolean(gameId))),
      )
    : [];

  const [
    rankings,
    upcomingEvents,
    pendingActionSummary,
    ownedStores,
    receivedChallenges,
    upcomingMatches,
    latestConfirmedMatches,
    ownedDisputedMatches,
    memberStoreMemberships,
    friendNetwork,
    latestChatPreviews,
  ] = await Promise.all([
    db.playerProfile.findMany({
      orderBy: [{ eloGlobal: "desc" }, { wins: "desc" }],
      take: 5,
      include: {
        user: { select: { id: true } },
        mainGame: true,
        primaryStore: true,
      },
    }),
    db.event.findMany({
      where: {
        status: {
          in: [EventStatus.OPEN_REGISTRATION, EventStatus.UPCOMING, EventStatus.FULL],
        },
      },
      orderBy: { startAt: "asc" },
      take: 4,
      include: {
        game: true,
        store: true,
        _count: {
          select: {
            registrations: true,
          },
        },
      },
    }),
    getPendingActionSummary(userId),
    db.store.findMany({
      where: {
        ownerId: userId,
      },
      orderBy: { name: "asc" },
      include: {
        joinRequests: {
          where: {
            status: StoreJoinRequestStatus.PENDING,
          },
          orderBy: {
            requestedAt: "asc",
          },
          include: {
            user: {
              select: {
                id: true,
                email: true,
                playerProfile: {
                  select: {
                    nick: true,
                    displayName: true,
                    city: true,
                  },
                },
              },
            },
          },
        },
        memberships: {
          where: {
            status: MembershipStatus.ACTIVE,
          },
          select: {
            id: true,
          },
        },
      },
    }),
    db.challenge.findMany({
      where: {
        challengedId: userId,
        status: {
          in: [ChallengeStatus.PENDING, ChallengeStatus.COUNTER_PROPOSED],
        },
      },
      orderBy: { scheduledFor: "asc" },
      take: 4,
      include: {
        game: true,
        challenger: {
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
    }),
    db.match.findMany({
      where: {
        status: {
          in: [MatchStatus.ACCEPTED, MatchStatus.PLAYED_PENDING_CONFIRMATION],
        },
        OR: [{ playerAId: userId }, { playerBId: userId }],
      },
      orderBy: { scheduledFor: "asc" },
      take: 4,
      include: {
        game: true,
        playerA: {
          select: {
            id: true,
            playerProfile: { select: { nick: true } },
          },
        },
        playerB: {
          select: {
            id: true,
            playerProfile: { select: { nick: true } },
          },
        },
      },
    }),
    db.match.findMany({
      where: {
        status: MatchStatus.CONFIRMED,
        OR: [{ playerAId: userId }, { playerBId: userId }],
      },
      orderBy: [{ confirmedAt: "desc" }, { playedAt: "desc" }],
      take: 4,
      include: {
        game: true,
        playerA: {
          select: {
            id: true,
            playerProfile: { select: { nick: true } },
          },
        },
        playerB: {
          select: {
            id: true,
            playerProfile: { select: { nick: true } },
          },
        },
        winner: {
          select: {
            id: true,
            playerProfile: { select: { nick: true } },
          },
        },
      },
    }),
    db.match.findMany({
      where: {
        status: MatchStatus.DISPUTED,
        OR: [
          {
            storeA: {
              ownerId: userId,
            },
          },
          {
            storeB: {
              ownerId: userId,
            },
          },
        ],
      },
      orderBy: { updatedAt: "desc" },
      take: 4,
      include: {
        game: true,
        playerA: {
          select: {
            id: true,
            playerProfile: { select: { nick: true } },
          },
        },
        playerB: {
          select: {
            id: true,
            playerProfile: { select: { nick: true } },
          },
        },
      },
    }),
    db.storeMembership.findMany({
      where: {
        userId,
        status: MembershipStatus.ACTIVE,
      },
      orderBy: [{ isPrimary: "desc" }, { joinedAt: "asc" }],
      include: {
        store: directoryStoreQuery,
      },
      take: 8,
    }),
    getFriendNetwork(userId),
    getLatestChatPreviews(userId, 5),
  ]);

  const memberStoreIds = memberStoreMemberships.map((membership) => membership.storeId);
  const [rawCityRecommendedStores, rawGameRecommendedStores] = await Promise.all([
    profile?.city
      ? db.store.findMany({
          where: {
            city: profile.city,
            id: {
              notIn: memberStoreIds,
            },
            memberships: {
              some: {
                status: MembershipStatus.ACTIVE,
              },
            },
          },
          orderBy: [{ isVerified: "desc" }, { name: "asc" }],
          take: 6,
          ...directoryStoreQuery,
        })
      : Promise.resolve([]),
    preferredGameIds.length
      ? db.store.findMany({
          where: {
            id: {
              notIn: memberStoreIds,
            },
            supportedGames: {
              some: {
                gameId: {
                  in: preferredGameIds,
                },
              },
            },
            memberships: {
              some: {
                status: MembershipStatus.ACTIVE,
              },
            },
          },
          orderBy: [{ isVerified: "desc" }, { name: "asc" }],
          take: 8,
          ...directoryStoreQuery,
        })
      : Promise.resolve([]),
  ]);

  const cityRecommendedStores = rawCityRecommendedStores.map(mapDirectoryStore);
  const cityRecommendedIds = new Set(cityRecommendedStores.map((store) => store.id));
  const gameRecommendedStores = rawGameRecommendedStores
    .map(mapDirectoryStore)
    .filter((store) => !cityRecommendedIds.has(store.id));
  const memberStores = memberStoreMemberships.map((membership) => ({
    id: membership.id,
    role: membership.role,
    isPrimary: membership.isPrimary,
    store: mapDirectoryStore(membership.store),
  }));

  return {
    profile,
    rankings,
    upcomingEvents,
    pendingActions: pendingActionSummary,
    pendingChallenges:
      pendingActionSummary.challengesReceived +
      pendingActionSummary.counterProposals,
    pendingConfirmations: pendingActionSummary.matchConfirmations,
    ownedStores,
    receivedChallenges,
    upcomingMatches,
    latestConfirmedMatches,
    ownedDisputedMatches,
    memberStores,
    cityRecommendedStores,
    gameRecommendedStores,
    friends: friendNetwork.friends,
    pendingFriendRequests: friendNetwork.incomingRequests,
    latestChats: latestChatPreviews,
  };
}
