// Reusable Input Component
import React from 'react';

export function Input({
  label,
  id,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  helperText,
  icon: Icon = null,
  prefix = null,
  suffix = null,
  required = false,
  disabled = false,
  className = '',
  inputClassName = '',
  ...props
}) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="text-xs font-semibold text-slate-700 flex items-center justify-between"
        >
          <span>
            {label}
            {required && <span className="text-rose-500 ml-0.5">*</span>}
          </span>
        </label>
      )}

      <div className="relative flex items-center">
        {Icon && (
          <div className="absolute left-3 pointer-events-none text-slate-400">
            <Icon className="w-4 h-4" />
          </div>
        )}

        {prefix && (
          <span className="absolute left-3 pointer-events-none text-xs font-semibold text-slate-500 select-none">
            {prefix}
          </span>
        )}

        <input
          id={inputId}
          type={type}
          value={value ?? ''}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={`w-full bg-white/80 focus:bg-white text-slate-900 border rounded-xl py-2 text-sm transition-all outline-none min-h-[42px] shadow-xs backdrop-blur-xs ${
            error
              ? 'border-rose-400 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10'
              : 'border-slate-200/90 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10'
          } ${Icon ? 'pl-9' : prefix ? 'pl-11' : 'pl-3.5'} ${
            suffix ? 'pr-12' : 'pr-3.5'
          } disabled:bg-stone-50 disabled:text-slate-400 disabled:cursor-not-allowed ${inputClassName}`}
          {...props}
        />

        {suffix && (
          <span className="absolute right-3 pointer-events-none text-xs font-medium text-slate-500 select-none">
            {suffix}
          </span>
        )}
      </div>

      {error ? (
        <p className="text-xs text-rose-600 font-medium flex items-center gap-1 mt-0.5">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-rose-500"></span>
          {error}
        </p>
      ) : helperText ? (
        <p className="text-xs text-slate-500 mt-0.5">{helperText}</p>
      ) : null}
    </div>
  );
}
