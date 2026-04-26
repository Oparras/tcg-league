"use client";

import { CheckCircle2, Info, X, XCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import type { AppToastPayload, ToastVariant } from "@/lib/toast";

type RenderedToast = {
  id: string;
  title: string;
  description?: string;
  variant: ToastVariant;
  durationMs: number;
};

const variantClasses: Record<ToastVariant, string> = {
  success: "border-emerald-300/35 bg-emerald-300/15 text-emerald-50",
  error: "border-rose-300/35 bg-rose-300/15 text-rose-50",
  info: "border-white/20 bg-slate-900/95 text-white",
};

const variantIcon = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
} satisfies Record<ToastVariant, typeof Info>;

export function ToastCenter() {
  const [toasts, setToasts] = useState<RenderedToast[]>([]);

  useEffect(() => {
    const handleToast = (event: Event) => {
      const customEvent = event as CustomEvent<AppToastPayload>;
      const payload = customEvent.detail;

      if (!payload?.title) {
        return;
      }

      const nextToast: RenderedToast = {
        id: crypto.randomUUID(),
        title: payload.title,
        description: payload.description,
        variant: payload.variant ?? "info",
        durationMs: payload.durationMs ?? 3200,
      };

      setToasts((previous) => [...previous, nextToast].slice(-4));

      window.setTimeout(() => {
        setToasts((previous) => previous.filter((toast) => toast.id !== nextToast.id));
      }, nextToast.durationMs);
    };

    window.addEventListener("tcg-league:toast", handleToast as EventListener);
    return () => window.removeEventListener("tcg-league:toast", handleToast as EventListener);
  }, []);

  const hasToasts = useMemo(() => toasts.length > 0, [toasts.length]);

  if (!hasToasts) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-[100] flex justify-center px-4 sm:justify-end">
      <div className="w-full max-w-sm space-y-2">
        {toasts.map((toast) => {
          const Icon = variantIcon[toast.variant];

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto rounded-2xl border px-3 py-3 shadow-xl backdrop-blur transition-all ${variantClasses[toast.variant]}`}
            >
              <div className="flex items-start gap-3">
                <Icon className="mt-0.5 size-4 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{toast.title}</p>
                  {toast.description ? (
                    <p className="mt-1 text-xs opacity-90">{toast.description}</p>
                  ) : null}
                </div>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="h-6 w-6 rounded-full p-0 text-current hover:bg-white/10"
                  onClick={() =>
                    setToasts((previous) => previous.filter((item) => item.id !== toast.id))
                  }
                >
                  <X className="size-3.5" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
