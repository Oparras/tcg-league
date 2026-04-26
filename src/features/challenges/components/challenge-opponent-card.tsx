import Link from "next/link";
import { MapPin, Store, Trophy } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { formatWinRate, getInitials } from "@/lib/utils";

export function ChallengeOpponentCard({
  player,
  selectedGameId,
  isSelected,
}: {
  player: {
    userId: string;
    nick: string;
    displayName: string;
    city: string;
    avatarUrl?: string | null;
    eloGlobal: number;
    winRate: number;
    matchesPlayed: number;
    primaryStore?: {
      name: string;
    } | null;
    mainGame?: {
      name: string;
    } | null;
    gameStats: {
      id: string;
      gameId: string;
      elo: number;
      game: {
        name: string;
      };
    }[];
  };
  selectedGameId?: string;
  isSelected?: boolean;
}) {
  const selectedGameStat =
    player.gameStats.find((stat) => stat.gameId === selectedGameId) ??
    player.gameStats[0];

  return (
    <Card
      className={
        isSelected
          ? "border-cyan-300/40 bg-cyan-300/10 text-white"
          : "border-white/10 bg-white/5 text-white"
      }
    >
      <CardHeader className="space-y-4">
        <div className="flex items-start gap-3">
          <Avatar className="size-14 border border-white/10">
            <AvatarImage src={player.avatarUrl ?? undefined} alt={player.displayName} />
            <AvatarFallback>{getInitials(player.displayName)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <CardTitle className="truncate text-xl">{player.displayName}</CardTitle>
            <p className="mt-1 text-sm text-white/60">@{player.nick}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {player.mainGame ? (
                <Badge variant="outline" className="border-white/10 bg-white/5 text-white">
                  {player.mainGame.name}
                </Badge>
              ) : null}
              {selectedGameStat ? (
                <Badge
                  variant="outline"
                  className="border-cyan-300/30 bg-cyan-300/10 text-cyan-100"
                >
                  {selectedGameStat.game.name}: {selectedGameStat.elo}
                </Badge>
              ) : null}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 text-sm text-white/65">
          <div className="flex items-center gap-2">
            <MapPin className="size-4 text-amber-300" />
            {player.city}
          </div>
          <div className="flex items-center gap-2">
            <Store className="size-4 text-cyan-300" />
            {player.primaryStore?.name ?? "Sin tienda principal"}
          </div>
          <div className="flex items-center gap-2">
            <Trophy className="size-4 text-cyan-300" />
            ELO global {player.eloGlobal} · {formatWinRate(player.winRate)}
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4 text-sm text-white/60">
          {player.matchesPlayed} partidas registradas
        </div>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full rounded-2xl">
          <Link href={`/challenges/new?opponent=${player.userId}${selectedGameId ? `&game=${selectedGameId}` : ""}`}>
            Retar
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
