import Link from "next/link";
import { Bell, ShieldCheck, Store, Users } from "lucide-react";

import { MetricCard } from "@/components/shared/metric-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AdminStoreEditorForm } from "@/features/admin/components/admin-store-editor-form";
import { AdminStoreOwnerForm } from "@/features/admin/components/admin-store-owner-form";
import { AdminStoreVerificationForm } from "@/features/admin/components/admin-store-verification-form";
import { AdminUserRoleForm } from "@/features/admin/components/admin-user-role-form";
import { getAdminPageData } from "@/features/admin/queries";
import { requireAdmin } from "@/lib/auth/permissions";

function formatRoleLabel(role: string) {
  switch (role) {
    case "STORE_OWNER":
      return "STORE_OWNER";
    default:
      return role;
  }
}

export default async function AdminPage() {
  await requireAdmin();
  const data = await getAdminPageData();

  return (
    <div className="space-y-6">
      <section className="rounded-[32px] border border-white/10 bg-white/5 p-6 text-white">
        <p className="text-xs uppercase tracking-[0.25em] text-cyan-300/80">
          Admin
        </p>
        <h1 className="mt-2 text-3xl font-semibold">Panel de administracion</h1>
        <p className="mt-2 max-w-3xl text-sm text-white/65">
          Gestiona usuarios, owners, tiendas verificadas y accesos de moderacion
          desde un unico panel operativo.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Usuarios"
          value={data.counts.users.toString()}
          caption="Cuentas registradas"
          icon={Users}
        />
        <MetricCard
          title="Tiendas"
          value={data.counts.stores.toString()}
          caption={`${data.counts.verifiedStores} verificadas`}
          icon={Store}
        />
        <MetricCard
          title="Solicitudes pendientes"
          value={data.counts.pendingRequests.toString()}
          caption="Pendientes de revisar"
          icon={Bell}
        />
        <MetricCard
          title="Admins"
          value={data.counts.admins.toString()}
          caption="Usuarios con acceso total"
          icon={ShieldCheck}
        />
      </section>

      <Card className="border-white/10 bg-white/5 text-white">
        <CardHeader>
          <CardTitle>Usuarios</CardTitle>
        </CardHeader>
        <CardContent>
          {data.users.length ? (
            <Table>
              <TableHeader>
                <TableRow className="border-white/10 hover:bg-transparent">
                  <TableHead className="text-white/60">Usuario</TableHead>
                  <TableHead className="text-white/60">Perfil</TableHead>
                  <TableHead className="text-white/60">Rol</TableHead>
                  <TableHead className="text-white/60">Tienda principal</TableHead>
                  <TableHead className="text-white/60">Accion</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.users.map((user) => (
                  <TableRow key={user.id} className="border-white/10 hover:bg-white/5">
                    <TableCell className="align-top text-white">
                      <div className="space-y-1">
                        <p className="font-medium">{user.email}</p>
                        {user.ownedStores.length ? (
                          <p className="text-xs text-white/45">
                            {user.ownedStores.length} tiendas como owner
                          </p>
                        ) : null}
                      </div>
                    </TableCell>
                    <TableCell className="align-top">
                      <div className="space-y-1">
                        <p className="text-white">
                          {user.playerProfile?.displayName ??
                            user.playerProfile?.nick ??
                            "Sin perfil"}
                        </p>
                        <p className="text-sm text-white/55">
                          @{user.playerProfile?.nick ?? "sin-nick"}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="align-top">
                      <Badge
                        variant="outline"
                        className="border-white/10 bg-white/5 text-white"
                      >
                        {formatRoleLabel(user.role)}
                      </Badge>
                    </TableCell>
                    <TableCell className="align-top text-white/65">
                      {user.playerProfile?.primaryStore?.name ?? "Sin tienda"}
                    </TableCell>
                    <TableCell className="min-w-[240px] align-top">
                      <AdminUserRoleForm
                        userId={user.id}
                        currentRole={user.role}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4 text-sm text-white/60">
              No hay usuarios registrados todavia.
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-white/10 bg-white/5 text-white">
        <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>Tiendas</CardTitle>
            <p className="text-sm text-white/60">
              Asigna owners, valida tiendas y entra a gestionar solicitudes de
              cualquier store.
            </p>
          </div>
        </CardHeader>
        <CardContent>
          {data.stores.length ? (
            <Table>
              <TableHeader>
                <TableRow className="border-white/10 hover:bg-transparent">
                  <TableHead className="text-white/60">Tienda</TableHead>
                  <TableHead className="text-white/60">Owner actual</TableHead>
                  <TableHead className="text-white/60">Miembros</TableHead>
                  <TableHead className="text-white/60">Solicitudes</TableHead>
                  <TableHead className="text-white/60">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.stores.map((store) => (
                  <TableRow key={store.id} className="border-white/10 hover:bg-white/5">
                    <TableCell className="align-top text-white">
                      <div className="space-y-2">
                        <div>
                          <p className="font-medium">{store.name}</p>
                          <p className="text-sm text-white/55">{store.city}</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {store.supportedGames.map((storeGame) => (
                            <Badge
                              key={storeGame.id}
                              variant="outline"
                              className="border-white/10 bg-white/5 text-white/80"
                            >
                              {storeGame.game.name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="min-w-[280px] align-top">
                      <div className="space-y-3">
                        <p className="text-sm text-white/65">
                          {store.owner?.playerProfile?.displayName ??
                            store.owner?.playerProfile?.nick ??
                            store.owner?.email ??
                            "Sin owner asignado"}
                        </p>
                        <AdminStoreOwnerForm
                          storeId={store.id}
                          currentOwnerId={store.ownerId}
                          owners={data.ownerOptions}
                        />
                      </div>
                    </TableCell>
                    <TableCell className="align-top text-white">
                      {store.memberships.length}
                    </TableCell>
                    <TableCell className="align-top">
                      <div className="space-y-3">
                        <Badge
                          variant="outline"
                          className="border-amber-300/30 bg-amber-300/10 text-amber-100"
                        >
                          {store.joinRequests.length} pending
                        </Badge>
                        <Button
                          asChild
                          variant="outline"
                          size="sm"
                          className="border-white/10 bg-white/5 text-white hover:bg-white/10"
                        >
                          <Link href={`/stores/${store.slug}/requests`}>
                            Gestionar solicitudes
                          </Link>
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="min-w-[180px] align-top">
                      <AdminStoreVerificationForm
                        storeId={store.id}
                        isVerified={store.isVerified}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4 text-sm text-white/60">
              No hay tiendas creadas todavia.
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-white/10 bg-white/5 text-white">
        <CardHeader>
          <CardTitle>Crear tienda</CardTitle>
        </CardHeader>
        <CardContent>
          <AdminStoreEditorForm
            mode="create"
            owners={data.ownerOptions.map((owner) => ({
              id: owner.id,
              label: `${owner.label} - ${owner.role}`,
            }))}
            games={data.games}
          />
        </CardContent>
      </Card>

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-white">Editar tiendas</h2>
          <p className="mt-1 text-sm text-white/60">
            Ajusta datos basicos y juegos soportados. El owner y la validacion se
            controlan desde la tabla superior.
          </p>
        </div>

        {data.stores.length ? (
          <div className="grid gap-6 xl:grid-cols-2">
            {data.stores.map((store) => (
              <Card key={store.id} className="border-white/10 bg-white/5 text-white">
                <CardHeader className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <CardTitle>{store.name}</CardTitle>
                      <p className="mt-1 text-sm text-white/55">
                        {store.address}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge
                        variant="outline"
                        className="border-white/10 bg-white/5 text-white"
                      >
                        slug: {store.slug}
                      </Badge>
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
                          Sin validar
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <AdminStoreEditorForm
                    mode="edit"
                    store={store}
                    games={data.games}
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4 text-sm text-white/60">
            No hay tiendas disponibles para editar todavia.
          </div>
        )}
      </section>

      <Card className="border-white/10 bg-white/5 text-white">
        <CardHeader>
          <CardTitle>Matches disputados</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {data.disputedMatches.length ? (
            data.disputedMatches.map((match) => (
              <div
                key={match.id}
                className="rounded-2xl border border-white/10 bg-slate-950/40 p-4"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="font-medium">
                      {match.playerA.playerProfile?.nick ?? "player"} vs{" "}
                      {match.playerB.playerProfile?.nick ?? "player"}
                    </p>
                    <p className="text-sm text-white/55">{match.game.name}</p>
                    {match.disputes[0] ? (
                      <p className="mt-2 text-sm text-white/65">
                        {match.disputes[0].raisedBy.playerProfile?.displayName ??
                          match.disputes[0].raisedBy.playerProfile?.nick ??
                          "Jugador"}{" "}
                        abrió disputa: {match.disputes[0].reason}
                      </p>
                    ) : null}
                  </div>
                  <Button
                    asChild
                    variant="outline"
                    className="border-white/10 bg-white/5 text-white hover:bg-white/10"
                  >
                    <Link href={`/matches/${match.id}`}>Revisar disputa</Link>
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4 text-sm text-white/60">
              No hay matches disputados en este momento.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
