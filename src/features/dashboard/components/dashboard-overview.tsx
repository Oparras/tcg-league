import Link from "next/link";
import type { UserRole } from "@prisma/client";
import {
  ArrowUpRight,
  Bell,
  CalendarDays,
  MapPin,
  MessageSquare,
  ShieldCheck,
  Store,
  Swords,
  Trophy,
  UserPlus,
  UserRound,
  Users,
} from "lucide-react";

import { MetricCard } from "@/components/shared/metric-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { getDashboardData } from "@/features/dashboard/queries";
import { formatSeriesScore, getMatchFormatDisplay } from "@/lib/match-format";
import { formatCompactDate, formatWinRate } from "@/lib/utils";

type DashboardData = Awaited<ReturnType<typeof getDashboardData>>;
type DirectoryStore =
  DashboardData["cityRecommendedStores"][number] | DashboardData["memberStores"][number]["store"];

function getPendingActionLabel(type: DashboardData["pendingActions"]["items"][number]["type"]) {
  if (type === "challenge_received" || type === "counter_proposal") {
    return "Ver reto";
  }

  if (type === "match_confirmation") {
    return "Ver match";
  }

  if (type === "store_join_request") {
    return "Gestionar solicitudes";
  }

  if (type === "friend_request") {
    return "Ver solicitudes";
  }

  return "Resolver disputa";
}

function formatStoreLocation(store: Pick<DirectoryStore, "city" | "region" | "country">) {
  return [store.city, store.region, store.country].filter(Boolean).join(", ");
}

