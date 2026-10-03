// Reusable Select Component
import React from 'react';

export function Select({
  label,
  id,
  value,
  onChange,
  options = [],
  placeholder = 'Pilih opsi...',
  error,
  helperText,
  required = false,
  disabled = false,
  className = '',
  selectClassName = '',
  ...props
}) {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label
          htmlFor={selectId}
          className="text-xs font-semibold text-slate-700 flex items-center justify-between"
        >
          <span>
            {label}
            {required && <span className="text-rose-500 ml-0.5">*</span>}
          </span>
        </label>
      )}

      <div className="relative flex items-center">
        <select
          id={selectId}
          value={value ?? ''}
          onChange={onChange}
          disabled={disabled}
          required={required}
          className={`w-full bg-white/80 focus:bg-white text-slate-900 border rounded-xl py-2 px-3.5 pr-8 text-sm transition-all outline-none appearance-none min-h-[42px] cursor-pointer shadow-xs backdrop-blur-xs ${
            error
              ? 'border-rose-400 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10'
              : 'border-slate-200/90 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10'
          } disabled:bg-stone-50 disabled:text-slate-400 disabled:cursor-not-allowed ${selectClassName}`}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((opt) => {
            const val = typeof opt === 'object' ? opt.value ?? opt.key : opt;
            const text = typeof opt === 'object' ? opt.label ?? opt.name : opt;
            return (
              <option key={val} value={val}>
                {text}
              </option>
            );
          })}
        </select>

        <div className="absolute right-3 pointer-events-none text-slate-400">
          <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </div>
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
