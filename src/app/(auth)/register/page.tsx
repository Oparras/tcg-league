import { redirect } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RegisterForm } from "@/features/auth/components/register-form";
import { getRegisterFormOptions } from "@/features/auth/queries";
import { getAuthEntryRedirectTarget } from "@/lib/auth/session";

export default async function RegisterPage() {
  const redirectTarget = await getAuthEntryRedirectTarget();

  if (redirectTarget) {
    redirect(redirectTarget);
  }

  const options = await getRegisterFormOptions();

  return (
    <Card className="border-white/10 bg-slate-950/70 text-white shadow-2xl shadow-black/30">
      <CardHeader className="space-y-2">
        <CardTitle className="text-3xl">Crea tu perfil</CardTitle>
        <p className="text-sm text-white/60">
          Completa tu perfil base con nick, ciudad y tienda opcional. El juego principal inicial sera Riftbound.
        </p>
      </CardHeader>
      <CardContent>
        <RegisterForm stores={options.stores} />
      </CardContent>
    </Card>
  );
}
