import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight, Globe, MapPin, ShieldCheck, Swords, Users } from "lucide-react";

import { StoreJoinRequestForm } from "@/features/stores/components/store-join-request-form";
import { StorePublicProfileForm } from "@/features/stores/components/store-public-profile-form";
import { getStoreDetailPageData } from "@/features/stores/queries";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireAuth } from "@/lib/auth/permissions";
import { formatWinRate, getInitials } from "@/lib/utils";

function joinRequestLabel(status?: "PENDING" | "ACCEPTED" | "REJECTED" | null) {
  switch (status) {
    case "PENDING":
      return "Tu solicitud esta pendiente";
    case "ACCEPTED":
      return "Tu solicitud fue aceptada";
    case "REJECTED":
      return "Tu ultima solicitud fue rechazada";
    default:
      return null;
  }
}

export default async function StoreDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await requireAuth();
  const data = await getStoreDetailPageData(id, session.user.id);

  if (!data) {
    notFound();
  }

  const { ranking, store, viewerMembership, viewerRequest } = data;
  const isManager =
    session.user.role === "ADMIN" || store.ownerId === session.user.id;
  const joinRequestStatus = viewerRequest?.status ?? null;
  const externalLinks = [
    { label: "Website", href: store.websiteUrl },
    { label: "Google Maps", href: store.googleMapsUrl },
    { label: "Discord", href: store.discordUrl },
    { label: "Instagram", href: store.instagramUrl },
  ].filter((item): item is { label: string; href: string } => Boolean(item.href));
  const externalEventsUrl = store.officialLocatorUrl ?? store.websiteUrl ?? null;

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-white/10 bg-white/5 text-white">
        {store.bannerUrl ? (
          <div
            className="h-36 w-full bg-cover bg-center"
            style={{ backgroundImage: `linear-gradient(to top, rgba(2,6,23,0.9), rgba(2,6,23,0.2)), url(${store.bannerUrl})` }}
          />
        ) : null}
        <CardContent className="flex flex-col gap-6 py-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex flex-col gap-4 sm:flex-row">
            <Avatar className="size-20 border border-white/10">
              <AvatarImage src={store.logoUrl ?? undefined} alt={store.name} />
              <AvatarFallback>{getInitials(store.name)}</AvatarFallback>
            </Avatar>
            <div className="space-y-3">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-3xl font-semibold">{store.name}</h1>
                  {store.isVerified ? (
                    <Badge
                      variant="outline"
                      className="border-emerald-300/30 bg-emerald-300/10 text-emerald-100"
                    >
                      Verificada
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="border-white/10 bg-white/5 text-white"
                    >
                      Pendiente de verificacion
                    </Badge>
                  )}
                </div>
                <div className="mt-2 flex flex-wrap gap-4 text-sm text-white/60">
                  <span className="flex items-center gap-2">
                    <MapPin className="size-4 text-amber-300" />
                    {[store.city, store.region, store.country].filter(Boolean).join(", ")}
                  </span>
                  <span className="flex items-center gap-2">
                    <Users className="size-4 text-cyan-300" />
                    {store.memberships.length} miembros activos
                  </span>
                </div>
              </div>

              <p className="max-w-3xl text-sm leading-6 text-white/70">
                {store.description ?? "Sin descripcion todavia."}
              </p>

              <div className="flex flex-wrap gap-2">
                {store.supportedGames.map((item) => (
                  <Badge
                    key={item.id}
                    variant="outline"
                    className="border-white/10 bg-white/5 text-white"
                  >
                    {item.game.name}
                  </Badge>
                ))}
              </div>

              <p className="text-sm text-white/55">{store.address}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button asChild className="rounded-full">
              <Link href={`/challenges/new?store=${store.id}`}>
                <Swords className="size-4" />
                Retar jugadores
              </Link>
            </Button>
            {externalEventsUrl ? (
              <Button
                asChild
                variant="outline"
                className="rounded-full border-cyan-300/30 bg-cyan-300/10 text-cyan-100 hover:bg-cyan-300/20"
              >
                <Link href={externalEventsUrl} target="_blank" rel="noreferrer">
                  Ver eventos oficiales
                  <ArrowUpRight className="size-4" />
                </Link>
              </Button>
            ) : null}
            {isManager ? (
              <Button asChild className="rounded-full">
                <Link href={`/stores/${store.slug}/requests`}>Gestionar solicitudes</Link>
              </Button>
            ) : null}
            <Button
              asChild
              variant="outline"
              className="rounded-full border-white/10 bg-white/5 text-white hover:bg-white/10"
            >
              <Link href="/stores">Volver al listado</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <section className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <div className="space-y-6">
          <Card className="border-white/10 bg-white/5 text-white">
            <CardHeader className="flex flex-row items-center justify-between gap-3">
              <CardTitle>Miembros actuales</CardTitle>
              <Button
                asChild
                variant="outline"
                size="sm"
                className="border-white/10 bg-white/5 text-white hover:bg-white/10"
              >
                <Link href={`/challenges/new?store=${store.id}`}>Retar desde esta tienda</Link>
              </Button>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2">
              {store.memberships.length ? (
                store.memberships.map((membership) => (
                  <div
                    key={membership.id}
                    className="rounded-2xl border border-white/10 bg-slate-950/40 p-4"
                  >
                    <div className="flex items-start gap-3">
                      <Avatar className="size-12 border border-white/10">
                        <AvatarImage
                          src={membership.user.playerProfile?.avatarUrl ?? undefined}
                          alt={membership.user.playerProfile?.displayName ?? membership.user.id}
                        />
                        <AvatarFallback>
                          {getInitials(
                            membership.user.playerProfile?.displayName ??
                              membership.user.playerProfile?.nick ??
                              "Player",
                          )}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1 space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <Link
                            href={`/profile/${membership.user.id}`}
                            className="font-medium text-white hover:text-cyan-200"
                          >
                            {membership.user.playerProfile?.displayName ??
                              membership.user.playerProfile?.nick ??
                              "Jugador"}
                          </Link>
                          {membership.isPrimary ? (
                            <Badge
                              variant="outline"
                              className="border-cyan-300/30 bg-cyan-300/10 text-cyan-100"
                            >
                              Principal
                            </Badge>
                          ) : null}
                        </div>
                        <p className="text-sm text-white/55">
                          @{membership.user.playerProfile?.nick ?? "player"}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <Badge
                            variant="outline"
                            className="border-white/10 bg-white/5 text-white"
                          >
                            ELO {membership.user.playerProfile?.eloGlobal ?? 1000}
                          </Badge>
                          {membership.user.playerProfile?.mainGame?.name ? (
                            <Badge
                              variant="outline"
                              className="border-white/10 bg-white/5 text-white"
                            >
                              {membership.user.playerProfile.mainGame.name}
                            </Badge>
                          ) : null}
                        </div>
                        {membership.user.id === session.user.id ? (
                          <Badge
                            variant="outline"
                            className="border-emerald-300/30 bg-emerald-300/10 text-emerald-100"
                          >
                            Tu perfil
                          </Badge>
                        ) : (
                          <Button
                            asChild
                            size="sm"
                            variant="outline"
                            className="border-white/10 bg-white/5 text-white hover:bg-white/10"
                          >
                            <Link href={`/challenges/new?store=${store.id}&opponent=${membership.user.id}`}>
                              Retar
                            </Link>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4 text-sm text-white/60">
                  Esta tienda todavia no tiene miembros.
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-white/5 text-white">
            <CardHeader>
              <CardTitle>Ranking interno por ELO</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {ranking.length ? (
                ranking.map((membership, index) => (
                  <div
                    key={membership.id}
                    className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-950/40 p-4"
                  >
                    <div>
                      <p className="font-medium">
                        #{index + 1} - @{membership.user.playerProfile?.nick ?? "player"}
                      </p>
                      <p className="text-sm text-white/55">
                        {membership.user.playerProfile?.displayName ?? "Jugador"} -{" "}
                        {formatWinRate(membership.user.playerProfile?.winRate ?? 0)}
                      </p>
                    </div>
                    <span className="text-lg font-semibold">
                      {membership.user.playerProfile?.eloGlobal ?? 1000}
                    </span>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4 text-sm text-white/60">
                  Todavia no hay miembros con ranking interno.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card id="join" className="border-white/10 bg-white/5 text-white">
            <CardHeader>
              <CardTitle>Estado de union</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {viewerMembership ? (
                <div className="rounded-2xl border border-emerald-300/30 bg-emerald-300/10 p-4 text-sm text-emerald-100">
                  Ya eres miembro activo de esta tienda.
                </div>
              ) : joinRequestStatus && joinRequestStatus !== "REJECTED" ? (
                <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4 text-sm text-white/70">
                  {joinRequestLabel(joinRequestStatus)}
                </div>
              ) : (
                <StoreJoinRequestForm
                  storeId={store.id}
                  currentStatus={joinRequestStatus}
                />
              )}

              {!viewerMembership && joinRequestStatus === "REJECTED" ? (
                <div className="rounded-2xl border border-amber-300/20 bg-amber-300/10 p-4 text-sm text-amber-100">
                  Puedes volver a solicitar tu entrada con un mensaje actualizado.
                </div>
              ) : null}
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-white/5 text-white">
            <CardHeader>
              <CardTitle>Eventos oficiales</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-white/65">
                La inscripcion oficial se realiza en la plataforma externa (Carde.io /
                locator oficial). TCG League solo enlaza a esos eventos.
              </p>

              {store.officialLocatorUrl ? (
                <Button asChild className="w-full rounded-2xl">
                  <Link href={store.officialLocatorUrl} target="_blank" rel="noreferrer">
                    Abrir locator oficial
                    <ArrowUpRight className="size-4" />
                  </Link>
                </Button>
              ) : null}

              {externalLinks.length ? (
                <div className="space-y-2">
                  {externalLinks.map((linkItem) => (
                    <Button
                      key={`${linkItem.label}-${linkItem.href}`}
                      asChild
                      variant="outline"
                      className="w-full justify-between rounded-2xl border-white/10 bg-slate-950/40 text-white hover:bg-white/10"
                    >
                      <Link href={linkItem.href} target="_blank" rel="noreferrer">
                        {linkItem.label}
                        <ArrowUpRight className="size-4" />
                      </Link>
                    </Button>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4 text-sm text-white/60">
                  Esta tienda aun no ha configurado enlaces de eventos oficiales.
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-white/5 text-white">
            <CardHeader>
              <CardTitle>Contacto y enlaces</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-white/70">
              <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
                <p className="font-medium text-white">Direccion</p>
                <p className="mt-1">
                  {store.address}
                  <br />
                  {[store.city, store.region, store.country].filter(Boolean).join(", ")}
                </p>
              </div>
              {store.googleMapsUrl ? (
                <Button
                  asChild
                  variant="outline"
                  className="w-full justify-between rounded-2xl border-white/10 bg-slate-950/40 text-white hover:bg-white/10"
                >
                  <Link href={store.googleMapsUrl} target="_blank" rel="noreferrer">
                    Abrir en mapa
                    <MapPin className="size-4" />
                  </Link>
                </Button>
              ) : null}
              {store.websiteUrl ? (
                <Button
                  asChild
                  variant="outline"
                  className="w-full justify-between rounded-2xl border-white/10 bg-slate-950/40 text-white hover:bg-white/10"
                >
                  <Link href={store.websiteUrl} target="_blank" rel="noreferrer">
                    Sitio web
                    <Globe className="size-4" />
                  </Link>
                </Button>
              ) : null}
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-white/5 text-white">
            <CardHeader>
              <CardTitle>Owner</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {store.owner?.playerProfile ? (
                <Link
                  href={`/profile/${store.owner.id}`}
                  className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/40 p-4 transition-colors hover:border-cyan-300/30 hover:bg-white/10"
                >
                  <Avatar className="size-12 border border-white/10">
                    <AvatarImage
                      src={store.owner.playerProfile.avatarUrl ?? undefined}
                      alt={store.owner.playerProfile.displayName}
                    />
                    <AvatarFallback>
                      {getInitials(store.owner.playerProfile.displayName)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{store.owner.playerProfile.displayName}</p>
                    <p className="text-sm text-white/55">
                      @{store.owner.playerProfile.nick}
                    </p>
                  </div>
                </Link>
              ) : (
                <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4 text-sm text-white/60">
                  Owner sin perfil de jugador asociado.
                </div>
              )}
              {isManager ? (
                <div className="rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-4 text-sm text-cyan-100">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="size-4" />
                    Tienes permisos para gestionar solicitudes y editar esta tienda.
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>

          {isManager ? (
            <Card className="border-white/10 bg-white/5 text-white">
              <CardHeader>
                <CardTitle>Editar tienda</CardTitle>
                <p className="text-sm text-white/60">
                  Ajusta enlaces externos, juegos soportados y datos publicos del
                  directorio.
                </p>
              </CardHeader>
              <CardContent>
                <StorePublicProfileForm
                  store={{
                    id: store.id,
                    city: store.city,
                    region: store.region,
                    country: store.country,
                    address: store.address,
                    description: store.description,
                    logoUrl: store.logoUrl,
                    bannerUrl: store.bannerUrl,
                    websiteUrl: store.websiteUrl,
                    officialLocatorUrl: store.officialLocatorUrl,
                    googleMapsUrl: store.googleMapsUrl,
                    discordUrl: store.discordUrl,
                    instagramUrl: store.instagramUrl,
                    supportedGames: store.supportedGames.map((item) => ({
                      gameId: item.gameId,
                    })),
                  }}
                  games={data.allGames}
                />
              </CardContent>
            </Card>
          ) : null}
        </div>
      </section>
    </div>
  );
}
