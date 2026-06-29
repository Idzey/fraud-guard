import { Skeleton } from "@/components/ui/skeleton";

export function LoadingCards({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, index) => (
        <Skeleton key={index} className="h-32 w-full rounded-lg" />
      ))}
    </div>
  );
}

