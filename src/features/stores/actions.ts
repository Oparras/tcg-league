"use server";

import {
  MembershipStatus,
  NotificationType,
  StoreJoinRequestStatus,
  StoreMembershipRole,
} from "@prisma/client";
import { revalidatePath } from "next/cache";

import {
  getStoreOwnerOrAdminAccess,
  requireAuth,
} from "@/lib/auth/permissions";
import { getDb } from "@/lib/db";
import {
  createStoreJoinRequestSchema,
  reviewStoreJoinRequestSchema,
  updateStorePublicProfileSchema,
} from "@/lib/validations/stores";
import type { FormActionState } from "@/types/action-state";

export async function createStoreJoinRequestAction(
  _previousState: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  const session = await requireAuth();
  const parsed = createStoreJoinRequestSchema.safeParse({
    storeId: formData.get("storeId"),
    message: formData.get("message"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "No hemos podido enviar la solicitud.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const db = getDb();
  const [user, store, existingMembership, existingRequest] = await Promise.all([
    db.user.findUnique({
      where: { id: session.user.id },
      include: { playerProfile: true },
    }),
    db.store.findUnique({
      where: { id: parsed.data.storeId },
      select: {
        id: true,
        slug: true,
        name: true,
        ownerId: true,
      },
    }),
    db.storeMembership.findUnique({
      where: {
        userId_storeId: {
          userId: session.user.id,
          storeId: parsed.data.storeId,
        },
      },
    }),
    db.storeJoinRequest.findUnique({
      where: {
        userId_storeId: {
          userId: session.user.id,
          storeId: parsed.data.storeId,
        },
      },
    }),
  ]);

  if (!user?.playerProfile) {
    return {
      status: "error",
      message: "Completa primero tu perfil de jugador.",
    };
  }

  const requesterDisplayName = user.playerProfile.displayName;

  if (!store) {
    return {
      status: "error",
      message: "La tienda seleccionada no existe.",
    };
  }

  if (existingMembership?.status === MembershipStatus.ACTIVE) {
    return {
      status: "error",
      message: "Ya perteneces a esta tienda.",
    };
  }

  if (existingRequest?.status === StoreJoinRequestStatus.PENDING) {
    return {
      status: "error",
      message: "Ya tienes una solicitud pendiente para esta tienda.",
    };
  }

  await db.$transaction(async (tx) => {
    if (existingRequest) {
      await tx.storeJoinRequest.update({
        where: { id: existingRequest.id },
        data: {
          status: StoreJoinRequestStatus.PENDING,
          message: parsed.data.message,
          respondedAt: null,
          respondedById: null,
          requestedAt: new Date(),
        },
      });
    } else {
      await tx.storeJoinRequest.create({
        data: {
          userId: session.user.id,
          storeId: store.id,
          status: StoreJoinRequestStatus.PENDING,
          message: parsed.data.message,
        },
      });
    }

    if (store.ownerId) {
      await tx.notification.create({
        data: {
          userId: store.ownerId,
          actorId: session.user.id,
          type: NotificationType.STORE_REQUEST,
          title: "Nueva solicitud de tienda",
          body: `${requesterDisplayName} ha solicitado unirse a ${store.name}.`,
          link: `/stores/${store.slug}/requests`,
        },
      });
    }
  });

  revalidatePath("/stores");
  revalidatePath(`/stores/${store.slug}`);
  revalidatePath(`/stores/${store.slug}/requests`);

  return {
    status: "success",
    message: "Solicitud enviada correctamente.",
  };
}

export async function reviewStoreJoinRequestAction(
  _previousState: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  const parsed = reviewStoreJoinRequestSchema.safeParse({
    requestId: formData.get("requestId"),
    decision: formData.get("decision"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "No hemos podido procesar la solicitud.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const db = getDb();
  const request = await db.storeJoinRequest.findUnique({
    where: { id: parsed.data.requestId },
    include: {
      store: {
        select: {
          id: true,
          slug: true,
          name: true,
          ownerId: true,
        },
      },
      user: {
        select: {
          id: true,
          playerProfile: {
            select: {
              id: true,
              displayName: true,
              primaryStoreId: true,
            },
          },
        },
      },
    },
  });

  if (!request) {
    return {
      status: "error",
      message: "La solicitud ya no existe.",
    };
  }

  const access = await getStoreOwnerOrAdminAccess(request.storeId);

  if (!access.hasAccess) {
    return {
      status: "error",
      message: "No tienes permisos para gestionar esta tienda.",
    };
  }

  if (request.status !== StoreJoinRequestStatus.PENDING) {
    return {
      status: "error",
      message: "Esta solicitud ya fue resuelta anteriormente.",
    };
  }

  const respondedAt = new Date();

  await db.$transaction(async (tx) => {
    if (parsed.data.decision === "accept") {
      const hasPrimaryStore = Boolean(request.user.playerProfile?.primaryStoreId);
      const membershipShouldBePrimary =
        request.user.playerProfile?.primaryStoreId === request.storeId ||
        !hasPrimaryStore;

      await tx.storeMembership.upsert({
        where: {
          userId_storeId: {
            userId: request.userId,
            storeId: request.storeId,
          },
        },
        update: {
          status: MembershipStatus.ACTIVE,
          role: StoreMembershipRole.MEMBER,
          leftAt: null,
          isPrimary: membershipShouldBePrimary,
        },
        create: {
          userId: request.userId,
          storeId: request.storeId,
          status: MembershipStatus.ACTIVE,
          role: StoreMembershipRole.MEMBER,
          isPrimary: membershipShouldBePrimary,
        },
      });

      if (!hasPrimaryStore && request.user.playerProfile) {
        await tx.playerProfile.update({
          where: { id: request.user.playerProfile.id },
          data: {
            primaryStoreId: request.storeId,
          },
        });
      }

      await tx.storeJoinRequest.update({
        where: { id: request.id },
        data: {
          status: StoreJoinRequestStatus.ACCEPTED,
          respondedById: access.session.user.id,
          respondedAt,
        },
      });

      await tx.notification.create({
        data: {
          userId: request.userId,
          actorId: access.session.user.id,
          type: NotificationType.STORE_REQUEST_RESOLVED,
          title: "Solicitud aceptada",
          body: `Tu solicitud para ${request.store.name} ha sido aceptada.`,
          link: `/stores/${request.store.slug}`,
        },
      });
    } else {
      await tx.storeJoinRequest.update({
        where: { id: request.id },
        data: {
          status: StoreJoinRequestStatus.REJECTED,
          respondedById: access.session.user.id,
          respondedAt,
        },
      });

      await tx.notification.create({
        data: {
          userId: request.userId,
          actorId: access.session.user.id,
          type: NotificationType.STORE_REQUEST_RESOLVED,
          title: "Solicitud rechazada",
          body: `Tu solicitud para ${request.store.name} ha sido rechazada.`,
          link: `/stores/${request.store.slug}`,
        },
      });
    }
  });

  revalidatePath("/stores");
  revalidatePath(`/stores/${request.store.slug}`);
  revalidatePath(`/stores/${request.store.slug}/requests`);
  revalidatePath(`/profile/${request.userId}`);
  revalidatePath("/dashboard");

  return {
    status: "success",
    message:
      parsed.data.decision === "accept"
        ? "Solicitud aceptada correctamente."
        : "Solicitud rechazada correctamente.",
  };
}

export async function updateStorePublicProfileAction(
  _previousState: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  const parsed = updateStorePublicProfileSchema.safeParse({
    storeId: formData.get("storeId"),
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
    gameIds: formData.getAll("gameIds"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "No hemos podido guardar la tienda.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const access = await getStoreOwnerOrAdminAccess(parsed.data.storeId);

  if (!access.hasAccess) {
    return {
      status: "error",
      message: "No tienes permisos para editar esta tienda.",
    };
  }

  const db = getDb();
  const existingGames = await db.game.count({
    where: {
      id: {
        in: parsed.data.gameIds,
      },
      isActive: true,
    },
  });

  if (existingGames !== new Set(parsed.data.gameIds).size) {
    return {
      status: "error",
      message: "Uno de los juegos seleccionados no existe o no esta activo.",
    };
  }

  await db.$transaction(async (tx) => {
    await tx.store.update({
      where: { id: parsed.data.storeId },
      data: {
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
      },
    });

    await tx.storeGame.deleteMany({
      where: {
        storeId: parsed.data.storeId,
      },
    });

    await tx.storeGame.createMany({
      data: parsed.data.gameIds.map((gameId, index) => ({
        storeId: parsed.data.storeId,
        gameId,
        isFeatured: index === 0,
      })),
    });
  });

  revalidatePath("/stores");
  revalidatePath(`/stores/${access.store.slug}`);
  revalidatePath(`/stores/${access.store.slug}/requests`);
  revalidatePath("/dashboard");
  revalidatePath("/admin");

  return {
    status: "success",
    message: "Datos de tienda actualizados correctamente.",
  };
}
