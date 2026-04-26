import {
  ChallengeStatus,
  DisputeStatus,
  EventRegistrationStatus,
  EventStatus,
  FriendshipStatus,
  MatchConfirmationStatus,
  MatchMode,
  MatchStatus,
  MembershipStatus,
  NotificationType,
  PresenceStatus,
  StoreJoinRequestStatus,
  StoreMembershipRole,
  UserRole,
} from "@prisma/client";
import bcrypt from "bcryptjs";
import { createPrismaClient } from "../src/lib/db";

const prisma = createPrismaClient();
const demoPassword = "League123!";

const games = [
  {
    slug: "riftbound",
    name: "Riftbound",
    description: "Flagship competitive title for local store leagues.",
    isFeatured: true,
  },
  {
    slug: "one-piece",
    name: "One Piece",
    description: "Fast-growing scene with strong weekly local communities.",
    isFeatured: true,
  },
  {
    slug: "pokemon",
    name: "Pokemon",
    description: "Accessible league play for junior and veteran players alike.",
  },
  {
    slug: "magic",
    name: "Magic",
    description: "Formats ranging from Standard to Commander nights.",
  },
  {
    slug: "lorcana",
    name: "Lorcana",
    description: "Casual-to-competitive Disney TCG leagues.",
  },
];

async function resetDatabase() {
  await prisma.message.deleteMany();
  await prisma.chat.deleteMany();
  await prisma.friendship.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.dispute.deleteMany();
  await prisma.matchResultConfirmation.deleteMany();
  await prisma.match.deleteMany();
  await prisma.challenge.deleteMany();
  await prisma.eventRegistration.deleteMany();
  await prisma.event.deleteMany();
  await prisma.storeJoinRequest.deleteMany();
  await prisma.storeMembership.deleteMany();
  await prisma.storeGame.deleteMany();
  await prisma.playerGameStat.deleteMany();
  await prisma.playerProfile.deleteMany();
  await prisma.linkedAccount.deleteMany();
  await prisma.account.deleteMany();
  await prisma.session.deleteMany();
  await prisma.verificationToken.deleteMany();
  await prisma.user.deleteMany();
  await prisma.store.deleteMany();
  await prisma.game.deleteMany();
}

