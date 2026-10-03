// Notification Center Modal
import React from 'react';
import {
  Bell,
  AlertTriangle,
  Clock,
  Truck,
  CloudOff,
  RefreshCw,
  Trash2,
  CheckCircle2,
} from 'lucide-react';
import { Modal } from '../ui/Modal.jsx';
import { Button } from '../ui/Button.jsx';
import { formatCurrency } from '../../utils/currency.js';
import { formatDate } from '../../utils/date.js';

export function NotificationCenterModal({
  isOpen,
  onClose,
  orders = [],
  offlineQueueCount = 0,
  onSyncOffline,
  onClearOffline,
  onSelectOrder,
}) {
  if (!isOpen) return null;

  // Unpaid orders
  const unpaidOrders = orders.filter(
    (o) => o.paymentStatus === 'unpaid' && o.orderStatus !== 'cancelled'
  );

  // DP orders
  const dpOrders = orders.filter(
    (o) => o.paymentStatus === 'dp' && o.orderStatus !== 'cancelled'
  );

  // Ready orders
  const readyOrders = orders.filter((o) => o.orderStatus === 'ready');

  const totalNotifs =
    unpaidOrders.length + dpOrders.length + readyOrders.length + offlineQueueCount;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Pusat Pemberitahuan"
      description={`${totalNotifs} pengingat & aktivitas penting membutuhkan perhatian Anda.`}
      maxWidth="max-w-lg"
    >
      <div className="space-y-5 text-xs">
        {/* Offline Queue Notice */}
        {offlineQueueCount > 0 && (
          <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-semibold text-amber-900">
                <CloudOff className="w-4 h-4 text-amber-700" />
                <span>
                  {offlineQueueCount} Perubahan Tersimpan Offline (Pending Sync)
                </span>
              </div>
            </div>
            <p className="text-[11px] text-amber-700 leading-relaxed">
              Perubahan pesanan atau pengeluaran telah tersimpan di browser ini dan menunggu koneksi stabil ke Google Sheets.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <Button
                variant="primary"
                size="sm"
                icon={RefreshCw}
                onClick={onSyncOffline}
              >
                Sinkronkan Sekarang
              </Button>
              <Button
                variant="ghost"
                size="sm"
                icon={Trash2}
                onClick={onClearOffline}
                className="text-slate-600 hover:text-slate-900"
              >
                Bersihkan Antrean
              </Button>
            </div>
          </div>
        )}

        {/* Ready Orders (Siap Kirim / Ambil) */}
        {readyOrders.length > 0 && (
          <div>
            <div className="font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-emerald-600" />
              <span>Pesanan Siap Kirim / Pickup ({readyOrders.length})</span>
            </div>
            <div className="space-y-1.5">
              {readyOrders.map((order) => (
                <div
                  key={order.id}
                  onClick={() => {
                    onClose();
                    onSelectOrder(order);
                  }}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-emerald-50/50 border border-emerald-200/70 hover:bg-emerald-50 cursor-pointer transition-all"
                >
                  <div>
                    <span className="font-bold text-slate-900 font-mono">
                      #{order.id}
                    </span>{' '}
                    · <span className="font-semibold">{order.customerName}</span>
                    <div className="text-slate-500 text-[11px]">
                      Jadwal: {formatDate(order.deliveryDate, false)}
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-700 underline">
                    Lihat Detail
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* DP Orders (Perlu Pelunasan) */}
        {dpOrders.length > 0 && (
          <div>
            <div className="font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-amber-600" />
              <span>Pesanan DP - Menunggu Pelunasan ({dpOrders.length})</span>
            </div>
            <div className="space-y-1.5">
              {dpOrders.map((order) => (
                <div
                  key={order.id}
                  onClick={() => {
                    onClose();
                    onSelectOrder(order);
                  }}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-amber-50/40 border border-amber-200/70 hover:bg-amber-50 cursor-pointer transition-all"
                >
                  <div>
                    <span className="font-bold text-slate-900 font-mono">
                      #{order.id}
                    </span>{' '}
                    · <span className="font-semibold">{order.customerName}</span>
                    <div className="text-slate-500 text-[11px]">
                      Sisa: {formatCurrency(order.remaining)}
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold text-amber-800 underline">
                    Tagih / Bayar
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Unpaid Orders (Belum Lunas Sama Sekali) */}
        {unpaidOrders.length > 0 && (
          <div>
            <div className="font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>Pesanan Belum Bayar ({unpaidOrders.length})</span>
            </div>
            <div className="space-y-1.5">
              {unpaidOrders.map((order) => (
                <div
                  key={order.id}
                  onClick={() => {
                    onClose();
                    onSelectOrder(order);
                  }}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-stone-50 border border-stone-200 hover:bg-stone-100 cursor-pointer transition-all"
                >
                  <div>
                    <span className="font-bold text-slate-900 font-mono">
                      #{order.id}
                    </span>{' '}
                    · <span className="font-semibold">{order.customerName}</span>
                    <div className="text-slate-500 text-[11px]">
                      Total: {formatCurrency(order.total)}
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold text-rose-700 underline">
                    Cek Pesanan
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {totalNotifs === 0 && (
          <div className="text-center py-8 text-slate-400">
            <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500 mb-2" />
            <p className="font-medium text-slate-700">Semua Berjalan Lancar!</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Tidak ada tagihan tertunda atau kendala antrean sinkronisasi.
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
}
