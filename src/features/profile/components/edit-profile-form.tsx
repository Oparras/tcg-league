"use client";

import { useActionState, useState } from "react";

import { FormSubmitButton } from "@/components/shared/form-submit-button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { updateProfileAction } from "@/features/profile/actions";
import { useActionToast } from "@/lib/hooks/use-action-toast";
import { initialFormActionState } from "@/types/action-state";

type EditProfileFormProps = {
  defaultValues: {
    nick: string;
    displayName: string;
    avatarUrl?: string | null;
    city: string;
    bio?: string | null;
    mainGameId?: string | null;
    availabilityStatus: "AVAILABLE" | "UNAVAILABLE";
  };
  games: { id: string; name: string }[];
  title?: string;
  description?: string;
  badgeLabel?: string;
  submitLabel?: string;
  redirectTo?: string;
};

export function EditProfileForm({
  defaultValues,
  games,
  title = "Editar perfil",
  description = "Cambia tu identidad visible y el estado con el que apareces en la liga.",
  badgeLabel = "Solo tu",
  submitLabel = "Guardar cambios",
  redirectTo,
}: EditProfileFormProps) {
  const [state, formAction] = useActionState(
    updateProfileAction,
    initialFormActionState,
  );
  useActionToast(state);
  const [mainGameId, setMainGameId] = useState(
    defaultValues.mainGameId ?? games[0]?.id ?? "",
  );
  const [availabilityStatus, setAvailabilityStatus] = useState(
    defaultValues.availabilityStatus,
  );

  return (
    <Card className="border-white/10 bg-white/5 text-white">
      <CardHeader className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle>{title}</CardTitle>
            <p className="mt-1 text-sm text-white/60">
              {description}
            </p>
          </div>
          <Badge
            variant="outline"
            className="border-cyan-300/30 bg-cyan-300/10 text-cyan-100"
          >
            {badgeLabel}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="grid gap-4">
          {redirectTo ? <input type="hidden" name="redirectTo" value={redirectTo} /> : null}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="nick">Nick</Label>
              <Input defaultValue={defaultValues.nick} id="nick" name="nick" />
              {state.fieldErrors?.nick?.[0] ? (
                <p className="text-sm text-rose-300">{state.fieldErrors.nick[0]}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="displayName">Nombre visible</Label>
              <Input
                defaultValue={defaultValues.displayName}
                id="displayName"
                name="displayName"
              />
              {state.fieldErrors?.displayName?.[0] ? (
                <p className="text-sm text-rose-300">
                  {state.fieldErrors.displayName[0]}
                </p>
              ) : null}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="city">Ciudad</Label>
              <Input defaultValue={defaultValues.city} id="city" name="city" />
              {state.fieldErrors?.city?.[0] ? (
                <p className="text-sm text-rose-300">{state.fieldErrors.city[0]}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="avatarUrl">Avatar URL</Label>
              <Input
                defaultValue={defaultValues.avatarUrl ?? ""}
                id="avatarUrl"
                name="avatarUrl"
                placeholder="https://..."
              />
              {state.fieldErrors?.avatarUrl?.[0] ? (
                <p className="text-sm text-rose-300">
                  {state.fieldErrors.avatarUrl[0]}
                </p>
              ) : null}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Juego principal</Label>
              <input type="hidden" name="mainGameId" value={mainGameId} />
              <Select onValueChange={setMainGameId} value={mainGameId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un juego" />
                </SelectTrigger>
                <SelectContent>
                  {games.map((game) => (
                    <SelectItem key={game.id} value={game.id}>
                      {game.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {state.fieldErrors?.mainGameId?.[0] ? (
                <p className="text-sm text-rose-300">
                  {state.fieldErrors.mainGameId[0]}
                </p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label>Disponibilidad</Label>
              <input
                type="hidden"
                name="availabilityStatus"
                value={availabilityStatus}
              />
              <Select
                onValueChange={(value) =>
                  setAvailabilityStatus(value as "AVAILABLE" | "UNAVAILABLE")
                }
                value={availabilityStatus}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AVAILABLE">Disponible</SelectItem>
                  <SelectItem value="UNAVAILABLE">No disponible</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              defaultValue={defaultValues.bio ?? ""}
              id="bio"
              name="bio"
              placeholder="Tu estilo de juego, formatos favoritos o disponibilidad."
              rows={4}
            />
            {state.fieldErrors?.bio?.[0] ? (
              <p className="text-sm text-rose-300">{state.fieldErrors.bio[0]}</p>
            ) : null}
          </div>

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

          <FormSubmitButton className="w-full md:w-fit" pendingLabel="Guardando perfil...">
            {submitLabel}
          </FormSubmitButton>
        </form>
      </CardContent>
    </Card>
  );
}
