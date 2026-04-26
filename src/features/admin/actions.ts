"use server";

import {
  MembershipStatus,
  NotificationType,
  StoreMembershipRole,
  UserRole,
  type Prisma,
} from "@prisma/client";
import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth/permissions";
import { getDb } from "@/lib/db";
import {
  assignStoreOwnerSchema,
  createAdminStoreSchema,
  toggleStoreVerificationSchema,
  updateAdminStoreSchema,
  updateUserRoleSchema,
} from "@/lib/validations/admin";
import { slugify } from "@/lib/utils";
import type { FormActionState } from "@/types/action-state";

async function buildUniqueStoreSlug(
  name: string,
  options?: { excludeStoreId?: string },
) {
  const db = getDb();
  const baseSlug = slugify(name) || "store";
  let slug = baseSlug;
  let suffix = 1;

  while (true) {
    const existing = await db.store.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!existing || existing.id === options?.excludeStoreId) {
      return slug;
    }

    suffix += 1;
    slug = `${baseSlug}-${suffix}`.slice(0, 60);
  }
}

async function ensureGamesExist(gameIds: string[]) {
  const db = getDb();
  const count = await db.game.count({
    where: {
      id: {
        in: gameIds,
      },
      isActive: true,
    },
  });

  return count === new Set(gameIds).size;
}

async function syncStoreOwnerAssignment(
  tx: Prisma.TransactionClient,
  input: {
    storeId: string;
    newOwnerId?: string;
    previousOwnerId?: string | null;
  },
) {
  if (input.previousOwnerId && input.previousOwnerId !== input.newOwnerId) {
    await tx.storeMembership.updateMany({
      where: {
        userId: input.previousOwnerId,
        storeId: input.storeId,
        role: StoreMembershipRole.OWNER,
      },
      data: {
        role: StoreMembershipRole.MEMBER,
        isPrimary: false,
      },
    });
  }

  if (!input.newOwnerId) {
    return;
  }

  const owner = await tx.user.findUnique({
    where: { id: input.newOwnerId },
    select: {
      id: true,
      role: true,
      playerProfile: {
        select: {
          id: true,
          primaryStoreId: true,
        },
      },
    },
  });

  if (!owner) {
    throw new Error("OWNER_NOT_FOUND");
  }

  const shouldSetPrimaryStore = !owner.playerProfile?.primaryStoreId;
  const isPrimaryMembership =
    owner.playerProfile?.primaryStoreId === input.storeId || shouldSetPrimaryStore;

  if (owner.role === UserRole.PLAYER) {
    await tx.user.update({
      where: { id: owner.id },
      data: {
        role: UserRole.STORE_OWNER,
      },
    });
  }

  await tx.storeMembership.upsert({
    where: {
      userId_storeId: {
        userId: owner.id,
        storeId: input.storeId,
      },
    },
        update: {
      status: MembershipStatus.ACTIVE,
      role: StoreMembershipRole.OWNER,
      leftAt: null,
      isPrimary: isPrimaryMembership,
    },
    create: {
      userId: owner.id,
      storeId: input.storeId,
      status: MembershipStatus.ACTIVE,
      role: StoreMembershipRole.OWNER,
      isPrimary: isPrimaryMembership,
    },
  });

  if (shouldSetPrimaryStore && owner.playerProfile) {
    await tx.playerProfile.update({
      where: { id: owner.playerProfile.id },
      data: {
        primaryStoreId: input.storeId,
      },
    });
  }
}

