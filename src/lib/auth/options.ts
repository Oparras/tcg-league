import { LinkedAccountType, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";

import { getDb } from "@/lib/db";
import { loginSchema } from "@/lib/validations/auth";

async function buildUniqueNick(baseValue: string) {
  const db = getDb();
  const normalized = baseValue
    .toLowerCase()
    .replace(/[^a-z0-9_.-]/g, "")
    .slice(0, 14);

  let nick = normalized || "player";
  let suffix = 1;

  while (await db.playerProfile.findUnique({ where: { nick } })) {
    suffix += 1;
    nick = `${normalized || "player"}${suffix}`.slice(0, 20);
  }

  return nick;
}

async function upsertOAuthUser(input: {
  email: string;
  image?: string | null;
  name?: string | null;
  provider: string;
  providerAccountId: string;
}) {
  const db = getDb();
  const email = input.email.toLowerCase();
  const existing = await db.user.findUnique({
    where: { email },
    include: { playerProfile: true },
  });

  if (existing) {
    const updated = await db.user.update({
      where: { id: existing.id },
      data: {
        image: existing.image ?? input.image ?? undefined,
      },
      include: { playerProfile: true },
    });

    await db.linkedAccount.upsert({
      where: {
        provider_providerAccountId: {
          provider: input.provider,
          providerAccountId: input.providerAccountId,
        },
      },
      update: {
        displayName: input.name ?? updated.playerProfile?.displayName ?? undefined,
        type: LinkedAccountType.SOCIAL,
      },
      create: {
        userId: updated.id,
        provider: input.provider,
        providerAccountId: input.providerAccountId,
        type: LinkedAccountType.SOCIAL,
        displayName: input.name ?? undefined,
      },
    });

    return updated;
  }

  const nick = await buildUniqueNick(input.name ?? email.split("@")[0] ?? "player");

  return db.user.create({
    data: {
      email,
      image: input.image ?? undefined,
      role: UserRole.PLAYER,
      playerProfile: {
        create: {
          nick,
          displayName: input.name ?? nick,
          city: "Pendiente",
          avatarUrl: input.image ?? undefined,
          onboardingCompleted: false,
        },
      },
      linkedAccounts: {
        create: {
          provider: input.provider,
          providerAccountId: input.providerAccountId,
          type: LinkedAccountType.SOCIAL,
          displayName: input.name ?? nick,
        },
      },
    },
    include: { playerProfile: true },
  });
}

const providers: NextAuthOptions["providers"] = [
  CredentialsProvider({
    name: "Credentials",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      const parsed = loginSchema.safeParse(credentials);

      if (!parsed.success) {
        return null;
      }

      const db = getDb();
      const user = await db.user.findUnique({
        where: { email: parsed.data.email.toLowerCase() },
        include: { playerProfile: true },
      });

      if (!user?.passwordHash) {
        return null;
      }

      const passwordIsValid = await bcrypt.compare(
        parsed.data.password,
        user.passwordHash,
      );

      if (!passwordIsValid) {
        return null;
      }

      return {
        id: user.id,
        email: user.email,
        image: user.image,
        role: user.role,
        nick: user.playerProfile?.nick ?? null,
        onboardingCompleted: user.playerProfile?.onboardingCompleted ?? false,
        name: user.playerProfile?.displayName ?? user.email,
      };
    },
  }),
];

if (process.env.GITHUB_ID && process.env.GITHUB_SECRET) {
  providers.push(
    GitHubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
  );
}

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  );
}

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers,
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.userId = user.id;
        token.role = user.role as UserRole;
        token.nick = ("nick" in user ? user.nick : null) ?? null;
        token.onboardingCompleted =
          ("onboardingCompleted" in user ? user.onboardingCompleted : false) ?? false;
      }

      if (account && account.provider !== "credentials" && token.email) {
        const dbUser = await upsertOAuthUser({
          email: token.email,
          image: token.picture,
          name: token.name,
          provider: account.provider,
          providerAccountId: account.providerAccountId,
        });

        token.userId = dbUser.id;
        token.role = dbUser.role;
        token.nick = dbUser.playerProfile?.nick ?? null;
        token.onboardingCompleted =
          dbUser.playerProfile?.onboardingCompleted ?? false;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.userId as string;
        session.user.role = token.role as UserRole;
        session.user.nick = (token.nick as string | null) ?? null;
        session.user.onboardingCompleted = Boolean(token.onboardingCompleted);
      }

      return session;
    },
  },
  debug: process.env.NODE_ENV === "development",
};
