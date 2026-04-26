"use client";

import { useActionState } from "react";

import { FormSubmitButton } from "@/components/shared/form-submit-button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { resolveDisputeAction } from "@/features/matches/actions";
import { useActionToast } from "@/lib/hooks/use-action-toast";
import { initialFormActionState } from "@/types/action-state";

export function ResolveDisputeForm({ disputeId }: { disputeId: string }) {
  const [state, formAction] = useActionState(
    resolveDisputeAction,
    initialFormActionState,
  );
  useActionToast(state);

  return (
    <form action={formAction} className="grid gap-4">
      <input type="hidden" name="disputeId" value={disputeId} />

      <div className="space-y-2">
        <Label htmlFor="resolutionNote">Nota de resolucion</Label>
        <Textarea
          id="resolutionNote"
          name="resolutionNote"
          rows={4}
          placeholder="Comentario opcional para dejar constancia de la decision."
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

      <div className="flex flex-wrap gap-2">
        <FormSubmitButton
          name="intent"
          value="confirm_result"
          pendingLabel="Resolviendo..."
        >
          Confirmar resultado
        </FormSubmitButton>
        <FormSubmitButton
          name="intent"
          value="cancel_match"
          pendingLabel="Cancelando..."
          variant="destructive"
        >
          Cancelar match
        </FormSubmitButton>
      </div>
    </form>
  );
}
