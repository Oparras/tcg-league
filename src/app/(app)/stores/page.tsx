import { Store } from "lucide-react";
import Link from "next/link";

import { StoreCard } from "@/features/stores/components/store-card";
import { StoreFiltersForm } from "@/features/stores/components/store-filters-form";
import { getStoresPageData } from "@/features/stores/queries";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireAuth } from "@/lib/auth/permissions";

export default async function StoresPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await requireAuth();
  const filters = await searchParams;
  const data = await getStoresPageData(filters, session.user.id);

  return (
    <div className="space-y-6">
      <section className="rounded-[32px] border border-white/10 bg-white/5 p-6 text-white">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-cyan-300/80">
              Stores
            </p>
            <h1 className="mt-2 text-3xl font-semibold">Tiendas y equipos competitivos</h1>
            <p className="mt-2 max-w-2xl text-sm text-white/65">
              Busca tiendas por ciudad o juego, revisa sus miembros activos y entra
              a la ficha para solicitar unirte.
            </p>
          </div>
          <div className="rounded-full border border-white/10 bg-slate-950/50 px-4 py-2 text-sm text-white/70">
            {data.stores.length} resultados
          </div>
        </div>
      </section>

      <StoreFiltersForm
        filters={data.filters}
        cities={data.cities}
        regions={data.regions}
        countries={data.countries}
        games={data.games}
      />

      {data.stores.length ? (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {data.stores.map((store) => (
            <StoreCard key={store.id} store={store} />
          ))}
        </section>
      ) : (
        <Card className="border-white/10 bg-white/5 text-white">
          <CardHeader className="items-center text-center">
            <div className="mx-auto flex size-10 items-center justify-center rounded-full border border-white/10 bg-slate-950/60">
              <Store className="size-5 text-amber-300" />
            </div>
            <CardTitle>No se encontraron tiendas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-center text-white/65">
            <p>
              Prueba con otra ciudad, elimina filtros o busca por nombre para
              encontrar tiendas activas.
            </p>
            <Button
              asChild
              variant="outline"
              className="border-white/10 bg-white/5 text-white hover:bg-white/10"
            >
              <Link href="/stores">Limpiar filtros</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
