import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth/options";
import {
  getPostAuthRedirectTarget,
  requireAuth,
  requireOnboardingCompleted,
} from "@/lib/auth/permissions";
import { getPendingActionSummary } from "@/lib/pending-actions";

export async function getServerAuthSession() {
  return getServerSession(authOptions);
}

export async function requireUserSession() {
  return requireAuth();
}

export async function getAuthEntryRedirectTarget() {
  return getPostAuthRedirectTarget();
}

export async function getCurrentUserSummary() {
  const { profile, session, user } = await requireOnboardingCompleted();
  const pendingActions = await getPendingActionSummary(session.user.id);

  return {
    session,
    pendingActions,
    user,
    profile,
  };
}
