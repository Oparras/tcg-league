import { redirect } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EditProfileForm } from "@/features/profile/components/edit-profile-form";
import { getCurrentUserState } from "@/lib/auth/permissions";
import { DEFAULT_MAIN_GAME } from "@/lib/constants/games";
import { getDb } from "@/lib/db";

function buildNickFallback(email?: string | null) {
  return (
    email
      ?.split("@")[0]
      ?.toLowerCase()
      .replace(/[^a-z0-9_.-]/g, "")
      .slice(0, 20) || "player"
  );
}

export default async function OnboardingPage() {
  const state = await getCurrentUserState();

  if (!state?.session.user.id) {
    redirect("/login");
  }

  if (!state.user) {
    redirect("/login");
  }

  if (state.user && state.profile?.onboardingCompleted) {
    redirect("/dashboard");
  }

  const db = getDb();
  const games = await db.game.findMany({
    where: { isActive: true },
    orderBy: [{ isFeatured: "desc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      slug: true,
    },
  });

  const defaultGame =
    games.find((game) => game.slug === DEFAULT_MAIN_GAME.slug) ?? games[0] ?? null;

  return (
    <div className="space-y-6">
      <Card className="border-white/10 bg-slate-950/70 text-white shadow-2xl shadow-black/30">
        <CardHeader className="space-y-2">
          <CardTitle className="text-3xl">Completa tu onboarding</CardTitle>
          <p className="text-sm text-white/60">
            Tu cuenta ya existe, pero necesitamos los datos base del perfil para
            desbloquear dashboard, ranking y retos.
          </p>
        </CardHeader>
        <CardContent className="text-sm text-white/65">
          Completa nick, ciudad, disponibilidad y juego principal. En cuanto lo
          guardes entraras directamente al dashboard.
        </CardContent>
      </Card>

      <EditProfileForm
        badgeLabel="Onboarding"
        description="Termina tu perfil base para entrar en la zona privada sin volver a pasar por registro."
        games={games.map(({ id, name }) => ({ id, name }))}
        redirectTo="/dashboard"
        submitLabel="Guardar y entrar"
        title="Perfil inicial"
        defaultValues={{
          nick: state.profile?.nick ?? buildNickFallback(state.session.user.email),
          displayName:
            state.profile?.displayName ??
            state.session.user.name ??
            state.session.user.email?.split("@")[0] ??
            "Player",
          avatarUrl: state.profile?.avatarUrl ?? null,
          city:
            state.profile?.city && state.profile.city !== "Pendiente"
              ? state.profile.city
              : "",
          bio: state.profile?.bio ?? null,
          mainGameId: state.profile?.mainGameId ?? defaultGame?.id ?? "",
          availabilityStatus: state.profile?.status ?? "AVAILABLE",
        }}
      />
    </div>
  );
}
