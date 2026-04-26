import Link from "next/link";
import { Trophy } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RankingsFiltersForm } from "@/features/rankings/components/rankings-filters-form";
import { getRankingsPageData } from "@/features/rankings/queries";
import { formatWinRate, getInitials } from "@/lib/utils";

export default async function RankingsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const data = await getRankingsPageData(await searchParams);

  return (
    <div className="space-y-6">
      <section className="rounded-[32px] border border-white/10 bg-white/5 p-6 text-white">
        <p className="text-xs uppercase tracking-[0.25em] text-cyan-300/80">
          Rankings
        </p>
        <h1 className="mt-2 text-3xl font-semibold">
          {data.filters.game ? "Ranking por juego" : "Ranking global"}
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-white/65">
          Consulta la ladder general o filtra por juego, tienda y ciudad para
          seguir la escena competitiva real.
        </p>
      </section>

      <RankingsFiltersForm
        filters={data.filters}
        games={data.games}
        stores={data.stores}
      />

      {data.filters.game ? (
        data.gameRanking.length ? (
          <Card className="border-white/10 bg-white/5 text-white">
            <CardHeader>
              <CardTitle>Leaderboard del juego</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.gameRanking.map((row, index) => {
                const profile = row.playerProfile;

                return (
                  <Link
                    key={row.id}
                    href={`/profile/${profile.userId}`}
                    className="block rounded-2xl border border-white/10 bg-slate-950/40 p-4 transition-colors hover:border-cyan-300/30 hover:bg-white/10"
                  >
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex size-10 items-center justify-center rounded-full border border-cyan-300/30 bg-cyan-300/10 font-semibold text-cyan-100">
                          #{index + 1}
                        </div>
                        <Avatar className="size-14 border border-white/10">
                          <AvatarImage
                            src={profile.avatarUrl ?? profile.user.image ?? undefined}
                            alt={profile.displayName}
                          />
                          <AvatarFallback>{getInitials(profile.displayName)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{profile.displayName}</p>
                          <p className="text-sm text-white/55">@{profile.nick}</p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {profile.primaryStore ? (
                              <Badge
                                variant="outline"
                                className="border-white/10 bg-white/5 text-white"
                              >
                                {profile.primaryStore.name}
                              </Badge>
                            ) : null}
                            <Badge
                              variant="outline"
                              className="border-cyan-300/30 bg-cyan-300/10 text-cyan-100"
                            >
                              {row.game.name}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-6 text-sm text-white/65">
                        <div>
                          <p className="text-xs uppercase tracking-[0.2em] text-white/45">
                            ELO
                          </p>
                          <p className="text-xl font-semibold text-white">{row.elo}</p>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-[0.2em] text-white/45">
                            Winrate
                          </p>
                          <p className="font-medium text-white">
                            {formatWinRate(row.winRate)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-[0.2em] text-white/45">
                            Partidas
                          </p>
                          <p className="font-medium text-white">{row.matchesPlayed}</p>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </CardContent>
          </Card>
        ) : (
          <Card className="border-white/10 bg-white/5 text-white">
            <CardHeader className="items-center text-center">
              <div className="mx-auto flex size-10 items-center justify-center rounded-full border border-white/10 bg-slate-950/60">
                <Trophy className="size-5 text-amber-300" />
              </div>
              <CardTitle>Aun no hay datos suficientes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-center text-sm text-white/65">
              <p>
                No hay partidas confirmadas para esta combinacion de filtros.
              </p>
              <Button
                asChild
                variant="outline"
                className="border-white/10 bg-white/5 text-white hover:bg-white/10"
              >
                <Link href="/rankings">Limpiar filtros</Link>
              </Button>
            </CardContent>
          </Card>
        )
      ) : data.globalRanking.length ? (
        <Card className="border-white/10 bg-white/5 text-white">
          <CardHeader>
            <CardTitle>Leaderboard global</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.globalRanking.map((profile, index) => {
              return (
                <Link
                  key={profile.id}
                  href={`/profile/${profile.userId}`}
                  className="block rounded-2xl border border-white/10 bg-slate-950/40 p-4 transition-colors hover:border-cyan-300/30 hover:bg-white/10"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex size-10 items-center justify-center rounded-full border border-cyan-300/30 bg-cyan-300/10 font-semibold text-cyan-100">
                        #{index + 1}
                      </div>
                      <Avatar className="size-14 border border-white/10">
                        <AvatarImage
                          src={profile.avatarUrl ?? profile.user.image ?? undefined}
                          alt={profile.displayName}
                        />
                        <AvatarFallback>{getInitials(profile.displayName)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{profile.displayName}</p>
                        <p className="text-sm text-white/55">@{profile.nick}</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {profile.primaryStore ? (
                            <Badge
                              variant="outline"
                              className="border-white/10 bg-white/5 text-white"
                            >
                              {profile.primaryStore.name}
                            </Badge>
                          ) : null}
                          {profile.mainGame ? (
                            <Badge
                              variant="outline"
                              className="border-white/10 bg-white/5 text-white"
                            >
                              {profile.mainGame.name}
                            </Badge>
                          ) : null}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-6 text-sm text-white/65">
                        <div>
                          <p className="text-xs uppercase tracking-[0.2em] text-white/45">
                            ELO
                          </p>
                          <p className="text-xl font-semibold text-white">{profile.eloGlobal}</p>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-[0.2em] text-white/45">
                            Winrate
                          </p>
                          <p className="font-medium text-white">
                            {formatWinRate(profile.winRate)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-[0.2em] text-white/45">
                            Partidas
                          </p>
                          <p className="font-medium text-white">{profile.matchesPlayed}</p>
                        </div>
                      </div>
                    </div>
                </Link>
              );
            })}
          </CardContent>
        </Card>
      ) : (
        <Card className="border-white/10 bg-white/5 text-white">
          <CardHeader className="items-center text-center">
            <div className="mx-auto flex size-10 items-center justify-center rounded-full border border-white/10 bg-slate-950/60">
              <Trophy className="size-5 text-amber-300" />
            </div>
            <CardTitle>Aun no hay datos suficientes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-center text-sm text-white/65">
            <p>
              Todavia no se han confirmado suficientes partidas para mostrar ranking.
            </p>
            <Button
              asChild
              variant="outline"
              className="border-white/10 bg-white/5 text-white hover:bg-white/10"
            >
              <Link href="/rankings">Limpiar filtros</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
