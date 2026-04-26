"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState } from "react";

import { FormSubmitButton } from "@/components/shared/form-submit-button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createChallengeAction } from "@/features/challenges/actions";
import { useActionToast } from "@/lib/hooks/use-action-toast";
import { MATCH_FORMAT_VALUES, getMatchFormatLabel } from "@/lib/match-format";
import { initialFormActionState } from "@/types/action-state";

type ChallengeCreateFormProps = {
  opponent: {
    userId: string;
    displayName: string;
    nick: string;
    mainGameId?: string | null;
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
  defaultGameId?: string;
};

export function ChallengeCreateForm({
  opponent,
  games,
  stores,
  defaultGameId,
}: ChallengeCreateFormProps) {
  const router = useRouter();
  const [state, formAction] = useActionState(
    createChallengeAction,
    initialFormActionState,
  );
  useActionToast(state);
  const [mode, setMode] = useState<"IN_PERSON" | "ONLINE">("IN_PERSON");

  useEffect(() => {
    if (state.status === "success") {
      router.push("/challenges");
    }
  }, [router, state.status]);

  return (
    <Card className="border-white/10 bg-white/5 text-white">
      <CardHeader className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle>Nuevo reto</CardTitle>
            <p className="mt-1 text-sm text-white/60">
              Define juego, formato, modalidad y fecha para arrancar el match.
            </p>
          </div>
          <Badge
            variant="outline"
            className="border-cyan-300/30 bg-cyan-300/10 text-cyan-100"
          >
            @{opponent.nick}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="grid gap-4">
          <input type="hidden" name="challengedId" value={opponent.userId} />

          <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4 text-sm text-white/70">
            Rival seleccionado: <span className="font-medium text-white">{opponent.displayName}</span>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="gameId">Juego</Label>
              <select
                id="gameId"
                name="gameId"
                defaultValue={defaultGameId ?? opponent.mainGameId ?? games[0]?.id ?? ""}
                className="flex h-9 w-full rounded-md border border-white/10 bg-slate-950/60 px-3 text-sm text-white outline-none transition-colors focus:border-cyan-300/40"
              >
                {games.map((game) => (
                  <option key={game.id} value={game.id}>
                    {game.name}
                  </option>
                ))}
              </select>
              {state.fieldErrors?.gameId?.[0] ? (
                <p className="text-xs text-rose-300">{state.fieldErrors.gameId[0]}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="format">Formato</Label>
              <select
                id="format"
                name="format"
                defaultValue="BO3"
                className="flex h-9 w-full rounded-md border border-white/10 bg-slate-950/60 px-3 text-sm text-white outline-none transition-colors focus:border-cyan-300/40"
              >
                {MATCH_FORMAT_VALUES.map((format) => (
                  <option key={format} value={format}>
                    {format} - {getMatchFormatLabel(format)}
                  </option>
                ))}
              </select>
              {state.fieldErrors?.format?.[0] ? (
                <p className="text-xs text-rose-300">{state.fieldErrors.format[0]}</p>
              ) : null}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="mode">Modalidad</Label>
              <select
                id="mode"
                name="mode"
                value={mode}
                onChange={(event) => setMode(event.target.value as "IN_PERSON" | "ONLINE")}
                className="flex h-9 w-full rounded-md border border-white/10 bg-slate-950/60 px-3 text-sm text-white outline-none transition-colors focus:border-cyan-300/40"
              >
                <option value="IN_PERSON">IN_PERSON</option>
                <option value="ONLINE">ONLINE</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="scheduledFor">Fecha y hora</Label>
              <Input id="scheduledFor" name="scheduledFor" type="datetime-local" />
              {state.fieldErrors?.scheduledFor?.[0] ? (
                <p className="text-xs text-rose-300">{state.fieldErrors.scheduledFor[0]}</p>
              ) : null}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="storeId">
                {mode === "IN_PERSON" ? "Store de encuentro" : "Store opcional"}
              </Label>
              <select
                id="storeId"
                name="storeId"
                defaultValue=""
                className="flex h-9 w-full rounded-md border border-white/10 bg-slate-950/60 px-3 text-sm text-white outline-none transition-colors focus:border-cyan-300/40"
              >
                <option value="">Sin tienda asociada</option>
                {stores.map((store) => (
                  <option key={store.id} value={store.id}>
                    {store.name} - {store.city}
                  </option>
                ))}
              </select>
              {state.fieldErrors?.storeId?.[0] ? (
                <p className="text-xs text-rose-300">{state.fieldErrors.storeId[0]}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="locationLabel">Lugar</Label>
              <Input
                id="locationLabel"
                name="locationLabel"
                placeholder={mode === "ONLINE" ? "Discord, webcam, app..." : "Mesa 2, sala principal..."}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Mensaje opcional</Label>
            <Textarea
              id="message"
              name="message"
              rows={4}
              placeholder="Contexto, disponibilidad o detalles de la partida."
            />
          </div>

          {state.message ? (
            <p
              className={
                state.status === "success"
                  ? "text-sm text-emerald-300"
                  : "text-sm text-rose-300"
              }
            >
              {state.message}
            </p>
          ) : null}

          <FormSubmitButton className="w-full md:w-fit" pendingLabel="Creando reto...">
            Crear reto
          </FormSubmitButton>
        </form>
      </CardContent>
    </Card>
  );
}
