"use client";

import { Loader2 } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";

type FormSubmitButtonProps = {
  children: ReactNode;
  pendingLabel?: string;
} & Omit<ComponentProps<typeof Button>, "children" | "type" | "disabled">;

export function FormSubmitButton({
  children,
  pendingLabel,
  className,
  variant,
  size,
  ...props
}: FormSubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      disabled={pending}
      className={className}
      variant={variant}
      size={size}
      {...props}
    >
      {pending ? <Loader2 className="size-4 animate-spin" /> : null}
      {pending ? pendingLabel ?? "Guardando..." : children}
    </Button>
  );
}
