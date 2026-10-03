// Reusable Card and StatCard Components (Glassmorphism Styled)
import React from 'react';

export function Card({
  children,
  className = '',
  padding = 'p-5',
  title = null,
  subtitle = null,
  action = null,
  footer = null,
  ...props
}) {
  return (
    <div
      className={`backdrop-blur-xl bg-white/75 border border-white/80 rounded-2xl shadow-[0_10px_30px_-5px_rgba(15,23,42,0.03)] hover:shadow-[0_15px_35px_-5px_rgba(15,23,42,0.06)] transition-all ${className}`}
      {...props}
    >
      {(title || action) && (
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/60">
          <div>
            {title && (
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
            )}
          </div>
          {action && <div className="flex items-center gap-2">{action}</div>}
        </div>
      )}

      <div className={padding}>{children}</div>

      {footer && (
        <div className="border-t border-white/60 px-5 py-3.5 bg-white/40 backdrop-blur-md rounded-b-2xl">
          {footer}
        </div>
      )}
    </div>
  );
}

export function StatCard({
  title,
  value,
  subtitle = null,
  trend = null, // e.g. { value: '+12%', isPositive: true, text: 'vs periode lalu' }
  icon: Icon = null,
  iconBg = 'bg-indigo-50/80 text-indigo-700 border border-indigo-200/50',
  tooltip = null,
  highlight = false,
  className = '',
  onClick = null,
}) {
  return (
    <div
      onClick={onClick}
      className={`backdrop-blur-xl bg-white/75 border rounded-2xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.03)] transition-all ${
        highlight
          ? 'border-indigo-600/60 ring-2 ring-indigo-500/20 shadow-md shadow-indigo-900/5'
          : 'border-white/80 hover:border-indigo-200/80 hover:shadow-[0_12px_36px_rgb(0,0,0,0.06)] hover:-translate-y-0.5'
      } ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      <div className="flex items-center justify-between gap-2">
        <span
          className="text-xs font-bold text-slate-400 tracking-wider uppercase truncate"
          title={title}
        >
          {title}
        </span>
        {Icon && (
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${iconBg}`}
          >
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="mt-3">
        <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono tabular-nums tracking-tight">
          {value}
        </div>

        {(trend || subtitle) && (
          <div className="flex items-center gap-1.5 mt-2 text-xs">
            {trend && (
              <span
                className={`font-bold font-mono tabular-nums px-1.5 py-0.5 rounded-md ${
                  trend.isPositive ? 'text-emerald-700 bg-emerald-50/80' : 'text-rose-700 bg-rose-50/80'
                }`}
              >
                {trend.value}
              </span>
            )}
            {subtitle && (
              <span className="text-slate-500 truncate">{subtitle}</span>
            )}
          </div>
        )}

        {tooltip && (
          <p className="text-[11px] text-slate-400 mt-1.5 leading-tight">
            {tooltip}
          </p>
        )}
      </div>
    </div>
  );
}
