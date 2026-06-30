'use client'

import { cn } from '@/lib/utils'

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn('glass-card p-5 space-y-4 animate-pulse', className)}>
      <div className="flex items-center gap-3">
        <div className="skeleton h-10 w-10 rounded-full" />
        <div className="flex-1 space-y-2">
          <div className="skeleton h-4 w-3/4 rounded" />
          <div className="skeleton h-3 w-1/2 rounded" />
        </div>
      </div>
      <div className="skeleton h-32 w-full rounded-xl" />
      <div className="space-y-2">
        <div className="skeleton h-3 w-full rounded" />
        <div className="skeleton h-3 w-5/6 rounded" />
      </div>
    </div>
  )
}

export function SkeletonGrid({ count = 6, cols = 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' }: { count?: number; cols?: string }) {
  return (
    <div className={`grid ${cols} gap-6`}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} className={`delay-${Math.min(i + 1, 3)}00`} />
      ))}
    </div>
  )
}
