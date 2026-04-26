"use client";

import { useActionState } from "react";

import { FormSubmitButton } from "@/components/shared/form-submit-button";
import { reviewStoreJoinRequestAction } from "@/features/stores/actions";
import { useActionToast } from "@/lib/hooks/use-action-toast";
import { initialFormActionState } from "@/types/action-state";

export function StoreRequestDecisionForm({
  requestId,
}: {
  requestId: string;
}) {
  const [state, formAction] = useActionState(
    reviewStoreJoinRequestAction,
    initialFormActionState,
  );
  useActionToast(state);

  return (
    <form action={formAction} className="space-y-2">
      <input type="hidden" name="requestId" value={requestId} />
      <div className="flex gap-2">
        <FormSubmitButton
          name="decision"
          value="accept"
          pendingLabel="Procesando..."
          size="sm"
        >
          Aceptar
        </FormSubmitButton>
        <FormSubmitButton
          name="decision"
          value="reject"
          pendingLabel="Procesando..."
          variant="destructive"
          size="sm"
        >
          Rechazar
        </FormSubmitButton>
      </div>
      {state.message ? (
        <p
          className={
            state.status === "success"
              ? "text-xs text-emerald-300"
              : "text-xs text-rose-300"
          }
        >
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
