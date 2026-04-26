import type { ReactNode } from "react";

import { Logo } from "@/components/shared/logo";

export const dynamic = "force-dynamic";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.16),transparent_30%),radial-gradient(circle_at_top_right,rgba(251,191,36,0.14),transparent_20%),linear-gradient(180deg,#07111f_0%,#020617_100%)] px-4 py-6 text-white md:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-6xl flex-col gap-8 md:flex-row md:items-stretch">
        <div className="flex flex-1 flex-col justify-between rounded-[32px] border border-white/10 bg-white/5 p-8 backdrop-blur">
          <div>
            <Logo />
            <div className="mt-14 max-w-xl space-y-4">
              <p className="text-xs uppercase tracking-[0.25em] text-cyan-300/80">
                TCG League MVP
              </p>
              <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
                Convierte tu comunidad TCG en una liga con identidad de producto.
              </h1>
              <p className="text-base text-white/65">
                Perfiles competitivos, tiendas, ELO, retos y eventos. Todo listo
                para seguir creciendo por fases sin rehacer la base.
              </p>
            </div>
          </div>

          <div className="grid gap-3 pt-8 md:grid-cols-3">
            {[
              "JWT auth y OAuth opcional",
              "Schema listo para Riot linking futuro",
              "Dashboard protegido y seed real",
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

        <div className="w-full md:max-w-xl">{children}</div>
      </div>
    </div>
  );
}
