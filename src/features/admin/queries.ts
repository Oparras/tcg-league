import {
  DisputeStatus,
  MembershipStatus,
  StoreJoinRequestStatus,
  UserRole,
} from "@prisma/client";

import { getDb } from "@/lib/db";

export async function getAdminPageData() {
  const db = getDb();

  const [users, stores, games, disputedMatches] = await Promise.all([
    db.user.findMany({
      orderBy: [{ role: "desc" }, { createdAt: "asc" }],
      include: {
        playerProfile: {
          include: {
            primaryStore: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        ownedStores: {
          select: {
            id: true,
          },
        },
      },
    }),
    db.store.findMany({
      orderBy: [{ isVerified: "desc" }, { name: "asc" }],
      include: {
        // Surface owner + directory data in one query so admin can edit without extra round-trips.
        owner: {
          select: {
            id: true,
            email: true,
            role: true,
            playerProfile: {
              select: {
                nick: true,
                displayName: true,
              },
            },
          },
        },
        supportedGames: {
          include: {
            game: true,
          },
          orderBy: [{ isFeatured: "desc" }, { createdAt: "asc" }],
        },
        memberships: {
          where: {
            status: MembershipStatus.ACTIVE,
          },
          select: {
            id: true,
          },
        },
        joinRequests: {
          where: {
            status: StoreJoinRequestStatus.PENDING,
          },
          select: {
            id: true,
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
        slug: true,
      },
    }),
    db.match.findMany({
      where: {
        status: "DISPUTED",
      },
      orderBy: { updatedAt: "desc" },
      take: 12,
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
        disputes: {
          where: {
            status: {
              in: [DisputeStatus.OPEN, DisputeStatus.UNDER_REVIEW],
            },
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
          include: {
            raisedBy: {
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
        },
      },
    }),
  ]);

  const ownerOptions = users.map((user) => ({
      id: user.id,
      email: user.email,
      role: user.role,
      label:
        user.playerProfile?.displayName ??
        user.playerProfile?.nick ??
        user.email,
    }));

  const counts = {
    users: users.length,
    stores: stores.length,
    verifiedStores: stores.filter((store) => store.isVerified).length,
    pendingRequests: stores.reduce(
      (total, store) => total + store.joinRequests.length,
      0,
    ),
    admins: users.filter((user) => user.role === UserRole.ADMIN).length,
  };

  return {
    counts,
    users,
    stores,
    games,
    disputedMatches,
    ownerOptions,
  };
}
