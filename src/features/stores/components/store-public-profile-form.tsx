"use client";

import { useActionState } from "react";

import { FormSubmitButton } from "@/components/shared/form-submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateStorePublicProfileAction } from "@/features/stores/actions";
import { useActionToast } from "@/lib/hooks/use-action-toast";
import { initialFormActionState } from "@/types/action-state";

const fieldWrapperClassName = "space-y-2";
const checkboxClassName =
  "size-4 rounded border border-white/15 bg-slate-950/70 text-cyan-300";

export function StorePublicProfileForm({
  store,
  games,
}: {
  store: {
    id: string;
    city: string;
    region?: string | null;
    country?: string | null;
    address: string;
    description?: string | null;
    logoUrl?: string | null;
    bannerUrl?: string | null;
    websiteUrl?: string | null;
    officialLocatorUrl?: string | null;
    googleMapsUrl?: string | null;
    discordUrl?: string | null;
    instagramUrl?: string | null;
    supportedGames: {
      gameId: string;
    }[];
  };
  games: {
    id: string;
    name: string;
  }[];
}) {
  const [state, formAction] = useActionState(
    updateStorePublicProfileAction,
    initialFormActionState,
  );
  useActionToast(state);
  const selectedGames = new Set(store.supportedGames.map((item) => item.gameId));

  return (
    <form action={formAction} className="grid gap-4">
      <input type="hidden" name="storeId" value={store.id} />

      <div className="grid gap-4 md:grid-cols-2">
        <div className={fieldWrapperClassName}>
          <Label htmlFor="store-edit-city">Ciudad</Label>
          <Input id="store-edit-city" name="city" defaultValue={store.city} />
          {state.fieldErrors?.city?.[0] ? (
            <p className="text-xs text-rose-300">{state.fieldErrors.city[0]}</p>
          ) : null}
        </div>
        <div className={fieldWrapperClassName}>
          <Label htmlFor="store-edit-region">Provincia / Region</Label>
          <Input
            id="store-edit-region"
            name="region"
            defaultValue={store.region ?? ""}
          />
          {state.fieldErrors?.region?.[0] ? (
            <p className="text-xs text-rose-300">{state.fieldErrors.region[0]}</p>
          ) : null}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className={fieldWrapperClassName}>
          <Label htmlFor="store-edit-country">Pais</Label>
          <Input
            id="store-edit-country"
            name="country"
            defaultValue={store.country ?? ""}
          />
          {state.fieldErrors?.country?.[0] ? (
            <p className="text-xs text-rose-300">{state.fieldErrors.country[0]}</p>
          ) : null}
        </div>
        <div className={fieldWrapperClassName}>
          <Label htmlFor="store-edit-address">Direccion</Label>
          <Input
            id="store-edit-address"
            name="address"
            defaultValue={store.address}
          />
          {state.fieldErrors?.address?.[0] ? (
            <p className="text-xs text-rose-300">{state.fieldErrors.address[0]}</p>
          ) : null}
        </div>
      </div>

      <div className={fieldWrapperClassName}>
        <Label htmlFor="store-edit-description">Descripcion</Label>
        <Textarea
          id="store-edit-description"
          name="description"
          rows={4}
          defaultValue={store.description ?? ""}
        />
        {state.fieldErrors?.description?.[0] ? (
          <p className="text-xs text-rose-300">{state.fieldErrors.description[0]}</p>
        ) : null}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className={fieldWrapperClassName}>
          <Label htmlFor="store-edit-logoUrl">Logo URL</Label>
          <Input
            id="store-edit-logoUrl"
            name="logoUrl"
            placeholder="https://..."
            defaultValue={store.logoUrl ?? ""}
          />
          {state.fieldErrors?.logoUrl?.[0] ? (
            <p className="text-xs text-rose-300">{state.fieldErrors.logoUrl[0]}</p>
          ) : null}
        </div>
        <div className={fieldWrapperClassName}>
          <Label htmlFor="store-edit-bannerUrl">Banner URL</Label>
          <Input
            id="store-edit-bannerUrl"
            name="bannerUrl"
            placeholder="https://..."
            defaultValue={store.bannerUrl ?? ""}
          />
          {state.fieldErrors?.bannerUrl?.[0] ? (
            <p className="text-xs text-rose-300">{state.fieldErrors.bannerUrl[0]}</p>
          ) : null}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className={fieldWrapperClassName}>
          <Label htmlFor="store-edit-websiteUrl">Website URL</Label>
          <Input
            id="store-edit-websiteUrl"
            name="websiteUrl"
            placeholder="https://..."
            defaultValue={store.websiteUrl ?? ""}
          />
          {state.fieldErrors?.websiteUrl?.[0] ? (
            <p className="text-xs text-rose-300">{state.fieldErrors.websiteUrl[0]}</p>
          ) : null}
        </div>
        <div className={fieldWrapperClassName}>
          <Label htmlFor="store-edit-officialLocatorUrl">Official Locator URL</Label>
          <Input
            id="store-edit-officialLocatorUrl"
            name="officialLocatorUrl"
            placeholder="https://locator.riftbound.uvsgames.com/..."
            defaultValue={store.officialLocatorUrl ?? ""}
          />
          {state.fieldErrors?.officialLocatorUrl?.[0] ? (
            <p className="text-xs text-rose-300">
              {state.fieldErrors.officialLocatorUrl[0]}
            </p>
          ) : null}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className={fieldWrapperClassName}>
          <Label htmlFor="store-edit-googleMapsUrl">Google Maps URL</Label>
          <Input
            id="store-edit-googleMapsUrl"
            name="googleMapsUrl"
            placeholder="https://maps.google.com/..."
            defaultValue={store.googleMapsUrl ?? ""}
          />
          {state.fieldErrors?.googleMapsUrl?.[0] ? (
            <p className="text-xs text-rose-300">{state.fieldErrors.googleMapsUrl[0]}</p>
          ) : null}
        </div>
        <div className={fieldWrapperClassName}>
          <Label htmlFor="store-edit-discordUrl">Discord URL</Label>
          <Input
            id="store-edit-discordUrl"
            name="discordUrl"
            placeholder="https://discord.gg/..."
            defaultValue={store.discordUrl ?? ""}
          />
          {state.fieldErrors?.discordUrl?.[0] ? (
            <p className="text-xs text-rose-300">{state.fieldErrors.discordUrl[0]}</p>
          ) : null}
        </div>
      </div>

      <div className={fieldWrapperClassName}>
        <Label htmlFor="store-edit-instagramUrl">Instagram URL</Label>
        <Input
          id="store-edit-instagramUrl"
          name="instagramUrl"
          placeholder="https://instagram.com/..."
          defaultValue={store.instagramUrl ?? ""}
        />
        {state.fieldErrors?.instagramUrl?.[0] ? (
          <p className="text-xs text-rose-300">{state.fieldErrors.instagramUrl[0]}</p>
        ) : null}
      </div>

      <div className={fieldWrapperClassName}>
        <Label>Juegos soportados</Label>
        <div className="grid gap-3 rounded-2xl border border-white/10 bg-slate-950/40 p-4 md:grid-cols-2">
          {games.map((game) => (
            <label key={game.id} className="flex items-center gap-3 text-sm text-white/75">
              <input
                type="checkbox"
                name="gameIds"
                value={game.id}
                defaultChecked={selectedGames.has(game.id)}
                className={checkboxClassName}
              />
              <span>{game.name}</span>
            </label>
          ))}
        </div>
        {state.fieldErrors?.gameIds?.[0] ? (
          <p className="text-xs text-rose-300">{state.fieldErrors.gameIds[0]}</p>
        ) : null}
      </div>

      {state.message ? (
        <p
          className={
            state.status === "success" ? "text-sm text-emerald-300" : "text-sm text-rose-300"
          }
        >
          {state.message}
        </p>
      ) : null}

      <FormSubmitButton pendingLabel="Guardando tienda..." className="w-full md:w-fit">
        Guardar cambios
      </FormSubmitButton>
    </form>
  );
}
