import { ChallengeStatus, MatchStatus } from "@prisma/client";

import { getDb } from "@/lib/db";
import { challengeFiltersSchema } from "@/lib/validations/challenges";

export async function getChallengeCreatePageData(
  rawFilters: Record<string, string | string[] | undefined>,
  currentUserId: string,
) {
  const filters = challengeFiltersSchema.parse({
    query: typeof rawFilters.query === "string" ? rawFilters.query : "",
    store: typeof rawFilters.store === "string" ? rawFilters.store : "",
    game: typeof rawFilters.game === "string" ? rawFilters.game : "",
    opponent:
      typeof rawFilters.opponent === "string" ? rawFilters.opponent : "",
  });

  const db = getDb();
  const [games, stores, players] = await Promise.all([
    db.game.findMany({
      where: { isActive: true },
      orderBy: [{ isFeatured: "desc" }, { name: "asc" }],
      select: {
        id: true,
        slug: true,
        name: true,
      },
    }),
    db.store.findMany({
      orderBy: [{ isVerified: "desc" }, { name: "asc" }],
      select: {
        id: true,
        slug: true,
        name: true,
        city: true,
      },
    }),
    db.playerProfile.findMany({
      where: {
        userId: {
          not: currentUserId,
        },
        ...(filters.query
          ? {
              OR: [
                {
                  nick: {
                    contains: filters.query,
                    mode: "insensitive",
                  },
                },
                {
                  displayName: {
                    contains: filters.query,
                    mode: "insensitive",
                  },
                },
              ],
            }
          : {}),
        ...(filters.store
          ? {
              primaryStoreId: filters.store,
            }
          : {}),
        ...(filters.game
          ? {
              mainGameId: filters.game,
            }
          : {}),
      },
      orderBy: [{ eloGlobal: "desc" }, { wins: "desc" }, { nick: "asc" }],
      take: 24,
      include: {
        user: {
          select: {
            id: true,
            image: true,
          },
        },
        mainGame: true,
        primaryStore: true,
        gameStats: {
          include: {
            game: true,
          },
          orderBy: [{ elo: "desc" }, { matchesPlayed: "desc" }],
        },
      },
    }),
  ]);

  const selectedOpponent =
    players.find((player) => player.userId === filters.opponent) ??
    (filters.opponent
      ? await db.playerProfile.findUnique({
          where: {
            userId: filters.opponent,
          },
          include: {
            user: {
              select: {
                id: true,
                image: true,
              },
            },
            mainGame: true,
            primaryStore: true,
            gameStats: {
              include: {
                game: true,
              },
              orderBy: [{ elo: "desc" }, { matchesPlayed: "desc" }],
            },
          },
        })
      : null);

  return {
    filters,
    games,
    stores,
    players,
    selectedOpponent:
      selectedOpponent?.userId === currentUserId ? null : selectedOpponent,
  };
}

export async function getChallengesPageData(userId: string) {
  const challenges = await getDb().challenge.findMany({
    where: {
      OR: [{ challengerId: userId }, { challengedId: userId }],
    },
    orderBy: [{ scheduledFor: "asc" }, { createdAt: "desc" }],
    include: {
      game: true,
      venueStore: {
        select: {
          id: true,
          slug: true,
          name: true,
          city: true,
        },
      },
      challenger: {
        select: {
          id: true,
          playerProfile: {
            select: {
              nick: true,
              displayName: true,
              avatarUrl: true,
              city: true,
            },
          },
        },
      },
      challenged: {
        select: {
          id: true,
          playerProfile: {
            select: {
              nick: true,
              displayName: true,
              avatarUrl: true,
              city: true,
            },
          },
        },
      },
      match: {
        select: {
          id: true,
          status: true,
          scheduledFor: true,
          playedAt: true,
          confirmedAt: true,
        },
      },
    },
  });

  const pendingLikeStatuses: ChallengeStatus[] = [
    ChallengeStatus.PENDING,
    ChallengeStatus.COUNTER_PROPOSED,
  ];
  const upcomingMatchStatuses: MatchStatus[] = [
    MatchStatus.ACCEPTED,
    MatchStatus.PLAYED_PENDING_CONFIRMATION,
  ];
  const historicalMatchStatuses: MatchStatus[] = [
    MatchStatus.CONFIRMED,
    MatchStatus.DISPUTED,
    MatchStatus.CANCELLED,
  ];
  const terminalChallengeStatuses: ChallengeStatus[] = [
    ChallengeStatus.REJECTED,
    ChallengeStatus.CANCELLED,
    ChallengeStatus.EXPIRED,
  ];

  const received = challenges.filter(
    (challenge) =>
      challenge.challengedId === userId &&
      pendingLikeStatuses.includes(challenge.status),
  );

  const sent = challenges.filter(
    (challenge) =>
      challenge.challengerId === userId &&
      pendingLikeStatuses.includes(challenge.status),
  );

  const upcoming = challenges.filter((challenge) => {
    if (challenge.status !== ChallengeStatus.ACCEPTED) {
      return false;
    }

    if (!challenge.match) {
      return true;
    }

    return upcomingMatchStatuses.includes(challenge.match.status);
  });

  const history = challenges.filter((challenge) => {
    if (terminalChallengeStatuses.includes(challenge.status)) {
      return true;
    }

    if (!challenge.match) {
      return false;
    }

    return historicalMatchStatuses.includes(challenge.match.status);
  });

  return {
    received,
    sent,
    upcoming,
    history,
    counts: {
      received: received.length,
      sent: sent.length,
      upcoming: upcoming.length,
      history: history.length,
    },
  };
}
