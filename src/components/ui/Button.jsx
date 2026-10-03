// Reusable Button Component
import React from 'react';

export function Button({
  children,
  type = 'button',
  variant = 'primary', // 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'success'
  size = 'md', // 'sm' | 'md' | 'lg'
  disabled = false,
  loading = false,
  icon: Icon = null,
  iconPosition = 'left',
  onClick,
  className = '',
  title = '',
  ...props
}) {
  const baseStyles =
    'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed select-none whitespace-nowrap shrink-0 active:scale-[0.98] cursor-pointer';

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 min-h-[36px] gap-1.5',
    md: 'text-sm px-4 py-2 min-h-[42px] gap-2',
    lg: 'text-base px-5 py-2.5 min-h-[48px] gap-2.5',
  };

  const variantStyles = {
    primary:
      'bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 text-white hover:from-slate-900 hover:to-slate-700 focus-visible:ring-slate-900 shadow-sm shadow-slate-900/15 border border-slate-700/50',
    secondary:
      'bg-white/80 hover:bg-white text-slate-800 hover:text-slate-950 focus-visible:ring-slate-400 border border-white/90 shadow-xs backdrop-blur-md',
    outline:
      'bg-white/60 hover:bg-white text-slate-700 hover:text-slate-950 border border-slate-200/80 focus-visible:ring-slate-400 shadow-xs backdrop-blur-md',
    danger:
      'bg-gradient-to-r from-rose-600 to-rose-700 text-white hover:from-rose-500 hover:to-rose-600 focus-visible:ring-rose-600 shadow-sm shadow-rose-600/15 border border-rose-500/50',
    success:
      'bg-gradient-to-r from-emerald-600 to-teal-700 text-white hover:from-emerald-500 hover:to-teal-600 focus-visible:ring-emerald-600 shadow-sm shadow-emerald-700/15 border border-emerald-500/50',
    ghost:
      'bg-transparent text-slate-600 hover:bg-white/60 hover:text-slate-900 focus-visible:ring-slate-400 border border-transparent backdrop-blur-xs',
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      title={title}
      className={`${baseStyles} ${sizeStyles[size] || sizeStyles.md} ${variantStyles[variant] || variantStyles.primary} ${className}`}
      {...props}
    >
      {loading ? (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      ) : Icon && iconPosition === 'left' ? (
        <Icon className={size === 'sm' ? 'w-3.5 h-3.5' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'} />
      ) : null}

      <span>{children}</span>

      {!loading && Icon && iconPosition === 'right' ? (
        <Icon className={size === 'sm' ? 'w-3.5 h-3.5' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'} />
      ) : null}
    </button>
  );
}
