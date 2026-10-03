// Orders Management Page Component
import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  ArrowUpDown,
  Plus,
  Eye,
  Edit2,
  Trash2,
  CreditCard,
  Printer,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
} from 'lucide-react';
import { Button } from '../components/ui/Button.jsx';
import { SearchInput } from '../components/ui/SearchInput.jsx';
import { EmptyState } from '../components/ui/EmptyState.jsx';
import { OrderStatusBadge } from '../components/orders/OrderStatusBadge.jsx';
import { PaymentStatusBadge } from '../components/orders/PaymentStatusBadge.jsx';
import { formatCurrency } from '../utils/currency.js';
import { formatDate } from '../utils/date.js';
import { generateWhatsAppMessage, openWhatsAppLink } from '../utils/whatsapp.js';
import { APP_CONFIG } from '../config/app.js';

export function Orders({
  orders = [],
  settings = {},
  initialFilter = 'all',
  onOpenCreateOrder,
  onSelectOrder,
  onEditOrder,
  onOpenQuickPay,
  onOpenReceipt,
  onDeleteOrder,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState(initialFilter);
  const [sortBy, setSortBy] = useState('date-desc'); // 'date-desc' | 'date-asc' | 'total-desc' | 'total-asc' | 'name-asc'
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Filter & Search Logic
  const filteredOrders = useMemo(() => {
    let result = [...orders];

    // Status / Payment Filter
    if (statusFilter !== 'all') {
      if (['unpaid', 'dp', 'paid'].includes(statusFilter)) {
        result = result.filter((o) => o.paymentStatus === statusFilter);
      } else {
        result = result.filter((o) => o.orderStatus === statusFilter);
      }
    }

    // Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (o) =>
          o.id.toLowerCase().includes(q) ||
          o.customerName.toLowerCase().includes(q) ||
          (o.whatsapp && o.whatsapp.includes(q)) ||
          (o.itemsSummary && o.itemsSummary.toLowerCase().includes(q)) ||
          (o.notes && o.notes.toLowerCase().includes(q))
      );
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'date-desc') {
        return new Date(b.orderDate || b.timestamp) - new Date(a.orderDate || a.timestamp);
      }
      if (sortBy === 'date-asc') {
        return new Date(a.orderDate || a.timestamp) - new Date(b.orderDate || b.timestamp);
      }
      if (sortBy === 'total-desc') {
        return (b.total || 0) - (a.total || 0);
      }
      if (sortBy === 'total-asc') {
        return (a.total || 0) - (b.total || 0);
      }
      if (sortBy === 'name-asc') {
        return a.customerName.localeCompare(b.customerName);
      }
      return 0;
    });

    return result;
  }, [orders, statusFilter, searchQuery, sortBy]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredOrders.length / pageSize) || 1;
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredOrders.slice(start, start + pageSize);
  }, [filteredOrders, currentPage, pageSize]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleWhatsApp = (order) => {
    const msg = generateWhatsAppMessage(order, settings);
    openWhatsAppLink(order.whatsapp, msg);
  };

  const filterTabs = [
    { key: 'all', label: 'Semua' },
    { key: 'unpaid', label: 'Belum Lunas' },
    { key: 'dp', label: 'DP' },
    { key: 'paid', label: 'Lunas' },
    { key: 'new', label: 'Baru' },
    { key: 'processing', label: 'Diproses' },
    { key: 'ready', label: 'Siap Kirim' },
    { key: 'completed', label: 'Selesai' },
    { key: 'cancelled', label: 'Batal' },
  ];

  return (
    <div className="space-y-5 max-w-7xl mx-auto pb-12">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Manajemen Pesanan Pre-Order
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Total {orders.length} pesanan terdaftar dalam sistem
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          icon={Plus}
          onClick={onOpenCreateOrder}
        >
          Buat Pesanan Baru
        </Button>
      </div>

      {/* Filter Tabs & Search Controls */}
      <div className="bg-white p-4 rounded-xl border border-stone-200/90 shadow-xs space-y-3.5">
        {/* Horizontal Filter Tabs (Disciplined Segmented Buttons) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {filterTabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => {
                setStatusFilter(tab.key);
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                statusFilter === tab.key
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-stone-100 text-slate-600 hover:bg-stone-200/70 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search & Sort Controls Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1 border-t border-stone-100">
          <div className="flex-1 max-w-md">
            <SearchInput
              value={searchQuery}
              onChange={(val) => {
                setSearchQuery(val);
                setCurrentPage(1);
              }}
              placeholder="Cari ID pesanan, nama pelanggan, produk, no WA..."
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium shrink-0">
              Urutkan:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-xs bg-white border border-stone-300 rounded-lg px-3 py-2 font-medium text-slate-800 outline-none cursor-pointer focus:border-slate-800 min-h-[40px]"
            >
              <option value="date-desc">Tanggal PO (Terbaru)</option>
              <option value="date-asc">Tanggal PO (Terlama)</option>
              <option value="total-desc">Total Tagihan (Tertinggi)</option>
              <option value="total-asc">Total Tagihan (Terendah)</option>
              <option value="name-asc">Nama Pelanggan (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Content: Desktop Table / Mobile Cards */}
      {filteredOrders.length === 0 ? (
        <EmptyState
          title="Tidak Ada Pesanan Ditemukan"
          description={
            searchQuery
              ? `Tidak ada pesanan yang sesuai dengan kata kunci "${searchQuery}".`
              : 'Belum ada pesanan dengan filter yang dipilih.'
          }
          actionLabel="Buat Pesanan Baru"
          onAction={onOpenCreateOrder}
        />
      ) : (
        <div className="space-y-4">
          {/* Desktop Data Table */}
          <div className="hidden md:block bg-white border border-stone-200/90 rounded-xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-stone-50 border-b border-stone-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-4">No. PO</th>
                    <th className="py-3 px-4">Pelanggan</th>
                    <th className="py-3 px-4">Jadwal Kirim</th>
                    <th className="py-3 px-4">Item Produk</th>
                    <th className="py-3 px-4 text-right">Total Tagihan</th>
                    <th className="py-3 px-4 text-center">Status Bayar</th>
                    <th className="py-3 px-4 text-center">Status PO</th>
                    <th className="py-3 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {paginatedOrders.map((order) => (
                    <tr
                      key={order.id}
                      onClick={() => onSelectOrder(order)}
                      className="hover:bg-stone-50/70 transition-colors cursor-pointer group"
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                        #{order.id}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900">
                          {order.customerName}
                        </div>
                        {order.whatsapp && (
                          <div className="text-[11px] text-slate-400">
                            {order.whatsapp}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-700">
                        {formatDate(order.deliveryDate, false)}
                      </td>
                      <td className="py-3.5 px-4 max-w-xs">
                        <p className="truncate text-slate-600" title={order.itemsSummary}>
                          {order.itemsSummary || '-'}
                        </p>
                        <span className="text-[10px] text-slate-400">
                          {order.totalQty || 0} item
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="font-bold text-slate-900 font-mono tabular-nums">
                          {formatCurrency(order.total)}
                        </div>
                        {order.remaining > 0 ? (
                          <div className="text-[10px] text-rose-600 font-medium">
                            Sisa: {formatCurrency(order.remaining)}
                          </div>
                        ) : (
                          <div className="text-[10px] text-emerald-600 font-medium">
                            Lunas
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <PaymentStatusBadge status={order.paymentStatus} size="sm" />
                      </td>
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <OrderStatusBadge status={order.orderStatus} size="sm" />
                      </td>
                      <td
                        className="py-3.5 px-4 text-right whitespace-nowrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-1">
                          {order.remaining > 0 && (
                            <button
                              type="button"
                              onClick={() => onOpenQuickPay(order)}
                              title="Bayar / Catat Pelunasan"
                              className="p-1.5 rounded-lg text-emerald-700 hover:bg-emerald-50 transition-colors"
                            >
                              <CreditCard className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleWhatsApp(order)}
                            title="Kirim via WhatsApp"
                            className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors"
                          >
                            <MessageCircle className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onOpenReceipt(order)}
                            title="Cetak Nota"
                            className="p-1.5 rounded-lg text-slate-600 hover:bg-stone-100 transition-colors"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onEditOrder(order)}
                            title="Edit Pesanan"
                            className="p-1.5 rounded-lg text-slate-600 hover:bg-stone-100 transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteOrder(order)}
                            title="Hapus Pesanan"
                            className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Order Cards */}
          <div className="md:hidden space-y-3">
            {paginatedOrders.map((order) => (
              <div
                key={order.id}
                onClick={() => onSelectOrder(order)}
                className="bg-white border border-stone-200/90 rounded-xl p-4 shadow-xs space-y-3 cursor-pointer active:bg-stone-50"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 font-mono text-xs">
                        #{order.id}
                      </span>
                      <OrderStatusBadge status={order.orderStatus} size="sm" />
                    </div>
                    <h4 className="font-bold text-sm text-slate-900 mt-1">
                      {order.customerName}
                    </h4>
                  </div>
                  <PaymentStatusBadge status={order.paymentStatus} size="sm" />
                </div>

                {/* Items & Schedule */}
                <div className="text-xs text-slate-600 space-y-1 bg-stone-50 p-2.5 rounded-lg border border-stone-100">
                  <div className="line-clamp-2">{order.itemsSummary || '-'}</div>
                  <div className="text-[11px] text-slate-500 pt-1 border-t border-stone-200/60 flex justify-between">
                    <span>Kirim: {formatDate(order.deliveryDate, false)}</span>
                    <span>{order.totalQty || 0} item</span>
                  </div>
                </div>

                {/* Financial Footer & Quick Actions */}
                <div className="flex items-center justify-between pt-1">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-semibold">
                      Total Tagihan
                    </span>
                    <span className="font-mono tabular-nums font-bold text-sm text-slate-900">
                      {formatCurrency(order.total)}
                    </span>
                    {order.remaining > 0 && (
                      <span className="text-[11px] text-rose-600 font-medium block">
                        Sisa: {formatCurrency(order.remaining)}
                      </span>
                    )}
                  </div>

                  <div
                    className="flex items-center gap-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      onClick={() => handleWhatsApp(order)}
                      className="p-2 rounded-lg bg-emerald-50 text-emerald-700 min-h-[44px] min-w-[44px] flex items-center justify-center border border-emerald-200/60"
                      title="Kirim WA"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </button>
                    {order.remaining > 0 && (
                      <button
                        type="button"
                        onClick={() => onOpenQuickPay(order)}
                        className="p-2 rounded-lg bg-slate-900 text-white min-h-[44px] min-w-[44px] flex items-center justify-center"
                        title="Bayar"
                      >
                        <CreditCard className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => onSelectOrder(order)}
                      className="p-2 rounded-lg bg-stone-100 text-slate-700 min-h-[44px] min-w-[44px] flex items-center justify-center"
                      title="Lihat Detail"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          <div className="bg-white p-3.5 rounded-xl border border-stone-200/90 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="text-slate-500">
              Menampilkan{' '}
              <span className="font-bold text-slate-800 font-mono tabular-nums">
                {(currentPage - 1) * pageSize + 1}
              </span>{' '}
              -{' '}
              <span className="font-bold text-slate-800 font-mono tabular-nums">
                {Math.min(currentPage * pageSize, filteredOrders.length)}
              </span>{' '}
              dari{' '}
              <span className="font-bold text-slate-800 font-mono tabular-nums">
                {filteredOrders.length}
              </span>{' '}
              pesanan
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                icon={ChevronLeft}
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Sebelumnya
              </Button>

              <span className="px-3 py-1 font-mono font-bold text-slate-800 bg-stone-100 rounded-lg">
                {currentPage} / {totalPages}
              </span>

              <Button
                variant="outline"
                size="sm"
                icon={ChevronRight}
                iconPosition="right"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Berikutnya
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
