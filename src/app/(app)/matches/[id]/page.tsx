import { notFound, redirect } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReportMatchResultForm } from "@/features/matches/components/report-match-result-form";
import { ResolveDisputeForm } from "@/features/matches/components/resolve-dispute-form";
import { ReviewMatchResultForm } from "@/features/matches/components/review-match-result-form";
import { getMatchPageData } from "@/features/matches/queries";
import { requireAuth } from "@/lib/auth/permissions";
import { formatSeriesScore, getMatchFormatDisplay } from "@/lib/match-format";
import { formatDateTime } from "@/lib/utils";

function getStatusBadgeClassName(status: string) {
  switch (status) {
    case "ACCEPTED":
    case "CONFIRMED":
      return "border-emerald-300/30 bg-emerald-300/10 text-emerald-100";
    case "PLAYED_PENDING_CONFIRMATION":
      return "border-amber-300/30 bg-amber-300/10 text-amber-100";
    case "DISPUTED":
      return "border-rose-300/30 bg-rose-300/10 text-rose-100";
    case "CANCELLED":
      return "border-white/10 bg-white/5 text-white/75";
    default:
      return "border-white/10 bg-white/5 text-white";
  }
}

function getStatusLabel(status: string) {
  switch (status) {
    case "ACCEPTED":
      return "Aceptado";
    case "PLAYED_PENDING_CONFIRMATION":
      return "Resultado pendiente";
    case "CONFIRMED":
      return "Confirmado";
    case "DISPUTED":
      return "En disputa";
    case "CANCELLED":
      return "Cancelado";
    case "PENDING":
      return "Pendiente";
    case "OPEN":
      return "Abierta";
    case "UNDER_REVIEW":
      return "En revision";
    case "RESOLVED":
      return "Resuelta";
    case "REJECTED":
      return "Rechazada";
    default:
      return status;
  }
}

