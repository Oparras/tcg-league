import { LinkedAccountType, NotificationType, PresenceStatus, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

import { DEFAULT_MAIN_GAME } from "@/lib/constants/games";
import { getDb } from "@/lib/db";
import { registerSchema } from "@/lib/validations/auth";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const parsed = registerSchema.safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json(
        {
          message: "Los datos del formulario no son validos.",
          errors: parsed.error.flatten(),
        },
        { status: 400 },
      );
    }

    const db = getDb();
    const { email, password, nick, displayName, city, avatarUrl, primaryStoreId } =
      parsed.data;

    const normalizedEmail = email.toLowerCase();

    const [existingEmail, existingNick, primaryStore] = await Promise.all([
      db.user.findUnique({ where: { email: normalizedEmail } }),
      db.playerProfile.findUnique({ where: { nick } }),
      primaryStoreId ? db.store.findUnique({ where: { id: primaryStoreId } }) : Promise.resolve(null),
    ]);

    if (existingEmail) {
      return NextResponse.json(
        { message: "Ya existe una cuenta con ese email." },
        { status: 409 },
      );
    }

    if (existingNick) {
      return NextResponse.json(
        { message: "Ese nick ya esta en uso." },
        { status: 409 },
      );
    }

    if (primaryStoreId && !primaryStore) {
      return NextResponse.json(
        { message: "La tienda seleccionada no existe." },
        { status: 400 },
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const defaultMainGame = await db.game.upsert({
      where: { slug: DEFAULT_MAIN_GAME.slug },
      update: {
        name: DEFAULT_MAIN_GAME.name,
        isActive: true,
        isFeatured: true,
      },
      create: {
        slug: DEFAULT_MAIN_GAME.slug,
        name: DEFAULT_MAIN_GAME.name,
        description: "Default main game assigned during account creation.",
        isActive: true,
        isFeatured: true,
      },
    });

    const created = await db.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: normalizedEmail,
          passwordHash,
          role: UserRole.PLAYER,
          image: avatarUrl,
          playerProfile: {
            create: {
              nick,
              displayName,
              city,
              avatarUrl,
              mainGameId: defaultMainGame.id,
              status: PresenceStatus.AVAILABLE,
              onboardingCompleted: true,
            },
          },
        },
        include: { playerProfile: true },
      });

      await tx.playerGameStat.create({
        data: {
          playerProfileId: user.playerProfile!.id,
          gameId: defaultMainGame.id,
          elo: 1000,
        },
      });

      await tx.linkedAccount.create({
        data: {
          userId: user.id,
          provider: "credentials",
          providerAccountId: normalizedEmail,
          type: LinkedAccountType.PLATFORM,
          displayName,
        },
      });

      if (primaryStore) {
        await tx.storeJoinRequest.upsert({
          where: {
            userId_storeId: {
              userId: user.id,
              storeId: primaryStore.id,
            },
          },
          update: {
            status: "PENDING",
            message: `${displayName} quiere unirse a ${primaryStore.name} desde el onboarding.`,
          },
          create: {
            userId: user.id,
            storeId: primaryStore.id,
            status: "PENDING",
            message: `${displayName} quiere unirse a ${primaryStore.name} desde el onboarding.`,
          },
        });

        if (primaryStore.ownerId) {
          await tx.notification.create({
            data: {
              userId: primaryStore.ownerId,
              actorId: user.id,
              type: NotificationType.STORE_REQUEST,
              title: "Nueva solicitud de tienda",
              body: `${displayName} ha solicitado unirse a ${primaryStore.name}.`,
              link: `/stores/${primaryStore.id}/requests`,
            },
          });
        }
      }

      return user;
    });

    return NextResponse.json(
      {
        message: "Cuenta creada correctamente.",
        userId: created.id,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "No hemos podido crear la cuenta en este momento." },
      { status: 500 },
    );
  }
}
