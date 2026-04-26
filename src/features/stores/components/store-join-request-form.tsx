"use client";

import { useActionState } from "react";

import { FormSubmitButton } from "@/components/shared/form-submit-button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { createStoreJoinRequestAction } from "@/features/stores/actions";
import { initialFormActionState } from "@/types/action-state";

type StoreJoinRequestFormProps = {
  storeId: string;
  currentStatus?: "PENDING" | "ACCEPTED" | "REJECTED" | null;
};

function requestStatusLabel(status: StoreJoinRequestFormProps["currentStatus"]) {
  switch (status) {
    case "PENDING":
      return "Solicitud pendiente";
    case "ACCEPTED":
      return "Solicitud aceptada";
    case "REJECTED":
      return "Solicitud rechazada";
    default:
      return null;
  }
}

export function StoreJoinRequestForm({
  storeId,
  currentStatus,
}: StoreJoinRequestFormProps) {
  const [state, formAction] = useActionState(
    createStoreJoinRequestAction,
    initialFormActionState,
  );

  return (
    <Card className="border-white/10 bg-white/5 text-white">
      <CardHeader className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <CardTitle>Solicitud de union</CardTitle>
          {currentStatus ? (
            <Badge
              variant="outline"
              className="border-white/10 bg-white/5 text-white"
            >
              {requestStatusLabel(currentStatus)}
            </Badge>
          ) : null}
        </div>
        <p className="text-sm text-white/60">
          Envia una solicitud al owner para unirte a esta tienda competitiva.
        </p>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="storeId" value={storeId} />
          <Textarea
            name="message"
            rows={4}
            placeholder="Mensaje opcional para explicar por que quieres unirte."
          />
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
          <FormSubmitButton className="w-full" pendingLabel="Enviando solicitud...">
            {currentStatus === "REJECTED" ? "Volver a solicitar" : "Solicitar unirme"}
          </FormSubmitButton>
        </form>
      </CardContent>
    </Card>
  );
}
