"use client";

import { useActionState } from "react";

import { FormSubmitButton } from "@/components/shared/form-submit-button";
import { toggleStoreVerificationAction } from "@/features/admin/actions";
import { initialFormActionState } from "@/types/action-state";

export function AdminStoreVerificationForm({
  storeId,
  isVerified,
}: {
  storeId: string;
  isVerified: boolean;
}) {
  const [state, formAction] = useActionState(
    toggleStoreVerificationAction,
    initialFormActionState,
  );

  return (
    <form action={formAction} className="space-y-2">
      <input type="hidden" name="storeId" value={storeId} />
      <input
        type="hidden"
        name="isVerified"
        value={String(!isVerified)}
      />
      <FormSubmitButton
        pendingLabel="Actualizando..."
        size="sm"
        variant={isVerified ? "outline" : "default"}
        className={
          isVerified
            ? "border-amber-300/30 bg-amber-300/10 text-amber-100 hover:bg-amber-300/20"
            : undefined
        }
      >
        {isVerified ? "Desvalidar" : "Validar"}
      </FormSubmitButton>
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
