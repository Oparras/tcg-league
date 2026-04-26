"use client";

import Link from "next/link";
import { Bell } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { PendingActionItem, PendingActionSummary } from "@/lib/pending-actions";

function getPendingLabel(total: number) {
  if (total === 1) {
    return "1 pendiente";
  }

  return `${total} pendientes`;
}

function getActionLabel(item: PendingActionItem) {
  if (item.type === "challenge_received" || item.type === "counter_proposal") {
    return "Ver reto";
  }

  if (item.type === "match_confirmation") {
    return "Ver match";
  }

  if (item.type === "store_join_request") {
    return "Gestionar solicitudes";
  }

  if (item.type === "friend_request") {
    return "Ver solicitudes";
  }

  return "Resolver disputa";
}

export function PendingActionsMenu({
  summary,
}: {
  summary: PendingActionSummary;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-2 py-2 text-sm text-white/70 transition-colors hover:bg-white/10 md:px-3"
        >
          <Bell className="size-4 text-amber-300" />
          <span className="md:hidden">{summary.total}</span>
          <span className="hidden md:inline">{getPendingLabel(summary.total)}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-[calc(100vw-2rem)] max-w-[420px] border border-white/10 bg-slate-950/95 p-2 text-white"
      >
        <DropdownMenuLabel className="px-2 py-1 text-sm text-white/80">
          Pendientes accionables
        </DropdownMenuLabel>
        <div className="grid grid-cols-2 gap-2 px-2 pb-2 pt-1 text-xs text-white/70">
          <div className="rounded-lg border border-white/10 bg-white/5 p-2">
            Retos recibidos: {summary.challengesReceived}
          </div>
          <div className="rounded-lg border border-white/10 bg-white/5 p-2">
            Contraofertas: {summary.counterProposals}
          </div>
          <div className="rounded-lg border border-white/10 bg-white/5 p-2">
            Resultados por confirmar: {summary.matchConfirmations}
          </div>
          <div className="rounded-lg border border-white/10 bg-white/5 p-2">
            Solicitudes de tienda: {summary.storeJoinRequests}
          </div>
          <div className="rounded-lg border border-white/10 bg-white/5 p-2 col-span-2">
            Disputas abiertas: {summary.disputes}
          </div>
          <div className="rounded-lg border border-white/10 bg-white/5 p-2 col-span-2">
            Solicitudes de amistad: {summary.friendRequests}
          </div>
        </div>
        <DropdownMenuSeparator className="bg-white/10" />
        {summary.items.length ? (
          summary.items.slice(0, 8).map((item, index) => (
            <DropdownMenuItem
              key={`${item.type}-${item.href}-${index}`}
              className="rounded-lg p-0 focus:bg-white/10"
              asChild
            >
              <Link
                href={item.href}
                className="flex w-full items-start justify-between gap-4 px-3 py-2"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white">{item.title}</p>
                  <p className="truncate text-xs text-white/60">{item.description}</p>
                </div>
                <Badge
                  variant="outline"
                  className="shrink-0 border-white/20 bg-white/5 text-[10px] text-white/80"
                >
                  {getActionLabel(item)}
                </Badge>
              </Link>
            </DropdownMenuItem>
          ))
        ) : (
          <div className="px-3 py-4 text-sm text-white/60">
            No tienes acciones pendientes.
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
