// Product Management Page Component
import React, { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  Package,
  Edit2,
  Trash2,
  Copy,
  ToggleLeft,
  ToggleRight,
  TrendingUp,
  Tag,
} from 'lucide-react';
import { Button } from '../components/ui/Button.jsx';
import { SearchInput } from '../components/ui/SearchInput.jsx';
import { EmptyState } from '../components/ui/EmptyState.jsx';
import { ProductFormModal } from '../components/products/ProductFormModal.jsx';
import { ConfirmDialog } from '../components/ui/ConfirmDialog.jsx';
import { formatCurrency } from '../utils/currency.js';
import { useToast } from '../components/ui/Toast.jsx';

export function Products({
  products = [],
  productAnalytics = {},
  onAddProduct,
  onUpdateProduct,
  onDuplicateProduct,
  onToggleStatus,
  onDeleteProduct,
}) {
  const { toastSuccess, toastError } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'active' | 'inactive'

  // Modals state
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [confirmDeleteProduct, setConfirmDeleteProduct] = useState(null);

  // Categories list
  const categories = useMemo(() => {
    const set = new Set();
    products.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return ['all', ...Array.from(set)];
  }, [products]);

  // Filtered products list
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (statusFilter !== 'all' && p.status !== statusFilter) return false;
      if (selectedCategory !== 'all' && p.category !== selectedCategory) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = p.name.toLowerCase().includes(q);
        const matchesDesc = p.description && p.description.toLowerCase().includes(q);
        const matchesCat = p.category && p.category.toLowerCase().includes(q);
        if (!matchesName && !matchesDesc && !matchesCat) return false;
      }
      return true;
    });
  }, [products, statusFilter, selectedCategory, searchQuery]);

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormModalOpen(true);
  };

  const handleOpenEdit = (product) => {
    setEditingProduct(product);
    setFormModalOpen(true);
  };

  const handleSaveProduct = async (productData) => {
    if (editingProduct) {
      const res = await onUpdateProduct(editingProduct.id, productData);
      if (res?.success) {
        toastSuccess(`Produk "${productData.name}" berhasil diperbarui.`);
        return res;
      }
      toastError(res?.error || 'Gagal memperbarui produk.');
      return res;
    } else {
      const res = await onAddProduct(productData);
      if (res?.success) {
        toastSuccess(`Produk "${productData.name}" berhasil ditambahkan.`);
        return res;
      }
      toastError(res?.error || 'Gagal menambahkan produk.');
      return res;
    }
  };

  const handleDuplicate = async (product) => {
    const res = await onDuplicateProduct(product);
    if (res?.success) {
      toastSuccess(`Salinan "${product.name}" berhasil dibuat.`);
    } else {
      toastError('Gagal menduplikasi produk.');
    }
  };

  const handleToggle = async (productId) => {
    await onToggleStatus(productId);
    toastSuccess('Status ketersediaan produk diubah.');
  };

  const handleDelete = async () => {
    if (!confirmDeleteProduct) return;
    const res = await onDeleteProduct(confirmDeleteProduct.id);
    if (res?.success) {
      toastSuccess(`Produk "${confirmDeleteProduct.name}" berhasil dihapus.`);
    } else {
      toastError('Gagal menghapus produk.');
    }
    setConfirmDeleteProduct(null);
  };

  return (
    <div className="space-y-5 max-w-7xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Katalog Produk & Menu
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Kelola daftar menu, harga jual satuan, dan pantau performa penjualan.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          icon={Plus}
          onClick={handleOpenAdd}
        >
          Tambah Produk Baru
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-stone-200/90 shadow-xs space-y-3.5">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex-1 max-w-md">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Cari nama produk, kategori, atau deskripsi..."
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium shrink-0">
              Status:
            </span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs bg-white border border-stone-300 rounded-lg px-3 py-2 font-medium text-slate-800 outline-none cursor-pointer focus:border-slate-800 min-h-[40px]"
            >
              <option value="all">Semua Status</option>
              <option value="active">Hanya Aktif</option>
              <option value="inactive">Hanya Non-aktif</option>
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar pt-1 border-t border-stone-100">
          <span className="text-xs text-slate-400 font-medium mr-1 shrink-0">
            Kategori:
          </span>
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

      {/* Products Grid or Empty */}
      {filteredProducts.length === 0 ? (
        <EmptyState
          title="Tidak Ada Produk"
          description={
            searchQuery
              ? `Tidak ada produk yang cocok dengan "${searchQuery}".`
              : 'Belum ada produk yang ditambahkan ke dalam katalog.'
          }
          actionLabel="Tambah Produk Pertama"
          onAction={handleOpenAdd}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map((product) => {
            const stats = productAnalytics[product.id] || {
              unitsSold: 0,
              revenue: 0,
              orderCount: 0,
            };

            const isActive = product.status !== 'inactive';

            return (
              <div
                key={product.id}
                className={`bg-white border rounded-xl p-5 shadow-xs flex flex-col justify-between transition-all ${
                  isActive
                    ? 'border-stone-200/90 hover:border-stone-300'
                    : 'border-stone-200 bg-stone-50/50 opacity-75'
                }`}
              >
                <div>
                  {/* Category and Status */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      {product.category || 'Umum'}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleToggle(product.id)}
                      className={`text-xs font-medium px-2 py-0.5 rounded-full flex items-center gap-1 cursor-pointer transition-colors ${
                        isActive
                          ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                          : 'bg-stone-200 text-slate-600 hover:bg-stone-300'
                      }`}
                      title={isActive ? 'Non-aktifkan produk' : 'Aktifkan produk'}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          isActive ? 'bg-emerald-500' : 'bg-slate-400'
                        }`}
                      />
                      <span>{isActive ? 'Aktif' : 'Non-aktif'}</span>
                    </button>
                  </div>

                  {/* Name and Price */}
                  <h3 className="text-base font-bold text-slate-900 leading-snug">
                    {product.name}
                  </h3>

                  <div className="flex items-baseline gap-1 mt-1.5">
                    <span className="text-lg font-bold text-slate-900 font-mono tabular-nums">
                      {formatCurrency(product.price)}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      / {product.unit || 'pcs'}
                    </span>
                  </div>

                  {product.description && (
                    <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                      {product.description}
                    </p>
                  )}
                </div>

                {/* Analytics Snapshot & Actions */}
                <div className="mt-5 pt-3 border-t border-stone-100 space-y-3">
                  {/* Product Analytics Bar */}
                  <div className="grid grid-cols-3 gap-2 bg-stone-50 p-2 rounded-lg text-center text-xs">
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">
                        Terjual
                      </div>
                      <div className="font-bold text-slate-800 font-mono tabular-nums">
                        {stats.unitsSold} {product.unit || 'pcs'}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">
                        Pesanan
                      </div>
                      <div className="font-bold text-slate-800 font-mono tabular-nums">
                        {stats.orderCount} PO
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">
                        Omzet
                      </div>
                      <div className="font-bold text-slate-800 font-mono tabular-nums truncate">
                        {formatCurrency(stats.revenue)}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-end gap-1.5 pt-1">
                    <button
                      type="button"
                      onClick={() => handleDuplicate(product)}
                      className="p-1.5 rounded-lg text-slate-600 hover:bg-stone-100 transition-colors"
                      title="Duplikasi Produk"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(product)}
                      className="p-1.5 rounded-lg text-slate-700 hover:bg-stone-100 transition-colors"
                      title="Edit Produk"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteProduct(product)}
                      className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Hapus Produk"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Product Form Modal (Add / Edit) */}
      <ProductFormModal
        isOpen={formModalOpen}
        onClose={() => {
          setFormModalOpen(false);
          setEditingProduct(null);
        }}
        initialProduct={editingProduct}
        onSave={handleSaveProduct}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(confirmDeleteProduct)}
        onClose={() => setConfirmDeleteProduct(null)}
        onConfirm={handleDelete}
        title="Hapus Produk"
        message={`Apakah Anda yakin ingin menghapus produk "${confirmDeleteProduct?.name}"? Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Hapus Produk"
        variant="danger"
      />
    </div>
  );
}
