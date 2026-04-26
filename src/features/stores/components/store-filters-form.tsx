import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type StoreFiltersFormProps = {
  filters: {
    query: string;
    city: string;
    region: string;
    country: string;
    game: string;
    verifiedOnly: boolean;
    activePlayersOnly: boolean;
  };
  cities: string[];
  regions: string[];
  countries: string[];
  games: { id: string; slug: string; name: string }[];
};

export function StoreFiltersForm({
  filters,
  cities,
  regions,
  countries,
  games,
}: StoreFiltersFormProps) {
  return (
    <form
      action="/stores"
      className="grid gap-3 rounded-[28px] border border-white/10 bg-white/5 p-4 md:grid-cols-3 xl:grid-cols-6"
    >
      <Input
        defaultValue={filters.query}
        name="query"
        placeholder="Buscar por nombre de tienda"
      />
      <select
        defaultValue={filters.city}
        name="city"
        className="h-10 rounded-md border border-white/10 bg-slate-950/50 px-3 text-sm text-white"
      >
        <option value="">Todas las ciudades</option>
        {cities.map((city) => (
          <option key={city} value={city}>
            {city}
          </option>
        ))}
      </select>
      <select
        defaultValue={filters.region}
        name="region"
        className="h-10 rounded-md border border-white/10 bg-slate-950/50 px-3 text-sm text-white"
      >
        <option value="">Todas las provincias/regiones</option>
        {regions.map((region) => (
          <option key={region} value={region}>
            {region}
          </option>
        ))}
      </select>
      <select
        defaultValue={filters.country}
        name="country"
        className="h-10 rounded-md border border-white/10 bg-slate-950/50 px-3 text-sm text-white"
      >
        <option value="">Todos los paises</option>
        {countries.map((country) => (
          <option key={country} value={country}>
            {country}
          </option>
        ))}
      </select>
      <select
        defaultValue={filters.game}
        name="game"
        className="h-10 rounded-md border border-white/10 bg-slate-950/50 px-3 text-sm text-white"
      >
        <option value="">Todos los juegos</option>
        {games.map((game) => (
          <option key={game.id} value={game.slug}>
            {game.name}
          </option>
        ))}
      </select>
      <label className="flex items-center gap-2 rounded-md border border-white/10 bg-slate-950/50 px-3 text-sm text-white/80">
        <input
          type="checkbox"
          name="verifiedOnly"
          value="true"
          defaultChecked={filters.verifiedOnly}
          className="size-4 rounded border border-white/20 bg-slate-950/80"
        />
        Solo verificadas
      </label>
      <label className="flex items-center gap-2 rounded-md border border-white/10 bg-slate-950/50 px-3 text-sm text-white/80">
        <input
          type="checkbox"
          name="activePlayersOnly"
          value="true"
          defaultChecked={filters.activePlayersOnly}
          className="size-4 rounded border border-white/20 bg-slate-950/80"
        />
        Con jugadores activos
      </label>
      <div className="flex gap-2 md:col-span-3 xl:col-span-6">
        <Button type="submit">Aplicar filtros</Button>
        <Button
          asChild
          type="button"
          variant="outline"
          className="border-white/10 bg-white/5 text-white hover:bg-white/10"
        >
          <Link href="/stores">Limpiar</Link>
        </Button>
      </div>
    </form>
  );
}
