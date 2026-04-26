import Link from "next/link";
import { ArrowUpRight, MapPin, ShieldCheck, Trophy, Users } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { getInitials } from "@/lib/utils";

type StoreCardProps = {
  store: {
    id: string;
    slug: string;
    name: string;
    city: string;
    region?: string | null;
    country?: string | null;
    address: string;
    logoUrl?: string | null;
    isVerified: boolean;
    officialLocatorUrl?: string | null;
    websiteUrl?: string | null;
    supportedGames: {
      id: string;
      game: {
        name: string;
      };
    }[];
    activeMembersCount: number;
    averageElo: number | null;
    topPlayer: {
      userId: string;
      nick: string;
      displayName: string;
      eloGlobal: number;
    } | null;
    viewerMembership: boolean;
    viewerJoinRequestStatus: "PENDING" | "ACCEPTED" | "REJECTED" | null;
  };
};

export function StoreCard({ store }: StoreCardProps) {
  const externalEventsUrl = store.officialLocatorUrl ?? store.websiteUrl ?? null;

  return (
    <Card className="border-white/10 bg-white/5 text-white">
      <CardHeader className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <Avatar className="size-12 border border-white/10">
              <AvatarImage src={store.logoUrl ?? undefined} alt={store.name} />
              <AvatarFallback>{getInitials(store.name)}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-xl">{store.name}</CardTitle>
              <div className="mt-1 flex items-center gap-2 text-sm text-white/60">
                <MapPin className="size-4 text-amber-300" />
                {[store.city, store.region, store.country].filter(Boolean).join(", ")}
              </div>
            </div>
          </div>
          {store.isVerified ? (
            <Badge
              variant="outline"
              className="border-emerald-300/30 bg-emerald-300/10 text-emerald-100"
            >
              Verificada
            </Badge>
          ) : (
            <Badge variant="outline" className="border-white/10 bg-white/5 text-white">
              Pendiente
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-white/65">
          <Users className="size-4 text-cyan-300" />
          {store.activeMembersCount} miembros activos
        </div>
        <p className="text-sm text-white/60">{store.address}</p>
        <div className="flex items-center gap-2 text-sm text-white/65">
          <Trophy className="size-4 text-amber-300" />
          {store.topPlayer
            ? `Top: @${store.topPlayer.nick} (${store.topPlayer.eloGlobal})`
            : store.averageElo
              ? `ELO medio ${store.averageElo}`
              : "Sin ranking interno aun"}
        </div>
        <div className="flex flex-wrap gap-2">
          {store.supportedGames.map((item) => (
            <Badge
              key={item.id}
              variant="outline"
              className="border-white/10 bg-white/5 text-white/80"
            >
              {item.game.name}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter className="grid w-full gap-2">
        <Button asChild className="w-full rounded-2xl">
          <Link href={`/stores/${store.slug}`}>Ver tienda</Link>
        </Button>
        {store.viewerMembership ? (
          <Button
            disabled
            variant="outline"
            className="w-full rounded-2xl border-emerald-300/30 bg-emerald-300/10 text-emerald-100"
          >
            <ShieldCheck className="size-4" />
            Ya eres miembro
          </Button>
        ) : (
          <Button
            asChild
            variant="outline"
            className="w-full rounded-2xl border-white/10 bg-white/5 text-white hover:bg-white/10"
          >
              <Link href={`/stores/${store.slug}#join`}>
                {store.viewerJoinRequestStatus === "PENDING"
                  ? "Solicitud pendiente"
                  : store.viewerJoinRequestStatus === "ACCEPTED"
                    ? "Solicitud aceptada"
                  : "Solicitar unirme"}
              </Link>
            </Button>
          )}
        {externalEventsUrl ? (
          <Button
            asChild
            variant="outline"
            className="w-full rounded-2xl border-cyan-300/30 bg-cyan-300/10 text-cyan-100 hover:bg-cyan-300/20"
          >
            <Link href={externalEventsUrl} target="_blank" rel="noreferrer">
              Ver eventos oficiales
              <ArrowUpRight className="size-4" />
            </Link>
          </Button>
        ) : null}
      </CardFooter>
    </Card>
  );
}
