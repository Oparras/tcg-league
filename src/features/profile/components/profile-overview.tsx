import Link from "next/link";
import {
  Activity,
  MapPin,
  MessageSquare,
  ShieldCheck,
  Store,
  Swords,
  Trophy,
  Users,
} from "lucide-react";

import { EditProfileForm } from "@/features/profile/components/edit-profile-form";
import { FriendRequestResponseForm } from "@/features/social/components/friend-request-response-form";
import { FriendRequestSendForm } from "@/features/social/components/friend-request-send-form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatSeriesScore, getMatchFormatDisplay } from "@/lib/match-format";
import { formatCompactDate, formatWinRate, getInitials } from "@/lib/utils";
import type { getProfilePageData } from "@/features/profile/queries";

type ProfilePageData = Awaited<ReturnType<typeof getProfilePageData>>;

function statusLabel(status: "AVAILABLE" | "UNAVAILABLE") {
  return status === "AVAILABLE" ? "Disponible" : "No disponible";
}

function matchStatusLabel({
  isWin,
  status,
}: {
  status: string;
  isWin: boolean;
}) {
  if (status === "CONFIRMED") {
    return isWin ? "Win" : "Loss";
  }

  if (status === "PLAYED_PENDING_CONFIRMATION") {
    return "Pendiente de confirmar";
  }

  if (status === "DISPUTED") {
    return "Disputa";
  }

  if (status === "ACCEPTED") {
    return "Programado";
  }

  return status;
}