export default async function MatchDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireAuth();
  const { id } = await params;
  const data = await getMatchPageData({
    matchId: id,
    viewerId: session.user.id,
    viewerRole: session.user.role,
  });

  if (!data) {
    notFound();
  }

  if (!data.permissions.canView) {
    redirect("/challenges");
  }

  const { match } = data;
  const latestDispute = match.disputes[0];
  const scoreline = formatSeriesScore(match.playerAScore, match.playerBScore);
  const winnerLabel =
    match.winner?.playerProfile?.displayName ??
    match.winner?.playerProfile?.nick ??
    "Pendiente";
  const playerADelta =
    typeof match.playerAEloAfter === "number"
      ? match.playerAEloAfter - match.playerAEloBefore
      : null;
  const playerBDelta =
    typeof match.playerBEloAfter === "number"
      ? match.playerBEloAfter - match.playerBEloBefore
      : null;
  const hasActionPanel =
    data.permissions.canReport ||
    data.permissions.canReviewPendingResult ||
    (data.permissions.canResolveDispute && Boolean(latestDispute));
  const players = [
    {
      id: match.playerA.id,
      label:
        match.playerA.playerProfile?.displayName ??
        match.playerA.playerProfile?.nick ??
        "Jugador A",
    },
    {
      id: match.playerB.id,
      label:
        match.playerB.playerProfile?.displayName ??
        match.playerB.playerProfile?.nick ??
        "Jugador B",
    },
  ];

  return (
    <div className="space-y-6">
      <section className="rounded-[32px] border border-white/10 bg-white/5 p-6 text-white">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-semibold">
            {match.playerA.playerProfile?.nick} vs {match.playerB.playerProfile?.nick}
          </h1>
          <Badge
            variant="outline"
            className={getStatusBadgeClassName(match.status)}
          >
            {getStatusLabel(match.status)}
          </Badge>
        </div>
        <div className="mt-3 space-y-1 text-sm text-white/65">
          <p>
            {match.game.name} - {getMatchFormatDisplay(match.format)} - {match.mode}
          </p>
          <p>
            {match.scheduledFor
              ? formatDateTime(match.scheduledFor)
              : "Sin fecha programada"}
          </p>
          <p>{match.locationLabel ?? "Sin lugar especificado"}</p>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <Card className="border-white/10 bg-white/5 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-white/70">Estado del match</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="outline" className={getStatusBadgeClassName(match.status)}>
              {getStatusLabel(match.status)}
            </Badge>
          </CardContent>
        </Card>
        <Card className="border-white/10 bg-white/5 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-white/70">Resultado</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold tracking-tight">{scoreline ?? "--"}</p>
            <p className="text-xs text-white/55">Games ganados por jugador</p>
          </CardContent>
        </Card>
        <Card className="border-white/10 bg-white/5 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-white/70">Ganador</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold text-emerald-200">{winnerLabel}</p>
            <p className="text-xs text-white/55">Se calcula automaticamente por marcador</p>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <Card className="border-white/10 bg-white/5 text-white">
          <CardHeader>
            <CardTitle>Datos de la partida</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-white/70">
            <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
              <p>Player A: {players[0].label}</p>
              <p>Player B: {players[1].label}</p>
              <p>
                Reporter:{" "}
                {match.reportedBy?.playerProfile?.displayName ??
                  match.reportedBy?.playerProfile?.nick ??
                  "Sin reporte"}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
              <p>
                Ganador:{" "}
                {match.winner?.playerProfile?.displayName ??
                  match.winner?.playerProfile?.nick ??
                  "Pendiente"}
              </p>
              <p>
                Perdedor:{" "}
                {match.loser?.playerProfile?.displayName ??
                  match.loser?.playerProfile?.nick ??
                  "Pendiente"}
              </p>
              <p>Resultado: {scoreline ?? "Pendiente"}</p>
              <p>
                Jugada el:{" "}
                {match.playedAt ? formatDateTime(match.playedAt) : "Pendiente"}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-white/5 text-white">
          <CardHeader>
            <CardTitle>ELO del juego</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-white/70">
            <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
              <p>
                {players[0].label}: {match.playerAEloBefore}
                {typeof match.playerAEloAfter === "number"
                  ? ` -> ${match.playerAEloAfter}`
                  : ""}
                {typeof playerADelta === "number"
                  ? ` (${playerADelta >= 0 ? "+" : ""}${playerADelta})`
                  : ""}
              </p>
              <p>
                {players[1].label}: {match.playerBEloBefore}
                {typeof match.playerBEloAfter === "number"
                  ? ` -> ${match.playerBEloAfter}`
                  : ""}
                {typeof playerBDelta === "number"
                  ? ` (${playerBDelta >= 0 ? "+" : ""}${playerBDelta})`
                  : ""}
              </p>
            </div>
            {match.proofImageUrl ? (
              <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
                <a
                  href={match.proofImageUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-cyan-200 underline-offset-4 hover:underline"
                >
                  Abrir prueba subida
                </a>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          {hasActionPanel ? (
            <Card className="border-white/10 bg-white/5 text-white">
              <CardHeader>
                <CardTitle>Acciones disponibles</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-white/65">
                Las acciones cambian segun el estado del match y tu rol en esta partida.
              </CardContent>
            </Card>
          ) : null}

          {data.permissions.canReport ? (
            <Card className="border-white/10 bg-white/5 text-white">
              <CardHeader>
                <CardTitle>Reportar resultado</CardTitle>
              </CardHeader>
              <CardContent>
                <ReportMatchResultForm
                  matchId={match.id}
                  format={match.format}
                  playerA={players[0]}
                  playerB={players[1]}
                  defaultPlayerAScore={match.playerAScore}
                  defaultPlayerBScore={match.playerBScore}
                />
              </CardContent>
            </Card>
          ) : null}

          {data.permissions.canReviewPendingResult ? (
            <Card className="border-white/10 bg-white/5 text-white">
              <CardHeader>
                <CardTitle>Confirmar o disputar</CardTitle>
              </CardHeader>
              <CardContent>
                <ReviewMatchResultForm matchId={match.id} />
              </CardContent>
            </Card>
          ) : null}

          {data.permissions.canResolveDispute && latestDispute ? (
            <Card className="border-white/10 bg-white/5 text-white">
              <CardHeader>
                <CardTitle>Resolver disputa</CardTitle>
              </CardHeader>
              <CardContent>
                <ResolveDisputeForm disputeId={latestDispute.id} />
              </CardContent>
            </Card>
          ) : null}
        </div>

        <div className="space-y-6">
          <Card className="border-white/10 bg-white/5 text-white">
            <CardHeader>
              <CardTitle>Confirmaciones</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {match.confirmations.length ? (
                match.confirmations.map((confirmation) => (
                  <div
                    key={confirmation.id}
                    className="rounded-2xl border border-white/10 bg-slate-950/40 p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-medium">
                        {confirmation.user.playerProfile?.displayName ??
                          confirmation.user.playerProfile?.nick ??
                          "Jugador"}
                      </p>
                      <Badge
                        variant="outline"
                        className={getStatusBadgeClassName(confirmation.status)}
                      >
                        {getStatusLabel(confirmation.status)}
                      </Badge>
                    </div>
                    {confirmation.note ? (
                      <p className="mt-3 text-sm text-white/65">{confirmation.note}</p>
                    ) : null}
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4 text-sm text-white/60">
                  Todavia no hay confirmaciones registradas.
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-white/5 text-white">
            <CardHeader>
              <CardTitle>Disputas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {match.disputes.length ? (
                match.disputes.map((dispute) => (
                  <div
                    key={dispute.id}
                    className="rounded-2xl border border-white/10 bg-slate-950/40 p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-medium">
                        {dispute.raisedBy.playerProfile?.displayName ??
                          dispute.raisedBy.playerProfile?.nick ??
                          "Jugador"}
                      </p>
                      <Badge
                        variant="outline"
                        className={getStatusBadgeClassName(dispute.status)}
                      >
                        {getStatusLabel(dispute.status)}
                      </Badge>
                    </div>
                    <p className="mt-3 text-sm text-white/65">{dispute.reason}</p>
                    {dispute.resolutionNote ? (
                      <p className="mt-3 text-sm text-cyan-100">
                        Resolucion: {dispute.resolutionNote}
                      </p>
                    ) : null}
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4 text-sm text-white/60">
                  Sin disputas activas ni resueltas.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
