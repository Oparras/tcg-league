import { Skeleton } from "@/components/ui/skeleton";

export default function ChatLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-32 rounded-[32px] bg-white/10" />
      <section className="grid gap-6 xl:grid-cols-[360px_1fr]">
        <div className="space-y-6">
          <Skeleton className="h-60 rounded-[28px] bg-white/10" />
          <Skeleton className="h-72 rounded-[28px] bg-white/10" />
        </div>
        <div className="space-y-6">
          <Skeleton className="h-72 rounded-[28px] bg-white/10" />
          <Skeleton className="h-[520px] rounded-[28px] bg-white/10" />
        </div>
      </section>
    </div>
  );
}
