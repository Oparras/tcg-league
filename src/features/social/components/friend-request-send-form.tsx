"use client";

import { useActionState } from "react";

import { FormSubmitButton } from "@/components/shared/form-submit-button";
import { sendFriendRequestAction } from "@/features/social/actions";
import { useActionToast } from "@/lib/hooks/use-action-toast";
import { initialFormActionState } from "@/types/action-state";

export function FriendRequestSendForm({
  targetUserId,
  buttonLabel = "Agregar amigo",
  className,
}: {
  targetUserId: string;
  buttonLabel?: string;
  className?: string;
}) {
  const [state, formAction] = useActionState(
    sendFriendRequestAction,
    initialFormActionState,
  );
  useActionToast(state);

  return (
    <form action={formAction} className={className}>
      <input type="hidden" name="targetUserId" value={targetUserId} />
      <FormSubmitButton pendingLabel="Enviando...">{buttonLabel}</FormSubmitButton>
      {state.message ? (
        <p
          className={
            state.status === "success"
              ? "mt-2 text-xs text-emerald-300"
              : "mt-2 text-xs text-rose-300"
          }
        >
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
