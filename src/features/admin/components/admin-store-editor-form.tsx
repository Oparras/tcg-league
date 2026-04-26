"use client";

import { useActionState } from "react";

import { FormSubmitButton } from "@/components/shared/form-submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  createAdminStoreAction,
  updateAdminStoreAction,
} from "@/features/admin/actions";
import { useActionToast } from "@/lib/hooks/use-action-toast";
import { initialFormActionState } from "@/types/action-state";

type StoreEditorFormProps = {
  games: {
    id: string;
    name: string;
  }[];
} & (
  | {
      mode: "create";
      owners: {
        id: string;
        label: string;
      }[];
    }
  | {
      mode: "edit";
      store: {
        id: string;
        name: string;
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
        isVerified: boolean;
        supportedGames: {
          gameId: string;
        }[];
      };
    }
);

const fieldWrapperClassName = "space-y-2";
const checkboxClassName =
  "size-4 rounded border border-white/15 bg-slate-950/70 text-cyan-300";
const selectClassName =
  "flex h-9 w-full rounded-md border border-white/10 bg-slate-950/60 px-3 text-sm text-white outline-none transition-colors focus:border-cyan-300/40";

export function AdminStoreEditorForm(props: StoreEditorFormProps) {
  const action =
    props.mode === "create" ? createAdminStoreAction : updateAdminStoreAction;
  const [state, formAction] = useActionState(action, initialFormActionState);
  useActionToast(state);
  const selectedGames =
    props.mode === "edit"
      ? new Set(props.store.supportedGames.map((item) => item.gameId))
      : new Set<string>();

  return (
    <form action={formAction} className="grid gap-4">
      {props.mode === "edit" ? (
        <>
          <input type="hidden" name="storeId" value={props.store.id} />
          <input
            type="hidden"
            name="isVerified"
            value={String(props.store.isVerified)}
          />
        </>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <div className={fieldWrapperClassName}>
          <Label htmlFor={`${props.mode}-name`}>Nombre</Label>
          <Input
            id={`${props.mode}-name`}
            name="name"
            defaultValue={props.mode === "edit" ? props.store.name : ""}
          />
          {state.fieldErrors?.name?.[0] ? (
            <p className="text-xs text-rose-300">{state.fieldErrors.name[0]}</p>
          ) : null}
        </div>
        <div className={fieldWrapperClassName}>
          <Label htmlFor={`${props.mode}-city`}>Ciudad</Label>
          <Input
            id={`${props.mode}-city`}
            name="city"
            defaultValue={props.mode === "edit" ? props.store.city : ""}
          />
          {state.fieldErrors?.city?.[0] ? (
            <p className="text-xs text-rose-300">{state.fieldErrors.city[0]}</p>
          ) : null}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className={fieldWrapperClassName}>
          <Label htmlFor={`${props.mode}-region`}>Provincia / Region</Label>
          <Input
            id={`${props.mode}-region`}
            name="region"
            defaultValue={props.mode === "edit" ? props.store.region ?? "" : ""}
          />
          {state.fieldErrors?.region?.[0] ? (
            <p className="text-xs text-rose-300">{state.fieldErrors.region[0]}</p>
          ) : null}
        </div>
        <div className={fieldWrapperClassName}>
          <Label htmlFor={`${props.mode}-country`}>Pais</Label>
          <Input
            id={`${props.mode}-country`}
            name="country"
            defaultValue={props.mode === "edit" ? props.store.country ?? "" : ""}
          />
          {state.fieldErrors?.country?.[0] ? (
            <p className="text-xs text-rose-300">{state.fieldErrors.country[0]}</p>
          ) : null}
        </div>
      </div>

      <div className={fieldWrapperClassName}>
        <Label htmlFor={`${props.mode}-address`}>Direccion</Label>
        <Input
          id={`${props.mode}-address`}
          name="address"
          defaultValue={props.mode === "edit" ? props.store.address : ""}
        />
        {state.fieldErrors?.address?.[0] ? (
          <p className="text-xs text-rose-300">{state.fieldErrors.address[0]}</p>
        ) : null}
      </div>

      <div className={fieldWrapperClassName}>
        <Label htmlFor={`${props.mode}-logoUrl`}>Logo URL</Label>
        <Input
          id={`${props.mode}-logoUrl`}
          name="logoUrl"
          placeholder="https://..."
          defaultValue={props.mode === "edit" ? props.store.logoUrl ?? "" : ""}
        />
        {state.fieldErrors?.logoUrl?.[0] ? (
          <p className="text-xs text-rose-300">{state.fieldErrors.logoUrl[0]}</p>
        ) : null}
      </div>

      <div className={fieldWrapperClassName}>
        <Label htmlFor={`${props.mode}-bannerUrl`}>Banner URL</Label>
        <Input
          id={`${props.mode}-bannerUrl`}
          name="bannerUrl"
          placeholder="https://..."
          defaultValue={props.mode === "edit" ? props.store.bannerUrl ?? "" : ""}
        />
        {state.fieldErrors?.bannerUrl?.[0] ? (
          <p className="text-xs text-rose-300">{state.fieldErrors.bannerUrl[0]}</p>
        ) : null}
      </div>

      {props.mode === "create" ? (
        <div className={fieldWrapperClassName}>
          <Label htmlFor="create-ownerId">Owner inicial</Label>
          <select
            id="create-ownerId"
            name="ownerId"
            defaultValue=""
            className={selectClassName}
          >
            <option value="">Sin owner</option>
            {props.owners.map((owner) => (
              <option key={owner.id} value={owner.id}>
                {owner.label}
              </option>
            ))}
          </select>
          {state.fieldErrors?.ownerId?.[0] ? (
            <p className="text-xs text-rose-300">{state.fieldErrors.ownerId[0]}</p>
          ) : null}
        </div>
      ) : null}

      <div className={fieldWrapperClassName}>
        <Label htmlFor={`${props.mode}-description`}>Descripcion</Label>
        <Textarea
          id={`${props.mode}-description`}
          name="description"
          rows={4}
          defaultValue={props.mode === "edit" ? props.store.description ?? "" : ""}
        />
        {state.fieldErrors?.description?.[0] ? (
          <p className="text-xs text-rose-300">
            {state.fieldErrors.description[0]}
          </p>
        ) : null}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className={fieldWrapperClassName}>
          <Label htmlFor={`${props.mode}-websiteUrl`}>Website URL</Label>
          <Input
            id={`${props.mode}-websiteUrl`}
            name="websiteUrl"
            placeholder="https://..."
            defaultValue={props.mode === "edit" ? props.store.websiteUrl ?? "" : ""}
          />
          {state.fieldErrors?.websiteUrl?.[0] ? (
            <p className="text-xs text-rose-300">{state.fieldErrors.websiteUrl[0]}</p>
          ) : null}
        </div>
        <div className={fieldWrapperClassName}>
          <Label htmlFor={`${props.mode}-officialLocatorUrl`}>Official Locator URL</Label>
          <Input
            id={`${props.mode}-officialLocatorUrl`}
            name="officialLocatorUrl"
            placeholder="https://locator.riftbound.uvsgames.com/..."
            defaultValue={props.mode === "edit" ? props.store.officialLocatorUrl ?? "" : ""}
          />
          {state.fieldErrors?.officialLocatorUrl?.[0] ? (
            <p className="text-xs text-rose-300">{state.fieldErrors.officialLocatorUrl[0]}</p>
          ) : null}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className={fieldWrapperClassName}>
          <Label htmlFor={`${props.mode}-googleMapsUrl`}>Google Maps URL</Label>
          <Input
            id={`${props.mode}-googleMapsUrl`}
            name="googleMapsUrl"
            placeholder="https://maps.google.com/..."
            defaultValue={props.mode === "edit" ? props.store.googleMapsUrl ?? "" : ""}
          />
          {state.fieldErrors?.googleMapsUrl?.[0] ? (
            <p className="text-xs text-rose-300">{state.fieldErrors.googleMapsUrl[0]}</p>
          ) : null}
        </div>
        <div className={fieldWrapperClassName}>
          <Label htmlFor={`${props.mode}-discordUrl`}>Discord URL</Label>
          <Input
            id={`${props.mode}-discordUrl`}
            name="discordUrl"
            placeholder="https://discord.gg/..."
            defaultValue={props.mode === "edit" ? props.store.discordUrl ?? "" : ""}
          />
          {state.fieldErrors?.discordUrl?.[0] ? (
            <p className="text-xs text-rose-300">{state.fieldErrors.discordUrl[0]}</p>
          ) : null}
        </div>
      </div>

      <div className={fieldWrapperClassName}>
        <Label htmlFor={`${props.mode}-instagramUrl`}>Instagram URL</Label>
        <Input
          id={`${props.mode}-instagramUrl`}
          name="instagramUrl"
          placeholder="https://instagram.com/..."
          defaultValue={props.mode === "edit" ? props.store.instagramUrl ?? "" : ""}
        />
        {state.fieldErrors?.instagramUrl?.[0] ? (
          <p className="text-xs text-rose-300">{state.fieldErrors.instagramUrl[0]}</p>
        ) : null}
      </div>

      <div className={fieldWrapperClassName}>
        <Label>Juegos soportados</Label>
        <div className="grid gap-3 rounded-2xl border border-white/10 bg-slate-950/40 p-4 md:grid-cols-2">
          {props.games.map((game) => (
            <label
              key={game.id}
              className="flex items-center gap-3 text-sm text-white/75"
            >
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
            state.status === "success"
              ? "text-sm text-emerald-300"
              : "text-sm text-rose-300"
          }
        >
          {state.message}
        </p>
      ) : null}

      <FormSubmitButton
        pendingLabel={
          props.mode === "create" ? "Creando tienda..." : "Guardando tienda..."
        }
        className="w-full md:w-fit"
      >
        {props.mode === "create" ? "Crear tienda" : "Guardar tienda"}
      </FormSubmitButton>
    </form>
  );
}
