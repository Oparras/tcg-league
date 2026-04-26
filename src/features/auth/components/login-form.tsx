"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginSchema, type LoginFormValues } from "@/lib/validations/auth";

export function LoginForm({
  githubEnabled,
  googleEnabled,
}: {
  githubEnabled: boolean;
  googleEnabled: boolean;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = form.handleSubmit((values) => {
    setError(null);

    startTransition(async () => {
      const response = await signIn("credentials", {
        email: values.email,
        password: values.password,
        redirect: false,
      });

      if (response?.error) {
        setError("Email o password incorrectos.");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    });
  });

  return (
    <div className="space-y-6">
      <form className="space-y-4" onSubmit={onSubmit}>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" {...form.register("email")} />
          {form.formState.errors.email ? (
            <p className="text-sm text-rose-300">
              {form.formState.errors.email.message}
            </p>
          ) : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" {...form.register("password")} />
          {form.formState.errors.password ? (
            <p className="text-sm text-rose-300">
              {form.formState.errors.password.message}
            </p>
          ) : null}
        </div>

        {error ? <p className="text-sm text-rose-300">{error}</p> : null}

        <Button className="w-full" disabled={isPending} type="submit">
          {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
          Entrar a TCG League
        </Button>
      </form>

      {githubEnabled || googleEnabled ? (
        <div className="space-y-3">
          <div className="text-center text-xs uppercase tracking-[0.2em] text-white/40">
            o continua con
          </div>
          <div className="grid gap-2">
            {githubEnabled ? (
              <Button
                variant="outline"
                className="border-white/10 bg-white/5 text-white hover:bg-white/10"
                onClick={() => signIn("github", { callbackUrl: "/dashboard" })}
                type="button"
              >
                GitHub
              </Button>
            ) : null}
            {googleEnabled ? (
              <Button
                variant="outline"
                className="border-white/10 bg-white/5 text-white hover:bg-white/10"
                onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
                type="button"
              >
                Google
              </Button>
            ) : null}
          </div>
        </div>
      ) : null}

      <p className="text-sm text-white/60">
        ¿Aun no tienes cuenta?{" "}
        <Link href="/register" className="text-cyan-300 hover:text-cyan-200">
          Crea tu perfil
        </Link>
      </p>
    </div>
  );
}
