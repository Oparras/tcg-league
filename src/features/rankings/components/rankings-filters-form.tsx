import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function RankingsFiltersForm({
  filters,
  games,
  stores,
}: {
  filters: {
    game: string;
    store: string;
    city: string;
  };
  games: {
    id: string;
    name: string;
  }[];
  stores: {
    id: string;
    name: string;
    city: string;
  }[];
}) {
  return (
    <form
      action="/rankings"
      className="rounded-[32px] border border-white/10 bg-white/5 p-5 text-white"
    >
      <div className="grid gap-4 lg:grid-cols-[1fr_1fr_1fr_auto]">
        <div className="space-y-2">
          <label className="text-xs uppercase tracking-[0.2em] text-white/50">
            Juego
          </label>
          <select
            name="game"
            defaultValue={filters.game}
            className="flex h-9 w-full rounded-md border border-white/10 bg-slate-950/60 px-3 text-sm text-white outline-none transition-colors focus:border-cyan-300/40"
          >
            <option value="">Global</option>
            {games.map((game) => (
              <option key={game.id} value={game.id}>
                {game.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-xs uppercase tracking-[0.2em] text-white/50">
            Tienda
          </label>
          <select
            name="store"
            defaultValue={filters.store}
            className="flex h-9 w-full rounded-md border border-white/10 bg-slate-950/60 px-3 text-sm text-white outline-none transition-colors focus:border-cyan-300/40"
          >
            <option value="">Todas las tiendas</option>
            {stores.map((store) => (
              <option key={store.id} value={store.id}>
                {store.name} - {store.city}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-xs uppercase tracking-[0.2em] text-white/50">
            Ciudad
          </label>
          <Input name="city" defaultValue={filters.city} placeholder="Madrid, Barcelona..." />
        </div>
        <div className="flex items-end gap-2">
          <Button type="submit" className="rounded-full">
            Aplicar
          </Button>
          <Button
            asChild
            variant="outline"
            className="rounded-full border-white/10 bg-white/5 text-white hover:bg-white/10"
          >
            <Link href="/rankings">Limpiar</Link>
          </Button>
        </div>
      </div>
    </form>
  );
}