export async function updateUserRoleAction(
  _previousState: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  const session = await requireAdmin();
  const parsed = updateUserRoleSchema.safeParse({
    userId: formData.get("userId"),
    role: formData.get("role"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "No hemos podido actualizar el rol.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const db = getDb();
  const targetUser = await db.user.findUnique({
    where: { id: parsed.data.userId },
    select: {
      id: true,
      role: true,
      ownedStores: {
        select: {
          id: true,
        },
      },
      playerProfile: {
        select: {
          displayName: true,
          nick: true,
        },
      },
      email: true,
    },
  });

  if (!targetUser) {
    return {
      status: "error",
      message: "Ese usuario ya no existe.",
    };
  }

  if (targetUser.id === session.user.id) {
    return {
      status: "error",
      message: "No puedes cambiar tu propio rol desde este panel.",
    };
  }

  if (parsed.data.role === UserRole.PLAYER && targetUser.ownedStores.length > 0) {
    return {
      status: "error",
      message: "Reasigna primero las tiendas que pertenecen a este usuario.",
    };
  }

  if (targetUser.role === UserRole.ADMIN && parsed.data.role !== UserRole.ADMIN) {
    const adminCount = await db.user.count({
      where: {
        role: UserRole.ADMIN,
      },
    });

    if (adminCount <= 1) {
      return {
        status: "error",
        message: "No puedes quitar el ultimo admin de la plataforma.",
      };
    }
  }

  await db.user.update({
    where: { id: targetUser.id },
    data: {
      role: parsed.data.role,
    },
  });

  revalidatePath("/admin");
  revalidatePath("/dashboard");

  return {
    status: "success",
    message: `Rol actualizado para ${targetUser.playerProfile?.displayName ?? targetUser.playerProfile?.nick ?? targetUser.email}.`,
  };
}

export async function assignStoreOwnerAction(
  _previousState: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  await requireAdmin();
  const parsed = assignStoreOwnerSchema.safeParse({
    storeId: formData.get("storeId"),
    ownerId: formData.get("ownerId"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "No hemos podido asignar el owner.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const db = getDb();
  const [store, owner] = await Promise.all([
    db.store.findUnique({
      where: { id: parsed.data.storeId },
      select: {
        id: true,
        slug: true,
        name: true,
        ownerId: true,
      },
    }),
    parsed.data.ownerId
      ? db.user.findUnique({
          where: { id: parsed.data.ownerId },
          select: {
            id: true,
            email: true,
            playerProfile: {
              select: {
                displayName: true,
                nick: true,
              },
            },
          },
        })
      : Promise.resolve(null),
  ]);

  if (!store) {
    return {
      status: "error",
      message: "La tienda seleccionada no existe.",
    };
  }

  if (parsed.data.ownerId && !owner) {
    return {
      status: "error",
      message: "El owner seleccionado no existe.",
    };
  }

  try {
    await db.$transaction(async (tx) => {
      await tx.store.update({
        where: { id: store.id },
        data: {
          ownerId: parsed.data.ownerId ?? null,
        },
      });

      await syncStoreOwnerAssignment(tx, {
        storeId: store.id,
        newOwnerId: parsed.data.ownerId,
        previousOwnerId: store.ownerId,
      });

      if (parsed.data.ownerId) {
        await tx.notification.create({
          data: {
            userId: parsed.data.ownerId,
            type: NotificationType.SYSTEM,
            title: "Nueva tienda asignada",
            body: `Ahora gestionas la tienda ${store.name}.`,
            link: `/stores/${store.slug}`,
          },
        });
      }
    });
  } catch (error) {
    console.error(error);

    return {
      status: "error",
      message: "No hemos podido asignar el owner a esta tienda.",
    };
  }

  revalidatePath("/admin");
  revalidatePath("/dashboard");
  revalidatePath(`/stores/${store.slug}`);
  revalidatePath(`/stores/${store.slug}/requests`);

  return {
    status: "success",
    message: parsed.data.ownerId
      ? `Owner asignado: ${owner?.playerProfile?.displayName ?? owner?.playerProfile?.nick ?? owner?.email}.`
      : "La tienda ha quedado sin owner asignado.",
  };
}

export async function toggleStoreVerificationAction(
  _previousState: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  await requireAdmin();
  const parsed = toggleStoreVerificationSchema.safeParse({
    storeId: formData.get("storeId"),
    isVerified: formData.get("isVerified"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "No hemos podido actualizar la validacion.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const db = getDb();
  const store = await db.store.update({
    where: { id: parsed.data.storeId },
    data: {
      isVerified: parsed.data.isVerified,
    },
    select: {
      slug: true,
      name: true,
      isVerified: true,
    },
  });

  revalidatePath("/admin");
  revalidatePath("/stores");
  revalidatePath(`/stores/${store.slug}`);

  return {
    status: "success",
    message: store.isVerified
      ? `${store.name} ha quedado validada.`
      : `${store.name} ha quedado sin validacion.`,
  };
}

export async function createAdminStoreAction(
  _previousState: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  await requireAdmin();
  const parsed = createAdminStoreSchema.safeParse({
    name: formData.get("name"),
    city: formData.get("city"),
    region: formData.get("region"),
    country: formData.get("country"),
    address: formData.get("address"),
    description: formData.get("description"),
    logoUrl: formData.get("logoUrl"),
    bannerUrl: formData.get("bannerUrl"),
    websiteUrl: formData.get("websiteUrl"),
    officialLocatorUrl: formData.get("officialLocatorUrl"),
    googleMapsUrl: formData.get("googleMapsUrl"),
    discordUrl: formData.get("discordUrl"),
    instagramUrl: formData.get("instagramUrl"),
    ownerId: formData.get("ownerId"),
    gameIds: formData.getAll("gameIds"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "No hemos podido crear la tienda.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  if (!(await ensureGamesExist(parsed.data.gameIds))) {
    return {
      status: "error",
      message: "Uno de los juegos seleccionados no existe.",
    };
  }

  const db = getDb();
  const slug = await buildUniqueStoreSlug(parsed.data.name);

  let storeName = parsed.data.name;

  try {
    await db.$transaction(async (tx) => {
      const store = await tx.store.create({
        data: {
          name: parsed.data.name,
          slug,
          city: parsed.data.city,
          region: parsed.data.region,
          country: parsed.data.country,
          address: parsed.data.address,
          description: parsed.data.description,
          logoUrl: parsed.data.logoUrl,
          bannerUrl: parsed.data.bannerUrl,
          websiteUrl: parsed.data.websiteUrl,
          officialLocatorUrl: parsed.data.officialLocatorUrl,
          googleMapsUrl: parsed.data.googleMapsUrl,
          discordUrl: parsed.data.discordUrl,
          instagramUrl: parsed.data.instagramUrl,
          ownerId: parsed.data.ownerId ?? null,
        },
      });

      storeName = store.name;

      await tx.storeGame.createMany({
        data: parsed.data.gameIds.map((gameId, index) => ({
          storeId: store.id,
          gameId,
          isFeatured: index === 0,
        })),
      });

      await syncStoreOwnerAssignment(tx, {
        storeId: store.id,
        newOwnerId: parsed.data.ownerId,
      });
    });
  } catch (error) {
    console.error(error);

    return {
      status: "error",
      message: "No hemos podido crear la tienda en este momento.",
    };
  }

  revalidatePath("/admin");
  revalidatePath("/stores");
  revalidatePath("/dashboard");

  return {
    status: "success",
    message: `Tienda creada correctamente: ${storeName}.`,
  };
}

export async function updateAdminStoreAction(
  _previousState: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  await requireAdmin();
  const parsed = updateAdminStoreSchema.safeParse({
    storeId: formData.get("storeId"),
    name: formData.get("name"),
    city: formData.get("city"),
    region: formData.get("region"),
    country: formData.get("country"),
    address: formData.get("address"),
    description: formData.get("description"),
    logoUrl: formData.get("logoUrl"),
    bannerUrl: formData.get("bannerUrl"),
    websiteUrl: formData.get("websiteUrl"),
    officialLocatorUrl: formData.get("officialLocatorUrl"),
    googleMapsUrl: formData.get("googleMapsUrl"),
    discordUrl: formData.get("discordUrl"),
    instagramUrl: formData.get("instagramUrl"),
    ownerId: formData.get("ownerId"),
    isVerified: formData.get("isVerified"),
    gameIds: formData.getAll("gameIds"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "No hemos podido guardar la tienda.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  if (!(await ensureGamesExist(parsed.data.gameIds))) {
    return {
      status: "error",
      message: "Uno de los juegos seleccionados no existe.",
    };
  }

  const db = getDb();
  const existingStore = await db.store.findUnique({
    where: { id: parsed.data.storeId },
    select: {
      id: true,
      slug: true,
      ownerId: true,
      name: true,
    },
  });

  if (!existingStore) {
    return {
      status: "error",
      message: "La tienda seleccionada ya no existe.",
    };
  }

  try {
    await db.$transaction(async (tx) => {
      await tx.store.update({
        where: { id: existingStore.id },
        data: {
          name: parsed.data.name,
          city: parsed.data.city,
          region: parsed.data.region,
          country: parsed.data.country,
          address: parsed.data.address,
          description: parsed.data.description,
          logoUrl: parsed.data.logoUrl,
          bannerUrl: parsed.data.bannerUrl,
          websiteUrl: parsed.data.websiteUrl,
          officialLocatorUrl: parsed.data.officialLocatorUrl,
          googleMapsUrl: parsed.data.googleMapsUrl,
          discordUrl: parsed.data.discordUrl,
          instagramUrl: parsed.data.instagramUrl,
          ownerId: parsed.data.ownerId ?? null,
          isVerified: parsed.data.isVerified,
        },
      });

      await tx.storeGame.deleteMany({
        where: {
          storeId: existingStore.id,
        },
      });

      await tx.storeGame.createMany({
        data: parsed.data.gameIds.map((gameId, index) => ({
          storeId: existingStore.id,
          gameId,
          isFeatured: index === 0,
        })),
      });

      await syncStoreOwnerAssignment(tx, {
        storeId: existingStore.id,
        newOwnerId: parsed.data.ownerId,
        previousOwnerId: existingStore.ownerId,
      });
    });
  } catch (error) {
    console.error(error);

    return {
      status: "error",
      message: "No hemos podido actualizar la tienda.",
    };
  }

  revalidatePath("/admin");
  revalidatePath("/stores");
  revalidatePath("/dashboard");
  revalidatePath(`/stores/${existingStore.slug}`);
  revalidatePath(`/stores/${existingStore.slug}/requests`);

  return {
    status: "success",
    message: `Tienda actualizada: ${parsed.data.name}.`,
  };
}
