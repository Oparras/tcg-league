import { Skeleton } from "@/components/ui/skeleton";

export default function StoresLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-36 rounded-[32px] bg-white/10" />
      <Skeleton className="h-28 rounded-[32px] bg-white/10" />
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton
            key={index}
            className="h-72 rounded-[32px] bg-white/10"
          />
        ))}
      </section>
    </div>
  );
}
