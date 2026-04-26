import { notFound } from "next/navigation";

import { StoreRequestDecisionForm } from "@/features/stores/components/store-request-decision-form";
import {
  getStoreByIdentifier,
  getStoreRequestsPageData,
} from "@/features/stores/queries";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireStoreOwnerOrAdmin } from "@/lib/auth/permissions";
import { formatDateTime, getInitials } from "@/lib/utils";

export default async function StoreRequestsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const store = await getStoreByIdentifier(id);

  if (!store) {
    notFound();
  }

  await requireStoreOwnerOrAdmin(store.id);
  const data = await getStoreRequestsPageData(store.id);

  return (
    <div className="space-y-6">
      <section className="rounded-[32px] border border-white/10 bg-white/5 p-6 text-white">
        <p className="text-xs uppercase tracking-[0.25em] text-cyan-300/80">
          Solicitudes
        </p>
        <h1 className="mt-2 text-3xl font-semibold">{store.name}</h1>
        <p className="mt-2 text-sm text-white/65">
          Revisa y resuelve las solicitudes pendientes para esta tienda.
        </p>
      </section>

      <Card className="border-white/10 bg-white/5 text-white">
        <CardHeader>
          <CardTitle>Pendientes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {data.pendingRequests.length ? (
            data.pendingRequests.map((request) => (
              <div
                key={request.id}
                className="rounded-2xl border border-white/10 bg-slate-950/40 p-4"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex items-start gap-3">
                    <Avatar className="size-12 border border-white/10">
                      <AvatarImage
                        src={request.user.playerProfile?.avatarUrl ?? undefined}
                        alt={request.user.playerProfile?.displayName ?? request.user.email}
                      />
                      <AvatarFallback>
                        {getInitials(
                          request.user.playerProfile?.displayName ??
                            request.user.playerProfile?.nick ??
                            request.user.email,
                        )}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-2">
                      <div>
                        <p className="font-medium">
                          {request.user.playerProfile?.displayName ?? request.user.email}
                        </p>
                        <p className="text-sm text-white/55">
                          @{request.user.playerProfile?.nick ?? "player"} - {request.user.playerProfile?.city ?? "Sin ciudad"}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {request.user.playerProfile?.mainGame?.name ? (
                          <Badge
                            variant="outline"
                            className="border-white/10 bg-white/5 text-white"
                          >
                            {request.user.playerProfile.mainGame.name}
                          </Badge>
                        ) : null}
                        <Badge
                          variant="outline"
                          className="border-white/10 bg-white/5 text-white"
                        >
                          ELO {request.user.playerProfile?.eloGlobal ?? 1000}
                        </Badge>
                      </div>
                      {request.message ? (
                        <p className="text-sm text-white/70">{request.message}</p>
                      ) : (
                        <p className="text-sm text-white/45">
                          Sin mensaje adicional.
                        </p>
                      )}
                      <p className="text-xs text-white/45">
                        Solicitado el {formatDateTime(request.requestedAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <StoreRequestDecisionForm requestId={request.id} />
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4 text-sm text-white/60">
              No hay solicitudes pendientes ahora mismo.
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-white/10 bg-white/5 text-white">
        <CardHeader>
          <CardTitle>Recientes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {data.recentRequests.length ? (
            data.recentRequests.map((request) => (
              <div
                key={request.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-slate-950/40 p-4"
              >
                <div>
                  <p className="font-medium">
                    {request.user.playerProfile?.displayName ?? request.user.playerProfile?.nick ?? "Jugador"}
                  </p>
                  <p className="text-sm text-white/55">
                    {request.status === "ACCEPTED" ? "Aceptada" : "Rechazada"} el {request.respondedAt ? formatDateTime(request.respondedAt) : "sin fecha"}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className={
                    request.status === "ACCEPTED"
                      ? "border-emerald-300/30 bg-emerald-300/10 text-emerald-100"
                      : "border-rose-300/30 bg-rose-300/10 text-rose-100"
                  }
                >
                  {request.status}
                </Badge>
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4 text-sm text-white/60">
              Aun no hay historial de solicitudes resueltas.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
