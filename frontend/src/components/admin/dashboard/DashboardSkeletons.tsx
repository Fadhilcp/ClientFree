const SkeletonBox = ({ className = "" }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg ${className}`} />
);

export const StatCardsSkeleton = () => (
  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
    {Array.from({ length: 8 }).map((_, i) => (
      <SkeletonBox key={i} className="h-24" />
    ))}
  </div>
);

export const ChartSkeleton = () => (
  <SkeletonBox className="h-72 w-full" />
);

export const TableSkeleton = () => (
  <div className="space-y-2">
    <SkeletonBox className="h-10 w-full" />
    {Array.from({ length: 5 }).map((_, i) => (
      <SkeletonBox key={i} className="h-12 w-full" />
    ))}
  </div>
);