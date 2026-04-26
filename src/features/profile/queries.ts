import { FriendshipStatus, MatchStatus, MembershipStatus } from "@prisma/client";

import { getFriendNetwork, getFriendshipBetweenUsers } from "@/features/social/queries";
import { getDb } from "@/lib/db";

export async function getProfilePageData(identifier: string, viewerId: string) {
  const db = getDb();

  const profile = await db.playerProfile.findFirst({
    where: {
      OR: [{ userId: identifier }, { nick: identifier }],
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          role: true,
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
  });

  if (!profile) {
    return null;
  }

  const [memberships, recentMatches, games, friendship, viewerFriendNetwork] =
    await Promise.all([
      db.storeMembership.findMany({
        where: {
          userId: profile.userId,
          status: MembershipStatus.ACTIVE,
        },
        include: {
          store: {
            select: {
              id: true,
              slug: true,
              name: true,
              city: true,
            },
          },
        },
        orderBy: [{ isPrimary: "desc" }, { joinedAt: "asc" }],
      }),
      db.match.findMany({
        where: {
          OR: [{ playerAId: profile.userId }, { playerBId: profile.userId }],
          status: {
            in: [
              MatchStatus.ACCEPTED,
              MatchStatus.PLAYED_PENDING_CONFIRMATION,
              MatchStatus.CONFIRMED,
              MatchStatus.DISPUTED,
              MatchStatus.CANCELLED,
            ],
          },
        },
        orderBy: [{ confirmedAt: "desc" }, { updatedAt: "desc" }, { createdAt: "desc" }],
        take: 14,
        include: {
          game: true,
          playerA: {
            select: {
              id: true,
              playerProfile: {
                select: {
                  nick: true,
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
                  nick: true,
                  displayName: true,
                },
              },
            },
          },
          winner: {
            select: {
              id: true,
              playerProfile: {
                select: {
                  nick: true,
                },
              },
            },
          },
        },
      }),
      db.game.findMany({
        where: { isActive: true },
        orderBy: [{ isFeatured: "desc" }, { name: "asc" }],
        select: {
          id: true,
          name: true,
        },
      }),
      getFriendshipBetweenUsers(viewerId, profile.userId),
      getFriendNetwork(profile.userId),
    ]);

  const matchSummary = {
    confirmedWins: recentMatches.filter(
      (match) => match.status === MatchStatus.CONFIRMED && match.winnerId === profile.userId,
    ).length,
    confirmedLosses: recentMatches.filter(
      (match) => match.status === MatchStatus.CONFIRMED && match.winnerId !== profile.userId,
    ).length,
    pendingResults: recentMatches.filter(
      (match) => match.status === MatchStatus.PLAYED_PENDING_CONFIRMATION,
    ).length,
    disputed: recentMatches.filter((match) => match.status === MatchStatus.DISPUTED).length,
  };

  return {
    profile,
    memberships,
    recentMatches,
    games,
    friendship,
    friends: viewerFriendNetwork.friends,
    incomingFriendRequests: viewerFriendNetwork.incomingRequests,
    outgoingFriendRequests: viewerFriendNetwork.outgoingRequests,
    matchSummary,
    currentStore:
      profile.primaryStore ??
      memberships.find((membership) => membership.isPrimary)?.store ??
      memberships[0]?.store ??
      null,
    isViewingOwnProfile: profile.userId === viewerId,
  };
}

export async function canUsersChat(viewerId: string, targetUserId: string) {
  if (viewerId === targetUserId) {
    return false;
  }

  const friendship = await getDb().friendship.findFirst({
    where: {
      status: FriendshipStatus.ACCEPTED,
      OR: [
        {
          requesterId: viewerId,
          addresseeId: targetUserId,
        },
        {
          requesterId: targetUserId,
          addresseeId: viewerId,
        },
      ],
    },
    select: {
      id: true,
    },
  });

  return Boolean(friendship);
}
