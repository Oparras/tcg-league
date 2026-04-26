"use client";

import { useEffect, useRef } from "react";

import { showToast } from "@/lib/toast";
import type { FormActionState } from "@/types/action-state";

export function useActionToast(state: FormActionState) {
  const lastToastKeyRef = useRef<string | null>(null);

  useEffect(() => {
    if (!state.message || state.status === "idle") {
      return;
    }

    const toastKey = `${state.status}:${state.message}`;

    if (lastToastKeyRef.current === toastKey) {
      return;
    }

    lastToastKeyRef.current = toastKey;

    showToast({
      title: state.message,
      variant:
        state.status === "success"
          ? "success"
          : state.status === "error"
            ? "error"
            : "info",
    });
  }, [state.message, state.status]);
}
