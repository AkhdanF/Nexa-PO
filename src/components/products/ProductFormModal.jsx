// Product Add/Edit Form Modal
import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal.jsx';
import { Button } from '../ui/Button.jsx';
import { Input } from '../ui/Input.jsx';
import { Select } from '../ui/Select.jsx';
import { validateProduct } from '../../utils/validation.js';
import { APP_CONFIG } from '../../config/app.js';

export function ProductFormModal({
  isOpen,
  onClose,
  initialProduct = null,
  onSave,
}) {
  const isEdit = Boolean(initialProduct?.id);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'Katering & Nasi',
    price: '',
    unit: 'pcs',
    status: 'active',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialProduct) {
      setFormData({
        name: initialProduct.name || '',
        description: initialProduct.description || '',
        category: initialProduct.category || 'Katering & Nasi',
        price: initialProduct.price !== undefined ? String(initialProduct.price) : '',
        unit: initialProduct.unit || 'pcs',
        status: initialProduct.status || 'active',
      });
    } else {
      setFormData({
        name: '',
        description: '',
        category: 'Katering & Nasi',
        price: '',
        unit: 'pcs',
        status: 'active',
      });
    }
    setErrors({});
  }, [initialProduct, isOpen]);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    const validation = validateProduct(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setLoading(true);
    const result = await onSave(formData);
    setLoading(false);

    if (result?.success) {
      onClose();
    } else if (result?.error) {
      setErrors({ form: result.error });
    }
  };

  const footer = (
    <>
      <Button variant="outline" size="md" onClick={onClose} disabled={loading}>
        Batal
      </Button>
      <Button
        variant="primary"
        size="md"
        onClick={handleSubmit}
        loading={loading}
      >
        {isEdit ? 'Perbarui Produk' : 'Simpan Produk'}
      </Button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit Produk' : 'Tambah Produk Baru'}
      description="Kelola informasi menu atau katalog barang usaha Anda."
      maxWidth="max-w-lg"
      footer={footer}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errors.form && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-xs text-rose-700 rounded-lg">
            {errors.form}
          </div>
        )}

        <Input
          label="Nama Produk"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Contoh: Nasi Tumpeng Mini Nusantara"
          error={errors.name}
          required
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Kategori"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            placeholder="Katering, Minuman, Kue..."
            error={errors.category}
            required
          />

          <Select
            label="Satuan Unit"
            value={formData.unit}
            onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
            options={APP_CONFIG.productUnits}
            error={errors.unit}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Harga Jual"
            type="number"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            placeholder="35000"
            prefix="Rp"
            error={errors.price}
            required
          />

          <Select
            label="Status Produk"
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            options={[
              { value: 'active', label: 'Aktif (Tersedia)' },
              { value: 'inactive', label: 'Non-aktif (Habis/Arsip)' },
            ]}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-700">
            Deskripsi / Komposisi (Opsional)
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Rincian isi lauk, porsi, atau catatan khusus produk..."
            rows={3}
            className="w-full bg-white text-slate-900 border border-stone-300 rounded-lg p-3 text-sm outline-none focus:border-slate-800 focus:ring-2 focus:ring-slate-100 resize-none"
          />
        </div>
      </form>
    </Modal>
  );
}
