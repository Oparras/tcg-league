"use client";

import { useActionState } from "react";

import { FormSubmitButton } from "@/components/shared/form-submit-button";
import { respondFriendRequestAction } from "@/features/social/actions";
import { useActionToast } from "@/lib/hooks/use-action-toast";
import { initialFormActionState } from "@/types/action-state";

export function FriendRequestResponseForm({
  friendshipId,
  compact = false,
}: {
  friendshipId: string;
  compact?: boolean;
}) {
  const [state, formAction] = useActionState(
    respondFriendRequestAction,
    initialFormActionState,
  );
  useActionToast(state);

  return (
    <form action={formAction} className="space-y-2">
      <input type="hidden" name="friendshipId" value={friendshipId} />
      <div className="flex flex-wrap gap-2">
        <FormSubmitButton
          name="decision"
          value="accept"
          pendingLabel="Procesando..."
          size={compact ? "sm" : "default"}
        >
          Aceptar
        </FormSubmitButton>
        <FormSubmitButton
          name="decision"
          value="reject"
          pendingLabel="Procesando..."
          size={compact ? "sm" : "default"}
          variant="destructive"
        >
          Rechazar
        </FormSubmitButton>
      </div>
      {state.message ? (
        <p
          className={
            state.status === "success" ? "text-xs text-emerald-300" : "text-xs text-rose-300"
          }
        >
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
