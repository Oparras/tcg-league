import { Clock3 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function FeaturePlaceholder({
  title,
  phase,
  description,
  bullets,
}: {
  title: string;
  phase: string;
  description: string;
  bullets: string[];
}) {
  return (
    <Card className="border-white/10 bg-white/5 text-white shadow-2xl shadow-black/10">
      <CardHeader className="space-y-4">
        <Badge
          variant="outline"
          className="w-fit border-cyan-300/30 bg-cyan-300/10 text-cyan-100"
        >
          {phase}
        </Badge>
        <div className="flex items-center gap-3">
          <span className="rounded-full border border-white/10 bg-white/5 p-2 text-amber-300">
            <Clock3 className="size-4" />
          </span>
          <div>
            <CardTitle className="text-2xl">{title}</CardTitle>
            <p className="mt-2 text-sm text-white/65">{description}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {bullets.map((bullet) => (
          <div
            key={bullet}
            className="rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm text-white/70"
          >
            {bullet}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
