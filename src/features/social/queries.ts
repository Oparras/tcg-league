import { FriendshipStatus } from "@prisma/client";

import { getDb } from "@/lib/db";

export type FriendshipRelationType =
  | "self"
  | "none"
  | "outgoing_pending"
  | "incoming_pending"
  | "friends"
  | "rejected"
  | "blocked";

export async function getFriendshipBetweenUsers(userId: string, targetUserId: string) {
  if (userId === targetUserId) {
    return {
      relation: "self" as const,
      record: null,
    };
  }

  const record = await getDb().friendship.findFirst({
    where: {
      OR: [
        {
          requesterId: userId,
          addresseeId: targetUserId,
        },
        {
          requesterId: targetUserId,
          addresseeId: userId,
        },
      ],
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  if (!record) {
    return {
      relation: "none" as const,
      record: null,
    };
  }

  if (record.status === FriendshipStatus.ACCEPTED) {
    return {
      relation: "friends" as const,
      record,
    };
  }

  if (record.status === FriendshipStatus.PENDING) {
    return {
      relation:
        record.requesterId === userId
          ? ("outgoing_pending" as const)
          : ("incoming_pending" as const),
      record,
    };
  }

  if (record.status === FriendshipStatus.REJECTED) {
    return {
      relation: "rejected" as const,
      record,
    };
  }

  return {
    relation: "blocked" as const,
    record,
  };
}

export async function getFriendNetwork(userId: string) {
  const db = getDb();
  const [acceptedFriendships, incomingRequests, outgoingRequests] =
    await Promise.all([
      db.friendship.findMany({
        where: {
          status: FriendshipStatus.ACCEPTED,
          OR: [{ requesterId: userId }, { addresseeId: userId }],
        },
        orderBy: {
          updatedAt: "desc",
        },
        include: {
          requester: {
            select: {
              id: true,
              playerProfile: {
                select: {
                  nick: true,
                  displayName: true,
                  avatarUrl: true,
                  city: true,
                  eloGlobal: true,
                  winRate: true,
                  primaryStore: {
                    select: {
                      id: true,
                      name: true,
                      slug: true,
                    },
                  },
                },
              },
            },
          },
          addressee: {
            select: {
              id: true,
              playerProfile: {
                select: {
                  nick: true,
                  displayName: true,
                  avatarUrl: true,
                  city: true,
                  eloGlobal: true,
                  winRate: true,
                  primaryStore: {
                    select: {
                      id: true,
                      name: true,
                      slug: true,
                    },
                  },
                },
              },
            },
          },
        },
      }),
      db.friendship.findMany({
        where: {
          addresseeId: userId,
          status: FriendshipStatus.PENDING,
        },
        orderBy: {
          createdAt: "desc",
        },
        include: {
          requester: {
            select: {
              id: true,
              playerProfile: {
                select: {
                  nick: true,
                  displayName: true,
                  avatarUrl: true,
                  city: true,
                  eloGlobal: true,
                  primaryStore: {
                    select: {
                      id: true,
                      name: true,
                      slug: true,
                    },
                  },
                },
              },
            },
          },
        },
      }),
      db.friendship.findMany({
        where: {
          requesterId: userId,
          status: FriendshipStatus.PENDING,
        },
        orderBy: {
          createdAt: "desc",
        },
        include: {
          addressee: {
            select: {
              id: true,
              playerProfile: {
                select: {
                  nick: true,
                  displayName: true,
                  avatarUrl: true,
                  city: true,
                  eloGlobal: true,
                  primaryStore: {
                    select: {
                      id: true,
                      name: true,
                      slug: true,
                    },
                  },
                },
              },
            },
          },
        },
      }),
    ]);

  const friendByUserId = new Map<
    string,
    {
      friendshipId: string;
      friendUserId: string;
      nick: string;
      displayName: string;
      avatarUrl: string | null;
      city: string;
      eloGlobal: number;
      winRate: number;
      primaryStore: { id: string; name: string; slug: string } | null;
      since: Date;
    }
  >();

  for (const friendship of acceptedFriendships) {
    const friend =
      friendship.requesterId === userId ? friendship.addressee : friendship.requester;

    if (!friend.playerProfile) {
      continue;
    }

    const existing = friendByUserId.get(friend.id);

    if (!existing || friendship.updatedAt > existing.since) {
      friendByUserId.set(friend.id, {
        friendshipId: friendship.id,
        friendUserId: friend.id,
        nick: friend.playerProfile.nick,
        displayName: friend.playerProfile.displayName,
        avatarUrl: friend.playerProfile.avatarUrl,
        city: friend.playerProfile.city,
        eloGlobal: friend.playerProfile.eloGlobal,
        winRate: friend.playerProfile.winRate,
        primaryStore: friend.playerProfile.primaryStore,
        since: friendship.updatedAt,
      });
    }
  }

  return {
    friends: [...friendByUserId.values()].sort((left, right) =>
      left.displayName.localeCompare(right.displayName, "es"),
    ),
    incomingRequests: incomingRequests
      .filter((request) => request.requester.playerProfile)
      .map((request) => ({
        id: request.id,
        createdAt: request.createdAt,
        requesterId: request.requester.id,
        requester: {
          nick: request.requester.playerProfile!.nick,
          displayName: request.requester.playerProfile!.displayName,
          avatarUrl: request.requester.playerProfile!.avatarUrl,
          city: request.requester.playerProfile!.city,
          eloGlobal: request.requester.playerProfile!.eloGlobal,
          primaryStore: request.requester.playerProfile!.primaryStore,
        },
      })),
    outgoingRequests: outgoingRequests
      .filter((request) => request.addressee.playerProfile)
      .map((request) => ({
        id: request.id,
        createdAt: request.createdAt,
        addresseeId: request.addressee.id,
        addressee: {
          nick: request.addressee.playerProfile!.nick,
          displayName: request.addressee.playerProfile!.displayName,
          avatarUrl: request.addressee.playerProfile!.avatarUrl,
          city: request.addressee.playerProfile!.city,
          eloGlobal: request.addressee.playerProfile!.eloGlobal,
          primaryStore: request.addressee.playerProfile!.primaryStore,
        },
      })),
  };
}