async function main() {
  await resetDatabase();

  const passwordHash = await bcrypt.hash(demoPassword, 10);

  const gameRecords = await Promise.all(
    games.map((game) =>
      prisma.game.create({
        data: game,
      }),
    ),
  );

  const gameBySlug = Object.fromEntries(
    gameRecords.map((game) => [game.slug, game]),
  );

  const admin = await prisma.user.create({
    data: {
      email: "admin@tcgleague.dev",
      passwordHash,
      role: UserRole.ADMIN,
      image:
        "https://images.unsplash.com/photo-1546961329-78bef0414d7c?auto=format&fit=crop&w=300&q=80",
      playerProfile: {
        create: {
          nick: "LeagueAdmin",
          displayName: "TCG League Admin",
          city: "Madrid",
          avatarUrl:
            "https://images.unsplash.com/photo-1546961329-78bef0414d7c?auto=format&fit=crop&w=300&q=80",
          status: PresenceStatus.AVAILABLE,
          mainGameId: gameBySlug.riftbound.id,
          eloGlobal: 1218,
          matchesPlayed: 34,
          wins: 21,
          losses: 13,
          winRate: 61.8,
          onboardingCompleted: true,
        },
      },
    },
    include: { playerProfile: true },
  });

  const manaVaultOwner = await prisma.user.create({
    data: {
      email: "sergio@manavault.es",
      passwordHash,
      role: UserRole.STORE_OWNER,
      image:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80",
      playerProfile: {
        create: {
          nick: "SergioMV",
          displayName: "Sergio Morales",
          city: "Madrid",
          avatarUrl:
            "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80",
          status: PresenceStatus.AVAILABLE,
          mainGameId: gameBySlug.magic.id,
          eloGlobal: 1142,
          matchesPlayed: 28,
          wins: 16,
          losses: 12,
          winRate: 57.1,
          onboardingCompleted: true,
        },
      },
    },
    include: { playerProfile: true },
  });

  const dragonDenOwner = await prisma.user.create({
    data: {
      email: "laia@dragonden.es",
      passwordHash,
      role: UserRole.STORE_OWNER,
      image:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80",
      playerProfile: {
        create: {
          nick: "LaiaDen",
          displayName: "Laia Pons",
          city: "Barcelona",
          avatarUrl:
            "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80",
          status: PresenceStatus.AVAILABLE,
          mainGameId: gameBySlug["one-piece"].id,
          eloGlobal: 1164,
          matchesPlayed: 25,
          wins: 15,
          losses: 10,
          winRate: 60,
          onboardingCompleted: true,
        },
      },
    },
    include: { playerProfile: true },
  });

  const luna = await prisma.user.create({
    data: {
      email: "luna@tcgleague.dev",
      passwordHash,
      role: UserRole.PLAYER,
      image:
        "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=300&q=80",
      playerProfile: {
        create: {
          nick: "LunaStorm",
          displayName: "Luna Herrera",
          city: "Madrid",
          avatarUrl:
            "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=300&q=80",
          status: PresenceStatus.AVAILABLE,
          mainGameId: gameBySlug.riftbound.id,
          eloGlobal: 1246,
          matchesPlayed: 42,
          wins: 27,
          losses: 15,
          winRate: 64.3,
          onboardingCompleted: true,
        },
      },
    },
    include: { playerProfile: true },
  });

  const marco = await prisma.user.create({
    data: {
      email: "marco@tcgleague.dev",
      passwordHash,
      role: UserRole.PLAYER,
      image:
        "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80",
      playerProfile: {
        create: {
          nick: "MarcoBlade",
          displayName: "Marco Sanz",
          city: "Valencia",
          avatarUrl:
            "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80",
          status: PresenceStatus.UNAVAILABLE,
          mainGameId: gameBySlug["one-piece"].id,
          eloGlobal: 1189,
          matchesPlayed: 31,
          wins: 18,
          losses: 13,
          winRate: 58.1,
          onboardingCompleted: true,
        },
      },
    },
    include: { playerProfile: true },
  });

  const sofia = await prisma.user.create({
    data: {
      email: "sofia@tcgleague.dev",
      passwordHash,
      role: UserRole.PLAYER,
      image:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=300&q=80",
      playerProfile: {
        create: {
          nick: "SofiaNova",
          displayName: "Sofia Ruiz",
          city: "Barcelona",
          avatarUrl:
            "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=300&q=80",
          status: PresenceStatus.AVAILABLE,
          mainGameId: gameBySlug.pokemon.id,
          eloGlobal: 1116,
          matchesPlayed: 20,
          wins: 11,
          losses: 9,
          winRate: 55,
          onboardingCompleted: true,
        },
      },
    },
    include: { playerProfile: true },
  });

  const alex = await prisma.user.create({
    data: {
      email: "alex@tcgleague.dev",
      passwordHash,
      role: UserRole.PLAYER,
      image:
        "https://images.unsplash.com/photo-1504593811423-6dd665756598?auto=format&fit=crop&w=300&q=80",
      playerProfile: {
        create: {
          nick: "AlexTempo",
          displayName: "Alex Campos",
          city: "Sevilla",
          avatarUrl:
            "https://images.unsplash.com/photo-1504593811423-6dd665756598?auto=format&fit=crop&w=300&q=80",
          status: PresenceStatus.AVAILABLE,
          mainGameId: gameBySlug.magic.id,
          eloGlobal: 1098,
          matchesPlayed: 18,
          wins: 9,
          losses: 9,
          winRate: 50,
          onboardingCompleted: true,
        },
      },
    },
    include: { playerProfile: true },
  });

  const diego = await prisma.user.create({
    data: {
      email: "diego@tcgleague.dev",
      passwordHash,
      role: UserRole.PLAYER,
      image:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80",
      playerProfile: {
        create: {
          nick: "DiegoSpark",
          displayName: "Diego Navarro",
          city: "Madrid",
          avatarUrl:
            "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80",
          status: PresenceStatus.AVAILABLE,
          mainGameId: gameBySlug.lorcana.id,
          eloGlobal: 1032,
          matchesPlayed: 9,
          wins: 4,
          losses: 5,
          winRate: 44.4,
          onboardingCompleted: true,
        },
      },
    },
    include: { playerProfile: true },
  });

  const manaVault = await prisma.store.create({
    data: {
      ownerId: manaVaultOwner.id,
      name: "Mana Vault Madrid",
      slug: "mana-vault-madrid",
      city: "Madrid",
      region: "Comunidad de Madrid",
      country: "Spain",
      address: "Calle de Atocha 118, Madrid",
      description:
        "Weekly league nights focused on Riftbound, Magic and high-quality community events.",
      isVerified: true,
      logoUrl:
        "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=200&q=80",
      bannerUrl:
        "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=1400&q=80",
      websiteUrl: "https://manavaultmadrid.example.com",
      officialLocatorUrl:
        "https://locator.riftbound.uvsgames.com/?store=mana-vault-madrid",
      googleMapsUrl: "https://maps.google.com/?q=Mana+Vault+Madrid",
      discordUrl: "https://discord.gg/manavault",
      instagramUrl: "https://instagram.com/manavaultmadrid",
    },
  });

  const dragonDen = await prisma.store.create({
    data: {
      ownerId: dragonDenOwner.id,
      name: "Dragon Den Barcelona",
      slug: "dragon-den-barcelona",
      city: "Barcelona",
      region: "Catalunya",
      country: "Spain",
      address: "Carrer de Sants 41, Barcelona",
      description:
        "Competitive One Piece and Pokemon hub with weekend cups and league ladders.",
      isVerified: true,
      logoUrl:
        "https://images.unsplash.com/photo-1511884642898-4c92249e20b6?auto=format&fit=crop&w=200&q=80",
      bannerUrl:
        "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=1400&q=80",
      websiteUrl: "https://dragondenbarcelona.example.com",
      officialLocatorUrl:
        "https://locator.riftbound.uvsgames.com/?store=dragon-den-barcelona",
      googleMapsUrl: "https://maps.google.com/?q=Dragon+Den+Barcelona",
      discordUrl: "https://discord.gg/dragonden",
      instagramUrl: "https://instagram.com/dragondenbarcelona",
    },
  });

  const nexus = await prisma.store.create({
    data: {
      name: "Nexus Sevilla",
      slug: "nexus-sevilla",
      city: "Sevilla",
      region: "Andalucia",
      country: "Spain",
      address: "Avenida de Kansas City 23, Sevilla",
      description:
        "Growing south-region scene with league play, learn-to-play sessions and Sunday events.",
      isVerified: false,
      logoUrl:
        "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=200&q=80",
      websiteUrl: "https://nexussevilla.example.com",
      googleMapsUrl: "https://maps.google.com/?q=Nexus+Sevilla",
      instagramUrl: "https://instagram.com/nexussevilla",
    },
  });

  const pixelTavern = await prisma.store.create({
    data: {
      ownerId: manaVaultOwner.id,
      name: "Pixel Tavern Valencia",
      slug: "pixel-tavern-valencia",
      city: "Valencia",
      region: "Comunitat Valenciana",
      country: "Spain",
      address: "Gran Via del Marques del Turia 12, Valencia",
      description:
        "Hybrid in-store and online community for midweek challenges and seasonal leagues.",
      isVerified: true,
      logoUrl:
        "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=200&q=80",
      bannerUrl:
        "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?auto=format&fit=crop&w=1400&q=80",
      websiteUrl: "https://pixeltavernvalencia.example.com",
      officialLocatorUrl:
        "https://locator.riftbound.uvsgames.com/?store=pixel-tavern-valencia",
      googleMapsUrl: "https://maps.google.com/?q=Pixel+Tavern+Valencia",
      discordUrl: "https://discord.gg/pixeltavern",
      instagramUrl: "https://instagram.com/pixeltavernvalencia",
    },
  });

  await prisma.storeGame.createMany({
    data: [
      { storeId: manaVault.id, gameId: gameBySlug.riftbound.id, isFeatured: true },
      { storeId: manaVault.id, gameId: gameBySlug.magic.id },
      { storeId: manaVault.id, gameId: gameBySlug.lorcana.id },
      { storeId: dragonDen.id, gameId: gameBySlug["one-piece"].id, isFeatured: true },
      { storeId: dragonDen.id, gameId: gameBySlug.pokemon.id },
      { storeId: nexus.id, gameId: gameBySlug.magic.id, isFeatured: true },
      { storeId: nexus.id, gameId: gameBySlug.riftbound.id },
      { storeId: pixelTavern.id, gameId: gameBySlug["one-piece"].id, isFeatured: true },
      { storeId: pixelTavern.id, gameId: gameBySlug.riftbound.id },
    ],
  });

  await prisma.storeMembership.createMany({
    data: [
      {
        userId: manaVaultOwner.id,
        storeId: manaVault.id,
        status: MembershipStatus.ACTIVE,
        role: StoreMembershipRole.OWNER,
        isPrimary: true,
      },
      {
        userId: dragonDenOwner.id,
        storeId: dragonDen.id,
        status: MembershipStatus.ACTIVE,
        role: StoreMembershipRole.OWNER,
        isPrimary: true,
      },
      {
        userId: manaVaultOwner.id,
        storeId: pixelTavern.id,
        status: MembershipStatus.ACTIVE,
        role: StoreMembershipRole.OWNER,
        isPrimary: false,
      },
      {
        userId: luna.id,
        storeId: manaVault.id,
        status: MembershipStatus.ACTIVE,
        role: StoreMembershipRole.CAPTAIN,
        isPrimary: true,
      },
      {
        userId: marco.id,
        storeId: pixelTavern.id,
        status: MembershipStatus.ACTIVE,
        role: StoreMembershipRole.MEMBER,
        isPrimary: true,
      },
      {
        userId: sofia.id,
        storeId: dragonDen.id,
        status: MembershipStatus.ACTIVE,
        role: StoreMembershipRole.MEMBER,
        isPrimary: true,
      },
      {
        userId: alex.id,
        storeId: nexus.id,
        status: MembershipStatus.ACTIVE,
        role: StoreMembershipRole.MEMBER,
        isPrimary: true,
      },
    ],
  });

  await Promise.all([
    prisma.playerProfile.update({
      where: { userId: manaVaultOwner.id },
      data: { primaryStoreId: manaVault.id },
    }),
    prisma.playerProfile.update({
      where: { userId: dragonDenOwner.id },
      data: { primaryStoreId: dragonDen.id },
    }),
    prisma.playerProfile.update({
      where: { userId: luna.id },
      data: { primaryStoreId: manaVault.id },
    }),
    prisma.playerProfile.update({
      where: { userId: marco.id },
      data: { primaryStoreId: pixelTavern.id },
    }),
    prisma.playerProfile.update({
      where: { userId: sofia.id },
      data: { primaryStoreId: dragonDen.id },
    }),
    prisma.playerProfile.update({
      where: { userId: alex.id },
      data: { primaryStoreId: nexus.id },
    }),
  ]);

  await prisma.playerGameStat.createMany({
    data: [
      { playerProfileId: luna.playerProfile!.id, gameId: gameBySlug.riftbound.id, elo: 1284, matchesPlayed: 22, wins: 15, losses: 7, winRate: 68.2 },
      { playerProfileId: luna.playerProfile!.id, gameId: gameBySlug.magic.id, elo: 1134, matchesPlayed: 8, wins: 5, losses: 3, winRate: 62.5 },
      { playerProfileId: marco.playerProfile!.id, gameId: gameBySlug["one-piece"].id, elo: 1210, matchesPlayed: 19, wins: 11, losses: 8, winRate: 57.9 },
      { playerProfileId: sofia.playerProfile!.id, gameId: gameBySlug.pokemon.id, elo: 1148, matchesPlayed: 14, wins: 8, losses: 6, winRate: 57.1 },
      { playerProfileId: alex.playerProfile!.id, gameId: gameBySlug.magic.id, elo: 1104, matchesPlayed: 11, wins: 5, losses: 6, winRate: 45.5 },
      { playerProfileId: diego.playerProfile!.id, gameId: gameBySlug.lorcana.id, elo: 1032, matchesPlayed: 9, wins: 4, losses: 5, winRate: 44.4 },
      { playerProfileId: manaVaultOwner.playerProfile!.id, gameId: gameBySlug.magic.id, elo: 1158, matchesPlayed: 17, wins: 10, losses: 7, winRate: 58.8 },
      { playerProfileId: dragonDenOwner.playerProfile!.id, gameId: gameBySlug["one-piece"].id, elo: 1172, matchesPlayed: 15, wins: 9, losses: 6, winRate: 60 },
      { playerProfileId: admin.playerProfile!.id, gameId: gameBySlug.riftbound.id, elo: 1206, matchesPlayed: 12, wins: 8, losses: 4, winRate: 66.7 },
    ],
  });

  await prisma.storeJoinRequest.createMany({
    data: [
      {
        userId: luna.id,
        storeId: manaVault.id,
        status: StoreJoinRequestStatus.ACCEPTED,
        message: "Busco un entorno competitivo estable para jugar Riftbound todas las semanas.",
        respondedById: manaVaultOwner.id,
        requestedAt: new Date("2026-03-20T17:00:00.000Z"),
        respondedAt: new Date("2026-03-21T11:00:00.000Z"),
      },
      {
        userId: diego.id,
        storeId: manaVault.id,
        status: StoreJoinRequestStatus.REJECTED,
        message: "Quiero entrar para probar Lorcana y algunos eventos de fin de semana.",
        respondedById: manaVaultOwner.id,
        requestedAt: new Date("2026-04-08T18:15:00.000Z"),
        respondedAt: new Date("2026-04-09T10:30:00.000Z"),
      },
    ],
  });

  const pendingJoinRequest = await prisma.storeJoinRequest.create({
    data: {
      userId: admin.id,
      storeId: manaVault.id,
      status: StoreJoinRequestStatus.PENDING,
      message: "Quiero participar como judge support y jugador regular de Riftbound.",
    },
  });

  const pendingPixelJoinRequest = await prisma.storeJoinRequest.create({
    data: {
      userId: diego.id,
      storeId: pixelTavern.id,
      status: StoreJoinRequestStatus.PENDING,
      message: "Me gustaria unirme a Pixel Tavern para jugar ligas mixtas y retos online.",
    },
  });

  await prisma.friendship.createMany({
    data: [
      {
        requesterId: luna.id,
        addresseeId: marco.id,
        status: FriendshipStatus.ACCEPTED,
        respondedAt: new Date("2026-04-10T18:00:00.000Z"),
      },
      {
        requesterId: luna.id,
        addresseeId: sofia.id,
        status: FriendshipStatus.ACCEPTED,
        respondedAt: new Date("2026-04-14T18:00:00.000Z"),
      },
      {
        requesterId: alex.id,
        addresseeId: luna.id,
        status: FriendshipStatus.PENDING,
      },
    ],
  });

  const pendingChallenge = await prisma.challenge.create({
    data: {
      challengerId: marco.id,
      challengedId: luna.id,
      gameId: gameBySlug["one-piece"].id,
      storeId: pixelTavern.id,
      format: "BO1",
      mode: MatchMode.ONLINE,
      locationLabel: "Remote tabletop room",
      scheduledFor: new Date("2026-04-29T20:00:00.000Z"),
      message: "Si te viene bien, lo jugamos despues de cenar.",
      status: ChallengeStatus.PENDING,
    },
  });

  const rejectedChallenge = await prisma.challenge.create({
    data: {
      challengerId: alex.id,
      challengedId: sofia.id,
      gameId: gameBySlug.magic.id,
      format: "BO3",
      mode: MatchMode.IN_PERSON,
      locationLabel: "Mesa casual",
      scheduledFor: new Date("2026-04-17T18:00:00.000Z"),
      message: "Tengo mazo nuevo y quiero probarlo contigo.",
      status: ChallengeStatus.REJECTED,
      respondedAt: new Date("2026-04-16T17:00:00.000Z"),
    },
  });

  const counterChallenge = await prisma.challenge.create({
    data: {
      challengerId: diego.id,
      challengedId: luna.id,
      gameId: gameBySlug.lorcana.id,
      format: "BO3",
      mode: MatchMode.IN_PERSON,
      storeId: manaVault.id,
      locationLabel: "Zona secundaria",
      scheduledFor: new Date("2026-04-30T18:00:00.000Z"),
      counterProposedFor: new Date("2026-05-01T19:30:00.000Z"),
      message: "Si no puedes el jueves, propongo moverlo al viernes.",
      status: ChallengeStatus.COUNTER_PROPOSED,
      respondedAt: new Date("2026-04-28T19:00:00.000Z"),
    },
  });

  const confirmedChallenge = await prisma.challenge.create({
    data: {
      challengerId: luna.id,
      challengedId: marco.id,
      gameId: gameBySlug.riftbound.id,
      storeId: manaVault.id,
      format: "BO3",
      mode: MatchMode.IN_PERSON,
      locationLabel: "Mana Vault Madrid",
      scheduledFor: new Date("2026-04-22T18:30:00.000Z"),
      message: "Warm-up before the store cup.",
      status: ChallengeStatus.ACCEPTED,
      respondedAt: new Date("2026-04-20T16:00:00.000Z"),
    },
  });

  const acceptedChallenge = await prisma.challenge.create({
    data: {
      challengerId: luna.id,
      challengedId: sofia.id,
      gameId: gameBySlug.riftbound.id,
      storeId: dragonDen.id,
      format: "BO1",
      mode: MatchMode.IN_PERSON,
      locationLabel: "Zona ranked",
      scheduledFor: new Date("2026-05-03T17:00:00.000Z"),
      message: "Quiero testear el match-up antes del evento del domingo.",
      status: ChallengeStatus.ACCEPTED,
      respondedAt: new Date("2026-04-25T19:00:00.000Z"),
    },
  });

  const confirmedMatch = await prisma.match.create({
    data: {
      challengeId: confirmedChallenge.id,
      playerAId: luna.id,
      playerBId: marco.id,
      winnerId: luna.id,
      loserId: marco.id,
      reportedById: luna.id,
      gameId: gameBySlug.riftbound.id,
      format: "BO3",
      mode: MatchMode.IN_PERSON,
      locationLabel: "Mana Vault Madrid",
      storeAId: manaVault.id,
      storeBId: pixelTavern.id,
      scheduledFor: new Date("2026-04-22T18:30:00.000Z"),
      playedAt: new Date("2026-04-22T19:55:00.000Z"),
      status: MatchStatus.CONFIRMED,
      playerAScore: 2,
      playerBScore: 0,
      playerAEloBefore: 1268,
      playerAEloAfter: 1284,
      playerBEloBefore: 1226,
      playerBEloAfter: 1210,
      confirmedAt: new Date("2026-04-22T20:05:00.000Z"),
    },
  });

  const acceptedMatch = await prisma.match.create({
    data: {
      challengeId: acceptedChallenge.id,
      playerAId: luna.id,
      playerBId: sofia.id,
      gameId: gameBySlug.riftbound.id,
      format: "BO1",
      mode: MatchMode.IN_PERSON,
      locationLabel: "Dragon Den Barcelona",
      storeAId: manaVault.id,
      storeBId: dragonDen.id,
      scheduledFor: new Date("2026-05-03T17:00:00.000Z"),
      status: MatchStatus.ACCEPTED,
      playerAEloBefore: 1284,
      playerBEloBefore: 1116,
    },
  });

  const disputedMatch = await prisma.match.create({
    data: {
      playerAId: sofia.id,
      playerBId: alex.id,
      winnerId: sofia.id,
      loserId: alex.id,
      reportedById: sofia.id,
      gameId: gameBySlug.pokemon.id,
      format: "BO5",
      mode: MatchMode.ONLINE,
      locationLabel: "TCG League Remote Lobby",
      storeAId: dragonDen.id,
      storeBId: nexus.id,
      scheduledFor: new Date("2026-04-19T15:00:00.000Z"),
      playedAt: new Date("2026-04-19T16:15:00.000Z"),
      proofImageUrl:
        "https://images.unsplash.com/photo-1511884642898-4c92249e20b6?auto=format&fit=crop&w=640&q=80",
      status: MatchStatus.DISPUTED,
      playerAScore: 3,
      playerBScore: 2,
      playerAEloBefore: 1132,
      playerAEloAfter: 1145,
      playerBEloBefore: 1120,
      playerBEloAfter: 1107,
    },
  });

  const pendingConfirmationMatch = await prisma.match.create({
    data: {
      playerAId: manaVaultOwner.id,
      playerBId: dragonDenOwner.id,
      winnerId: dragonDenOwner.id,
      loserId: manaVaultOwner.id,
      reportedById: dragonDenOwner.id,
      gameId: gameBySlug["one-piece"].id,
      format: "BO3",
      mode: MatchMode.IN_PERSON,
      locationLabel: "Dragon Den Barcelona",
      storeAId: manaVault.id,
      storeBId: dragonDen.id,
      scheduledFor: new Date("2026-04-24T18:00:00.000Z"),
      playedAt: new Date("2026-04-24T18:45:00.000Z"),
      status: MatchStatus.PLAYED_PENDING_CONFIRMATION,
      playerAScore: 1,
      playerBScore: 2,
      playerAEloBefore: 1148,
      playerAEloAfter: 1132,
      playerBEloBefore: 1156,
      playerBEloAfter: 1172,
    },
  });

  await prisma.matchResultConfirmation.createMany({
    data: [
      {
        matchId: confirmedMatch.id,
        userId: luna.id,
        status: MatchConfirmationStatus.CONFIRMED,
      },
      {
        matchId: confirmedMatch.id,
        userId: marco.id,
        status: MatchConfirmationStatus.CONFIRMED,
      },
      {
        matchId: disputedMatch.id,
        userId: sofia.id,
        status: MatchConfirmationStatus.CONFIRMED,
      },
      {
        matchId: disputedMatch.id,
        userId: alex.id,
        status: MatchConfirmationStatus.DISPUTED,
        note: "Reported score does not match the final game state.",
      },
      {
        matchId: pendingConfirmationMatch.id,
        userId: dragonDenOwner.id,
        status: MatchConfirmationStatus.CONFIRMED,
      },
      {
        matchId: pendingConfirmationMatch.id,
        userId: manaVaultOwner.id,
        status: MatchConfirmationStatus.PENDING,
      },
    ],
  });

  await prisma.dispute.create({
    data: {
      matchId: disputedMatch.id,
      raisedById: alex.id,
      assignedToId: admin.id,
      reason: "The uploaded winner is correct, but the number of games won is not reflected correctly.",
      evidenceUrl:
        "https://images.unsplash.com/photo-1511884642898-4c92249e20b6?auto=format&fit=crop&w=640&q=80",
      status: DisputeStatus.UNDER_REVIEW,
    },
  });

  const saturdayCup = await prisma.event.create({
    data: {
      storeId: manaVault.id,
      createdById: manaVaultOwner.id,
      gameId: gameBySlug.riftbound.id,
      name: "Mana Vault Saturday Cup",
      slug: "mana-vault-saturday-cup",
      description:
        "Competitive weekly cup with league points, prize support and store ranking impact.",
      format: "Swiss + Top 4",
      location: "Main play room",
      startAt: new Date("2026-05-02T10:00:00.000Z"),
      registrationOpensAt: new Date("2026-04-20T08:00:00.000Z"),
      registrationClosesAt: new Date("2026-05-02T09:30:00.000Z"),
      maxParticipants: 32,
      status: EventStatus.OPEN_REGISTRATION,
    },
  });

  const barcelonaClash = await prisma.event.create({
    data: {
      storeId: dragonDen.id,
      createdById: dragonDenOwner.id,
      gameId: gameBySlug["one-piece"].id,
      name: "Barcelona Treasure Clash",
      slug: "barcelona-treasure-clash",
      description:
        "Monthly showdown for One Piece crews with boosted ladder points.",
      format: "Bo1 Swiss",
      location: "Tournament area",
      startAt: new Date("2026-05-05T17:00:00.000Z"),
      registrationOpensAt: new Date("2026-04-25T10:00:00.000Z"),
      registrationClosesAt: new Date("2026-05-05T16:30:00.000Z"),
      maxParticipants: 24,
      status: EventStatus.OPEN_REGISTRATION,
    },
  });

  await prisma.event.create({
    data: {
      storeId: pixelTavern.id,
      createdById: admin.id,
      gameId: gameBySlug.riftbound.id,
      name: "Pixel Tavern Night League",
      slug: "pixel-tavern-night-league",
      description:
        "Hybrid ladder night with remote pairing support and in-store finals.",
      format: "Round Robin",
      location: "Main hall + online remote room",
      startAt: new Date("2026-05-07T19:00:00.000Z"),
      registrationOpensAt: new Date("2026-04-27T10:00:00.000Z"),
      registrationClosesAt: new Date("2026-05-07T18:45:00.000Z"),
      maxParticipants: 16,
      status: EventStatus.UPCOMING,
    },
  });

  await prisma.eventRegistration.createMany({
    data: [
      { eventId: saturdayCup.id, userId: luna.id, status: EventRegistrationStatus.REGISTERED },
      { eventId: saturdayCup.id, userId: admin.id, status: EventRegistrationStatus.REGISTERED },
      { eventId: saturdayCup.id, userId: marco.id, status: EventRegistrationStatus.WAITLIST },
      { eventId: barcelonaClash.id, userId: sofia.id, status: EventRegistrationStatus.REGISTERED },
      { eventId: barcelonaClash.id, userId: dragonDenOwner.id, status: EventRegistrationStatus.REGISTERED },
    ],
  });

  const chat = await prisma.chat.create({
    data: {
      userAId: luna.id,
      userBId: marco.id,
      lastMessageAt: new Date("2026-04-24T20:00:00.000Z"),
    },
  });

  await prisma.message.createMany({
    data: [
      {
        chatId: chat.id,
        senderId: luna.id,
        content: "Can you do Tuesday evening for the rematch?",
        createdAt: new Date("2026-04-24T19:40:00.000Z"),
      },
      {
        chatId: chat.id,
        senderId: marco.id,
        content: "Yes, let's lock it in after store closing.",
        createdAt: new Date("2026-04-24T19:44:00.000Z"),
      },
      {
        chatId: chat.id,
        senderId: luna.id,
        content: "Perfect, I will send the challenge through the app.",
        createdAt: new Date("2026-04-24T19:46:00.000Z"),
      },
    ],
  });

  const secondChat = await prisma.chat.create({
    data: {
      userAId: luna.id,
      userBId: sofia.id,
      lastMessageAt: new Date("2026-04-25T16:35:00.000Z"),
    },
  });

  await prisma.message.createMany({
    data: [
      {
        chatId: secondChat.id,
        senderId: sofia.id,
        content: "¿Te va bien jugar el domingo por la tarde?",
        createdAt: new Date("2026-04-25T16:22:00.000Z"),
        readAt: new Date("2026-04-25T16:28:00.000Z"),
      },
      {
        chatId: secondChat.id,
        senderId: luna.id,
        content: "Sí, perfecto. Te mando reto en un rato.",
        createdAt: new Date("2026-04-25T16:35:00.000Z"),
      },
    ],
  });

  await prisma.notification.createMany({
    data: [
      {
        userId: manaVaultOwner.id,
        actorId: admin.id,
        type: NotificationType.STORE_REQUEST,
        title: "Nueva solicitud para Mana Vault Madrid",
        body: "LeagueAdmin ha solicitado unirse a tu tienda principal.",
        link: `/stores/${manaVault.slug}/requests`,
      },
      {
        userId: manaVaultOwner.id,
        actorId: diego.id,
        type: NotificationType.STORE_REQUEST,
        title: "Nueva solicitud para Pixel Tavern Valencia",
        body: "DiegoSpark ha solicitado unirse a tu tienda de Valencia.",
        link: `/stores/${pixelTavern.slug}/requests`,
      },
      {
        userId: luna.id,
        actorId: manaVaultOwner.id,
        type: NotificationType.STORE_REQUEST_RESOLVED,
        title: "Solicitud aceptada",
        body: "Tu solicitud para Mana Vault Madrid fue aceptada y ya apareces como miembro.",
        link: `/stores/${manaVault.slug}`,
        isRead: true,
        readAt: new Date("2026-03-21T11:30:00.000Z"),
      },
      {
        userId: diego.id,
        actorId: manaVaultOwner.id,
        type: NotificationType.STORE_REQUEST_RESOLVED,
        title: "Solicitud rechazada",
        body: "Mana Vault Madrid ha rechazado tu solicitud de entrada por ahora.",
        link: `/stores/${manaVault.slug}`,
      },
      {
        userId: marco.id,
        actorId: luna.id,
        type: NotificationType.CHALLENGE_UPDATED,
        title: "Reto confirmado",
        body: "LunaStorm ha confirmado el horario del reto en Madrid.",
        link: "/challenges",
        isRead: true,
        readAt: new Date("2026-04-24T18:00:00.000Z"),
      },
      {
        userId: alex.id,
        actorId: sofia.id,
        type: NotificationType.MATCH_DISPUTED,
        title: "Disputa abierta",
        body: "Tu match con SofiaNova esta esperando revision de un admin.",
        link: `/matches/${disputedMatch.id}`,
      },
      {
        userId: luna.id,
        actorId: marco.id,
        type: NotificationType.CHALLENGE_RECEIVED,
        title: "Reto pendiente",
        body: "MarcoBlade te ha enviado un nuevo reto online de One Piece.",
        link: "/challenges?tab=received",
      },
      {
        userId: diego.id,
        actorId: luna.id,
        type: NotificationType.CHALLENGE_UPDATED,
        title: "Nueva fecha propuesta",
        body: "LunaStorm ha movido el reto a una nueva fecha pendiente de tu confirmacion.",
        link: "/challenges?tab=sent",
      },
      {
        userId: luna.id,
        actorId: marco.id,
        type: NotificationType.NEW_MESSAGE,
        title: "Mensaje nuevo",
        body: "MarcoBlade te ha respondido en el chat.",
        link: "/chat",
      },
      {
        userId: luna.id,
        actorId: alex.id,
        type: NotificationType.FRIEND_REQUEST,
        title: "Nueva solicitud de amistad",
        body: "AlexTempo quiere agregarte como amigo.",
        link: `/profile/${alex.id}`,
      },
      {
        userId: marco.id,
        actorId: luna.id,
        type: NotificationType.FRIEND_REQUEST_ACCEPTED,
        title: "Solicitud de amistad aceptada",
        body: "LunaStorm ha aceptado tu solicitud. Ya podéis chatear.",
        link: `/chat?with=${luna.id}`,
      },
    ],
  });

  console.log("Seed completed successfully.");
  console.log(`Demo credentials: admin@tcgleague.dev / ${demoPassword}`);
  console.log(`Sample player: luna@tcgleague.dev / ${demoPassword}`);
  console.log(`Pending join request id: ${pendingJoinRequest.id}`);
  console.log(`Second pending join request id: ${pendingPixelJoinRequest.id}`);
  console.log(`Pending challenge id: ${pendingChallenge.id}`);
  console.log(`Rejected challenge id: ${rejectedChallenge.id}`);
  console.log(`Counter challenge id: ${counterChallenge.id}`);
  console.log(`Accepted match id: ${acceptedMatch.id}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
