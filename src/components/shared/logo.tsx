import Link from "next/link";
import { Layers3 } from "lucide-react";

import { cn } from "@/lib/utils";

export function Logo({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  return (
    <Link
      href="/"
      className={cn(
        "inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-white backdrop-blur",
        className,
      )}
    >
      <span className="flex size-9 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 via-sky-500 to-amber-400 text-slate-950 shadow-lg shadow-cyan-500/30">
        <Layers3 className="size-4" />
      </span>
      {!compact && (
        <span className="flex flex-col leading-none">
          <span className="font-semibold tracking-wide">TCG League</span>
          <span className="text-[11px] text-white/60">
            Competitive community platform
          </span>
        </span>
      )}
    </Link>
  );
}
