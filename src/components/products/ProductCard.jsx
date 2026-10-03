// Product Card Component with Quick Quantity Steppers (+1, +5, +10, -, +)
import React from 'react';
import { Plus, Minus, Tag } from 'lucide-react';
import { formatCurrency } from '../../utils/currency.js';

export function ProductCard({
  product,
  quantity = 0,
  onQuantityChange,
  showControls = true,
  onEdit = null,
}) {
  const handleStep = (delta) => {
    const next = Math.max(0, quantity + delta);
    onQuantityChange(product, next);
  };

  const handleManualInput = (e) => {
    const val = parseInt(e.target.value, 10);
    onQuantityChange(product, isNaN(val) ? 0 : Math.max(0, val));
  };

  const isSelected = quantity > 0;

  return (
    <div
      className={`flex flex-col justify-between bg-white border rounded-xl p-4 transition-all ${
        isSelected
          ? 'border-slate-800 ring-1 ring-slate-800 shadow-sm'
          : 'border-stone-200/90 hover:border-stone-300 shadow-xs'
      }`}
    >
      {/* Product Information */}
      <div>
        <div className="flex items-start justify-between gap-2">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              {product.category || 'Umum'}
            </span>
            <h4 className="text-sm font-bold text-slate-900 leading-snug mt-0.5">
              {product.name}
            </h4>
          </div>
          {onEdit && (
            <button
              type="button"
              onClick={() => onEdit(product)}
              className="text-xs text-slate-400 hover:text-slate-700 underline shrink-0"
            >
              Edit
            </button>
          )}
        </div>

        {product.description && (
          <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        )}

        <div className="flex items-baseline gap-1 mt-2.5">
          <span className="text-base font-bold text-slate-900 font-mono tabular-nums">
            {formatCurrency(product.price)}
          </span>
          <span className="text-xs text-slate-500 font-medium">
            / {product.unit || 'pcs'}
          </span>
        </div>
      </div>

      {/* Quantity Stepper Controls */}
      {showControls && (
        <div className="mt-4 pt-3 border-t border-stone-100 space-y-2">
          {/* Main - / + Control */}
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => handleStep(-1)}
              disabled={quantity <= 0}
              className="w-10 h-10 rounded-lg border border-stone-300 bg-stone-50 text-slate-700 flex items-center justify-center hover:bg-stone-100 disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 transition-all cursor-pointer"
              aria-label="Kurangi 1"
            >
              <Minus className="w-4 h-4" />
            </button>

            <div className="flex-1 flex items-center justify-center">
              <input
                type="number"
                min="0"
                value={quantity === 0 ? '' : quantity}
                onChange={handleManualInput}
                placeholder="0"
                className="w-full text-center font-mono tabular-nums font-bold text-base py-1.5 px-1 border border-stone-200 rounded-lg outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800"
              />
            </div>

            <button
              type="button"
              onClick={() => handleStep(1)}
              className="w-10 h-10 rounded-lg bg-slate-900 text-white flex items-center justify-center hover:bg-slate-800 active:scale-95 transition-all cursor-pointer shadow-xs"
              aria-label="Tambah 1"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Increment Shortcuts: +1, +5, +10 */}
          <div className="flex items-center justify-end gap-1.5 pt-1">
            <span className="text-[11px] text-slate-400 mr-auto font-medium">
              Cepat:
            </span>
            <button
              type="button"
              onClick={() => handleStep(1)}
              className="text-[11px] font-mono tabular-nums font-semibold px-2 py-1 rounded bg-stone-100 hover:bg-stone-200 text-slate-700 transition-colors"
            >
              +1
            </button>
            <button
              type="button"
              onClick={() => handleStep(5)}
              className="text-[11px] font-mono tabular-nums font-semibold px-2 py-1 rounded bg-stone-100 hover:bg-stone-200 text-slate-700 transition-colors"
            >
              +5
            </button>
            <button
              type="button"
              onClick={() => handleStep(10)}
              className="text-[11px] font-mono tabular-nums font-semibold px-2 py-1 rounded bg-stone-100 hover:bg-stone-200 text-slate-700 transition-colors"
            >
              +10
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
