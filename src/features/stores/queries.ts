import { MembershipStatus, StoreJoinRequestStatus } from "@prisma/client";
import type { Prisma } from "@prisma/client";

import { getDb } from "@/lib/db";
import { storeFiltersSchema } from "@/lib/validations/stores";

export async function getStoreByIdentifier(identifier: string) {
  return getDb().store.findFirst({
    where: {
      OR: [{ id: identifier }, { slug: identifier }],
    },
    select: {
      id: true,
      slug: true,
      name: true,
      ownerId: true,
      city: true,
      region: true,
      country: true,
      address: true,
      description: true,
      logoUrl: true,
      bannerUrl: true,
      websiteUrl: true,
      officialLocatorUrl: true,
      googleMapsUrl: true,
      discordUrl: true,
      instagramUrl: true,
      isVerified: true,
      createdAt: true,
    },
  });
}

export async function getStoresPageData(
  rawFilters: Record<string, string | string[] | undefined>,
  viewerId: string,
) {
  const filters = storeFiltersSchema.parse({
    query: typeof rawFilters.query === "string" ? rawFilters.query : "",
    city: typeof rawFilters.city === "string" ? rawFilters.city : "",
    region: typeof rawFilters.region === "string" ? rawFilters.region : "",
    country: typeof rawFilters.country === "string" ? rawFilters.country : "",
    game: typeof rawFilters.game === "string" ? rawFilters.game : "",
    verifiedOnly:
      typeof rawFilters.verifiedOnly === "string" ? rawFilters.verifiedOnly : "",
    activePlayersOnly:
      typeof rawFilters.activePlayersOnly === "string"
        ? rawFilters.activePlayersOnly
        : "",
  });

  const where: Prisma.StoreWhereInput = {};

  if (filters.query) {
    where.OR = [
      {
        name: {
          contains: filters.query,
          mode: "insensitive",
        },
      },
      {
        city: {
          contains: filters.query,
          mode: "insensitive",
        },
      },
      {
        address: {
          contains: filters.query,
          mode: "insensitive",
        },
      },
    ];
  }

  if (filters.city) {
    where.city = {
      equals: filters.city,
      mode: "insensitive",
    };
  }

  if (filters.region) {
    where.region = {
      equals: filters.region,
      mode: "insensitive",
    };
  }

  if (filters.country) {
    where.country = {
      equals: filters.country,
      mode: "insensitive",
    };
  }

  if (filters.game) {
    where.supportedGames = {
      some: {
        game: {
          slug: filters.game,
        },
      },
    };
  }

  if (filters.verifiedOnly) {
    where.isVerified = true;
  }

  if (filters.activePlayersOnly) {
    where.memberships = {
      some: {
        status: MembershipStatus.ACTIVE,
      },
    };
  }

  const db = getDb();
  const [stores, cities, regions, countries, games] = await Promise.all([
    db.store.findMany({
      where,
      orderBy: [{ isVerified: "desc" }, { name: "asc" }],
      include: {
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
          include: {
            user: {
              select: {
                id: true,
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
        },
        joinRequests: {
          where: {
            userId: viewerId,
          },
          orderBy: { updatedAt: "desc" },
          take: 1,
          select: {
            status: true,
          },
        },
      },
    }),
    db.store.findMany({
      select: { city: true },
      distinct: ["city"],
      orderBy: { city: "asc" },
    }),
    db.store.findMany({
      select: { region: true },
      where: {
        region: {
          not: null,
        },
      },
      distinct: ["region"],
      orderBy: { region: "asc" },
    }),
    db.store.findMany({
      select: { country: true },
      where: {
        country: {
          not: null,
        },
      },
      distinct: ["country"],
      orderBy: { country: "asc" },
    }),
    db.game.findMany({
      where: { isActive: true },
      select: {
        id: true,
        slug: true,
        name: true,
      },
      orderBy: [{ isFeatured: "desc" }, { name: "asc" }],
    }),
  ]);

  const storesWithStats = stores.map((store) => {
    const topMembership = [...store.memberships].sort((left, right) => {
      return (
        (right.user.playerProfile?.eloGlobal ?? 0) -
        (left.user.playerProfile?.eloGlobal ?? 0)
      );
    })[0];
    const averageElo = store.memberships.length
      ? Math.round(
          store.memberships.reduce((total, membership) => {
            return total + (membership.user.playerProfile?.eloGlobal ?? 1000);
          }, 0) / store.memberships.length,
        )
      : null;

    return {
      ...store,
      activeMembersCount: store.memberships.length,
      averageElo,
      topPlayer: topMembership?.user.playerProfile
        ? {
            userId: topMembership.user.id,
            nick: topMembership.user.playerProfile.nick,
            displayName: topMembership.user.playerProfile.displayName,
            eloGlobal: topMembership.user.playerProfile.eloGlobal,
          }
        : null,
      viewerMembership: store.memberships.some(
        (membership) => membership.userId === viewerId,
      ),
      viewerJoinRequestStatus: store.joinRequests[0]?.status ?? null,
    };
  });

  return {
    filters,
    stores: storesWithStats,
    cities: cities.map((item) => item.city),
    regions: regions.map((item) => item.region).filter(Boolean) as string[],
    countries: countries.map((item) => item.country).filter(Boolean) as string[],
    games,
  };
}

export async function getStoreDetailPageData(identifier: string, viewerId: string) {
  const db = getDb();
  const [store, allGames] = await Promise.all([
    db.store.findFirst({
      where: {
        OR: [{ id: identifier }, { slug: identifier }],
      },
      include: {
        owner: {
          select: {
            id: true,
            role: true,
            playerProfile: {
              select: {
                displayName: true,
                nick: true,
                avatarUrl: true,
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
          include: {
            user: {
              select: {
                id: true,
                role: true,
                playerProfile: {
                  select: {
                    displayName: true,
                    nick: true,
                    avatarUrl: true,
                    eloGlobal: true,
                    wins: true,
                    losses: true,
                    winRate: true,
                    status: true,
                    mainGame: {
                      select: {
                        name: true,
                      },
                    },
                  },
                },
              },
            },
          },
          orderBy: [{ isPrimary: "desc" }, { joinedAt: "asc" }],
        },
        joinRequests: {
          where: { userId: viewerId },
          orderBy: { updatedAt: "desc" },
          take: 1,
        },
      },
    }),
    db.game.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        slug: true,
      },
      orderBy: [{ isFeatured: "desc" }, { name: "asc" }],
    }),
  ]);

  if (!store) {
    return null;
  }

  const ranking = [...store.memberships]
    .filter((membership) => membership.user.playerProfile)
    .sort((a, b) => {
      const left = a.user.playerProfile?.eloGlobal ?? 0;
      const right = b.user.playerProfile?.eloGlobal ?? 0;

      return right - left;
    });

  return {
    store,
    ranking,
    allGames,
    viewerMembership:
      store.memberships.find((membership) => membership.userId === viewerId) ?? null,
    viewerRequest: store.joinRequests[0] ?? null,
  };
}

export async function getStoreRequestsPageData(storeId: string) {
  const db = getDb();

  const [pendingRequests, recentRequests] = await Promise.all([
    db.storeJoinRequest.findMany({
      where: {
        storeId,
        status: StoreJoinRequestStatus.PENDING,
      },
      orderBy: { requestedAt: "asc" },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            playerProfile: {
              select: {
                displayName: true,
                nick: true,
                city: true,
                avatarUrl: true,
                eloGlobal: true,
                mainGame: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    }),
    db.storeJoinRequest.findMany({
      where: {
        storeId,
        status: {
          in: [StoreJoinRequestStatus.ACCEPTED, StoreJoinRequestStatus.REJECTED],
        },
      },
      orderBy: { respondedAt: "desc" },
      take: 8,
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
        respondedBy: {
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
  ]);

  return {
    pendingRequests,
    recentRequests,
  };
}
