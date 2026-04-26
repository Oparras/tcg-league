"use client";

import { UserRole } from "@prisma/client";
import { useActionState } from "react";

import { FormSubmitButton } from "@/components/shared/form-submit-button";
import { assignStoreOwnerAction } from "@/features/admin/actions";
import { initialFormActionState } from "@/types/action-state";

const selectClassName =
  "flex h-9 w-full rounded-md border border-white/10 bg-slate-950/60 px-3 text-sm text-white outline-none transition-colors focus:border-cyan-300/40";

export function AdminStoreOwnerForm({
  storeId,
  currentOwnerId,
  owners,
}: {
  storeId: string;
  currentOwnerId?: string | null;
  owners: {
    id: string;
    label: string;
    email: string;
    role: UserRole;
  }[];
}) {
  const [state, formAction] = useActionState(
    assignStoreOwnerAction,
    initialFormActionState,
  );

  return (
    <form action={formAction} className="space-y-2">
      <input type="hidden" name="storeId" value={storeId} />
      <div className="flex flex-col gap-2 sm:flex-row">
        <select
          name="ownerId"
          defaultValue={currentOwnerId ?? ""}
          className={selectClassName}
        >
          <option value="">Sin owner</option>
          {owners.map((owner) => (
            <option key={owner.id} value={owner.id}>
              {owner.label} - {owner.role}
            </option>
          ))}
        </select>
        <FormSubmitButton pendingLabel="Asignando..." size="sm">
          Asignar owner
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
