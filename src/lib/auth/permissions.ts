import { MembershipStatus, UserRole } from "@prisma/client";
import { getServerSession } from "next-auth";
import { notFound, redirect } from "next/navigation";

import { authOptions } from "@/lib/auth/options";
import { getDb } from "@/lib/db";

async function getUserById(userId: string) {
  return getDb().user.findUnique({
    where: { id: userId },
    include: {
      playerProfile: {
        include: {
          mainGame: true,
          primaryStore: true,
        },
      },
      storeMemberships: {
        where: {
          status: MembershipStatus.ACTIVE,
        },
        include: {
          store: true,
        },
        orderBy: [{ isPrimary: "desc" }, { joinedAt: "asc" }],
      },
    },
  });
}

export async function requireAuth() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  return session;
}

export async function getCurrentUser() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return null;
  }

  return getUserById(session.user.id);
}

export async function getCurrentUserState() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return null;
  }

  const user = await getUserById(session.user.id);
  const profile = user?.playerProfile ?? null;

  return {
    session,
    user,
    profile,
    hasProfile: Boolean(profile),
    onboardingCompleted: Boolean(profile?.onboardingCompleted),
  };
}

export async function getPostAuthRedirectTarget() {
  const state = await getCurrentUserState();

  if (!state) {
    return null;
  }

  if (!state.user) {
    return null;
  }

  if (!state.profile || !state.onboardingCompleted) {
    return "/onboarding";
  }

  return "/dashboard";
}

export async function requireOnboardingCompleted() {
  const state = await getCurrentUserState();

  if (!state) {
    redirect("/login");
  }

  if (!state.user) {
    redirect("/login");
  }

  if (!state.profile || !state.onboardingCompleted) {
    redirect("/onboarding");
  }

  return {
    session: state.session,
    user: state.user,
    profile: state.profile,
    hasProfile: true,
    onboardingCompleted: true,
  };
}

export async function canEditProfile(userId: string) {
  const session = await getServerSession(authOptions);

  return session?.user?.id === userId;
}

export async function getStoreOwnerOrAdminAccess(storeId: string) {
  const [session, store] = await Promise.all([
    requireAuth(),
    getDb().store.findUnique({
      where: { id: storeId },
      select: {
        id: true,
        slug: true,
        name: true,
        ownerId: true,
      },
    }),
  ]);

  if (!store) {
    notFound();
  }

  const isAdmin = session.user.role === UserRole.ADMIN;
  const isOwner = store.ownerId === session.user.id;

  return {
    session,
    store,
    isAdmin,
    isOwner,
    hasAccess: isAdmin || isOwner,
  };
}

export async function requireStoreOwnerOrAdmin(storeId: string) {
  const access = await getStoreOwnerOrAdminAccess(storeId);

  if (!access.hasAccess) {
    redirect(`/stores/${access.store.slug}`);
  }

  return access;
}

export async function requireAdmin() {
  const session = await requireAuth();

  if (session.user.role !== UserRole.ADMIN) {
    redirect("/dashboard");
  }

  return session;
}
