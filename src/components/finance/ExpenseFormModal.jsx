// Expense Add/Edit Form Modal
import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal.jsx';
import { Button } from '../ui/Button.jsx';
import { Input } from '../ui/Input.jsx';
import { Select } from '../ui/Select.jsx';
import { validateExpense } from '../../utils/validation.js';
import { getTodayDateString } from '../../utils/date.js';
import { APP_CONFIG } from '../../config/app.js';

export function ExpenseFormModal({
  isOpen,
  onClose,
  initialExpense = null,
  onSave,
}) {
  const isEdit = Boolean(initialExpense?.id);

  const [formData, setFormData] = useState({
    date: getTodayDateString(),
    category: 'Bahan Baku',
    amount: '',
    paymentMethod: 'Cash / Tunai',
    description: '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialExpense) {
      setFormData({
        date: initialExpense.date || getTodayDateString(),
        category: initialExpense.category || 'Bahan Baku',
        amount: initialExpense.amount !== undefined ? String(initialExpense.amount) : '',
        paymentMethod: initialExpense.paymentMethod || 'Cash / Tunai',
        description: initialExpense.description || '',
      });
    } else {
      setFormData({
        date: getTodayDateString(),
        category: 'Bahan Baku',
        amount: '',
        paymentMethod: 'Cash / Tunai',
        description: '',
      });
    }
    setErrors({});
  }, [initialExpense, isOpen]);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    const validation = validateExpense(formData);
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
        {isEdit ? 'Perbarui Pengeluaran' : 'Catat Pengeluaran'}
      </Button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit Catatan Pengeluaran' : 'Catat Pengeluaran Baru'}
      description="Catat biaya bahan baku, operasional, atau kemasan untuk menghitung arus kas riil."
      maxWidth="max-w-lg"
      footer={footer}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errors.form && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-xs text-rose-700 rounded-lg">
            {errors.form}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Tanggal Pengeluaran"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            error={errors.date}
            required
          />

          <Select
            label="Kategori Biaya"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            options={APP_CONFIG.expenseCategories}
            error={errors.category}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Nominal Pengeluaran"
            type="number"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            placeholder="150000"
            prefix="Rp"
            error={errors.amount}
            required
          />

          <Select
            label="Metode Pembayaran"
            value={formData.paymentMethod}
            onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
            options={APP_CONFIG.paymentMethods}
            required
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-700">
            Keterangan / Rincian Pengeluaran
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Contoh: Belanja beras 25kg, bumbu dapur, atau bayar gas LPG..."
            rows={3}
            className="w-full bg-white text-slate-900 border border-stone-300 rounded-lg p-3 text-sm outline-none focus:border-slate-800 focus:ring-2 focus:ring-slate-100 resize-none"
          />
        </div>
      </form>
    </Modal>
  );
}
