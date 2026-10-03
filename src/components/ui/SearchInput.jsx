// Reusable SearchInput Component
import React from 'react';
import { Search, X } from 'lucide-react';

export function SearchInput({
  value,
  onChange,
  placeholder = 'Cari...',
  onClear = null,
  shortcut = null,
  className = '',
  size = 'md', // 'sm' | 'md'
  autoFocus = false,
}) {
  const isSm = size === 'sm';

  return (
    <div className={`relative flex items-center ${className}`}>
      <Search
        className={`absolute left-3 pointer-events-none text-slate-400 ${
          isSm ? 'w-3.5 h-3.5' : 'w-4 h-4'
        }`}
      />
      <input
        type="text"
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className={`w-full bg-white text-slate-900 border border-stone-300 rounded-lg pl-9 pr-9 transition-all outline-none focus:border-slate-800 focus:ring-2 focus:ring-slate-100 ${
          isSm ? 'py-1.5 text-xs min-h-[36px]' : 'py-2 text-sm min-h-[42px]'
        }`}
      />

      {value ? (
        <button
          type="button"
          onClick={() => {
            if (onClear) onClear();
            else onChange('');
          }}
          className="absolute right-2.5 p-1 text-slate-400 hover:text-slate-600 rounded transition-colors"
          title="Hapus pencarian"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      ) : shortcut ? (
        <span className="absolute right-2.5 pointer-events-none text-[11px] font-mono text-slate-400 bg-stone-100 border border-stone-200 px-1.5 py-0.5 rounded">
          {shortcut}
        </span>
      ) : null}
    </div>
  );
}
