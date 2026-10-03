// WhatsApp Message Generator & Deep Link Utility
import { formatCurrency } from './currency.js';
import { formatDate } from './date.js';

/**
 * Generate formatted WhatsApp invoice message
 * @param {Object} order
 * @param {Object} settings - business settings
 * @returns {string}
 */
export function generateWhatsAppMessage(order, settings = {}) {
  const businessName = settings.businessName || 'Dapur Berkah';
  const orderId = order.id || 'PO-000';
  const customerName = order.customerName || 'Pelanggan';
  const orderDate = formatDate(order.orderDate, false);
  const deliveryDate = formatDate(order.deliveryDate, false);

  const items = order.items || [];
  const itemsText = items
    .filter((item) => (parseInt(item.qty, 10) || 0) > 0)
    .map(
      (item, idx) =>
        `${idx + 1}. *${item.name}* (${item.qty} ${item.unit || 'pcs'} x ${formatCurrency(item.price)}) = ${formatCurrency(item.subtotal || item.qty * item.price)}`
    )
    .join('\n');

  let paymentStatusLabel = 'Belum Lunas';
  if (order.paymentStatus === 'paid') paymentStatusLabel = 'Lunas';
  if (order.paymentStatus === 'dp') paymentStatusLabel = 'DP (Uang Muka Diterima)';

  let paymentDetail = '';
  if (order.paymentStatus === 'dp') {
    paymentDetail = `\n• *DP / Sudah Dibayar:* ${formatCurrency(order.amountPaid)}\n• *Sisa Tagihan:* ${formatCurrency(order.remaining)}`;
  } else if (order.paymentStatus === 'unpaid') {
    paymentDetail = `\n• *Sisa Tagihan:* ${formatCurrency(order.total)}`;
  } else {
    paymentDetail = `\n• *Status:* LUNAS (Terima Kasih!)`;
  }

  let bankInfo = '';
  if (settings.bankName && settings.accountNumber && order.remaining > 0) {
    bankInfo = `\n\n💳 *Rekening Pembayaran:*\nBank: ${settings.bankName}\nNo. Rek: *${settings.accountNumber}*\nA.n: ${settings.accountName || settings.businessName}`;
  }

  const notesText = order.notes ? `\n\n📝 *Catatan:* ${order.notes}` : '';

  return `Halo Kak *${customerName}*, terima kasih telah melakukan pemesanan di *${businessName}*! 🙏

Berikut adalah rincian pesanan Anda:
━━━━━━━━━━━━━━━━━━━
🧾 *No. Pesanan:* #${orderId}
📅 *Tanggal PO:* ${orderDate}
🚚 *Jadwal Kirim/Ambil:* ${deliveryDate}

📦 *Rincian Produk:*
${itemsText}
━━━━━━━━━━━━━━━━━━━
💰 *Total Pesanan:* *${formatCurrency(order.total)}*
📊 *Status Bayar:* ${paymentStatusLabel}${paymentDetail}${bankInfo}${notesText}

Mohon konfirmasi jika pesanan sudah sesuai ya Kak. Terima kasih banyak atas kepercayaannya! ❤️`;
}

/**
 * Open WhatsApp via deep link
 * @param {string} phone - customer phone
 * @param {string} message - pre-filled text
 */
export function openWhatsAppLink(phone, message) {
  let cleaned = String(phone || '').replace(/[^0-9]/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.substring(1);
  } else if (cleaned.startsWith('8')) {
    cleaned = '62' + cleaned;
  }

  const encodedMessage = encodeURIComponent(message);
  const url = cleaned
    ? `https://wa.me/${cleaned}?text=${encodedMessage}`
    : `https://api.whatsapp.com/send?text=${encodedMessage}`;

  window.open(url, '_blank', 'noopener,noreferrer');
}
