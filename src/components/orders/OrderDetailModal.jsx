// Order Detail Modal with Status Timeline and Full Actions
import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  User,
  Phone,
  MessageCircle,
  Printer,
  CreditCard,
  Edit2,
  Trash2,
  CheckCircle,
  Truck,
  PackageCheck,
  AlertCircle,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { Modal } from '../ui/Modal.jsx';
import { Button } from '../ui/Button.jsx';
import { OrderStatusBadge } from './OrderStatusBadge.jsx';
import { PaymentStatusBadge } from './PaymentStatusBadge.jsx';
import { formatCurrency } from '../../utils/currency.js';
import { formatDate, formatDateTime } from '../../utils/date.js';
import { generateWhatsAppMessage, openWhatsAppLink } from '../../utils/whatsapp.js';
import { APP_CONFIG } from '../../config/app.js';

export function OrderDetailModal({
  isOpen,
  onClose,
  order,
  settings,
  onUpdateStatus,
  onOpenQuickPay,
  onOpenReceipt,
  onEditOrder,
  onDeleteOrder,
}) {
  const [updatingStatus, setUpdatingStatus] = useState(false);
  if (!order) return null;

  const handleStatusChange = async (newStatus) => {
    setUpdatingStatus(true);
    await onUpdateStatus(order.id, newStatus);
    setUpdatingStatus(false);
  };

  const handleSendWhatsApp = () => {
    const message = generateWhatsAppMessage(order, settings);
    openWhatsAppLink(order.whatsapp, message);
  };

  // Status timeline definitions
  const timelineSteps = [
    { key: 'new', label: 'Baru', icon: Clock },
    { key: 'processing', label: 'Diproses', icon: PackageCheck },
    { key: 'ready', label: 'Siap Kirim', icon: Truck },
    { key: 'completed', label: 'Selesai', icon: CheckCircle },
  ];

  const currentStepIdx = timelineSteps.findIndex((s) => s.key === order.orderStatus);
  const isCancelled = order.orderStatus === 'cancelled';

  const footer = (
    <div className="flex flex-wrap items-center justify-between w-full gap-2">
      {/* Destructive / Left action */}
      <Button
        variant="ghost"
        size="sm"
        icon={Trash2}
        className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
        onClick={() => {
          onClose();
          onDeleteOrder(order);
        }}
      >
        Hapus
      </Button>

      {/* Primary actions */}
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          icon={Printer}
          onClick={() => {
            onClose();
            onOpenReceipt(order);
          }}
        >
          Cetak Nota
        </Button>

        <Button
          variant="outline"
          size="sm"
          icon={MessageCircle}
          className="text-emerald-700 border-emerald-300 hover:bg-emerald-50"
          onClick={handleSendWhatsApp}
        >
          WhatsApp
        </Button>

        {order.remaining > 0 && (
          <Button
            variant="success"
            size="sm"
            icon={CreditCard}
            onClick={() => {
              onClose();
              onOpenQuickPay(order);
            }}
          >
            Bayar / Lunas
          </Button>
        )}

        <Button
          variant="secondary"
          size="sm"
          icon={Edit2}
          onClick={() => {
            onClose();
            onEditOrder(order);
          }}
        >
          Edit
        </Button>
      </div>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Detail Pesanan #${order.id}`}
      description={`Dibuat pada ${formatDateTime(order.timestamp || order.orderDate)}`}
      maxWidth="max-w-2xl"
      footer={footer}
    >
      <div className="space-y-6">
        {/* Top Badges & Quick Status Selector */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-stone-50 border border-stone-200/80 p-3.5 rounded-xl">
          <div className="flex items-center gap-2.5">
            <span className="text-xs text-slate-500 font-medium">Status:</span>
            <OrderStatusBadge status={order.orderStatus} />
            <span className="text-xs text-slate-300">|</span>
            <PaymentStatusBadge status={order.paymentStatus} />
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-500 font-medium hidden sm:inline">
              Ubah Status:
            </span>
            <select
              value={order.orderStatus}
              disabled={updatingStatus}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="text-xs bg-white border border-stone-300 rounded-lg px-2.5 py-1 font-medium text-slate-800 outline-none cursor-pointer focus:border-slate-800"
            >
              {APP_CONFIG.orderStatuses.map((st) => (
                <option key={st.key} value={st.key}>
                  {st.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Status Timeline */}
        {!isCancelled ? (
          <div>
            <div className="text-xs font-semibold text-slate-700 mb-2.5">
              Alur Progres Pesanan
            </div>
            <div className="grid grid-cols-4 gap-2 text-center">
              {timelineSteps.map((step, idx) => {
                const isPassed = currentStepIdx >= idx;
                const isCurrent = currentStepIdx === idx;
                const StepIcon = step.icon;

                return (
                  <button
                    key={step.key}
                    type="button"
                    onClick={() => handleStatusChange(step.key)}
                    disabled={updatingStatus}
                    className={`flex flex-col items-center p-2 rounded-lg border text-xs transition-all cursor-pointer ${
                      isCurrent
                        ? 'bg-slate-900 border-slate-900 text-white font-semibold shadow-xs'
                        : isPassed
                        ? 'bg-stone-100 border-stone-200 text-slate-800'
                        : 'bg-white border-stone-200 text-slate-400 hover:border-stone-300'
                    }`}
                  >
                    <StepIcon
                      className={`w-4 h-4 mb-1 ${
                        isCurrent
                          ? 'text-white'
                          : isPassed
                          ? 'text-slate-700'
                          : 'text-slate-300'
                      }`}
                    />
                    <span className="text-[11px] truncate w-full">{step.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-2 text-xs text-rose-800 font-medium">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>Pesanan ini berstatus DIBATALKAN.</span>
            <button
              type="button"
              onClick={() => handleStatusChange('new')}
              className="ml-auto underline text-rose-700 hover:text-rose-900"
            >
              Pulihkan ke Baru
            </button>
          </div>
        )}

        {/* Customer & Schedule Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Customer Card */}
          <div className="bg-stone-50/70 border border-stone-200/80 rounded-xl p-3.5 space-y-2">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span>Data Pelanggan</span>
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900">
                {order.customerName}
              </div>
              <div className="flex items-center gap-2 mt-1">
                {order.whatsapp ? (
                  <button
                    type="button"
                    onClick={handleSendWhatsApp}
                    className="inline-flex items-center gap-1 text-xs text-emerald-700 hover:text-emerald-900 font-medium bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60"
                  >
                    <Phone className="w-3 h-3" />
                    <span>{order.whatsapp}</span>
                    <ExternalLink className="w-2.5 h-2.5 ml-0.5 opacity-70" />
                  </button>
                ) : (
                  <span className="text-xs text-slate-400">Tanpa Nomor WhatsApp</span>
                )}
              </div>
            </div>
          </div>

          {/* Schedule Card */}
          <div className="bg-stone-50/70 border border-stone-200/80 rounded-xl p-3.5 space-y-2">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>Jadwal Pemesanan</span>
            </div>
            <div className="text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Tanggal PO:</span>
                <span className="font-semibold text-slate-800">
                  {formatDate(order.orderDate, false)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Jadwal Kirim/Pickup:</span>
                <span className="font-bold text-slate-900">
                  {formatDate(order.deliveryDate, false)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Product Items Table */}
        <div>
          <div className="text-xs font-semibold text-slate-700 mb-2 flex items-center justify-between">
            <span>Rincian Produk Dipesan ({order.totalQty || 0} Item)</span>
          </div>
          <div className="border border-stone-200 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 border-b border-stone-200 text-slate-600 font-semibold">
                <tr>
                  <th className="py-2.5 px-3.5">Produk</th>
                  <th className="py-2.5 px-2 text-center w-16">Qty</th>
                  <th className="py-2.5 px-3 text-right">Harga</th>
                  <th className="py-2.5 px-3.5 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {(order.items || []).map((item, idx) => (
                  <tr key={idx} className="hover:bg-stone-50/60">
                    <td className="py-2.5 px-3.5 font-medium text-slate-900">
                      {item.name}
                      <span className="text-[11px] text-slate-400 block font-normal">
                        Satuan: {item.unit || 'pcs'}
                      </span>
                    </td>
                    <td className="py-2.5 px-2 text-center font-mono tabular-nums font-semibold text-slate-800">
                      {item.qty}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-600">
                      {formatCurrency(item.price)}
                    </td>
                    <td className="py-2.5 px-3.5 text-right font-mono tabular-nums font-semibold text-slate-900">
                      {formatCurrency(item.subtotal || item.qty * item.price)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Payment Breakdown */}
        <div className="bg-stone-50/80 border border-stone-200 rounded-xl p-4 space-y-2 text-xs">
          <div className="flex justify-between text-slate-600">
            <span>Subtotal Pesanan:</span>
            <span className="font-mono tabular-nums">
              {formatCurrency(order.subtotal || order.total)}
            </span>
          </div>
          <div className="flex justify-between font-bold text-slate-900 text-sm pt-1 border-t border-stone-200">
            <span>Total Tagihan:</span>
            <span className="font-mono tabular-nums">{formatCurrency(order.total)}</span>
          </div>
          <div className="flex justify-between text-slate-600 pt-1">
            <span>Metode Pembayaran:</span>
            <span className="font-medium text-slate-800">
              {order.paymentMethod || 'Cash / Tunai'}
            </span>
          </div>
          <div className="flex justify-between text-emerald-800">
            <span>Sudah Dibayar (DP/Tunai):</span>
            <span className="font-mono tabular-nums font-bold">
              {formatCurrency(order.amountPaid || 0)}
            </span>
          </div>
          <div className="flex justify-between pt-1 border-t border-stone-200 text-sm">
            <span className="font-bold text-slate-800">Sisa Piutang / Kekurangan:</span>
            <span
              className={`font-mono tabular-nums font-bold ${
                order.remaining > 0 ? 'text-rose-700' : 'text-slate-700'
              }`}
            >
              {formatCurrency(order.remaining || 0)}
            </span>
          </div>
        </div>

        {/* Notes */}
        {order.notes && (
          <div className="bg-amber-50/50 border border-amber-200/80 rounded-xl p-3.5 text-xs text-amber-900">
            <span className="font-semibold block mb-0.5">Catatan Pesanan:</span>
            <p className="leading-relaxed whitespace-pre-wrap">{order.notes}</p>
          </div>
        )}
      </div>
    </Modal>
  );
}
