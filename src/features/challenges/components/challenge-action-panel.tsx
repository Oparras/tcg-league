"use client";

import Link from "next/link";
import { useActionState } from "react";

import { FormSubmitButton } from "@/components/shared/form-submit-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { respondChallengeAction } from "@/features/challenges/actions";
import { useActionToast } from "@/lib/hooks/use-action-toast";
import { initialFormActionState } from "@/types/action-state";

export function ChallengeActionPanel({
  challengeId,
  canAccept,
  canReject,
  canCounter,
  canAcceptCounter,
  canCancel,
  matchId,
}: {
  challengeId: string;
  canAccept?: boolean;
  canReject?: boolean;
  canCounter?: boolean;
  canAcceptCounter?: boolean;
  canCancel?: boolean;
  matchId?: string | null;
}) {
  const [state, formAction] = useActionState(
    respondChallengeAction,
    initialFormActionState,
  );
  useActionToast(state);

  return (
    <div className="space-y-3">
      <form action={formAction} className="space-y-3">
        <input type="hidden" name="challengeId" value={challengeId} />

        <div className="flex flex-wrap gap-2">
          {canAccept ? (
            <FormSubmitButton name="intent" value="accept" pendingLabel="Actualizando..." size="sm">
              Aceptar
            </FormSubmitButton>
          ) : null}
          {canReject ? (
            <FormSubmitButton
              name="intent"
              value="reject"
              pendingLabel="Actualizando..."
              size="sm"
              variant="destructive"
            >
              Rechazar
            </FormSubmitButton>
          ) : null}
          {canAcceptCounter ? (
            <FormSubmitButton
              name="intent"
              value="acceptCounter"
              pendingLabel="Confirmando..."
              size="sm"
            >
              Aceptar nueva fecha
            </FormSubmitButton>
          ) : null}
          {canCancel ? (
            <FormSubmitButton
              name="intent"
              value="cancel"
              pendingLabel="Cancelando..."
              size="sm"
              variant="destructive"
            >
              Cancelar
            </FormSubmitButton>
          ) : null}
          {matchId ? (
            <Button
              asChild
              variant="outline"
              size="sm"
              className="border-white/10 bg-white/5 text-white hover:bg-white/10"
            >
              <Link href={`/matches/${matchId}`}>Ver match</Link>
            </Button>
          ) : null}
        </div>

        {canCounter ? (
          <div className="grid gap-3 md:grid-cols-[1fr_auto]">
            <Input name="counterProposedFor" type="datetime-local" />
            <FormSubmitButton name="intent" value="counter" pendingLabel="Enviando...">
              Proponer nueva fecha
            </FormSubmitButton>
          </div>
        ) : null}
      </form>

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
    </div>
  );
}
