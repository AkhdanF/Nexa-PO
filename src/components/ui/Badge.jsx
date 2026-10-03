// Reusable Badge Component (Disciplined, Non-Candy Styling)
import React from 'react';

export function Badge({
  children,
  variant = 'neutral', // 'neutral' | 'success' | 'warning' | 'danger' | 'info'
  size = 'md', // 'sm' | 'md'
  dot = false,
  className = '',
}) {
  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-0.5 gap-1.5',
  };

  const variantStyles = {
    neutral: 'bg-slate-100/80 text-slate-700 border-slate-200/70',
    success: 'bg-emerald-50/80 text-emerald-800 border-emerald-200/60',
    warning: 'bg-amber-50/80 text-amber-800 border-amber-200/60',
    danger: 'bg-rose-50/80 text-rose-800 border-rose-200/60',
    info: 'bg-indigo-50/80 text-indigo-800 border-indigo-200/60',
  };

  const dotColors = {
    neutral: 'bg-slate-400',
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    danger: 'bg-rose-500',
    info: 'bg-indigo-500',
  };

  return (
    <span
      className={`inline-flex items-center font-semibold rounded-lg border backdrop-blur-xs ${sizeStyles[size] || sizeStyles.md} ${variantStyles[variant] || variantStyles.neutral} ${className} whitespace-nowrap`}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full ${dotColors[variant] || dotColors.neutral} shrink-0`}
        />
      )}
      <span>{children}</span>
    </span>
  );
}
