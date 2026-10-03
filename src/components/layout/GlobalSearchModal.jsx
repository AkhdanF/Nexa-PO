// Global Search Modal (Cmd/Ctrl + K)
import React, { useState, useEffect } from 'react';
import { Search, ShoppingBag, Package, User, ArrowRight, X } from 'lucide-react';
import { formatCurrency } from '../../utils/currency.js';
import { formatDate } from '../../utils/date.js';
import { OrderStatusBadge } from '../orders/OrderStatusBadge.jsx';

export function GlobalSearchModal({
  isOpen,
  onClose,
  orders = [],
  products = [],
  onSelectOrder,
  onSelectProduct,
}) {
  const [query, setQuery] = useState('');

  // Handle Cmd+K / Ctrl+K keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // handled by parent or toggled
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const q = query.toLowerCase().trim();

  // Search results
  const matchedOrders = q
    ? orders.filter(
        (o) =>
          o.id.toLowerCase().includes(q) ||
          o.customerName.toLowerCase().includes(q) ||
          (o.whatsapp && o.whatsapp.includes(q)) ||
          (o.itemsSummary && o.itemsSummary.toLowerCase().includes(q))
      ).slice(0, 5)
    : [];

  const matchedProducts = q
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.category && p.category.toLowerCase().includes(q)) ||
          (p.description && p.description.toLowerCase().includes(q))
      ).slice(0, 5)
    : [];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="flex min-h-full items-start justify-center p-3 sm:p-4 pt-16 sm:pt-20 text-center">
        <div
          className="relative transform overflow-hidden rounded-xl bg-white text-left shadow-2xl transition-all w-full max-w-xl border border-stone-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Search Header Input */}
          <div className="flex items-center px-4 py-3.5 border-b border-stone-200">
            <Search className="w-5 h-5 text-slate-400 shrink-0 mr-3" />
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari pesanan, pelanggan, nomor WA, atau produk..."
              className="w-full bg-transparent text-slate-900 placeholder:text-slate-400 text-sm outline-none"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="p-1 text-slate-400 hover:text-slate-600 rounded mr-2"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <kbd className="hidden sm:inline-block px-2 py-0.5 text-[11px] font-mono font-medium text-slate-400 bg-stone-100 border border-stone-200 rounded">
              ESC
            </kbd>
          </div>

          {/* Search Results Container */}
          <div className="max-h-[60vh] overflow-y-auto p-3">
            {!q ? (
              <div className="p-6 text-center text-xs text-slate-400">
                Ketik kata kunci untuk mencari pesanan, pelanggan, atau produk.
              </div>
            ) : matchedOrders.length === 0 && matchedProducts.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                Tidak ada data yang cocok dengan "{query}".
              </div>
            ) : (
              <div className="space-y-4">
                {/* Orders Section */}
                {matchedOrders.length > 0 && (
                  <div>
                    <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2 mb-1.5 flex items-center gap-1.5">
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Pesanan ({matchedOrders.length})</span>
                    </div>
                    <div className="space-y-1">
                      {matchedOrders.map((order) => (
                        <div
                          key={order.id}
                          onClick={() => {
                            onClose();
                            onSelectOrder(order);
                          }}
                          className="flex items-center justify-between p-2.5 rounded-lg hover:bg-stone-50 cursor-pointer border border-transparent hover:border-stone-200 transition-all text-xs"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900 font-mono">
                                #{order.id}
                              </span>
                              <span className="text-slate-700 font-semibold">
                                {order.customerName}
                              </span>
                              <OrderStatusBadge status={order.orderStatus} size="sm" />
                            </div>
                            <div className="text-slate-500 text-[11px] mt-0.5 truncate max-w-sm">
                              {order.itemsSummary || 'Rincian pesanan'}
                            </div>
                          </div>
                          <div className="text-right shrink-0 ml-3">
                            <div className="font-bold text-slate-900 font-mono tabular-nums">
                              {formatCurrency(order.total)}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              {formatDate(order.orderDate, true)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Products Section */}
                {matchedProducts.length > 0 && (
                  <div>
                    <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2 mb-1.5 flex items-center gap-1.5">
                      <Package className="w-3.5 h-3.5" />
                      <span>Produk ({matchedProducts.length})</span>
                    </div>
                    <div className="space-y-1">
                      {matchedProducts.map((prod) => (
                        <div
                          key={prod.id}
                          onClick={() => {
                            onClose();
                            onSelectProduct(prod);
                          }}
                          className="flex items-center justify-between p-2.5 rounded-lg hover:bg-stone-50 cursor-pointer border border-transparent hover:border-stone-200 transition-all text-xs"
                        >
                          <div>
                            <div className="font-semibold text-slate-900">
                              {prod.name}
                            </div>
                            <div className="text-slate-400 text-[11px]">
                              {prod.category} · {prod.unit || 'pcs'}
                            </div>
                          </div>
                          <div className="font-bold text-slate-900 font-mono tabular-nums shrink-0 ml-3">
                            {formatCurrency(prod.price)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
