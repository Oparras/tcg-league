"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { canEditProfile, requireAuth } from "@/lib/auth/permissions";
import { getDb } from "@/lib/db";
import { updateProfileSchema } from "@/lib/validations/profile";
import type { FormActionState } from "@/types/action-state";

export async function updateProfileAction(
  _previousState: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  const session = await requireAuth();
  const parsed = updateProfileSchema.safeParse({
    nick: formData.get("nick"),
    displayName: formData.get("displayName"),
    avatarUrl: formData.get("avatarUrl"),
    city: formData.get("city"),
    bio: formData.get("bio"),
    mainGameId: formData.get("mainGameId"),
    availabilityStatus: formData.get("availabilityStatus"),
  });
  const redirectTarget = formData.get("redirectTo");

  if (!parsed.success) {
    return {
      status: "error",
      message: "Revisa los campos del perfil.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const db = getDb();
  const currentUser = await db.user.findUnique({
    where: { id: session.user.id },
    include: {
      playerProfile: true,
    },
  });

  if (!currentUser) {
    return {
      status: "error",
      message: "No hemos encontrado tu cuenta.",
    };
  }

  if (!(await canEditProfile(currentUser.id))) {
    return {
      status: "error",
      message: "No puedes editar este perfil.",
    };
  }

  const [existingNick, selectedGame] = await Promise.all([
    db.playerProfile.findUnique({
      where: { nick: parsed.data.nick },
      select: { userId: true },
    }),
    db.game.findUnique({
      where: { id: parsed.data.mainGameId },
      select: { id: true },
    }),
  ]);

  if (existingNick && existingNick.userId !== currentUser.id) {
    return {
      status: "error",
      message: "Ese nick ya esta en uso por otro jugador.",
      fieldErrors: {
        nick: ["Ese nick ya esta en uso por otro jugador."],
      },
    };
  }

  if (!selectedGame) {
    return {
      status: "error",
      message: "El juego principal seleccionado no existe.",
      fieldErrors: {
        mainGameId: ["Selecciona un juego principal valido."],
      },
    };
  }

  let playerProfileId = currentUser.playerProfile?.id;

  await db.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: currentUser.id },
      data: {
        image: parsed.data.avatarUrl ?? null,
      },
    });

    if (currentUser.playerProfile) {
      const profile = await tx.playerProfile.update({
        where: { userId: currentUser.id },
        data: {
          nick: parsed.data.nick,
          displayName: parsed.data.displayName,
          avatarUrl: parsed.data.avatarUrl ?? null,
          city: parsed.data.city,
          bio: parsed.data.bio ?? null,
          mainGameId: parsed.data.mainGameId,
          status: parsed.data.availabilityStatus,
          onboardingCompleted: true,
        },
      });

      playerProfileId = profile.id;
    } else {
      const profile = await tx.playerProfile.create({
        data: {
          userId: currentUser.id,
          nick: parsed.data.nick,
          displayName: parsed.data.displayName,
          avatarUrl: parsed.data.avatarUrl ?? null,
          city: parsed.data.city,
          bio: parsed.data.bio ?? null,
          mainGameId: parsed.data.mainGameId,
          status: parsed.data.availabilityStatus,
          onboardingCompleted: true,
        },
      });

      playerProfileId = profile.id;
    }

    await tx.playerGameStat.upsert({
      where: {
        playerProfileId_gameId: {
          playerProfileId: playerProfileId!,
          gameId: parsed.data.mainGameId,
        },
      },
      update: {},
      create: {
        playerProfileId: playerProfileId!,
        gameId: parsed.data.mainGameId,
        elo: 1000,
      },
    });
  });

  revalidatePath("/dashboard");
  revalidatePath("/onboarding");
  revalidatePath("/profile/me");
  revalidatePath(`/profile/${currentUser.id}`);

  if (typeof redirectTarget === "string" && redirectTarget.startsWith("/")) {
    redirect(redirectTarget);
  }

  return {
    status: "success",
    message: "Perfil actualizado correctamente.",
  };
}
