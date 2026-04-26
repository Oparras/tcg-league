import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-40 rounded-[32px] bg-white/10" />
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-32 rounded-[24px] bg-white/10" />
        ))}
      </section>
      <Skeleton className="h-64 rounded-[28px] bg-white/10" />
      <section className="grid gap-6 xl:grid-cols-2">
        <Skeleton className="h-80 rounded-[28px] bg-white/10" />
        <Skeleton className="h-80 rounded-[28px] bg-white/10" />
      </section>
    </div>
  );
}
