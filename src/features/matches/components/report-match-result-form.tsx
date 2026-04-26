"use client";

import { useActionState } from "react";

import { FormSubmitButton } from "@/components/shared/form-submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { reportMatchResultAction } from "@/features/matches/actions";
import { useActionToast } from "@/lib/hooks/use-action-toast";
import { getMatchFormatDisplay, getValidSeriesScores } from "@/lib/match-format";
import { initialFormActionState } from "@/types/action-state";

export function ReportMatchResultForm({
  matchId,
  format,
  playerA,
  playerB,
  defaultPlayerAScore,
  defaultPlayerBScore,
}: {
  matchId: string;
  format: string;
  playerA: {
    id: string;
    label: string;
  };
  playerB: {
    id: string;
    label: string;
  };
  defaultPlayerAScore?: number | null;
  defaultPlayerBScore?: number | null;
}) {
  const [state, formAction] = useActionState(
    reportMatchResultAction,
    initialFormActionState,
  );
  useActionToast(state);
  const validScores = getValidSeriesScores(format);
  const maxScore =
    validScores.length > 0
      ? Math.max(...validScores.map((score) => Math.max(score.playerAScore, score.playerBScore)))
      : 3;
  const scoreOptions = Array.from({ length: maxScore + 1 }, (_, index) => index);
  const defaultScore = validScores[0] ?? { playerAScore: 0, playerBScore: 0 };

  return (
    <form action={formAction} className="grid gap-4">
      <input type="hidden" name="matchId" value={matchId} />

      <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4 text-sm text-white/70">
        <p>
          Formato: <span className="font-medium text-white">{getMatchFormatDisplay(format)}</span>
        </p>
        {validScores.length ? (
          <p className="mt-1 text-xs text-white/55">
            Marcadores validos:{" "}
            {validScores.map((score) => `${score.playerAScore}-${score.playerBScore}`).join(", ")}
          </p>
        ) : null}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="playerAScore">{playerA.label}</Label>
          <select
            id="playerAScore"
            name="playerAScore"
            defaultValue={
              typeof defaultPlayerAScore === "number"
                ? defaultPlayerAScore
                : defaultScore.playerAScore
            }
            className="flex h-9 w-full rounded-md border border-white/10 bg-slate-950/60 px-3 text-sm text-white outline-none transition-colors focus:border-cyan-300/40"
          >
            {scoreOptions.map((score) => (
              <option key={`player-a-${score}`} value={score}>
                {score}
              </option>
            ))}
          </select>
          {state.fieldErrors?.playerAScore?.[0] ? (
            <p className="text-xs text-rose-300">{state.fieldErrors.playerAScore[0]}</p>
          ) : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="playerBScore">{playerB.label}</Label>
          <select
            id="playerBScore"
            name="playerBScore"
            defaultValue={
              typeof defaultPlayerBScore === "number"
                ? defaultPlayerBScore
                : defaultScore.playerBScore
            }
            className="flex h-9 w-full rounded-md border border-white/10 bg-slate-950/60 px-3 text-sm text-white outline-none transition-colors focus:border-cyan-300/40"
          >
            {scoreOptions.map((score) => (
              <option key={`player-b-${score}`} value={score}>
                {score}
              </option>
            ))}
          </select>
          {state.fieldErrors?.playerBScore?.[0] ? (
            <p className="text-xs text-rose-300">{state.fieldErrors.playerBScore[0]}</p>
          ) : null}
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-xs text-white/55">
          El ganador se calcula automaticamente segun el marcador.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="proofImageUrl">Prueba (URL opcional)</Label>
        <Input
          id="proofImageUrl"
          name="proofImageUrl"
          placeholder="https://..."
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="note">Nota para el rival</Label>
        <Textarea
          id="note"
          name="note"
          rows={4}
          placeholder="Resumen del resultado o detalles relevantes."
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

      <FormSubmitButton className="w-full md:w-fit" pendingLabel="Reportando...">
        Reportar resultado
      </FormSubmitButton>
    </form>
  );
}
