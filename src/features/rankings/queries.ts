import { getDb } from "@/lib/db";
import { rankingsFiltersSchema } from "@/lib/validations/rankings";

export async function getRankingsPageData(
  rawFilters: Record<string, string | string[] | undefined>,
) {
  const filters = rankingsFiltersSchema.parse({
    game: typeof rawFilters.game === "string" ? rawFilters.game : "",
    store: typeof rawFilters.store === "string" ? rawFilters.store : "",
    city: typeof rawFilters.city === "string" ? rawFilters.city : "",
  });

  const db = getDb();
  const [games, stores, globalRanking, gameRanking] = await Promise.all([
    db.game.findMany({
      where: { isActive: true },
      orderBy: [{ isFeatured: "desc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
      },
    }),
    db.store.findMany({
      orderBy: [{ isVerified: "desc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        city: true,
      },
    }),
    db.playerProfile.findMany({
      where: {
        ...(filters.store ? { primaryStoreId: filters.store } : {}),
        ...(filters.city
          ? {
              city: {
                contains: filters.city,
                mode: "insensitive",
              },
            }
          : {}),
      },
      orderBy: [{ eloGlobal: "desc" }, { winRate: "desc" }, { wins: "desc" }],
      take: 100,
      include: {
        user: {
          select: {
            id: true,
            image: true,
          },
        },
        primaryStore: {
          select: {
            id: true,
            name: true,
            city: true,
          },
        },
        mainGame: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    }),
    filters.game
      ? db.playerGameStat.findMany({
          where: {
            gameId: filters.game,
            playerProfile: {
              ...(filters.store ? { primaryStoreId: filters.store } : {}),
              ...(filters.city
                ? {
                    city: {
                      contains: filters.city,
                      mode: "insensitive",
                    },
                  }
                : {}),
            },
          },
          orderBy: [{ elo: "desc" }, { winRate: "desc" }, { wins: "desc" }],
          take: 100,
          include: {
            game: {
              select: {
                id: true,
                name: true,
              },
            },
            playerProfile: {
              include: {
                user: {
                  select: {
                    id: true,
                    image: true,
                  },
                },
                primaryStore: {
                  select: {
                    id: true,
                    name: true,
                    city: true,
                  },
                },
              },
            },
          },
        })
      : Promise.resolve([]),
  ]);

  return {
    filters,
    games,
    stores,
    globalRanking,
    gameRanking,
  };
}
