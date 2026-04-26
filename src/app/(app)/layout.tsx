import type { ReactNode } from "react";

import { AppShell } from "@/components/layout/app-shell";
import { getCurrentUserSummary } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function ProtectedAppLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { pendingActions, profile, session, user } = await getCurrentUserSummary();

  return (
    <AppShell
      pendingActions={pendingActions}
      user={{
        email: user.email,
        role: session.user.role,
        image: user.image,
      }}
      profile={{
        displayName: profile.displayName,
        nick: profile.nick,
        city: profile.city,
        mainGame: profile.mainGame,
        primaryStore: profile.primaryStore,
      }}
    >
      {children}
    </AppShell>
  );
}
