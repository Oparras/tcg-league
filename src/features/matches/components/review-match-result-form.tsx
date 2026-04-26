"use client";

import { useActionState } from "react";

import { FormSubmitButton } from "@/components/shared/form-submit-button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { reviewMatchResultAction } from "@/features/matches/actions";
import { useActionToast } from "@/lib/hooks/use-action-toast";
import { initialFormActionState } from "@/types/action-state";

export function ReviewMatchResultForm({ matchId }: { matchId: string }) {
  const [state, formAction] = useActionState(
    reviewMatchResultAction,
    initialFormActionState,
  );
  useActionToast(state);

  return (
    <form action={formAction} className="grid gap-4">
      <input type="hidden" name="matchId" value={matchId} />

      <div className="space-y-2">
        <Label htmlFor="reason">Motivo de disputa</Label>
        <Textarea
          id="reason"
          name="reason"
          rows={4}
          placeholder="Solo es necesario si vas a disputar el resultado."
        />
        {state.fieldErrors?.reason?.[0] ? (
          <p className="text-xs text-rose-300">{state.fieldErrors.reason[0]}</p>
        ) : null}
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

      <div className="flex flex-wrap gap-2">
        <FormSubmitButton name="intent" value="confirm" pendingLabel="Confirmando...">
          Confirmar resultado
        </FormSubmitButton>
        <FormSubmitButton
          name="intent"
          value="dispute"
          pendingLabel="Abriendo disputa..."
          variant="destructive"
        >
          Disputar
        </FormSubmitButton>
      </div>
    </form>
  );
}
