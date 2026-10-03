// Order Receipt & Invoice Print Modal
import React, { useRef } from 'react';
import { Printer, CheckCircle, Share2 } from 'lucide-react';
import { Modal } from '../ui/Modal.jsx';
import { Button } from '../ui/Button.jsx';
import { formatCurrency } from '../../utils/currency.js';
import { formatDate, formatDateTime } from '../../utils/date.js';

export function OrderReceiptModal({
  isOpen,
  onClose,
  order,
  settings,
}) {
  const receiptRef = useRef(null);
  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  const footer = (
    <>
      <Button variant="outline" size="md" onClick={onClose}>
        Tutup
      </Button>
      <Button
        variant="primary"
        size="md"
        icon={Printer}
        onClick={handlePrint}
      >
        Cetak Nota / Invoice
      </Button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Cetak Nota / Struk Pesanan"
      description="Format struk siap cetak ke printer thermal 80mm atau printer biasa (A4/A5)."
      maxWidth="max-w-lg"
      footer={footer}
    >
      {/* Printable Receipt Paper Container */}
      <div
        ref={receiptRef}
        id="printable-receipt"
        className="bg-white border border-stone-300 rounded-lg p-6 font-mono text-xs text-slate-800 space-y-4 shadow-xs"
      >
        {/* Business Header */}
        <div className="text-center pb-3 border-b border-dashed border-stone-300">
          <h2 className="text-base font-bold text-slate-900 uppercase tracking-wide">
            {settings?.businessName || 'Dapur Berkah Nusantara'}
          </h2>
          {settings?.businessTagline && (
            <p className="text-[11px] text-slate-600 mt-0.5">{settings.businessTagline}</p>
          )}
          {settings?.address && (
            <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">{settings.address}</p>
          )}
          {settings?.phone && (
            <p className="text-[10px] text-slate-600 mt-0.5">Telp/WA: {settings.phone}</p>
          )}
        </div>

        {/* Order Meta Info */}
        <div className="space-y-1 text-[11px]">
          <div className="flex justify-between">
            <span className="text-slate-500">No. Pesanan:</span>
            <span className="font-bold text-slate-900">{order.id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Waktu Order:</span>
            <span>{formatDateTime(order.timestamp || order.orderDate)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Jadwal Kirim/Ambil:</span>
            <span className="font-semibold">{formatDate(order.deliveryDate, false)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Pelanggan:</span>
            <span className="font-semibold text-slate-900">{order.customerName}</span>
          </div>
          {order.whatsapp && (
            <div className="flex justify-between">
              <span className="text-slate-500">WhatsApp:</span>
              <span>{order.whatsapp}</span>
            </div>
          )}
        </div>

        {/* Items List */}
        <div className="pt-2 border-t border-dashed border-stone-300">
          <div className="flex justify-between font-bold pb-1 text-[11px] border-b border-stone-200">
            <span>PRODUK</span>
            <span>TOTAL</span>
          </div>
          <div className="divide-y divide-stone-100 py-1 space-y-1">
            {(order.items || []).map((item, idx) => (
              <div key={idx} className="pt-1 text-[11px]">
                <div className="font-semibold text-slate-900">{item.name}</div>
                <div className="flex justify-between text-slate-600 text-[10px]">
                  <span>
                    {item.qty} {item.unit || 'pcs'} x {formatCurrency(item.price)}
                  </span>
                  <span className="tabular-nums font-semibold">
                    {formatCurrency(item.subtotal || item.qty * item.price)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Financial Summary */}
        <div className="pt-2 border-t border-dashed border-stone-300 space-y-1 text-[11px]">
          <div className="flex justify-between">
            <span className="text-slate-500">Total Kuantitas:</span>
            <span className="tabular-nums font-semibold">{order.totalQty || 0} item</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Subtotal:</span>
            <span className="tabular-nums">{formatCurrency(order.subtotal || order.total)}</span>
          </div>
          <div className="flex justify-between font-bold text-slate-900 text-xs pt-1 border-t border-stone-200">
            <span>TOTAL TAGIHAN:</span>
            <span className="tabular-nums">{formatCurrency(order.total)}</span>
          </div>
          <div className="flex justify-between pt-1">
            <span className="text-slate-500">Metode Bayar:</span>
            <span>{order.paymentMethod || 'Cash'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Sudah Dibayar:</span>
            <span className="tabular-nums font-semibold text-emerald-700">
              {formatCurrency(order.amountPaid || 0)}
            </span>
          </div>
          <div className="flex justify-between font-bold">
            <span className="text-slate-700">Sisa Pembayaran:</span>
            <span className={`tabular-nums ${order.remaining > 0 ? 'text-rose-700' : 'text-slate-900'}`}>
              {formatCurrency(order.remaining || 0)}
            </span>
          </div>
          <div className="flex justify-between pt-1 border-t border-stone-100">
            <span className="text-slate-500">Status Pembayaran:</span>
            <span className="font-bold uppercase tracking-wider">
              {order.paymentStatus === 'paid'
                ? 'LUNAS'
                : order.paymentStatus === 'dp'
                ? 'DP (SEBAGIAN)'
                : 'BELUM LUNAS'}
            </span>
          </div>
        </div>

        {/* Notes */}
        {order.notes && (
          <div className="pt-2 border-t border-dashed border-stone-300 text-[10px] text-slate-600">
            <span className="font-bold">Catatan: </span>
            {order.notes}
          </div>
        )}

        {/* Bank Account Info if unpaid or DP */}
        {order.remaining > 0 && settings?.accountNumber && (
          <div className="pt-2 border-t border-dashed border-stone-300 text-center text-[10px] text-slate-600 bg-stone-50 p-2 rounded">
            <div>Transfer Pelunasan ke:</div>
            <div className="font-bold text-slate-900">
              {settings.bankName} - {settings.accountNumber}
            </div>
            <div>a.n. {settings.accountName}</div>
          </div>
        )}

        {/* Footer Greetings */}
        <div className="pt-3 border-t border-dashed border-stone-300 text-center text-[10px] text-slate-500 space-y-0.5">
          <p className="font-medium text-slate-700">Terima kasih atas pesanan Anda!</p>
          <p>Barang yang sudah dipesan tidak dapat dibatalkan sepihak.</p>
        </div>
      </div>
    </Modal>
  );
}
