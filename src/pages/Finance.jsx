// Finance & Expense Management Page Component
import React, { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  Filter,
  Receipt,
  DollarSign,
  TrendingUp,
  CreditCard,
  PiggyBank,
  Edit2,
  Trash2,
  Calendar,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { StatCard } from '../components/ui/StatCard.jsx';
import { Card } from '../components/ui/Card.jsx';
import { Button } from '../components/ui/Button.jsx';
import { SearchInput } from '../components/ui/SearchInput.jsx';
import { EmptyState } from '../components/ui/EmptyState.jsx';
import { ExpenseFormModal } from '../components/finance/ExpenseFormModal.jsx';
import { ConfirmDialog } from '../components/ui/ConfirmDialog.jsx';
import { formatCurrency, calculateFinancials } from '../utils/currency.js';
import { formatDate, isDateInRange, getTodayDateString } from '../utils/date.js';
import { useToast } from '../components/ui/Toast.jsx';
import { APP_CONFIG } from '../config/app.js';

export function Finance({
  orders = [],
  expenses = [],
  onAddExpense,
  onUpdateExpense,
  onDeleteExpense,
}) {
  const { toastSuccess, toastError } = useToast();

  const [dateRange, setDateRange] = useState('month'); // 'today' | '7d' | '30d' | 'month' | 'all' | 'custom'
  const [customStart, setCustomStart] = useState(getTodayDateString());
  const [customEnd, setCustomEnd] = useState(getTodayDateString());
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Modals state
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [confirmDeleteExpense, setConfirmDeleteExpense] = useState(null);

  // Filtered orders & expenses based on date range
  const rangeOrders = useMemo(() => {
    return orders.filter((o) =>
      isDateInRange(o.orderDate || o.timestamp, dateRange, customStart, customEnd)
    );
  }, [orders, dateRange, customStart, customEnd]);

  const rangeExpenses = useMemo(() => {
    return expenses.filter((e) =>
      isDateInRange(e.date || e.timestamp, dateRange, customStart, customEnd)
    );
  }, [expenses, dateRange, customStart, customEnd]);

  // Centralized Financial Calculations
  const financials = useMemo(() => {
    return calculateFinancials(rangeOrders, rangeExpenses);
  }, [rangeOrders, rangeExpenses]);

  // Filtered expenses list for table view
  const displayedExpenses = useMemo(() => {
    return rangeExpenses.filter((e) => {
      if (categoryFilter !== 'all' && e.category !== categoryFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesDesc = e.description && e.description.toLowerCase().includes(q);
        const matchesCat = e.category && e.category.toLowerCase().includes(q);
        const matchesMethod = e.paymentMethod && e.paymentMethod.toLowerCase().includes(q);
        if (!matchesDesc && !matchesCat && !matchesMethod) return false;
      }
      return true;
    });
  }, [rangeExpenses, categoryFilter, searchQuery]);

  // Category breakdown for expenses
  const expenseByCategory = useMemo(() => {
    const map = {};
    rangeExpenses.forEach((e) => {
      map[e.category] = (map[e.category] || 0) + (parseFloat(e.amount) || 0);
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [rangeExpenses]);

  const handleOpenAdd = () => {
    setEditingExpense(null);
    setFormModalOpen(true);
  };

  const handleOpenEdit = (expense) => {
    setEditingExpense(expense);
    setFormModalOpen(true);
  };

  const handleSaveExpense = async (expenseData) => {
    if (editingExpense) {
      const res = await onUpdateExpense(editingExpense.id, expenseData);
      if (res?.success) {
        toastSuccess('Catatan pengeluaran berhasil diperbarui.');
        return res;
      }
      toastError(res?.error || 'Gagal memperbarui pengeluaran.');
      return res;
    } else {
      const res = await onAddExpense(expenseData);
      if (res?.success) {
        toastSuccess('Pengeluaran baru berhasil dicatat.');
        return res;
      }
      toastError(res?.error || 'Gagal mencatat pengeluaran.');
      return res;
    }
  };

  const handleDelete = async () => {
    if (!confirmDeleteExpense) return;
    const res = await onDeleteExpense(confirmDeleteExpense.id);
    if (res?.success) {
      toastSuccess('Pengeluaran berhasil dihapus.');
    } else {
      toastError('Gagal menghapus pengeluaran.');
    }
    setConfirmDeleteExpense(null);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header & Date Range */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-stone-200/90 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Arus Kas & Manajemen Pengeluaran
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Pantau kas masuk riil, piutang usaha, belanja operasional, dan estimasi laba.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Date Range Selector */}
          <div className="flex items-center gap-1 p-1 bg-stone-100 rounded-lg border border-stone-200/70">
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

          <Button
            variant="primary"
            size="md"
            icon={Plus}
            onClick={handleOpenAdd}
          >
            Catat Pengeluaran
          </Button>
        </div>
      </div>

      {/* Cashflow Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Total Omzet */}
        <StatCard
          title="Total Omzet"
          value={formatCurrency(financials.revenue)}
          subtitle="Nilai seluruh pesanan"
          icon={TrendingUp}
          iconBg="bg-blue-50 text-blue-700"
          tooltip="Omzet kotor dari pesanan aktif"
        />

        {/* Kas Masuk Riil */}
        <StatCard
          title="Kas Masuk Riil"
          value={formatCurrency(financials.cashReceived)}
          subtitle="Uang riil diterima"
          icon={DollarSign}
          iconBg="bg-emerald-50 text-emerald-700"
          tooltip="Uang nyata yang sudah masuk kas"
        />

        {/* Piutang */}
        <StatCard
          title="Piutang Usaha"
          value={formatCurrency(financials.receivables)}
          subtitle="Sisa tagihan pelanggan"
          icon={CreditCard}
          iconBg="bg-rose-50 text-rose-700"
          tooltip="Uang yang masih belum dilunasi"
        />

        {/* Total Pengeluaran */}
        <StatCard
          title="Pengeluaran"
          value={formatCurrency(financials.expenses)}
          subtitle="Biaya & operasional"
          icon={Receipt}
          iconBg="bg-amber-50 text-amber-700"
          tooltip="Total belanja bahan dan biaya operasional"
        />

        {/* Net Cashflow */}
        <StatCard
          title="Arus Kas Bersih"
          value={formatCurrency(financials.netCashflow)}
          subtitle="Kas Masuk - Pengeluaran"
          icon={PiggyBank}
          iconBg={financials.netCashflow >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}
          highlight={true}
          tooltip="Arus kas likuid riil yang tersisa di tangan"
        />

        {/* Estimasi Laba */}
        <StatCard
          title="Estimasi Laba"
          value={formatCurrency(financials.estimatedProfit)}
          subtitle="Omzet - Pengeluaran"
          icon={TrendingUp}
          iconBg="bg-indigo-50 text-indigo-700"
          tooltip="Perkiraan laba (Omzet dikurangi Pengeluaran tercatat)"
        />
      </div>

      {/* Cashflow Explanation Card */}
      <div className="bg-stone-50 border border-stone-200/90 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-600">
        <div className="flex items-center gap-2.5">
          <AlertCircle className="w-5 h-5 text-slate-400 shrink-0" />
          <span>
            <strong className="text-slate-800">Catatan Arus Kas:</strong> Nilai{' '}
            <strong>Total Omzet ({formatCurrency(financials.revenue)})</strong> berbeda dengan{' '}
            <strong>Kas Masuk Riil ({formatCurrency(financials.cashReceived)})</strong> karena sebagian pesanan masih berstatus DP atau belum lunas (Piutang: {formatCurrency(financials.receivables)}).
          </span>
        </div>
      </div>

      {/* Expense Management Section: Category Breakdown + Expenses Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (4 cols): Expense Categories Breakdown */}
        <Card
          title="Komposisi Pengeluaran"
          subtitle="Distribusi biaya berdasarkan kategori"
          className="lg:col-span-4"
        >
          {expenseByCategory.length === 0 ? (
            <div className="text-center py-6 text-xs text-slate-400">
              Belum ada data pengeluaran pada rentang waktu ini.
            </div>
          ) : (
            <div className="space-y-3">
              {expenseByCategory.map(([cat, amount], idx) => {
                const totalExp = financials.expenses || 1;
                const pct = Math.round((amount / totalExp) * 100);

                return (
                  <div key={idx} className="space-y-1 text-xs">
                    <div className="flex justify-between font-medium">
                      <span className="text-slate-800">{cat}</span>
                      <span className="font-mono tabular-nums text-slate-900 font-semibold">
                        {formatCurrency(amount)} ({pct}%)
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-stone-100 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${pct}%` }}
                        className="h-full bg-slate-800 rounded-full"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Right Column (8 cols): Expense Transactions Table */}
        <div className="lg:col-span-8 space-y-3.5">
          {/* Table Controls */}
          <div className="bg-white p-3.5 rounded-xl border border-stone-200/90 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex-1 max-w-sm">
              <SearchInput
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Cari keterangan, kategori, atau metode..."
                size="sm"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium shrink-0">
                Kategori:
              </span>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="text-xs bg-white border border-stone-300 rounded-lg px-2.5 py-1.5 font-medium text-slate-800 outline-none cursor-pointer focus:border-slate-800 min-h-[36px]"
              >
                <option value="all">Semua Kategori</option>
                {APP_CONFIG.expenseCategories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Expenses Table or Empty */}
          {displayedExpenses.length === 0 ? (
            <EmptyState
              title="Tidak Ada Catatan Pengeluaran"
              description="Belum ada transaksi pengeluaran yang cocok dengan kriteria filter."
              actionLabel="Catat Pengeluaran Baru"
              onAction={handleOpenAdd}
            />
          ) : (
            <div className="bg-white border border-stone-200/90 rounded-xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-stone-50 border-b border-stone-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="py-3 px-4">Tanggal</th>
                      <th className="py-3 px-4">Kategori</th>
                      <th className="py-3 px-4">Keterangan</th>
                      <th className="py-3 px-4">Metode</th>
                      <th className="py-3 px-4 text-right">Nominal</th>
                      <th className="py-3 px-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {displayedExpenses.map((expense) => (
                      <tr key={expense.id} className="hover:bg-stone-50/70 transition-colors">
                        <td className="py-3 px-4 whitespace-nowrap text-slate-700">
                          {formatDate(expense.date, false)}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="font-semibold text-slate-800 bg-stone-100 px-2 py-0.5 rounded text-[11px]">
                            {expense.category}
                          </span>
                        </td>
                        <td className="py-3 px-4 max-w-xs text-slate-600">
                          {expense.description || '-'}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap text-slate-500">
                          {expense.paymentMethod || 'Cash'}
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap font-mono tabular-nums font-bold text-slate-900">
                          {formatCurrency(expense.amount)}
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(expense)}
                              className="p-1.5 rounded-lg text-slate-600 hover:bg-stone-100 transition-colors"
                              title="Edit Pengeluaran"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteExpense(expense)}
                              className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors"
                              title="Hapus Pengeluaran"
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
          )}
        </div>
      </div>

      {/* Expense Form Modal (Add / Edit) */}
      <ExpenseFormModal
        isOpen={formModalOpen}
        onClose={() => {
          setFormModalOpen(false);
          setEditingExpense(null);
        }}
        initialExpense={editingExpense}
        onSave={handleSaveExpense}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(confirmDeleteExpense)}
        onClose={() => setConfirmDeleteExpense(null)}
        onConfirm={handleDelete}
        title="Hapus Catatan Pengeluaran"
        message={`Apakah Anda yakin ingin menghapus catatan pengeluaran sebesar ${formatCurrency(
          confirmDeleteExpense?.amount
        )} untuk ${confirmDeleteExpense?.category}?`}
        confirmText="Hapus"
        variant="danger"
      />
    </div>
  );
}
