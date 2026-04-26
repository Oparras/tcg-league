import { Skeleton } from "@/components/ui/skeleton";

export default function StoreDetailLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-52 rounded-[32px] bg-white/10" />
      <section className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <div className="space-y-6">
          <Skeleton className="h-80 rounded-[32px] bg-white/10" />
          <Skeleton className="h-72 rounded-[32px] bg-white/10" />
        </div>
        <div className="space-y-6">
          <Skeleton className="h-64 rounded-[32px] bg-white/10" />
          <Skeleton className="h-64 rounded-[32px] bg-white/10" />
          <Skeleton className="h-56 rounded-[32px] bg-white/10" />
        </div>
      </section>
    </div>
  );
}
