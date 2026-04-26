import { redirect } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoginForm } from "@/features/auth/components/login-form";
import { getAuthEntryRedirectTarget } from "@/lib/auth/session";

export default async function LoginPage() {
  const redirectTarget = await getAuthEntryRedirectTarget();

  if (redirectTarget) {
    redirect(redirectTarget);
  }

  return (
    <Card className="border-white/10 bg-slate-950/70 text-white shadow-2xl shadow-black/30">
      <CardHeader className="space-y-2">
        <CardTitle className="text-3xl">Inicia sesion</CardTitle>
        <p className="text-sm text-white/60">
          Entra con tu cuenta para acceder al dashboard competitivo.
        </p>
      </CardHeader>
      <CardContent>
        <LoginForm
          githubEnabled={Boolean(process.env.GITHUB_ID && process.env.GITHUB_SECRET)}
          googleEnabled={Boolean(
            process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET,
          )}
        />
      </CardContent>
    </Card>
  );
}
