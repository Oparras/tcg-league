import { UserRole } from "@prisma/client";
import {
  CalendarDays,
  LayoutDashboard,
  MessageSquare,
  ShieldCheck,
  Store,
  Swords,
  Trophy,
  UserRound,
} from "lucide-react";

export type NavigationItem = {
  href: string;
  label: string;
  description: string;
  icon: typeof LayoutDashboard;
  roles?: UserRole[];
};

export const navigationItems: NavigationItem[] = [
  {
    href: "/dashboard",
    label: "Dashboard",
    description: "Tu snapshot competitivo",
    icon: LayoutDashboard,
  },
  {
    href: "/stores",
    label: "Stores",
    description: "Tiendas y equipos",
    icon: Store,
  },
  {
    href: "/rankings",
    label: "Rankings",
    description: "ELO global y por juego",
    icon: Trophy,
  },
  {
    href: "/challenges",
    label: "Retos",
    description: "Calendario y confirmaciones",
    icon: Swords,
  },
  {
    href: "/events",
    label: "Eventos",
    description: "Torneos y registros",
    icon: CalendarDays,
  },
  {
    href: "/chat",
    label: "Amigos y Chat",
    description: "Amistades y mensajes 1:1",
    icon: MessageSquare,
  },
  {
    href: "/profile/me",
    label: "Perfil",
    description: "Identidad de jugador",
    icon: UserRound,
  },
  {
    href: "/admin",
    label: "Admin",
    description: "Moderacion y disputas",
    icon: ShieldCheck,
    roles: [UserRole.ADMIN],
  },
];
