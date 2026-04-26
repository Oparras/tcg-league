import { Skeleton } from "@/components/ui/skeleton";

export default function ProfileLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-56 rounded-[32px] bg-white/10" />
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton
            key={index}
            className="h-36 rounded-[32px] bg-white/10"
          />
        ))}
      </section>
      <section className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <div className="space-y-6">
          <Skeleton className="h-80 rounded-[32px] bg-white/10" />
          <Skeleton className="h-72 rounded-[32px] bg-white/10" />
        </div>
        <div className="space-y-6">
          <Skeleton className="h-96 rounded-[32px] bg-white/10" />
          <Skeleton className="h-56 rounded-[32px] bg-white/10" />
        </div>
      </section>
    </div>
  );
}
