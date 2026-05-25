export function Skeleton({ width = '100%', height = 14, className = '' }) {
  return (
    <div
      className={`skeleton${className ? ` ${className}` : ''}`}
      style={{ width, height }}
      aria-hidden="true"
    />
  )
}

export function SkeletonCard({ lines = 3 }) {
  return (
    <div className="skeleton-card" aria-hidden="true">
      <Skeleton height={18} width="40%" />
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} height={12} width={i === lines - 1 ? '70%' : '100%'} />
      ))}
    </div>
  )
}
