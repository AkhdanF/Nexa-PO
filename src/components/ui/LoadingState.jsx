// Reusable Loading Skeleton Component
import React from 'react';

export function LoadingState({
  type = 'table', // 'table' | 'cards' | 'stats'
  count = 4,
  className = '',
}) {
  if (type === 'stats') {
    return (
      <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 ${className}`}>
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="bg-white border border-stone-200/80 rounded-xl p-4 animate-pulse"
          >
            <div className="h-3 bg-stone-200 rounded w-2/3 mb-3"></div>
            <div className="h-6 bg-stone-200 rounded w-4/5 mb-2"></div>
            <div className="h-2.5 bg-stone-100 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'cards') {
    return (
      <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 ${className}`}>
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="bg-white border border-stone-200/80 rounded-xl p-4 animate-pulse"
          >
            <div className="flex justify-between mb-3">
              <div className="h-4 bg-stone-200 rounded w-1/2"></div>
              <div className="h-4 bg-stone-200 rounded w-16"></div>
            </div>
            <div className="h-3 bg-stone-100 rounded w-3/4 mb-4"></div>
            <div className="h-8 bg-stone-100 rounded w-full"></div>
          </div>
        ))}
      </div>
    );
  }

  // Default: Table skeleton
  return (
    <div className={`w-full bg-white border border-stone-200/80 rounded-xl overflow-hidden ${className}`}>
      <div className="border-b border-stone-200 p-4 bg-stone-50/50 flex gap-4">
        <div className="h-4 bg-stone-200 rounded w-24"></div>
        <div className="h-4 bg-stone-200 rounded w-32"></div>
        <div className="h-4 bg-stone-200 rounded w-20 ml-auto"></div>
      </div>
      <div className="divide-y divide-stone-100">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="p-4 flex items-center gap-4 animate-pulse">
            <div className="h-4 bg-stone-200 rounded w-16"></div>
            <div className="h-4 bg-stone-200 rounded w-36"></div>
            <div className="h-4 bg-stone-100 rounded w-24 hidden md:block"></div>
            <div className="h-4 bg-stone-200 rounded w-20 ml-auto"></div>
            <div className="h-6 bg-stone-100 rounded w-16"></div>
          </div>
        ))}
      </div>
    </div>
  );
}
