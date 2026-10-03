// Dashboard Page Component
import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  DollarSign,
  CreditCard,
  Receipt,
  PiggyBank,
  ShoppingBag,
  ArrowUpRight,
  ArrowDownRight,
  PlusCircle,
  PackagePlus,
  Plus,
  AlertCircle,
  Calendar,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { StatCard } from '../components/ui/StatCard.jsx';
import { Card } from '../components/ui/Card.jsx';
import { Button } from '../components/ui/Button.jsx';
import { OrderStatusBadge } from '../components/orders/OrderStatusBadge.jsx';
import { PaymentStatusBadge } from '../components/orders/PaymentStatusBadge.jsx';
import { formatCurrency, calculateFinancials } from '../utils/currency.js';
import {
  formatDate,
  formatFullDate,
  getTimeGreeting,
  isDateInRange,
  getTodayDateString,
} from '../utils/date.js';

export function Dashboard({
  orders = [],
  expenses = [],
  products = [],
  productAnalytics = {},
  onNavigate,
  onOpenCreateOrder,
  onOpenAddProduct,
  onOpenAddExpense,
  onSelectOrder,
}) {
  const [dateRange, setDateRange] = useState('month'); // 'today' | '7d' | '30d' | 'month' | 'all' | 'custom'
  const [customStart, setCustomStart] = useState(getTodayDateString());
  const [customEnd, setCustomEnd] = useState(getTodayDateString());

  // Filter orders and expenses by selected date range
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

  // Centralized Financial Metrics for current period
  const financials = useMemo(() => {
    return calculateFinancials(filteredOrders, filteredExpenses);
  }, [filteredOrders, filteredExpenses]);

  // Top Products for this period
  const topProducts = useMemo(() => {
    const counts = {};
    filteredOrders.forEach((o) => {
      if (o.orderStatus === 'cancelled') return;
      (o.items || []).forEach((it) => {
        if (!counts[it.productId]) {
          counts[it.productId] = {
            name: it.name,
            qty: 0,
            revenue: 0,
            unit: it.unit || 'pcs',
          };
        }
        counts[it.productId].qty += parseInt(it.qty, 10) || 0;
        counts[it.productId].revenue +=
          it.subtotal !== undefined
            ? parseFloat(it.subtotal) || 0
            : (parseInt(it.qty, 10) || 0) * (parseFloat(it.price) || 0);
      });
    });

    return Object.values(counts)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }, [filteredOrders]);

  // Payment Status distribution
  const paymentDistribution = useMemo(() => {
    const active = filteredOrders.filter((o) => o.orderStatus !== 'cancelled');
    const total = active.length || 1;
    const paid = active.filter((o) => o.paymentStatus === 'paid').length;
    const dp = active.filter((o) => o.paymentStatus === 'dp').length;
    const unpaid = active.filter((o) => o.paymentStatus === 'unpaid').length;

    return {
      paid,
      dp,
      unpaid,
      paidPct: Math.round((paid / total) * 100),
      dpPct: Math.round((dp / total) * 100),
      unpaidPct: Math.round((unpaid / total) * 100),
    };
  }, [filteredOrders]);

  // Recent 5 Orders
  const recentOrders = useMemo(() => {
    return [...orders].slice(0, 5);
  }, [orders]);

  const greeting = getTimeGreeting();
  const todayFormatted = formatFullDate(new Date());

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Header & Date Range Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 backdrop-blur-xl bg-white/75 p-5 rounded-2xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.03)]">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              {greeting}! 👋
            </h2>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-indigo-50/80 text-indigo-700 border border-indigo-200/50">
              NEXA Live
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 font-medium">{todayFormatted}</p>
        </div>

        {/* Date Range Selector Segmented Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-white/60 backdrop-blur-md rounded-xl border border-white/80 shadow-xs">
          {[
            { key: 'today', label: 'Hari Ini' },
            { key: '7d', label: '7 Hari' },
            { key: '30d', label: '30 Hari' },
            { key: 'month', label: 'Bulan Ini' },
            { key: 'all', label: 'Semua' },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setDateRange(tab.key)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                dateRange === tab.key
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 6 KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* 1. Total Omzet */}
        <StatCard
          title="Total Omzet"
          value={formatCurrency(financials.revenue)}
          subtitle="Nilai pesanan aktif"
          icon={TrendingUp}
          iconBg="bg-blue-50 text-blue-700"
          tooltip="Akumulasi seluruh pesanan dikonfirmasi"
        />

        {/* 2. Kas Masuk (Riil) */}
        <StatCard
          title="Kas Masuk"
          value={formatCurrency(financials.cashReceived)}
          subtitle="Uang diterima riil"
          icon={DollarSign}
          iconBg="bg-emerald-50 text-emerald-700"
          tooltip="Uang nyata yang sudah masuk kas/rekening"
        />

        {/* 3. Piutang (Belum Lunas) */}
        <StatCard
          title="Piutang"
          value={formatCurrency(financials.receivables)}
          subtitle="Belum dilunasi"
          icon={CreditCard}
          iconBg="bg-rose-50 text-rose-700"
          tooltip="Sisa tagihan pesanan yang masih harus ditagih"
        />

        {/* 4. Pengeluaran */}
        <StatCard
          title="Pengeluaran"
          value={formatCurrency(financials.expenses)}
          subtitle="Biaya operasional & bahan"
          icon={Receipt}
          iconBg="bg-amber-50 text-amber-700"
          tooltip="Total pengeluaran tercatat periode ini"
        />

        {/* 5. Estimasi Laba */}
        <StatCard
          title="Estimasi Laba"
          value={formatCurrency(financials.estimatedProfit)}
          subtitle="Omzet - Pengeluaran"
          icon={PiggyBank}
          iconBg="bg-indigo-50 text-indigo-700"
          highlight={true}
          tooltip="Estimasi kasar (Omzet dikurangi Pengeluaran)"
        />

        {/* 6. Jumlah Pesanan */}
        <StatCard
          title="Jumlah Pesanan"
          value={`${financials.orderCount} PO`}
          subtitle={`AOV: ${formatCurrency(financials.averageOrderValue)}`}
          icon={ShoppingBag}
          iconBg="bg-slate-100 text-slate-800"
          tooltip="Rata-rata per pesanan di periode ini"
        />
      </div>

      {/* Quick Action Shortcuts */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          type="button"
          onClick={onOpenCreateOrder}
          className="flex items-center gap-2.5 p-3.5 bg-slate-900 text-white rounded-xl hover:bg-slate-800 active:scale-98 transition-all shadow-xs text-left cursor-pointer"
        >
          <PlusCircle className="w-5 h-5 text-emerald-400 shrink-0" />
          <div>
            <div className="text-xs font-bold">Buat Pesanan Baru</div>
            <div className="text-[10px] text-slate-300">Catat PO pelanggan</div>
          </div>
        </button>

        <button
          type="button"
          onClick={onOpenAddProduct}
          className="flex items-center gap-2.5 p-3.5 bg-white border border-stone-200/90 text-slate-800 rounded-xl hover:bg-stone-50 active:scale-98 transition-all shadow-xs text-left cursor-pointer"
        >
          <PackagePlus className="w-5 h-5 text-blue-600 shrink-0" />
          <div>
            <div className="text-xs font-bold">Tambah Produk</div>
            <div className="text-[10px] text-slate-500">Menu & katalog baru</div>
          </div>
        </button>

        <button
          type="button"
          onClick={onOpenAddExpense}
          className="flex items-center gap-2.5 p-3.5 bg-white border border-stone-200/90 text-slate-800 rounded-xl hover:bg-stone-50 active:scale-98 transition-all shadow-xs text-left cursor-pointer"
        >
          <Receipt className="w-5 h-5 text-amber-600 shrink-0" />
          <div>
            <div className="text-xs font-bold">Catat Pengeluaran</div>
            <div className="text-[10px] text-slate-500">Belanja & operasional</div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('orders', 'unpaid')}
          className="flex items-center gap-2.5 p-3.5 bg-white border border-stone-200/90 text-slate-800 rounded-xl hover:bg-stone-50 active:scale-98 transition-all shadow-xs text-left cursor-pointer"
        >
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <div>
            <div className="text-xs font-bold">Pesanan Belum Lunas</div>
            <div className="text-[10px] text-slate-500">
              {financials.paymentBreakdown.unpaidCount + financials.paymentBreakdown.dpCount} pesanan perlu ditagih
            </div>
          </div>
        </button>
      </div>

      {/* Analytics & Top Products Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Payment Status Breakdown */}
        <Card
          title="Distribusi Status Pembayaran"
          subtitle="Persentase status pembayaran pesanan"
          className="lg:col-span-1"
        >
          <div className="space-y-4">
            {/* Visual Bar */}
            <div className="h-4 w-full bg-stone-100 rounded-full overflow-hidden flex shadow-inner">
              <div
                style={{ width: `${paymentDistribution.paidPct}%` }}
                className="bg-emerald-500 h-full transition-all"
                title={`Lunas: ${paymentDistribution.paidPct}%`}
              />
              <div
                style={{ width: `${paymentDistribution.dpPct}%` }}
                className="bg-amber-400 h-full transition-all"
                title={`DP: ${paymentDistribution.dpPct}%`}
              />
              <div
                style={{ width: `${paymentDistribution.unpaidPct}%` }}
                className="bg-rose-400 h-full transition-all"
                title={`Belum Lunas: ${paymentDistribution.unpaidPct}%`}
              />
            </div>

            {/* Legend & Details */}
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50/60 border border-emerald-100">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  <span className="font-semibold text-emerald-900">Lunas</span>
                </div>
                <div className="text-right">
                  <span className="font-mono tabular-nums font-bold text-emerald-900">
                    {paymentDistribution.paid} PO ({paymentDistribution.paidPct}%)
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-amber-50/60 border border-amber-100">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                  <span className="font-semibold text-amber-900">DP (Uang Muka)</span>
                </div>
                <div className="text-right">
                  <span className="font-mono tabular-nums font-bold text-amber-900">
                    {paymentDistribution.dp} PO ({paymentDistribution.dpPct}%)
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-rose-50/60 border border-rose-100">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                  <span className="font-semibold text-rose-900">Belum Lunas</span>
                </div>
                <div className="text-right">
                  <span className="font-mono tabular-nums font-bold text-rose-900">
                    {paymentDistribution.unpaid} PO ({paymentDistribution.unpaidPct}%)
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-stone-100 text-[11px] text-slate-500 flex justify-between">
              <span>Arus Kas Bersih (Net Cashflow):</span>
              <span className={`font-mono tabular-nums font-bold ${financials.netCashflow >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                {formatCurrency(financials.netCashflow)}
              </span>
            </div>
          </div>
        </Card>

        {/* Top Selling Products */}
        <Card
          title="Produk Terlaris"
          subtitle="Berdasarkan kuantitas terjual & omzet"
          className="lg:col-span-2"
          action={
            <button
              type="button"
              onClick={() => onNavigate('products')}
              className="text-xs text-blue-600 hover:text-blue-800 font-semibold"
            >
              Lihat Semua
            </button>
          }
        >
          {topProducts.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400">
              Belum ada data penjualan produk pada rentang waktu ini.
            </div>
          ) : (
            <div className="divide-y divide-stone-100">
              {topProducts.map((prod, idx) => (
                <div
                  key={idx}
                  className="py-2.5 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-5 h-5 rounded-md bg-stone-100 text-slate-600 flex items-center justify-center font-mono font-bold text-[11px] shrink-0">
                      {idx + 1}
                    </span>
                    <div>
                      <h5 className="font-semibold text-slate-900">{prod.name}</h5>
                      <span className="text-[11px] text-slate-400">
                        {prod.qty} {prod.unit} terjual
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-slate-900 font-mono tabular-nums">
                      {formatCurrency(prod.revenue)}
                    </div>
                    <span className="text-[10px] text-slate-400">Total Omzet</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Recent Orders Section */}
      <Card
        title="Pesanan Terbaru"
        subtitle="5 pesanan pre-order terakhir masuk"
        action={
          <button
            type="button"
            onClick={() => onNavigate('orders')}
            className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1"
          >
            <span>Buka Semua Pesanan</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        }
      >
        <div className="divide-y divide-stone-100">
          {recentOrders.map((order) => (
            <div
              key={order.id}
              onClick={() => onSelectOrder(order)}
              className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-stone-50/60 rounded-lg px-2 -mx-2 cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center font-mono text-xs font-bold text-slate-700 shrink-0">
                  PO
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 font-mono text-xs">
                      #{order.id}
                    </span>
                    <span className="text-xs font-semibold text-slate-800">
                      {order.customerName}
                    </span>
                    <OrderStatusBadge status={order.orderStatus} size="sm" />
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5 truncate max-w-md">
                    {order.itemsSummary || 'Rincian pesanan'}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3 sm:text-right shrink-0">
                <PaymentStatusBadge status={order.paymentStatus} size="sm" />
                <div>
                  <div className="text-xs font-bold text-slate-900 font-mono tabular-nums">
                    {formatCurrency(order.total)}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Kirim: {formatDate(order.deliveryDate, true)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
