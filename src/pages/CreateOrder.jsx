// Create / Edit Order Page Component
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Save,
  RotateCcw,
  CheckCircle2,
  Calendar,
  User,
  Phone,
  MessageCircle,
  FileText,
  CreditCard,
  ShoppingBag,
  AlertCircle,
  Search,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Button } from '../components/ui/Button.jsx';
import { Input } from '../components/ui/Input.jsx';
import { Select } from '../components/ui/Select.jsx';
import { ProductCard } from '../components/products/ProductCard.jsx';
import { SearchInput } from '../components/ui/SearchInput.jsx';
import { formatCurrency, calculateOrderTotals } from '../utils/currency.js';
import { formatDate, getTodayDateString } from '../utils/date.js';
import { validateOrder } from '../utils/validation.js';
import { APP_CONFIG } from '../config/app.js';

export function CreateOrder({
  products = [],
  editingOrder = null,
  onSaveOrder,
  onCancel,
}) {
  const isEditMode = Boolean(editingOrder?.id);

  // Initial order state
  const getInitialState = () => {
    // If editing existing order, load it
    if (editingOrder) {
      const itemsMap = {};
      (editingOrder.items || []).forEach((it) => {
        itemsMap[it.productId] = it.qty;
      });

      return {
        customerName: editingOrder.customerName || '',
        whatsapp: editingOrder.whatsapp || '',
        orderDate: editingOrder.orderDate || getTodayDateString(),
        deliveryDate: editingOrder.deliveryDate || getTodayDateString(),
        notes: editingOrder.notes || '',
        paymentMethod: editingOrder.paymentMethod || 'Cash / Tunai',
        amountPaid: editingOrder.amountPaid !== undefined ? String(editingOrder.amountPaid) : '0',
        quantities: itemsMap,
        orderStatus: editingOrder.orderStatus || 'new',
      };
    }

    // Check draft in localStorage if creating new order
    try {
      const savedDraft = localStorage.getItem(APP_CONFIG.storageKeys.DRAFT_ORDER);
      if (savedDraft) {
        const parsed = JSON.parse(savedDraft);
        return {
          customerName: parsed.customerName || '',
          whatsapp: parsed.whatsapp || '',
          orderDate: parsed.orderDate || getTodayDateString(),
          deliveryDate: parsed.deliveryDate || getTodayDateString(),
          notes: parsed.notes || '',
          paymentMethod: parsed.paymentMethod || 'Cash / Tunai',
          amountPaid: parsed.amountPaid !== undefined ? String(parsed.amountPaid) : '0',
          quantities: parsed.quantities || {},
          orderStatus: parsed.orderStatus || 'new',
        };
      }
    } catch (e) {
      console.error('Failed to parse draft order:', e);
    }

    // Default clean state
    return {
      customerName: '',
      whatsapp: '',
      orderDate: getTodayDateString(),
      deliveryDate: getTodayDateString(),
      notes: '',
      paymentMethod: 'Cash / Tunai',
      amountPaid: '0',
      quantities: {},
      orderStatus: 'new',
    };
  };

  const [formData, setFormData] = useState(getInitialState);
  const [productSearch, setProductSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [mobileSummaryOpen, setMobileSummaryOpen] = useState(false);

  // Save to localStorage draft automatically (only if not edit mode)
  useEffect(() => {
    if (!isEditMode) {
      try {
        localStorage.setItem(APP_CONFIG.storageKeys.DRAFT_ORDER, JSON.stringify(formData));
      } catch (err) {
        console.error('Failed to persist draft order:', err);
      }
    }
  }, [formData, isEditMode]);

  // Handle quantity changes for a product
  const handleQuantityChange = useCallback((product, newQty) => {
    setFormData((prev) => {
      const nextQuantities = { ...prev.quantities };
      if (newQty <= 0) {
        delete nextQuantities[product.id];
      } else {
        nextQuantities[product.id] = newQty;
      }
      return { ...prev, quantities: nextQuantities };
    });
  }, []);

  // Compute selected items structured list
  const selectedItems = useMemo(() => {
    const list = [];
    Object.entries(formData.quantities).forEach(([productId, qty]) => {
      const prod = products.find((p) => p.id === productId);
      if (prod && qty > 0) {
        list.push({
          productId: prod.id,
          name: prod.name,
          qty,
          price: prod.price,
          unit: prod.unit || 'pcs',
          subtotal: qty * prod.price,
        });
      }
    });
    return list;
  }, [formData.quantities, products]);

  // Compute totals
  const totals = useMemo(() => {
    return calculateOrderTotals(selectedItems, parseFloat(formData.amountPaid) || 0);
  }, [selectedItems, formData.amountPaid]);

  // Categories list from products
  const categories = useMemo(() => {
    const set = new Set();
    products.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return ['all', ...Array.from(set)];
  }, [products]);

  // Filtered products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (p.status === 'inactive') return false;
      const matchesCat = selectedCategory === 'all' || p.category === selectedCategory;
      const matchesSearch =
        !productSearch.trim() ||
        p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(productSearch.toLowerCase()));
      return matchesCat && matchesSearch;
    });
  }, [products, selectedCategory, productSearch]);

  // Reset form
  const handleResetForm = () => {
    if (window.confirm('Bersihkan formulir dan hapus draf yang belum selesai?')) {
      const cleanState = {
        customerName: '',
        whatsapp: '',
        orderDate: getTodayDateString(),
        deliveryDate: getTodayDateString(),
        notes: '',
        paymentMethod: 'Cash / Tunai',
        amountPaid: '0',
        quantities: {},
        orderStatus: 'new',
      };
      setFormData(cleanState);
      localStorage.removeItem(APP_CONFIG.storageKeys.DRAFT_ORDER);
      setErrors({});
    }
  };

  // Submit Order
  const handleSubmit = async (e) => {
    e?.preventDefault();

    const orderPayload = {
      customerName: formData.customerName,
      whatsapp: formData.whatsapp,
      orderDate: formData.orderDate,
      deliveryDate: formData.deliveryDate,
      items: selectedItems,
      total: totals.total,
      amountPaid: totals.amountPaid,
      paymentMethod: formData.paymentMethod,
      orderStatus: formData.orderStatus,
      notes: formData.notes,
    };

    const validation = validateOrder(orderPayload);
    if (!validation.isValid) {
      setErrors(validation.errors);
      // Scroll to top error or show alert
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setLoading(true);
    const result = await onSaveOrder(orderPayload, isEditMode ? editingOrder.id : null);
    setLoading(false);

    if (result?.success) {
      // Clear draft on successful creation
      if (!isEditMode) {
        localStorage.removeItem(APP_CONFIG.storageKeys.DRAFT_ORDER);
      }
    } else if (result?.error) {
      setErrors({ form: result.error });
    }
  };

  return (
    <div className="max-w-7xl mx-auto pb-24 space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-xl border border-stone-200/90 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              {isEditMode ? `Edit Pesanan #${editingOrder.id}` : 'Buat Pesanan Pre-Order'}
            </h2>
            {!isEditMode && (
              <span className="text-[10px] font-medium text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60">
                Draf Otomatis Disimpan
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Pilih menu produk, atur jumlah, dan catat DP atau pelunasan tagihan.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {!isEditMode && (
            <Button
              variant="outline"
              size="sm"
              icon={RotateCcw}
              onClick={handleResetForm}
              disabled={loading}
            >
              Reset Draf
            </Button>
          )}
          {onCancel && (
            <Button
              variant="secondary"
              size="sm"
              onClick={onCancel}
              disabled={loading}
            >
              Batal
            </Button>
          )}
        </div>
      </div>

      {errors.form && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium">
          {errors.form}
        </div>
      )}

      {/* Main Grid: Left (Form + Products) & Right (Summary) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* 1. Customer & Schedule Information Card */}
          <div className="bg-white p-5 rounded-xl border border-stone-200/90 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-stone-100">
              <User className="w-4 h-4 text-slate-700" />
              <h3 className="text-sm font-bold text-slate-900">
                1. Data Pelanggan & Jadwal Pemesanan
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Nama Pelanggan"
                placeholder="Contoh: Ibu Siti Rahmawati"
                value={formData.customerName}
                onChange={(e) =>
                  setFormData({ ...formData, customerName: e.target.value })
                }
                error={errors.customerName}
                required
              />

              <Input
                label="Nomor WhatsApp (Opsional)"
                placeholder="Contoh: 08123456789 atau 62812..."
                value={formData.whatsapp}
                onChange={(e) =>
                  setFormData({ ...formData, whatsapp: e.target.value })
                }
                helperText="Digunakan untuk kirim invoice otomatis."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Tanggal PO (Pemesanan)"
                type="date"
                value={formData.orderDate}
                onChange={(e) =>
                  setFormData({ ...formData, orderDate: e.target.value })
                }
                error={errors.orderDate}
                required
              />

              <Input
                label="Tanggal Pengiriman / Pickup"
                type="date"
                value={formData.deliveryDate}
                onChange={(e) =>
                  setFormData({ ...formData, deliveryDate: e.target.value })
                }
                error={errors.deliveryDate}
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Catatan Pesanan / Pengiriman (Opsional)
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                placeholder="Contoh: Sambal dipisah, minta kirim jam 10:30 pagi, atau kartu ucapan..."
                rows={2}
                className="w-full bg-white text-slate-900 border border-stone-300 rounded-lg p-3 text-sm outline-none focus:border-slate-800 focus:ring-2 focus:ring-slate-100 resize-none"
              />
            </div>
          </div>

          {/* 2. Product Catalog Selection Card */}
          <div className="bg-white p-5 rounded-xl border border-stone-200/90 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-slate-700" />
                <h3 className="text-sm font-bold text-slate-900">
                  2. Pilih Produk & Atur Kuantitas
                </h3>
              </div>
              <span className="text-xs text-slate-500">
                {selectedItems.length} produk terpilih ({totals.totalQty} total item)
              </span>
            </div>

            {errors.items && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errors.items}</span>
              </div>
            )}

            {/* Product Filters & Search */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="flex-1">
                <SearchInput
                  value={productSearch}
                  onChange={setProductSearch}
                  placeholder="Cari nama menu atau kata kunci produk..."
                  size="sm"
                />
              </div>

              {/* Category Pills / Buttons */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all whitespace-nowrap cursor-pointer ${
                      selectedCategory === cat
                        ? 'bg-slate-900 text-white'
                        : 'bg-stone-100 text-slate-600 hover:bg-stone-200'
                    }`}
                  >
                    {cat === 'all' ? 'Semua Kategori' : cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Products Grid */}
            {filteredProducts.length === 0 ? (
              <div className="py-10 text-center text-xs text-slate-400 border border-dashed border-stone-200 rounded-xl">
                Tidak ada produk aktif yang sesuai pencarian.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    quantity={formData.quantities[product.id] || 0}
                    onQuantityChange={handleQuantityChange}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (4 Cols): Sticky Order Summary & Payment Settings */}
        <div className="lg:col-span-4 lg:sticky lg:top-20 space-y-4">
          <div className="bg-white rounded-xl border border-stone-200/90 shadow-xs overflow-hidden">
            {/* Header */}
            <div className="px-5 py-4 bg-stone-50 border-b border-stone-200/80">
              <h3 className="text-sm font-bold text-slate-900">
                Ringkasan Pesanan
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {formData.customerName ? formData.customerName : 'Nama Pelanggan'} ·{' '}
                {formatDate(formData.deliveryDate, true)}
              </p>
            </div>

            {/* Selected Items List */}
            <div className="p-4 max-h-56 overflow-y-auto divide-y divide-stone-100 text-xs">
              {selectedItems.length === 0 ? (
                <div className="py-6 text-center text-slate-400">
                  Belum ada produk yang dipilih.
                </div>
              ) : (
                selectedItems.map((item, idx) => (
                  <div key={idx} className="py-2 flex justify-between items-start gap-2">
                    <div className="flex-1">
                      <div className="font-semibold text-slate-800">{item.name}</div>
                      <div className="text-[11px] text-slate-500 font-mono tabular-nums">
                        {item.qty} {item.unit} x {formatCurrency(item.price)}
                      </div>
                    </div>
                    <div className="font-bold font-mono tabular-nums text-slate-900 shrink-0">
                      {formatCurrency(item.subtotal)}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Financial Calculations & Payment Input */}
            <div className="p-4 bg-stone-50/70 border-t border-stone-200 space-y-3.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Total Item:</span>
                <span className="font-mono tabular-nums font-semibold">
                  {totals.totalQty} item
                </span>
              </div>

              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span className="font-mono tabular-nums">
                  {formatCurrency(totals.subtotal)}
                </span>
              </div>

              <div className="flex justify-between font-bold text-slate-900 text-sm pt-2 border-t border-stone-200">
                <span>TOTAL TAGIHAN:</span>
                <span className="font-mono tabular-nums">
                  {formatCurrency(totals.total)}
                </span>
              </div>

              {/* Payment Section */}
              <div className="pt-2 border-t border-stone-200 space-y-3">
                <Select
                  label="Metode Pembayaran"
                  value={formData.paymentMethod}
                  onChange={(e) =>
                    setFormData({ ...formData, paymentMethod: e.target.value })
                  }
                  options={APP_CONFIG.paymentMethods}
                />

                <Input
                  label="Nominal Dibayar (DP / Lunas)"
                  type="number"
                  value={formData.amountPaid}
                  onChange={(e) =>
                    setFormData({ ...formData, amountPaid: e.target.value })
                  }
                  prefix="Rp"
                  error={errors.amountPaid}
                  helperText="Isi 0 untuk Belum Lunas, atau sebagian untuk DP."
                />

                {/* Quick Fill Buttons */}
                {totals.total > 0 && (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, amountPaid: String(totals.total) })
                      }
                      className="text-xs text-blue-600 hover:text-blue-800 font-semibold"
                    >
                      Bayar Lunas
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          amountPaid: String(Math.round(totals.total / 2)),
                        })
                      }
                      className="text-xs text-slate-600 hover:text-slate-800 font-medium"
                    >
                      DP 50%
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, amountPaid: '0' })
                      }
                      className="text-xs text-slate-400 hover:text-slate-700"
                    >
                      Nol (Belum Bayar)
                    </button>
                  </div>
                )}

                {/* Remaining & Status Display */}
                <div className="p-3 bg-white rounded-lg border border-stone-200/90 space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Status Pembayaran:</span>
                    <span className="font-bold uppercase tracking-wider text-[11px]">
                      {totals.paymentStatus === 'paid'
                        ? 'Lunas'
                        : totals.paymentStatus === 'dp'
                        ? 'DP (Uang Muka)'
                        : 'Belum Lunas'}
                    </span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span className="text-slate-700">Sisa Tagihan (Piutang):</span>
                    <span
                      className={`font-mono tabular-nums ${
                        totals.remaining > 0 ? 'text-rose-700' : 'text-emerald-700'
                      }`}
                    >
                      {formatCurrency(totals.remaining)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Submit CTA */}
              <div className="pt-2">
                <Button
                  variant="primary"
                  size="lg"
                  icon={Save}
                  onClick={handleSubmit}
                  loading={loading}
                  className="w-full"
                >
                  {isEditMode ? 'Simpan Perubahan' : 'Kirim & Simpan Pesanan'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Bottom Summary Drawer (< 15% height cap compliance) */}
      <div className="lg:hidden fixed bottom-16 left-0 right-0 z-20 bg-white border-t border-stone-200 shadow-xl p-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block">
              Total ({totals.totalQty} item)
            </span>
            <span className="text-base font-bold text-slate-900 font-mono tabular-nums">
              {formatCurrency(totals.total)}
            </span>
          </div>

          <Button
            variant="primary"
            size="md"
            icon={Save}
            onClick={handleSubmit}
            loading={loading}
            className="flex-1 max-w-[200px]"
          >
            {isEditMode ? 'Simpan' : 'Kirim PO'}
          </Button>
        </div>
      </div>
    </div>
  );
}
