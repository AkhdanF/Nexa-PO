// Financial & Sales Reports Page Component
import React, { useState, useMemo } from 'react';
import {
  Download,
  Printer,
  Calendar,
  FileSpreadsheet,
  TrendingUp,
  DollarSign,
  CreditCard,
  Receipt,
  PiggyBank,
  ShoppingBag,
} from 'lucide-react';
import { Button } from '../components/ui/Button.jsx';
import { Card } from '../components/ui/Card.jsx';
import { StatCard } from '../components/ui/StatCard.jsx';
import { formatCurrency, calculateFinancials } from '../utils/currency.js';
import {
  formatDate,
  formatFullDate,
  isDateInRange,
  getTodayDateString,
} from '../utils/date.js';

export function Reports({
  orders = [],
  expenses = [],
  settings = {},
}) {
  const [dateRange, setDateRange] = useState('month'); // 'today' | '7d' | '30d' | 'month' | 'all' | 'custom'
  const [customStart, setCustomStart] = useState(getTodayDateString());
  const [customEnd, setCustomEnd] = useState(getTodayDateString());

  // Filtered orders & expenses
  const filteredOrders = useMemo(() => {
    return orders.filter((o) =>
      isDateInRange(o.orderDate || o.timestamp, dateRange, customStart, customEnd)
    );
  }, [orders, dateRange, customStart, customEnd]);

  const filteredExpenses = useMemo(() => {
    return expenses.filter((e) =>
      isDateInRange(e.date || e.timestamp, dateRange, customStart, customEnd)
    );
  }, [expenses, dateRange, customStart, customEnd]);

  // Financial calculations
  const financials = useMemo(() => {
    return calculateFinancials(filteredOrders, filteredExpenses);
  }, [filteredOrders, filteredExpenses]);

  // Product sales breakdown
  const productSales = useMemo(() => {
    const map = {};
    filteredOrders.forEach((o) => {
      if (o.orderStatus === 'cancelled') return;
      (o.items || []).forEach((it) => {
        if (!map[it.productId]) {
          map[it.productId] = {
            id: it.productId,
            name: it.name,
            qty: 0,
            revenue: 0,
            unit: it.unit || 'pcs',
          };
        }
        const qty = parseInt(it.qty, 10) || 0;
        const sub = it.subtotal !== undefined
          ? parseFloat(it.subtotal) || 0
          : qty * (parseFloat(it.price) || 0);
        map[it.productId].qty += qty;
        map[it.productId].revenue += sub;
      });
    });
    return Object.values(map).sort((a, b) => b.revenue - a.revenue);
  }, [filteredOrders]);

  // Payment method breakdown
  const paymentMethodSales = useMemo(() => {
    const map = {};
    filteredOrders.forEach((o) => {
      if (o.orderStatus === 'cancelled') return;
      const m = o.paymentMethod || 'Lainnya';
      map[m] = (map[m] || 0) + (parseFloat(o.amountPaid) || 0);
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [filteredOrders]);

  // Export Orders to CSV
  const handleExportOrdersCSV = () => {
    const headers = [
      'No. PO',
      'Tanggal PO',
      'Jadwal Kirim',
      'Pelanggan',
      'WhatsApp',
      'Item Produk',
      'Total Qty',
      'Subtotal',
      'Total Tagihan',
      'Sudah Dibayar',
      'Sisa Piutang',
      'Status Bayar',
      'Metode Bayar',
      'Status Pesanan',
      'Catatan',
    ];

    const rows = filteredOrders.map((o) => [
      `"${o.id}"`,
      `"${o.orderDate}"`,
      `"${o.deliveryDate}"`,
      `"${o.customerName.replace(/"/g, '""')}"`,
      `"${o.whatsapp || ''}"`,
      `"${(o.itemsSummary || '').replace(/"/g, '""')}"`,
      o.totalQty || 0,
      o.subtotal || o.total,
      o.total,
      o.amountPaid,
      o.remaining,
      `"${o.paymentStatus}"`,
      `"${o.paymentMethod || ''}"`,
      `"${o.orderStatus}"`,
      `"${(o.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Laporan_Pesanan_${dateRange}_${getTodayDateString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export Expenses to CSV
  const handleExportExpensesCSV = () => {
    const headers = ['ID', 'Tanggal', 'Kategori', 'Keterangan', 'Metode Bayar', 'Nominal'];
    const rows = filteredExpenses.map((e) => [
      `"${e.id}"`,
      `"${e.date}"`,
      `"${e.category}"`,
      `"${(e.description || '').replace(/"/g, '""')}"`,
      `"${e.paymentMethod || ''}"`,
      e.amount,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Laporan_Pengeluaran_${dateRange}_${getTodayDateString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-stone-200/90 shadow-xs no-print">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Laporan Keuangan & Penjualan
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Analisis kinerja bisnis, ekspor data CSV, dan cetak ikhtisar keuangan.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Export CSV Dropdown / Buttons */}
          <Button
            variant="outline"
            size="sm"
            icon={FileSpreadsheet}
            onClick={handleExportOrdersCSV}
          >
            Ekspor Pesanan (CSV)
          </Button>

          <Button
            variant="outline"
            size="sm"
            icon={Download}
            onClick={handleExportExpensesCSV}
          >
            Ekspor Pengeluaran (CSV)
          </Button>

          <Button
            variant="primary"
            size="sm"
            icon={Printer}
            onClick={handlePrint}
          >
            Cetak Laporan
          </Button>
        </div>
      </div>

      {/* Date Range Selector Bar */}
      <div className="bg-white p-4 rounded-xl border border-stone-200/90 shadow-xs flex flex-wrap items-center justify-between gap-3 no-print">
        <div className="flex items-center gap-1.5 p-1 bg-stone-100 rounded-lg">
          {[
            { key: 'today', label: 'Hari Ini' },
            { key: '7d', label: '7 Hari' },
            { key: '30d', label: '30 Hari' },
            { key: 'month', label: 'Bulan Ini' },
            { key: 'all', label: 'Semua Waktu' },
            { key: 'custom', label: 'Kustom' },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setDateRange(tab.key)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                dateRange === tab.key
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {dateRange === 'custom' && (
          <div className="flex items-center gap-2 text-xs">
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="border border-stone-300 rounded-lg px-2.5 py-1.5 text-xs outline-none"
            />
            <span className="text-slate-400">s/d</span>
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="border border-stone-300 rounded-lg px-2.5 py-1.5 text-xs outline-none"
            />
          </div>
        )}
      </div>

      {/* Printable Report Document Wrapper */}
      <div className="space-y-6 bg-white p-6 sm:p-8 rounded-xl border border-stone-200/90 shadow-xs">
        {/* Printable Business Header */}
        <div className="border-b border-stone-200 pb-4 flex flex-col sm:flex-row justify-between sm:items-end gap-2">
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-900">
              {settings?.businessName || 'Dapur Berkah Nusantara'}
            </h1>
            <p className="text-xs text-slate-500">
              Laporan Keuangan & Penjualan ({dateRange.toUpperCase()})
            </p>
          </div>
          <div className="text-xs text-slate-500 text-left sm:text-right">
            <div>Dicetak pada: {formatDate(new Date(), false)}</div>
            <div className="text-slate-400">{filteredOrders.length} transaksi dianalisis</div>
          </div>
        </div>

        {/* 6 Key Financial Metrics in Report */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          <div className="p-3.5 bg-stone-50 rounded-lg border border-stone-200/80">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              Total Omzet
            </span>
            <span className="text-base font-bold font-mono tabular-nums text-slate-900 block mt-1">
              {formatCurrency(financials.revenue)}
            </span>
            <span className="text-[10px] text-slate-500">Pesanan terkonfirmasi</span>
          </div>

          <div className="p-3.5 bg-stone-50 rounded-lg border border-stone-200/80">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              Kas Masuk Riil
            </span>
            <span className="text-base font-bold font-mono tabular-nums text-emerald-800 block mt-1">
              {formatCurrency(financials.cashReceived)}
            </span>
            <span className="text-[10px] text-slate-500">Uang tunai/transfer riil</span>
          </div>

          <div className="p-3.5 bg-stone-50 rounded-lg border border-stone-200/80">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              Piutang Usaha
            </span>
            <span className="text-base font-bold font-mono tabular-nums text-rose-700 block mt-1">
              {formatCurrency(financials.receivables)}
            </span>
            <span className="text-[10px] text-slate-500">Sisa belum dibayar</span>
          </div>

          <div className="p-3.5 bg-stone-50 rounded-lg border border-stone-200/80">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              Pengeluaran
            </span>
            <span className="text-base font-bold font-mono tabular-nums text-amber-800 block mt-1">
              {formatCurrency(financials.expenses)}
            </span>
            <span className="text-[10px] text-slate-500">Belanja & operasional</span>
          </div>

          <div className="p-3.5 bg-slate-900 text-white rounded-lg border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              Estimasi Laba
            </span>
            <span className="text-base font-bold font-mono tabular-nums text-emerald-400 block mt-1">
              {formatCurrency(financials.estimatedProfit)}
            </span>
            <span className="text-[10px] text-slate-300">Omzet - Pengeluaran</span>
          </div>

          <div className="p-3.5 bg-stone-50 rounded-lg border border-stone-200/80">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              Jumlah Pesanan
            </span>
            <span className="text-base font-bold font-mono tabular-nums text-slate-900 block mt-1">
              {financials.orderCount} PO
            </span>
            <span className="text-[10px] text-slate-500">
              Rata-rata: {formatCurrency(financials.averageOrderValue)}
            </span>
          </div>
        </div>

        {/* Product Sales Performance Table */}
        <div className="space-y-3 pt-2">
          <h3 className="text-sm font-bold text-slate-900">
            Rincian Penjualan per Produk
          </h3>
          <div className="border border-stone-200 rounded-lg overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 border-b border-stone-200 font-semibold text-slate-600">
                <tr>
                  <th className="py-2.5 px-4">Nama Produk</th>
                  <th className="py-2.5 px-4 text-center">Qty Terjual</th>
                  <th className="py-2.5 px-4 text-right">Kontribusi Omzet</th>
                  <th className="py-2.5 px-4 text-right">% dari Omzet</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {productSales.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-slate-400">
                      Tidak ada data penjualan pada rentang waktu ini.
                    </td>
                  </tr>
                ) : (
                  productSales.map((item, idx) => {
                    const pct = financials.revenue > 0
                      ? Math.round((item.revenue / financials.revenue) * 100)
                      : 0;

                    return (
                      <tr key={idx} className="hover:bg-stone-50">
                        <td className="py-2.5 px-4 font-semibold text-slate-900">
                          {item.name}
                        </td>
                        <td className="py-2.5 px-4 text-center font-mono tabular-nums text-slate-700">
                          {item.qty} {item.unit}
                        </td>
                        <td className="py-2.5 px-4 text-right font-mono tabular-nums font-bold text-slate-900">
                          {formatCurrency(item.revenue)}
                        </td>
                        <td className="py-2.5 px-4 text-right font-mono tabular-nums text-slate-600">
                          {pct}%
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Payment Methods Breakdown Table */}
        <div className="space-y-3 pt-2">
          <h3 className="text-sm font-bold text-slate-900">
            Penerimaan Kas Berdasarkan Metode Pembayaran
          </h3>
          <div className="border border-stone-200 rounded-lg overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 border-b border-stone-200 font-semibold text-slate-600">
                <tr>
                  <th className="py-2.5 px-4">Metode Pembayaran</th>
                  <th className="py-2.5 px-4 text-right">Kas Diterima</th>
                  <th className="py-2.5 px-4 text-right">% dari Kas Diterima</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {paymentMethodSales.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-6 text-center text-slate-400">
                      Tidak ada penerimaan kas pada rentang waktu ini.
                    </td>
                  </tr>
                ) : (
                  paymentMethodSales.map(([method, amount], idx) => {
                    const pct = financials.cashReceived > 0
                      ? Math.round((amount / financials.cashReceived) * 100)
                      : 0;

                    return (
                      <tr key={idx} className="hover:bg-stone-50">
                        <td className="py-2.5 px-4 font-semibold text-slate-900">
                          {method}
                        </td>
                        <td className="py-2.5 px-4 text-right font-mono tabular-nums font-bold text-emerald-800">
                          {formatCurrency(amount)}
                        </td>
                        <td className="py-2.5 px-4 text-right font-mono tabular-nums text-slate-600">
                          {pct}%
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
