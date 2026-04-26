import Link from "next/link";
import { redirect } from "next/navigation";
import {
  CalendarDays,
  ShieldCheck,
  Store,
  Swords,
  Trophy,
  UserRound,
} from "lucide-react";

import { Logo } from "@/components/shared/logo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAuthEntryRedirectTarget } from "@/lib/auth/session";

const quickLinks = [
  {
    title: "Ver rankings",
    copy: "Consulta el ELO global y por juego para ubicar rivales y tiendas fuertes.",
    icon: Trophy,
    href: "/rankings",
  },
  {
    title: "Explorar stores",
    copy: "Busca tiendas por ciudad o juego y revisa miembros, ladder interna y estado de solicitudes.",
    icon: Store,
    href: "/stores",
  },
  {
    title: "Editar perfil",
    copy: "Ajusta nick, ciudad, disponibilidad y juego principal desde tu area personal.",
    icon: UserRound,
    href: "/profile/me",
  },
  {
    title: "Retar jugadores",
    copy: "Prepara tus proximos enfrentamientos y deja el flujo listo para confirmaciones.",
    icon: Swords,
    href: "/challenges/new",
  },
];

export default async function MarketingPage() {
  const redirectTarget = await getAuthEntryRedirectTarget();

  if (redirectTarget) {
    redirect(redirectTarget);
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.16),transparent_30%),radial-gradient(circle_at_top_right,rgba(251,191,36,0.14),transparent_20%),linear-gradient(180deg,#07111f_0%,#020617_100%)] text-white">
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-8">
        <header className="flex flex-col gap-4 rounded-[30px] border border-white/10 bg-white/5 px-5 py-4 backdrop-blur md:flex-row md:items-center md:justify-between">
          <Logo />
          <div className="flex flex-wrap gap-3">
            <Button
              asChild
              variant="ghost"
              className="rounded-full border border-white/10 bg-white/5 text-white hover:bg-white/10"
            >
              <Link href="/login">Entrar</Link>
            </Button>
            <Button asChild className="rounded-full">
              <Link href="/register">Crear cuenta</Link>
            </Button>
          </div>
        </header>

        <section className="grid gap-10 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="space-y-8">
            <Badge
              variant="outline"
              className="border-cyan-300/30 bg-cyan-300/10 text-cyan-100"
            >
              Entorno de prueba para jugadores y testers
            </Badge>
            <div className="space-y-5">
              <h1 className="max-w-4xl text-5xl font-semibold tracking-tight md:text-7xl">
                Entra, crea perfil y prueba la liga desde dentro.
              </h1>
              <p className="max-w-2xl text-lg text-white/70 md:text-xl">
                La app ya permite navegar por tiendas, ver ranking, revisar eventos y
                preparar el flujo competitivo real del MVP.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg" className="rounded-full">
                <Link href="/register">Crear cuenta</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="rounded-full border-white/10 bg-white/5 text-white hover:bg-white/10"
              >
                <Link href="/login">Entrar</Link>
              </Button>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                "Registro con Riftbound por defecto",
                "Stores, ranking y eventos navegables",
                "Base lista para retos, matches y solicitudes",
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm text-white/70"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>

          <Card className="border-white/10 bg-slate-950/70 text-white shadow-2xl shadow-cyan-950/30">
            <CardHeader className="space-y-4">
              <Badge
                variant="outline"
                className="w-fit border-amber-300/30 bg-amber-300/10 text-amber-100"
              >
                Acceso rapido
              </Badge>
              <CardTitle className="text-2xl">
                Usa estas rutas para probar la app sin pasar por una landing comercial.
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: "Dashboard", value: "/dashboard" },
                { label: "Stores", value: "/stores" },
                { label: "Rankings", value: "/rankings" },
                { label: "Perfil", value: "/profile/me" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
                >
                  <span className="text-white/65">{item.label}</span>
                  <span className="font-semibold">{item.value}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {quickLinks.map((card) => {
            const Icon = card.icon;

            return (
              <Link key={card.title} href={card.href}>
                <Card className="h-full border-white/10 bg-white/5 text-white transition-colors hover:border-cyan-300/30 hover:bg-white/10">
                  <CardHeader className="space-y-4">
                    <span className="flex size-11 items-center justify-center rounded-2xl bg-white/5 text-cyan-300">
                      <Icon className="size-5" />
                    </span>
                    <CardTitle>{card.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-white/65">{card.copy}</CardContent>
                </Card>
              </Link>
            );
          })}
        </section>

        <section className="mt-16 grid gap-4 md:grid-cols-3">
          {[
            {
              title: "Stores",
              copy: "Consulta miembros, juegos soportados y estado de solicitud de cada tienda.",
              icon: Store,
            },
            {
              title: "Eventos",
              copy: "Revisa los proximos torneos y sus plazas sin salir del producto.",
              icon: CalendarDays,
            },
            {
              title: "Admin y owners",
              copy: "Acepta o rechaza solicitudes desde rutas protegidas por rol.",
              icon: ShieldCheck,
            },
          ].map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.title}
                className="rounded-[28px] border border-white/10 bg-slate-950/50 p-6"
              >
                <Icon className="size-5 text-amber-300" />
                <h3 className="mt-4 text-xl font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm text-white/65">{item.copy}</p>
              </div>
            );
          })}
        </section>

        <section className="mt-8 grid gap-4 md:grid-cols-2">
          <Card className="border-white/10 bg-white/5 text-white">
            <CardHeader>
              <CardTitle>Credenciales de seed</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-white/70">
              <p>
                <span className="font-medium text-white">Admin:</span> admin@tcgleague.dev / League123!
              </p>
              <p>
                <span className="font-medium text-white">Player:</span> luna@tcgleague.dev / League123!
              </p>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-white/5 text-white">
            <CardHeader>
              <CardTitle>Siguiente foco</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-white/70">
              Perfiles, stores y solicitudes son el siguiente bloque funcional del MVP.
              Esta home queda como punto de entrada rapido para pruebas.
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
