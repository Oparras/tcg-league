"use client";

export type ToastVariant = "success" | "error" | "info";

export type AppToastPayload = {
  title: string;
  description?: string;
  variant?: ToastVariant;
  durationMs?: number;
};

export function showToast(payload: AppToastPayload) {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(
    new CustomEvent<AppToastPayload>("tcg-league:toast", {
      detail: payload,
    }),
  );
}