export function ProfileOverview({
  data,
  isCurrentUser,
  viewerId,
}: {
  data: Exclude<ProfilePageData, null>;
  isCurrentUser: boolean;
  viewerId?: string;
}) {
  const {
    currentStore,
    memberships,
    profile,
    recentMatches,
    games,
    friendship,
    friends,
    incomingFriendRequests,
    outgoingFriendRequests,
    matchSummary,
  } = data;
  const friendshipRelation = friendship.relation;
  const clampedWinRate = Math.min(100, Math.max(0, profile.winRate));

  return (
    <div className="space-y-6">
      <Card className="border-white/10 bg-white/5 text-white">
        <CardContent className="flex flex-col gap-6 py-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex flex-col gap-4 sm:flex-row">
            <Avatar className="size-24 border border-white/10">
              <AvatarImage
                src={profile.avatarUrl ?? profile.user.image ?? undefined}
                alt={profile.displayName}
              />
              <AvatarFallback className="text-lg">
                {getInitials(profile.displayName)}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-3">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-cyan-300/80">
                  Player profile
                </p>
                <h1 className="mt-1 text-3xl font-semibold">{profile.displayName}</h1>
                <p className="text-white/60">@{profile.nick}</p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="border-white/10 bg-white/5 text-white">
                  {statusLabel(profile.status)}
                </Badge>
                <Badge variant="outline" className="border-white/10 bg-white/5 text-white">
                  ELO {profile.eloGlobal}
                </Badge>
                {profile.mainGame ? (
                  <Badge variant="outline" className="border-white/10 bg-white/5 text-white">
                    {profile.mainGame.name}
                  </Badge>
                ) : null}
                {currentStore ? (
                  <Badge variant="outline" className="border-white/10 bg-white/5 text-white">
                    {currentStore.name}
                  </Badge>
                ) : null}
              </div>

              <div className="space-y-2 text-sm text-white/65">
                <div className="flex items-center gap-2">
                  <MapPin className="size-4 text-amber-300" />
                  {profile.city}
                </div>
                <div className="flex items-center gap-2">
                  <Store className="size-4 text-cyan-300" />
                  {currentStore ? currentStore.name : "Sin tienda principal"}
                </div>
              </div>

              {profile.bio ? (
                <p className="max-w-2xl text-sm leading-6 text-white/70">{profile.bio}</p>
              ) : (
                <p className="max-w-2xl text-sm leading-6 text-white/45">Sin bio todavia.</p>
              )}
            </div>
          </div>

          <div className="flex max-w-[360px] flex-col gap-3">
            <div className="rounded-3xl border border-cyan-300/25 bg-cyan-300/10 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-cyan-100/80">ELO global</p>
              <p className="mt-1 text-4xl font-semibold text-white">{profile.eloGlobal}</p>
              <div className="mt-3">
                <div className="flex items-center justify-between text-xs text-white/70">
                  <span>Winrate</span>
                  <span>{formatWinRate(profile.winRate)}</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-slate-950/70">
                  <div
                    className="h-2 rounded-full bg-emerald-300 transition-all"
                    style={{ width: `${clampedWinRate}%` }}
                  />
                </div>
              </div>
            </div>

            {isCurrentUser ? (
              <>
                <Button asChild className="rounded-full">
                  <Link href="/stores">Ver stores</Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="rounded-full border-white/10 bg-white/5 text-white hover:bg-white/10"
                >
                  <Link href="/chat">Abrir chat</Link>
                </Button>
              </>
            ) : (
              <>
                <Button asChild className="rounded-full">
                  <Link href={`/challenges/new?opponent=${profile.userId}`}>
                    <Swords className="size-4" />
                    Retar jugador
                  </Link>
                </Button>

                {friendshipRelation === "friends" ? (
                  <Button
                    asChild
                    variant="outline"
                    className="rounded-full border-cyan-300/30 bg-cyan-300/10 text-cyan-100 hover:bg-cyan-300/20"
                  >
                    <Link href={`/chat?with=${profile.userId}`}>
                      <MessageSquare className="size-4" />
                      Mensaje
                    </Link>
                  </Button>
                ) : null}

                {(friendshipRelation === "none" || friendshipRelation === "rejected") &&
                viewerId ? (
                  <div className="space-y-2 rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-white/70">
                    <FriendRequestSendForm targetUserId={profile.userId} className="space-y-2" />
                    <p className="text-xs text-white/55">Agrega a este jugador para poder chatear.</p>
                  </div>
                ) : null}

                {friendshipRelation === "incoming_pending" && friendship.record ? (
                  <div className="rounded-2xl border border-amber-300/20 bg-amber-300/10 p-3">
                    <p className="mb-2 text-xs text-amber-100">
                      Este jugador te ha enviado solicitud de amistad.
                    </p>
                    <FriendRequestResponseForm friendshipId={friendship.record.id} compact />
                  </div>
                ) : null}

                {friendshipRelation === "outgoing_pending" ? (
                  <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/70">
                    Solicitud enviada. Esperando respuesta.
                  </div>
                ) : null}
              </>
            )}
            <Button
              asChild
              variant="outline"
              className="rounded-full border-white/10 bg-white/5 text-white hover:bg-white/10"
            >
              <Link href="/rankings">Ver ranking</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          {
            title: "ELO global",
            value: profile.eloGlobal.toString(),
            caption: "Ladder principal",
            icon: Trophy,
          },
          {
            title: "Partidas",
            value: profile.matchesPlayed.toString(),
            caption: "Totales registradas",
            icon: Activity,
          },
          {
            title: "Victorias / derrotas",
            value: `${profile.wins}/${profile.losses}`,
            caption: "Balance actual",
            icon: ShieldCheck,
          },
          {
            title: "Winrate",
            value: formatWinRate(profile.winRate),
            caption: `${matchSummary.confirmedWins}W ${matchSummary.confirmedLosses}L confirmadas`,
            icon: Swords,
          },
        ].map((item) => {
          const Icon = item.icon;

          return (
            <Card key={item.title} className="border-white/10 bg-white/5 text-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-white/70">
                  {item.title}
                </CardTitle>
                <span className="rounded-full border border-white/10 bg-white/5 p-2 text-cyan-300">
                  <Icon className="size-4" />
                </span>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-semibold tracking-tight">{item.value}</div>
                <p className="mt-1 text-sm text-white/60">{item.caption}</p>
              </CardContent>
            </Card>
          );
        })}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <div className="space-y-6">
          <Card className="border-white/10 bg-white/5 text-white">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Historial de partidas</CardTitle>
              <div className="flex gap-2 text-xs text-white/60">
                <Badge variant="outline" className="border-white/10 bg-white/5 text-white">
                  Pendientes: {matchSummary.pendingResults}
                </Badge>
                <Badge
                  variant="outline"
                  className="border-amber-300/30 bg-amber-300/10 text-amber-100"
                >
                  Disputas: {matchSummary.disputed}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-0">
              {recentMatches.length ? (
                recentMatches.map((match, index) => {
                  const isWin = match.winnerId === profile.userId;
                  const scoreline = formatSeriesScore(match.playerAScore, match.playerBScore);
                  const eloDelta =
                    profile.userId === match.playerA.id
                      ? typeof match.playerAEloAfter === "number"
                        ? match.playerAEloAfter - match.playerAEloBefore
                        : null
                      : typeof match.playerBEloAfter === "number"
                        ? match.playerBEloAfter - match.playerBEloBefore
                        : null;

                  return (
                    <Link
                      key={match.id}
                      href={`/matches/${match.id}`}
                      className="relative block border-l border-white/15 pl-8 pt-1 pb-6 transition-colors hover:border-cyan-300/30"
                    >
                      <span
                        className={
                          match.status === "CONFIRMED"
                            ? isWin
                              ? "absolute left-[-7px] top-2 size-3 rounded-full border border-emerald-300/60 bg-emerald-300"
                              : "absolute left-[-7px] top-2 size-3 rounded-full border border-rose-300/60 bg-rose-300"
                            : "absolute left-[-7px] top-2 size-3 rounded-full border border-white/30 bg-slate-900"
                        }
                      />
                      <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <p className="font-medium">
                              {match.playerA.playerProfile?.nick ?? "player"} vs{" "}
                              {match.playerB.playerProfile?.nick ?? "player"}
                            </p>
                            <p className="text-sm text-white/55">
                              {match.game.name} - {getMatchFormatDisplay(match.format)}
                              {scoreline ? ` - ${scoreline}` : ""}
                              {typeof eloDelta === "number"
                                ? ` - ELO ${eloDelta >= 0 ? "+" : ""}${eloDelta}`
                                : ""}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge
                              variant="outline"
                              className={
                                match.status === "CONFIRMED"
                                  ? isWin
                                    ? "border-emerald-300/30 bg-emerald-300/10 text-emerald-100"
                                    : "border-rose-300/30 bg-rose-300/10 text-rose-100"
                                  : match.status === "DISPUTED"
                                    ? "border-amber-300/30 bg-amber-300/10 text-amber-100"
                                    : "border-white/10 bg-white/5 text-white"
                              }
                            >
                              {matchStatusLabel({ status: match.status, isWin })}
                            </Badge>
                            <span className="text-sm text-white/50">
                              {match.playedAt
                                ? formatCompactDate(match.playedAt)
                                : match.scheduledFor
                                  ? formatCompactDate(match.scheduledFor)
                                  : "Sin fecha"}
                            </span>
                          </div>
                        </div>
                      </div>
                      {index === recentMatches.length - 1 ? null : (
                        <span className="absolute bottom-0 left-[-1px] h-4 w-px bg-transparent" />
                      )}
                    </Link>
                  );
                })
              ) : (
                <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4 text-sm text-white/60">
                  Aun no hay matches registrados para este perfil.
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-white/5 text-white">
            <CardHeader>
              <CardTitle>ELO por juego</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2">
              {profile.gameStats.length ? (
                profile.gameStats.map((stat) => (
                  <div
                    key={stat.id}
                    className="rounded-2xl border border-white/10 bg-slate-950/40 p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm text-white/60">{stat.game.name}</p>
                        <p className="text-2xl font-semibold">{stat.elo}</p>
                      </div>
                      <Badge
                        variant="outline"
                        className="border-white/10 bg-white/5 text-white"
                      >
                        {formatWinRate(stat.winRate)}
                      </Badge>
                    </div>
                    <p className="mt-3 text-sm text-white/60">
                      {stat.matchesPlayed} partidas - {stat.wins} victorias
                    </p>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4 text-sm text-white/60">
                  No hay estadisticas por juego todavia.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {isCurrentUser ? (
            <EditProfileForm
              defaultValues={{
                nick: profile.nick,
                displayName: profile.displayName,
                avatarUrl: profile.avatarUrl,
                city: profile.city,
                bio: profile.bio,
                mainGameId: profile.mainGameId,
                availabilityStatus: profile.status,
              }}
              games={games}
            />
          ) : null}

          <Card className="border-white/10 bg-white/5 text-white">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Amigos</CardTitle>
              <Badge variant="outline" className="border-white/10 bg-white/5 text-white">
                {friends.length}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-3">
              {friends.length ? (
                friends.map((friend) => (
                  <div
                    key={friend.friendUserId}
                    className="rounded-2xl border border-white/10 bg-slate-950/40 p-3"
                  >
                    <div className="mb-3 flex items-center gap-3">
                      <Avatar className="size-10 border border-white/10">
                        <AvatarImage src={friend.avatarUrl ?? undefined} alt={friend.displayName} />
                        <AvatarFallback>{getInitials(friend.displayName)}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium">{friend.displayName}</p>
                        <p className="truncate text-sm text-white/55">@{friend.nick}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        asChild
                        size="sm"
                        variant="outline"
                        className="border-white/10 bg-white/5 text-white hover:bg-white/10"
                      >
                        <Link href={`/chat?with=${friend.friendUserId}`}>
                          <MessageSquare className="size-4" />
                          Mensaje
                        </Link>
                      </Button>
                      <Button
                        asChild
                        size="sm"
                        variant="outline"
                        className="border-white/10 bg-white/5 text-white hover:bg-white/10"
                      >
                        <Link href={`/profile/${friend.friendUserId}`}>Perfil</Link>
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4 text-sm text-white/60">
                  Aun no hay amistades aceptadas.
                </div>
              )}
            </CardContent>
          </Card>

          {isCurrentUser ? (
            <Card className="border-white/10 bg-white/5 text-white">
              <CardHeader>
                <CardTitle>Solicitudes de amistad</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {incomingFriendRequests.length ? (
                  incomingFriendRequests.map((request) => (
                    <div
                      key={request.id}
                      className="rounded-2xl border border-white/10 bg-slate-950/40 p-3"
                    >
                      <p className="font-medium">{request.requester.displayName}</p>
                      <p className="text-sm text-white/55">@{request.requester.nick}</p>
                      <p className="mb-2 text-xs text-white/45">
                        Recibida {formatCompactDate(request.createdAt)}
                      </p>
                      <FriendRequestResponseForm friendshipId={request.id} compact />
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4 text-sm text-white/60">
                    No tienes solicitudes pendientes.
                  </div>
                )}

                {outgoingFriendRequests.length ? (
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                    <p className="mb-2 text-sm font-medium">Solicitudes enviadas</p>
                    <div className="space-y-2">
                      {outgoingFriendRequests.map((request) => (
                        <div
                          key={request.id}
                          className="rounded-xl border border-white/10 bg-slate-950/40 p-2 text-xs text-white/65"
                        >
                          {request.addressee.displayName} (@{request.addressee.nick}) -{" "}
                          {formatCompactDate(request.createdAt)}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          ) : null}

          <Card className="border-white/10 bg-white/5 text-white">
            <CardHeader>
              <CardTitle>Tiendas activas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {memberships.length ? (
                memberships.map((membership) => (
                  <Link
                    key={membership.id}
                    href={`/stores/${membership.store.slug}`}
                    className="block rounded-2xl border border-white/10 bg-slate-950/40 p-4 transition-colors hover:border-cyan-300/30 hover:bg-white/10"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-medium">{membership.store.name}</p>
                        <p className="text-sm text-white/55">{membership.store.city}</p>
                      </div>
                      {membership.isPrimary ? (
                        <Badge
                          variant="outline"
                          className="border-cyan-300/30 bg-cyan-300/10 text-cyan-100"
                        >
                          Principal
                        </Badge>
                      ) : null}
                    </div>
                  </Link>
                ))
              ) : (
                <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4 text-sm text-white/60">
                  Sin membresias activas.
                </div>
              )}
            </CardContent>
          </Card>

          {!isCurrentUser && viewerId ? (
            <Card className="border-white/10 bg-white/5 text-white">
              <CardHeader>
                <CardTitle>Acciones rapidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button asChild className="w-full rounded-2xl">
                  <Link href={`/challenges/new?opponent=${profile.userId}`}>Retar jugador</Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="w-full rounded-2xl border-white/10 bg-white/5 text-white hover:bg-white/10"
                >
                  <Link href={`/profile/${viewerId}`}>Volver a mi perfil</Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="w-full rounded-2xl border-white/10 bg-white/5 text-white hover:bg-white/10"
                >
                  <Link href="/chat">
                    <Users className="size-4" />
                    Abrir chat
                  </Link>
                </Button>
                {(friendshipRelation === "none" || friendshipRelation === "rejected") ? (
                  <FriendRequestSendForm
                    targetUserId={profile.userId}
                    buttonLabel="Agregar amigo"
                  />
                ) : null}
              </CardContent>
            </Card>
          ) : null}
        </div>
      </section>
    </div>
  );
}
