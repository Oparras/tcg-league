"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  registerSchema,
  type RegisterFormValues,
} from "@/lib/validations/auth";

type RegisterFormProps = {
  stores: { id: string; name: string; city: string }[];
};

export function RegisterForm({ stores }: RegisterFormProps) {
  const router = useRouter();
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      nick: "",
      displayName: "",
      city: "",
      avatarUrl: "",
      primaryStoreId: "",
    },
  });

  const onSubmit = form.handleSubmit((values) => {
    setFeedback(null);

    startTransition(async () => {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      const payload = (await response.json()) as { message?: string };

      if (!response.ok) {
        setFeedback(payload.message ?? "No hemos podido crear la cuenta.");
        return;
      }

      const loginResponse = await signIn("credentials", {
        email: values.email,
        password: values.password,
        redirect: false,
      });

      if (loginResponse?.error) {
        router.push("/login");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    });
  });

  return (
    <form className="grid gap-4" onSubmit={onSubmit}>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="displayName">Nombre visible</Label>
          <Input id="displayName" {...form.register("displayName")} />
          {form.formState.errors.displayName ? (
            <p className="text-sm text-rose-300">
              {form.formState.errors.displayName.message}
            </p>
          ) : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="nick">Nick</Label>
          <Input id="nick" placeholder="LunaStorm" {...form.register("nick")} />
          {form.formState.errors.nick ? (
            <p className="text-sm text-rose-300">
              {form.formState.errors.nick.message}
            </p>
          ) : null}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
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
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="city">Ciudad</Label>
          <Input id="city" {...form.register("city")} />
          {form.formState.errors.city ? (
            <p className="text-sm text-rose-300">
              {form.formState.errors.city.message}
            </p>
          ) : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="avatarUrl">Foto de perfil (URL)</Label>
          <Input
            id="avatarUrl"
            placeholder="https://..."
            {...form.register("avatarUrl")}
          />
          {form.formState.errors.avatarUrl ? (
            <p className="text-sm text-rose-300">
              {form.formState.errors.avatarUrl.message}
            </p>
          ) : null}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Juego principal inicial</Label>
          <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/70">
            Tu perfil se crea con <span className="font-semibold text-white">Riftbound</span> por defecto.
            Podras cambiarlo mas adelante desde tu perfil.
          </div>
        </div>

        <div className="space-y-2">
          <Label>Tienda principal (opcional)</Label>
          <Controller
            control={form.control}
            name="primaryStoreId"
            render={({ field }) => (
              <Select
                onValueChange={(value) =>
                  field.onChange(value === "no-store" ? "" : value)
                }
                value={field.value || "no-store"}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una tienda" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no-store">Sin tienda principal</SelectItem>
                  {stores.map((store) => (
                    <SelectItem key={store.id} value={store.id}>
                      {store.name} - {store.city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </div>

      {feedback ? <p className="text-sm text-rose-300">{feedback}</p> : null}

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
        Crear cuenta y entrar
      </Button>
    </form>
  );
}
