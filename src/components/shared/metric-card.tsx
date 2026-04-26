import type { LucideIcon } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function MetricCard({
  title,
  value,
  caption,
  icon: Icon,
}: {
  title: string;
  value: string;
  caption: string;
  icon: LucideIcon;
}) {
  return (
    <Card className="border-white/10 bg-white/5 text-white shadow-2xl shadow-black/10">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-sm font-medium text-white/70">{title}</CardTitle>
        <span className="rounded-full border border-white/10 bg-white/5 p-2 text-cyan-300">
          <Icon className="size-4" />
        </span>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-semibold tracking-tight">{value}</div>
        <p className="mt-1 text-sm text-white/60">{caption}</p>
      </CardContent>
    </Card>
  );
}
