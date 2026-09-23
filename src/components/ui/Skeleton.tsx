export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`shimmer-overlay rounded-lg bg-ink-100 ${className}`} />;
}

export function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-ink-200 bg-cream-50 p-6">
      <div className="flex items-center gap-2">
        <Skeleton className="h-3.5 w-6" />
        <Skeleton className="h-3.5 w-3.5 rounded-full" />
      </div>
      <Skeleton className="mt-3 h-5 w-2/3" />
      <Skeleton className="mt-2 h-4 w-full" />
      <Skeleton className="mt-1 h-4 w-4/5" />
      <Skeleton className="mt-5 h-1.5 w-full rounded-full" />
    </div>
  );
}
