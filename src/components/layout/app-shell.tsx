import type { UserRole } from "@prisma/client";
import type { ReactNode } from "react";
import { MapPin, Menu, Swords } from "lucide-react";

import { Logo } from "@/components/shared/logo";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { PendingActionsMenu } from "@/components/layout/pending-actions-menu";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { UserMenu } from "@/components/layout/user-menu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { PendingActionSummary } from "@/lib/pending-actions";

type AppShellProps = {
  pendingActions: PendingActionSummary;
  children: ReactNode;
  user: {
    email: string;
    role: UserRole;
    image?: string | null;
  };
  profile: {
    displayName: string;
    nick: string;
    city: string;
    mainGame?: { name: string } | null;
    primaryStore?: { name: string } | null;
  };
};

function MobileNavigation({ role }: { role: UserRole }) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="rounded-full border-white/10 bg-white/5 text-white md:hidden"
        >
          <Menu className="size-4" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="border-white/10 bg-slate-950 text-white">
        <SheetHeader>
          <SheetTitle className="text-left text-white">Navegacion</SheetTitle>
        </SheetHeader>
        <div className="mt-6">
          <SidebarNav role={role} />
        </div>
      </SheetContent>
    </Sheet>
  );
}

export function AppShell({
  children,
  pendingActions,
  user,
  profile,
}: AppShellProps) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(6,182,212,0.18),transparent_30%),radial-gradient(circle_at_top_right,rgba(251,191,36,0.12),transparent_20%),linear-gradient(180deg,#07111f_0%,#020617_100%)]">
      <div className="mx-auto flex min-h-screen max-w-[1600px] gap-6 px-4 py-4 md:px-6">
        <aside className="hidden w-[290px] shrink-0 flex-col rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur md:flex">
          <Logo />
          <div className="mt-8 rounded-3xl border border-white/10 bg-slate-950/50 p-4 text-white">
            <p className="text-xs uppercase tracking-[0.3em] text-cyan-300/80">
              Mi perfil activo
            </p>
            <h2 className="mt-2 text-xl font-semibold">
              @{profile.nick}
            </h2>
            <div className="mt-4 flex flex-wrap gap-2 text-xs text-white/60">
              <Badge variant="outline" className="border-white/10 bg-white/5 text-white">
                {user.role.toLowerCase()}
              </Badge>
              {profile.mainGame?.name ? (
                <Badge variant="outline" className="border-white/10 bg-white/5 text-white">
                  {profile.mainGame.name}
                </Badge>
              ) : null}
            </div>
            <div className="mt-5 space-y-2 text-sm text-white/60">
              <div className="flex items-center gap-2">
                <MapPin className="size-4 text-amber-300" />
                {profile.city}
              </div>
              <div className="flex items-center gap-2">
                <Swords className="size-4 text-cyan-300" />
                {profile.primaryStore?.name ?? "Sin tienda principal"}
              </div>
            </div>
          </div>
          <Separator className="my-5 bg-white/10" />
          <SidebarNav role={user.role} />
        </aside>

        <div className="flex min-h-screen flex-1 flex-col">
          <header className="sticky top-4 z-30 mb-6 flex items-center justify-between rounded-[28px] border border-white/10 bg-slate-950/70 px-4 py-3 text-white backdrop-blur md:px-6 md:py-4">
            <div className="flex items-center gap-2 md:gap-3">
              <MobileNavigation role={user.role} />
              <div className="min-w-0">
                <p className="hidden text-xs uppercase tracking-[0.25em] text-cyan-300/80 md:block">
                  TCG League
                </p>
                <h1 className="text-base font-semibold md:hidden">
                  TCG League
                </h1>
                <h1 className="hidden text-xl font-semibold md:block">
                  Panel de juego y comunidad
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2 md:gap-3">
              <PendingActionsMenu summary={pendingActions} />
              <div className="hidden md:block">
                <ThemeToggle />
              </div>
              <UserMenu
                displayName={profile.displayName}
                email={user.email}
                image={user.image}
                nick={profile.nick}
                role={user.role}
              />
            </div>
          </header>

          <main className="flex-1">{children}</main>
        </div>
      </div>
    </div>
  );
}
