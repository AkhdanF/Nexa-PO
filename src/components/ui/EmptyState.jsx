// Reusable Empty State Component
import React from 'react';
import { PackageOpen } from 'lucide-react';
import { Button } from './Button.jsx';

export function EmptyState({
  icon: Icon = PackageOpen,
  title = 'Belum Ada Data',
  description = 'Data akan muncul di sini setelah Anda menambahkannya.',
  actionLabel = null,
  onAction = null,
  secondaryActionLabel = null,
  onSecondaryAction = null,
  className = '',
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-8 sm:p-12 border border-dashed border-stone-300 rounded-xl bg-stone-50/50 ${className}`}
    >
      <div className="w-12 h-12 rounded-xl bg-white border border-stone-200/80 shadow-xs flex items-center justify-center text-slate-400 mb-3.5">
        <Icon className="w-6 h-6 stroke-[1.5]" />
      </div>

      <h4 className="text-sm font-semibold text-slate-900 tracking-tight">{title}</h4>
      <p className="text-xs text-slate-500 max-w-sm mt-1 mb-5 leading-relaxed">
        {description}
      </p>

      {(actionLabel || secondaryActionLabel) && (
        <div className="flex flex-wrap items-center justify-center gap-2">
          {actionLabel && onAction && (
            <Button variant="primary" size="sm" onClick={onAction}>
              {actionLabel}
            </Button>
          )}
          {secondaryActionLabel && onSecondaryAction && (
            <Button variant="outline" size="sm" onClick={onSecondaryAction}>
              {secondaryActionLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
