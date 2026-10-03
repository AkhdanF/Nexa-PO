// Validation Utilities

/**
 * Format & sanitize phone number to Indonesian WhatsApp standard (628...)
 * @param {string} phone
 * @returns {string}
 */
export function sanitizeWhatsApp(phone) {
  if (!phone) return '';
  let cleaned = String(phone).replace(/[^0-9]/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.substring(1);
  } else if (cleaned.startsWith('8')) {
    cleaned = '62' + cleaned;
  }
  return cleaned;
}

/**
 * Validate an order form data
 * @param {Object} orderData
 * @returns {{ isValid: boolean, errors: Object }}
 */
export function validateOrder(orderData) {
  const errors = {};

  if (!orderData.customerName || !orderData.customerName.trim()) {
    errors.customerName = 'Nama pelanggan wajib diisi';
  } else if (orderData.customerName.trim().length < 2) {
    errors.customerName = 'Nama pelanggan minimal 2 karakter';
  }

  if (!orderData.orderDate) {
    errors.orderDate = 'Tanggal PO wajib dipilih';
  }

  if (!orderData.deliveryDate) {
    errors.deliveryDate = 'Tanggal pengiriman/pickup wajib dipilih';
  } else if (orderData.orderDate && new Date(orderData.deliveryDate) < new Date(orderData.orderDate)) {
    errors.deliveryDate = 'Tanggal pengiriman tidak boleh sebelum tanggal PO';
  }

  const items = orderData.items || [];
  const validItems = items.filter((item) => (parseInt(item.qty, 10) || 0) > 0);

  if (validItems.length === 0) {
    errors.items = 'Pilih minimal satu produk dengan kuantitas > 0';
  }

  const total = orderData.total || 0;
  const amountPaid = parseFloat(orderData.amountPaid) || 0;

  if (amountPaid < 0) {
    errors.amountPaid = 'Nominal pembayaran tidak boleh negatif';
  } else if (amountPaid > total && total > 0) {
    errors.amountPaid = 'Nominal pembayaran tidak boleh melebihi total pesanan';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validate product form data
 * @param {Object} productData
 * @returns {{ isValid: boolean, errors: Object }}
 */
export function validateProduct(productData) {
  const errors = {};

  if (!productData.name || !productData.name.trim()) {
    errors.name = 'Nama produk wajib diisi';
  }

  const price = parseFloat(productData.price);
  if (isNaN(price) || price < 0) {
    errors.price = 'Harga harus berupa angka valid (>= 0)';
  }

  if (!productData.unit || !productData.unit.trim()) {
    errors.unit = 'Satuan produk wajib dipilih';
  }

  if (!productData.category || !productData.category.trim()) {
    errors.category = 'Kategori produk wajib diisi';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validate expense form data
 * @param {Object} expenseData
 * @returns {{ isValid: boolean, errors: Object }}
 */
export function validateExpense(expenseData) {
  const errors = {};

  if (!expenseData.date) {
    errors.date = 'Tanggal pengeluaran wajib diisi';
  }

  if (!expenseData.category || !expenseData.category.trim()) {
    errors.category = 'Kategori pengeluaran wajib dipilih';
  }

  const amount = parseFloat(expenseData.amount);
  if (isNaN(amount) || amount <= 0) {
    errors.amount = 'Nominal harus lebih besar dari 0';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
