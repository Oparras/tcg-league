"use client";

import { useActionState } from "react";

import { FormSubmitButton } from "@/components/shared/form-submit-button";
import { Textarea } from "@/components/ui/textarea";
import { sendChatMessageAction } from "@/features/chat/actions";
import { useActionToast } from "@/lib/hooks/use-action-toast";
import { initialFormActionState } from "@/types/action-state";

export function ChatMessageForm({ chatId }: { chatId: string }) {
  const [state, formAction] = useActionState(
    sendChatMessageAction,
    initialFormActionState,
  );
  useActionToast(state);

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="chatId" value={chatId} />
      <Textarea
        name="content"
        rows={3}
        placeholder="Escribe un mensaje..."
        className="border-white/10 bg-slate-950/50 text-white"
      />
      <div className="flex flex-wrap items-center justify-between gap-2">
        <FormSubmitButton pendingLabel="Enviando...">Enviar mensaje</FormSubmitButton>
        {state.message ? (
          <p
            className={
              state.status === "success" ? "text-xs text-emerald-300" : "text-xs text-rose-300"
            }
          >
            {state.message}
          </p>
        ) : null}
      </div>
    </form>
  );
}
