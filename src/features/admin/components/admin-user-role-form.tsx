"use client";

import { UserRole } from "@prisma/client";
import { useActionState } from "react";

import { FormSubmitButton } from "@/components/shared/form-submit-button";
import { updateUserRoleAction } from "@/features/admin/actions";
import { initialFormActionState } from "@/types/action-state";

const selectClassName =
  "flex h-9 w-full rounded-md border border-white/10 bg-slate-950/60 px-3 text-sm text-white outline-none transition-colors focus:border-cyan-300/40";

export function AdminUserRoleForm({
  userId,
  currentRole,
}: {
  userId: string;
  currentRole: UserRole;
}) {
  const [state, formAction] = useActionState(
    updateUserRoleAction,
    initialFormActionState,
  );

  return (
    <form action={formAction} className="space-y-2">
      <input type="hidden" name="userId" value={userId} />
      <div className="flex flex-col gap-2 sm:flex-row">
        <select
          name="role"
          defaultValue={currentRole}
          className={selectClassName}
        >
          {Object.values(UserRole).map((role) => (
            <option key={role} value={role}>
              {role}
            </option>
          ))}
        </select>
        <FormSubmitButton pendingLabel="Guardando..." size="sm">
          Cambiar rol
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
