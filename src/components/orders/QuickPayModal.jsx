// Quick Pay Modal
import React, { useState } from 'react';
import { Modal } from '../ui/Modal.jsx';
import { Button } from '../ui/Button.jsx';
import { Input } from '../ui/Input.jsx';
import { Select } from '../ui/Select.jsx';
import { formatCurrency } from '../../utils/currency.js';
import { APP_CONFIG } from '../../config/app.js';

export function QuickPayModal({
  isOpen,
  onClose,
  order,
  onConfirmPayment,
}) {
  if (!order) return null;

  const remaining = order.remaining || 0;
  const [payAmount, setPayAmount] = useState(String(remaining));
  const [paymentMethod, setPaymentMethod] = useState(order.paymentMethod || 'Transfer Bank');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePay = async () => {
    const amount = parseFloat(payAmount) || 0;
    if (amount <= 0) {
      setError('Nominal pembayaran harus lebih besar dari 0');
      return;
    }
    if (amount > remaining) {
      setError(`Maksimal pembayaran adalah sisa tagihan: ${formatCurrency(remaining)}`);
      return;
    }

    setLoading(true);
    await onConfirmPayment(order.id, amount, paymentMethod);
    setLoading(false);
    onClose();
  };

  const footer = (
    <>
      <Button variant="outline" size="md" onClick={onClose} disabled={loading}>
        Batal
      </Button>
      <Button variant="primary" size="md" onClick={handlePay} loading={loading}>
        Simpan Pembayaran
      </Button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Rekam Pembayaran: ${order.id}`}
      description={`Pelanggan: ${order.customerName}`}
      maxWidth="max-w-md"
      footer={footer}
    >
      <div className="space-y-4">
        {/* Info Box */}
        <div className="bg-stone-50 border border-stone-200 rounded-lg p-3.5 space-y-1.5 text-xs">
          <div className="flex justify-between">
            <span className="text-slate-500">Total Tagihan:</span>
            <span className="font-semibold text-slate-800 font-mono tabular-nums">
              {formatCurrency(order.total)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Sudah Dibayar:</span>
            <span className="font-semibold text-emerald-700 font-mono tabular-nums">
              {formatCurrency(order.amountPaid)}
            </span>
          </div>
          <div className="flex justify-between pt-1.5 border-t border-stone-200">
            <span className="font-semibold text-slate-700">Sisa Tagihan:</span>
            <span className="font-bold text-rose-700 font-mono tabular-nums text-sm">
              {formatCurrency(remaining)}
            </span>
          </div>
        </div>

        {/* Input Amount */}
        <div>
          <Input
            label="Nominal Pembayaran Diterima"
            type="number"
            value={payAmount}
            onChange={(e) => {
              setPayAmount(e.target.value);
              setError('');
            }}
            prefix="Rp"
            error={error}
            helperText="Masukkan nominal yang baru dibayarkan oleh pelanggan."
            required
          />
          {remaining > 0 && (
            <div className="flex gap-2 mt-2">
              <button
                type="button"
                onClick={() => setPayAmount(String(remaining))}
                className="text-xs text-blue-600 hover:text-blue-800 hover:underline font-medium"
              >
                Bayar Lunas ({formatCurrency(remaining)})
              </button>
              {remaining > 50000 && (
                <button
                  type="button"
                  onClick={() => setPayAmount(String(Math.round(remaining / 2)))}
                  className="text-xs text-slate-500 hover:text-slate-800 hover:underline"
                >
                  Bayar 50% ({formatCurrency(Math.round(remaining / 2))})
                </button>
              )}
            </div>
          )}
        </div>

        {/* Payment Method */}
        <Select
          label="Metode Pembayaran"
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
          options={APP_CONFIG.paymentMethods}
          required
        />
      </div>
    </Modal>
  );
}
