
interface LoadingSkeletonProps {
  lines?: number;
  className?: string;
}

function SkeletonLine({ width = 'full' }: { width?: string }) {
  return (
    <div
      className={`shimmer h-3.5 rounded-full bg-white/5 w-${width}`}
      aria-hidden="true"
    />
  );
}

export function LoadingSkeleton({ lines = 4, className = '' }: LoadingSkeletonProps) {
  return (
    <div className={`space-y-3 ${className}`} role="status" aria-label="Loading content">
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonLine
          key={i}
          width={i % 3 === 2 ? '3/4' : 'full'}
        />
      ))}
      <span className="sr-only">Loading…</span>
    </div>
  );
}

export function ResultSkeleton() {
  return (
    <div className="space-y-6" role="status" aria-label="Analyzing content…">
      {/* Tab skeleton */}
      <div className="flex gap-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="shimmer h-9 w-28 rounded-lg bg-white/5" aria-hidden="true" />
        ))}
      </div>
      {/* Content skeleton */}
      <div className="space-y-4">
        <div className="shimmer h-5 w-2/5 rounded-full bg-white/5" aria-hidden="true" />
        <LoadingSkeleton lines={5} />
        <div className="shimmer h-5 w-1/3 rounded-full bg-white/5 mt-6" aria-hidden="true" />
        <LoadingSkeleton lines={3} />
      </div>
      <span className="sr-only">Analyzing content…</span>
    </div>
  );
}
