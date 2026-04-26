"use client";

import type { UserRole } from "@prisma/client";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { navigationItems } from "@/lib/constants/navigation";
import { cn } from "@/lib/utils";

export function SidebarNav({ role }: { role: UserRole }) {
  const pathname = usePathname();

  return (
    <nav className="space-y-2">
      {navigationItems
        .filter((item) => !item.roles || item.roles.includes(role))
        .map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-start gap-3 rounded-2xl border px-4 py-3 transition-colors",
                isActive
                  ? "border-cyan-300/40 bg-cyan-300/10 text-white"
                  : "border-transparent bg-white/5 text-white/70 hover:border-white/10 hover:bg-white/10 hover:text-white",
              )}
            >
              <Icon className="mt-0.5 size-4 shrink-0" />
              <span className="space-y-1">
                <span className="block text-sm font-medium">{item.label}</span>
                <span className="block text-xs text-white/50">
                  {item.description}
                </span>
              </span>
            </Link>
          );
        })}
    </nav>
  );
}
