import { Swords } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChallengeCreateForm } from "@/features/challenges/components/challenge-create-form";
import { ChallengeFiltersForm } from "@/features/challenges/components/challenge-filters-form";
import { ChallengeOpponentCard } from "@/features/challenges/components/challenge-opponent-card";
import { getChallengeCreatePageData } from "@/features/challenges/queries";
import { requireAuth } from "@/lib/auth/permissions";

export default async function NewChallengePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await requireAuth();
  const data = await getChallengeCreatePageData(
    await searchParams,
    session.user.id,
  );

  return (
    <div className="space-y-6">
      <section className="rounded-[32px] border border-white/10 bg-white/5 p-6 text-white">
        <p className="text-xs uppercase tracking-[0.25em] text-cyan-300/80">
          Retos
        </p>
        <h1 className="mt-2 text-3xl font-semibold">Buscar rival y crear reto</h1>
        <p className="mt-2 max-w-3xl text-sm text-white/65">
          Filtra jugadores por nick, tienda o juego principal, elige a tu rival y
          programa la partida desde aqui.
        </p>
      </section>

      <ChallengeFiltersForm
        filters={data.filters}
        stores={data.stores}
        games={data.games}
      />

      {data.selectedOpponent ? (
        <ChallengeCreateForm
          opponent={{
            userId: data.selectedOpponent.userId,
            displayName: data.selectedOpponent.displayName,
            nick: data.selectedOpponent.nick,
            mainGameId: data.selectedOpponent.mainGameId,
          }}
          games={data.games}
          stores={data.stores}
          defaultGameId={data.filters.game || data.selectedOpponent.mainGameId || undefined}
        />
      ) : (
        <Card className="border-white/10 bg-white/5 text-white">
          <CardHeader className="flex flex-row items-center gap-3">
            <Swords className="size-5 text-cyan-300" />
            <CardTitle>Selecciona un rival</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-white/65">
            Elige un jugador de la lista para abrir el formulario de reto.
          </CardContent>
        </Card>
      )}

      {data.players.length ? (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {data.players.map((player) => (
            <ChallengeOpponentCard
              key={player.id}
              player={player}
              selectedGameId={data.filters.game || undefined}
              isSelected={player.userId === data.selectedOpponent?.userId}
            />
          ))}
        </section>
      ) : (
        <Card className="border-white/10 bg-white/5 text-white">
          <CardHeader>
            <CardTitle>Sin jugadores disponibles</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-white/65">
            No hemos encontrado rivales con esos filtros. Prueba con otro nick,
            tienda o juego principal.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
