import Link from "next/link";
import { Swords } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChallengeActionPanel } from "@/features/challenges/components/challenge-action-panel";
import { getChallengesPageData } from "@/features/challenges/queries";
import { requireAuth } from "@/lib/auth/permissions";
import { getMatchFormatDisplay } from "@/lib/match-format";
import { formatDateTime } from "@/lib/utils";

const tabs = [
  { key: "received", label: "Recibidos" },
  { key: "sent", label: "Enviados" },
  { key: "upcoming", label: "Aceptados / proximos" },
  { key: "history", label: "Historial" },
] as const;

function getStatusBadgeClassName(status: string) {
  switch (status) {
    case "PENDING":
      return "border-amber-300/30 bg-amber-300/10 text-amber-100";
    case "ACCEPTED":
      return "border-emerald-300/30 bg-emerald-300/10 text-emerald-100";
    case "REJECTED":
    case "CANCELLED":
      return "border-rose-300/30 bg-rose-300/10 text-rose-100";
    case "COUNTER_PROPOSED":
      return "border-cyan-300/30 bg-cyan-300/10 text-cyan-100";
    default:
      return "border-white/10 bg-white/5 text-white";
  }
}

function getStatusLabel(status: string) {
  switch (status) {
    case "PENDING":
      return "Pendiente";
    case "ACCEPTED":
      return "Aceptado";
    case "CONFIRMED":
      return "Confirmado";
    case "PLAYED_PENDING_CONFIRMATION":
      return "Resultado pendiente";
    case "DISPUTED":
      return "En disputa";
    case "REJECTED":
      return "Rechazado";
    case "COUNTER_PROPOSED":
      return "Nueva fecha propuesta";
    case "CANCELLED":
      return "Cancelado";
    case "EXPIRED":
      return "Expirado";
    default:
      return status;
  }
}

export default async function ChallengesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await requireAuth();
  const rawParams = await searchParams;
  const requestedTab =
    typeof rawParams.tab === "string" ? rawParams.tab : "received";
  const data = await getChallengesPageData(session.user.id);
  const activeTab = tabs.some((tab) => tab.key === requestedTab)
    ? (requestedTab as (typeof tabs)[number]["key"])
    : "received";

  const activeItems =
    activeTab === "received"
      ? data.received
      : activeTab === "sent"
        ? data.sent
        : activeTab === "upcoming"
          ? data.upcoming
          : data.history;

  return (
    <div className="space-y-6">
      <section className="rounded-[32px] border border-white/10 bg-white/5 p-6 text-white">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-cyan-300/80">
              Retos
            </p>
            <h1 className="mt-2 text-3xl font-semibold">Gestion competitiva</h1>
            <p className="mt-2 max-w-3xl text-sm text-white/65">
              Revisa lo que te han enviado, acepta nuevas fechas y entra a tus
              matches programados.
            </p>
          </div>
          <Button asChild className="rounded-full">
            <Link href="/challenges/new">Nuevo reto</Link>
          </Button>
        </div>
      </section>

      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <Button
            key={tab.key}
            asChild
            variant={tab.key === activeTab ? "default" : "outline"}
            className={
              tab.key === activeTab
                ? "rounded-full"
                : "rounded-full border-white/10 bg-white/5 text-white hover:bg-white/10"
            }
          >
            <Link href={`/challenges?tab=${tab.key}`}>
              {tab.label}
              <Badge
                variant="outline"
                className="ml-2 border-white/10 bg-black/20 text-current"
              >
                {data.counts[tab.key]}
              </Badge>
            </Link>
          </Button>
        ))}
      </div>

      {activeItems.length ? (
        <section className="grid gap-4">
          {activeItems.map((challenge) => {
            const rival =
              challenge.challengerId === session.user.id
                ? challenge.challenged
                : challenge.challenger;
            const canAccept =
              challenge.challengedId === session.user.id &&
              challenge.status === "PENDING";
            const canReject =
              challenge.challengedId === session.user.id &&
              challenge.status === "PENDING";
            const canCounter =
              challenge.challengedId === session.user.id &&
              challenge.status === "PENDING";
            const canAcceptCounter =
              challenge.challengerId === session.user.id &&
              challenge.status === "COUNTER_PROPOSED";
            const canCancel =
              (challenge.challengerId === session.user.id &&
                ["PENDING", "COUNTER_PROPOSED"].includes(challenge.status)) ||
              session.user.role === "ADMIN";

            return (
              <Card key={challenge.id} className="border-white/10 bg-white/5 text-white">
                <CardContent className="flex flex-col gap-4 py-6 xl:flex-row xl:items-start xl:justify-between">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-xl font-semibold">
                        @{rival.playerProfile?.nick ?? "player"}
                      </p>
                      <Badge
                        variant="outline"
                        className={getStatusBadgeClassName(challenge.status)}
                      >
                        {getStatusLabel(challenge.status)}
                      </Badge>
                      {challenge.match ? (
                        <Badge
                          variant="outline"
                          className={getStatusBadgeClassName(challenge.match.status)}
                        >
                          match {getStatusLabel(challenge.match.status)}
                        </Badge>
                      ) : null}
                    </div>

                    <div className="space-y-1 text-sm text-white/65">
                      <p>
                        {rival.playerProfile?.displayName ?? "Jugador"} - {challenge.game.name}
                      </p>
                      <p>
                        {getMatchFormatDisplay(challenge.format)} - {challenge.mode} -{" "}
                        {formatDateTime(challenge.scheduledFor)}
                      </p>
                      <p>
                        {challenge.venueStore?.name ??
                          challenge.locationLabel ??
                          "Sin lugar especificado"}
                      </p>
                      {challenge.status === "COUNTER_PROPOSED" &&
                      challenge.counterProposedFor ? (
                        <p className="text-cyan-200">
                          Nueva fecha propuesta: {formatDateTime(challenge.counterProposedFor)}
                        </p>
                      ) : null}
                    </div>

                    {challenge.message ? (
                      <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4 text-sm text-white/70">
                        {challenge.message}
                      </div>
                    ) : null}
                  </div>

                  <div className="w-full max-w-md space-y-4">
                    <ChallengeActionPanel
                      challengeId={challenge.id}
                      canAccept={canAccept}
                      canReject={canReject}
                      canCounter={canCounter}
                      canAcceptCounter={canAcceptCounter}
                      canCancel={canCancel}
                      matchId={challenge.match?.id}
                    />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </section>
      ) : (
        <Card className="border-white/10 bg-white/5 text-white">
          <CardHeader className="items-center text-center">
            <div className="mx-auto flex size-10 items-center justify-center rounded-full border border-white/10 bg-slate-950/60">
              <Swords className="size-5 text-cyan-300" />
            </div>
            <CardTitle>No tienes retos aun</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-center text-sm text-white/65">
            <p>
              No hay retos en esta vista. Empieza uno nuevo para activar tu
              calendario competitivo.
            </p>
            <Button asChild>
              <Link href="/challenges/new">Crear reto</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