function StoreDirectoryRow({
  store,
  actionLabel = "Ver tienda",
}: {
  store: DirectoryStore;
  actionLabel?: string;
}) {
  const externalUrl = store.officialLocatorUrl ?? store.websiteUrl ?? null;

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-medium">{store.name}</p>
          <p className="mt-1 flex items-center gap-2 text-sm text-white/55">
            <MapPin className="size-4 text-amber-300" />
            {formatStoreLocation(store)}
          </p>
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
      <p className="mt-3 text-sm text-white/60">
        {store.activeMembersCount} miembros activos
        {store.topPlayer ? ` - Top @${store.topPlayer.nick} (${store.topPlayer.eloGlobal})` : ""}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {store.supportedGames.slice(0, 3).map((game) => (
          <Badge key={game.id} variant="outline" className="border-white/10 bg-white/5 text-white">
            {game.name}
          </Badge>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button
          asChild
          size="sm"
          variant="outline"
          className="border-white/10 bg-white/5 text-white hover:bg-white/10"
        >
          <Link href={`/stores/${store.slug}`}>{actionLabel}</Link>
        </Button>
        {externalUrl ? (
          <Button
            asChild
            size="sm"
            variant="outline"
            className="border-cyan-300/30 bg-cyan-300/10 text-cyan-100 hover:bg-cyan-300/20"
          >
            <Link href={externalUrl} target="_blank" rel="noreferrer">
              Eventos oficiales
              <ArrowUpRight className="size-4" />
            </Link>
          </Button>
        ) : null}
      </div>
    </div>
  );
}

export function DashboardOverview({
  data,
  userId,
  userRole,
}: {
  data: DashboardData;
  userId: string;
  userRole: UserRole;
}) {
  if (!data.profile) {
    return (
      <Card className="border-white/10 bg-white/5 text-white">
        <CardContent className="py-10 text-center text-white/70">
          Tu perfil aun no esta listo. Completa el onboarding para desbloquear el
          dashboard competitivo.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-white/10 bg-white/5 text-white">
        <CardContent className="flex flex-col gap-6 py-6 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-cyan-200/70">
              Panel personal
            </p>
            <h2 className="mt-2 text-3xl font-semibold">@{data.profile.nick}</h2>
            <p className="mt-2 text-sm text-white/65">
              Revisa tu ranking, entra en stores, actualiza tu perfil y prepara tus
              proximos retos.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
            {[
              { id: "stores", href: "/stores", label: "Ver stores", icon: Store },
              { id: "profile", href: "/profile/me", label: "Editar perfil", icon: UserRound },
              { id: "new-challenge", href: "/challenges/new", label: "Nuevo reto", icon: Swords },
              {
                id: "find-players",
                href: "/challenges/new?browse=players",
                label: "Buscar jugadores",
                icon: Users,
              },
              { id: "rankings", href: "/rankings", label: "Ver ranking", icon: Trophy },
              { id: "chat", href: "/chat", label: "Amigos y chat", icon: MessageSquare },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <Button
                  key={item.id}
                  asChild
                  variant="outline"
                  className="justify-start rounded-2xl border-white/10 bg-slate-950/50 text-white hover:bg-white/10"
                >
                  <Link href={item.href}>
                    <Icon className="size-4" />
                    {item.label}
                  </Link>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="ELO global"
          value={data.profile.eloGlobal.toString()}
          caption="Tu posicion actual en la ladder"
          icon={Trophy}
        />
        <MetricCard
          title="Winrate"
          value={formatWinRate(data.profile.winRate)}
          caption={`${data.profile.wins} victorias - ${data.profile.losses} derrotas`}
          icon={ShieldCheck}
        />
        <MetricCard
          title="Retos pendientes"
          value={data.pendingChallenges.toString()}
          caption="Jugadores esperando tu respuesta"
          icon={Swords}
        />
        <MetricCard
          title="Resultados por confirmar"
          value={data.pendingConfirmations.toString()}
          caption="Matches pendientes de validacion"
          icon={Bell}
        />
      </section>

      <Card className="border-white/10 bg-white/5 text-white">
        <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>Pendientes accionables</CardTitle>
            <p className="text-sm text-white/60">
              Solo tareas que requieren una accion real ahora.
            </p>
          </div>
          <Badge
            variant="outline"
            className="w-fit border-amber-300/30 bg-amber-300/10 text-amber-100"
          >
            {data.pendingActions.total === 1
              ? "1 pendiente"
              : `${data.pendingActions.total} pendientes`}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2 text-xs text-white/75 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2">
              Retos recibidos: {data.pendingActions.challengesReceived}
            </div>
            <div className="rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2">
              Contraofertas: {data.pendingActions.counterProposals}
            </div>
            <div className="rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2">
              Resultados por confirmar: {data.pendingActions.matchConfirmations}
            </div>
            <div className="rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2">
              Solicitudes de tienda: {data.pendingActions.storeJoinRequests}
            </div>
            <div className="rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2">
              Disputas abiertas: {data.pendingActions.disputes}
            </div>
            <div className="rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2">
              Solicitudes de amistad: {data.pendingActions.friendRequests}
            </div>
          </div>

          {data.pendingActions.items.length ? (
            <div className="space-y-3">
              {data.pendingActions.items.slice(0, 6).map((item, index) => (
                <div
                  key={`${item.type}-${item.href}-${index}`}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-slate-950/40 p-4"
                >
                  <div>
                    <p className="font-medium">{item.title}</p>
                    <p className="text-sm text-white/60">{item.description}</p>
                  </div>
                  <Button
                    asChild
                    size="sm"
                    variant="outline"
                    className="border-white/10 bg-white/5 text-white hover:bg-white/10"
                  >
                    <Link href={item.href}>{getPendingActionLabel(item.type)}</Link>
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4 text-sm text-white/60">
              No tienes acciones pendientes.
            </div>
          )}
        </CardContent>
      </Card>

      <section className="grid gap-6 xl:grid-cols-2">
        <Card className="border-white/10 bg-white/5 text-white">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Solicitudes de amistad</CardTitle>
              <p className="mt-1 text-sm text-white/60">
                Pendientes de respuesta para seguir ampliando tu red.
              </p>
            </div>
            <Badge
              variant="outline"
              className="border-amber-300/30 bg-amber-300/10 text-amber-100"
            >
              {data.pendingFriendRequests.length}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.pendingFriendRequests.length ? (
              data.pendingFriendRequests.slice(0, 4).map((request) => (
                <div
                  key={request.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-slate-950/40 p-4"
                >
                  <div>
                    <p className="font-medium">{request.requester.displayName}</p>
                    <p className="text-sm text-white/55">@{request.requester.nick}</p>
                    <p className="text-xs text-white/45">
                      Recibida {formatCompactDate(request.createdAt)}
                    </p>
                  </div>
                  <Button
                    asChild
                    size="sm"
                    variant="outline"
                    className="border-white/10 bg-white/5 text-white hover:bg-white/10"
                  >
                    <Link href="/chat">
                      <UserPlus className="size-4" />
                      Gestionar
                    </Link>
                  </Button>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4 text-sm text-white/60">
                No tienes solicitudes de amistad pendientes.
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-white/5 text-white">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Ultimos mensajes</CardTitle>
              <p className="mt-1 text-sm text-white/60">
                Conversaciones recientes con tus amigos.
              </p>
            </div>
            <Button
              asChild
              size="sm"
              variant="outline"
              className="border-white/10 bg-white/5 text-white hover:bg-white/10"
            >
              <Link href="/chat">
                <Users className="size-4" />
                Amigos y chat
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.latestChats.length ? (
              data.latestChats.map((chat) => (
                <Link
                  key={chat.id}
                  href={`/chat?chat=${chat.id}`}
                  className="block rounded-2xl border border-white/10 bg-slate-950/40 p-4 transition-colors hover:border-cyan-300/30 hover:bg-white/10"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium">{chat.partner.displayName}</p>
                      <p className="text-sm text-white/55">@{chat.partner.nick}</p>
                    </div>
                    {chat.lastMessage?.isUnread ? (
                      <Badge
                        variant="outline"
                        className="border-amber-300/30 bg-amber-300/10 text-amber-100"
                      >
                        Nuevo
                      </Badge>
                    ) : null}
                  </div>
                  <p className="mt-2 truncate text-sm text-white/65">
                    {chat.lastMessage?.content ?? "Sin mensajes aun"}
                  </p>
                </Link>
              ))
            ) : (
              <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4 text-sm text-white/60">
                Aun no tienes conversaciones. Agrega amigos para empezar a chatear.
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <Card className="border-white/10 bg-white/5 text-white">
          <CardHeader>
            <CardTitle>Mis tiendas</CardTitle>
            <p className="text-sm text-white/60">
              Accesos directos a las tiendas donde ya compites.
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.memberStores.length ? (
              data.memberStores.map((membership) => (
                <div
                  key={membership.id}
                  className="rounded-2xl border border-white/10 bg-slate-950/40 p-4"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium">{membership.store.name}</p>
                    <div className="flex gap-2">
                      {membership.isPrimary ? (
                        <Badge
                          variant="outline"
                          className="border-cyan-300/30 bg-cyan-300/10 text-cyan-100"
                        >
                          Principal
                        </Badge>
                      ) : null}
                      <Badge
                        variant="outline"
                        className="border-white/10 bg-white/5 text-white"
                      >
                        {membership.role}
                      </Badge>
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-white/60">
                    {formatStoreLocation(membership.store)}
                  </p>
                  <div className="mt-3">
                    <Button
                      asChild
                      size="sm"
                      variant="outline"
                      className="border-white/10 bg-white/5 text-white hover:bg-white/10"
                    >
                      <Link href={`/stores/${membership.store.slug}`}>Abrir tienda</Link>
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4 text-sm text-white/60">
                Aun no perteneces a ninguna tienda.
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-white/5 text-white">
          <CardHeader>
            <CardTitle>Tiendas cerca de ti</CardTitle>
            <p className="text-sm text-white/60">
              Recomendadas por ciudad para unirte o retar jugadores.
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.cityRecommendedStores.length ? (
              data.cityRecommendedStores.slice(0, 4).map((store) => (
                <StoreDirectoryRow key={store.id} store={store} />
              ))
            ) : (
              <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4 text-sm text-white/60">
                No hay recomendaciones cercanas por ciudad en este momento.
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-white/5 text-white">
          <CardHeader>
            <CardTitle>Tiendas de mis juegos</CardTitle>
            <p className="text-sm text-white/60">
              Stores activas que soportan tus juegos principales.
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.gameRecommendedStores.length ? (
              data.gameRecommendedStores.slice(0, 4).map((store) => (
                <StoreDirectoryRow key={store.id} store={store} />
              ))
            ) : (
              <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4 text-sm text-white/60">
                No hay nuevas tiendas por juego para recomendar ahora.
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      {userRole === "STORE_OWNER" || data.ownedStores.length ? (
        <Card className="border-white/10 bg-white/5 text-white">
          <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Solicitudes pendientes de mis tiendas</CardTitle>
              <p className="text-sm text-white/60">
                Revisa y resuelve las altas pendientes sin salir del panel.
              </p>
            </div>
            <Badge
              variant="outline"
              className="w-fit border-cyan-300/30 bg-cyan-300/10 text-cyan-100"
            >
              {data.ownedStores.reduce(
                (total, store) => total + store.joinRequests.length,
                0,
              )}{" "}
              pendientes
            </Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.ownedStores.length ? (
              data.ownedStores.map((store) => (
                <div
                  key={store.id}
                  className="rounded-2xl border border-white/10 bg-slate-950/40 p-4"
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="font-medium">{store.name}</p>
                      <p className="text-sm text-white/55">
                        {store.memberships.length} miembros activos
                      </p>
                    </div>
                    <Button
                      asChild
                      variant="outline"
                      className="rounded-full border-white/10 bg-white/5 text-white hover:bg-white/10"
                    >
                      <Link href={`/stores/${store.slug}/requests`}>
                        Gestionar solicitudes
                      </Link>
                    </Button>
                  </div>

                  {store.joinRequests.length ? (
                    <div className="mt-4 space-y-3">
                      {store.joinRequests.map((request) => (
                        <div
                          key={request.id}
                          className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 p-3"
                        >
                          <div>
                            <p className="font-medium">
                              {request.user.playerProfile?.displayName ??
                                request.user.playerProfile?.nick ??
                                request.user.email}
                            </p>
                            <p className="text-sm text-white/55">
                              @{request.user.playerProfile?.nick ?? "player"} -{" "}
                              {formatCompactDate(request.requestedAt)}
                            </p>
                          </div>
                          <Badge
                            variant="outline"
                            className="border-amber-300/30 bg-amber-300/10 text-amber-100"
                          >
                            pending
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/60">
                      No hay solicitudes pendientes para {store.name}.
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4 text-sm text-white/60">
                Aun no tienes tiendas asignadas como owner.
              </div>
            )}
          </CardContent>
        </Card>
      ) : null}

      <section className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <Card className="border-white/10 bg-white/5 text-white">
          <CardHeader>
            <CardTitle>Retos recibidos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.receivedChallenges.length ? (
              data.receivedChallenges.map((challenge) => (
                <div
                  key={challenge.id}
                  className="rounded-2xl border border-white/10 bg-slate-950/40 p-4"
                >
                  <div>
                    <p className="font-medium">
                      @{challenge.challenger.playerProfile?.nick ?? "player"}
                    </p>
                    <p className="text-sm text-white/55">
                      {challenge.game.name} - {getMatchFormatDisplay(challenge.format)}
                    </p>
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <span className="text-sm text-white/60">
                      {formatCompactDate(challenge.scheduledFor)}
                    </span>
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="border-white/10 bg-white/5 text-white hover:bg-white/10"
                    >
                      <Link href="/challenges?tab=received">Responder</Link>
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4 text-sm text-white/60">
                No tienes retos pendientes de respuesta ahora mismo.
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-white/5 text-white">
          <CardHeader>
            <CardTitle>Proximos matches</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.upcomingMatches.length ? (
              data.upcomingMatches.map((match) => (
                <div
                  key={match.id}
                  className="rounded-2xl border border-white/10 bg-slate-950/40 p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium">
                        {match.playerA.playerProfile?.nick} vs {match.playerB.playerProfile?.nick}
                      </p>
                      <p className="text-sm text-white/55">
                        {match.game.name} - {getMatchFormatDisplay(match.format)}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className="border-white/10 bg-white/5 text-white"
                    >
                      {match.status}
                    </Badge>
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-3 text-sm text-white/60">
                    <div className="flex items-center gap-2">
                      <CalendarDays className="size-4 text-amber-300" />
                      {match.scheduledFor ? formatCompactDate(match.scheduledFor) : "Sin fecha"}
                    </div>
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="border-white/10 bg-white/5 text-white hover:bg-white/10"
                    >
                      <Link href={`/matches/${match.id}`}>Ver match</Link>
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4 text-sm text-white/60">
                No hay matches proximos pendientes.
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_1fr]">
        <Card className="border-white/10 bg-white/5 text-white">
          <CardHeader>
            <CardTitle>Ultimos matches confirmados</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.latestConfirmedMatches.length ? (
              data.latestConfirmedMatches.map((match) => {
                const isWin = match.winnerId === userId;
                const scoreline = formatSeriesScore(match.playerAScore, match.playerBScore);
                const eloDelta =
                  userId === match.playerA.id
                    ? typeof match.playerAEloAfter === "number"
                      ? match.playerAEloAfter - match.playerAEloBefore
                      : null
                    : typeof match.playerBEloAfter === "number"
                      ? match.playerBEloAfter - match.playerBEloBefore
                      : null;

                return (
                  <div
                    key={match.id}
                    className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/10 bg-slate-950/40 p-4"
                  >
                    <div>
                      <p className="font-medium">
                        {match.playerA.playerProfile?.nick} vs {match.playerB.playerProfile?.nick}
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
                          isWin
                            ? "border-emerald-300/30 bg-emerald-300/10 text-emerald-100"
                            : "border-rose-300/30 bg-rose-300/10 text-rose-100"
                        }
                      >
                        {match.status === "CONFIRMED" ? (isWin ? "Win" : "Loss") : match.status}
                      </Badge>
                      <span className="text-sm text-white/50">
                        {match.confirmedAt ? formatCompactDate(match.confirmedAt) : "Pendiente"}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4 text-sm text-white/60">
                Aun no tienes matches confirmados.
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-white/10 bg-white/5 text-white">
            <CardHeader>
              <CardTitle>Ranking destacado</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.rankings.map((profile, index) => (
                <div
                  key={profile.id}
                  className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-950/40 p-4"
                >
                  <div>
                    <p className="font-medium">
                      #{index + 1} - @{profile.nick}
                    </p>
                    <p className="text-sm text-white/55">
                      {profile.primaryStore?.name ?? "Sin tienda"} -{" "}
                      {profile.mainGame?.name ?? "Sin juego"}
                    </p>
                  </div>
                  <span className="text-lg font-semibold">{profile.eloGlobal}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-white/5 text-white">
            <CardHeader>
              <CardTitle>Proximos eventos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.upcomingEvents.length ? (
                data.upcomingEvents.map((event) => (
                  <div
                    key={event.id}
                    className="rounded-2xl border border-white/10 bg-slate-950/40 p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-medium">{event.name}</p>
                        <p className="text-sm text-white/55">
                          {event.store.name} - {event.game.name}
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className="border-white/10 bg-white/5 text-white"
                      >
                        {event._count.registrations}/{event.maxParticipants}
                      </Badge>
                    </div>
                    <div className="mt-3 flex items-center gap-2 text-sm text-white/60">
                      <CalendarDays className="size-4 text-amber-300" />
                      {formatCompactDate(event.startAt)}
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4 text-sm text-white/60">
                  No hay eventos proximos visibles.
                </div>
              )}
            </CardContent>
          </Card>

          {data.ownedDisputedMatches.length ? (
            <Card className="border-white/10 bg-white/5 text-white">
              <CardHeader>
                <CardTitle>Disputas de mis tiendas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {data.ownedDisputedMatches.map((match) => (
                  <div
                    key={match.id}
                    className="rounded-2xl border border-white/10 bg-slate-950/40 p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-medium">
                          {match.playerA.playerProfile?.nick} vs {match.playerB.playerProfile?.nick}
                        </p>
                        <p className="text-sm text-white/55">{match.game.name}</p>
                      </div>
                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="border-white/10 bg-white/5 text-white hover:bg-white/10"
                      >
                        <Link href={`/matches/${match.id}`}>Revisar</Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ) : null}
        </div>
      </section>
    </div>
  );
}
