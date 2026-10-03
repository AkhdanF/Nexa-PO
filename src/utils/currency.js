// Centralized Currency & Financial Calculation Utilities

/**
 * Format a number to Indonesian Rupiah (e.g. Rp 25.000)
 * @param {number|string} amount
 * @param {boolean} showPrefix - whether to show "Rp "
 * @returns {string}
 */
export function formatCurrency(amount, showPrefix = true) {
  const numeric = typeof amount === 'number' ? amount : parseFloat(amount) || 0;
  const formatted = Math.round(numeric)
    .toLocaleString('id-ID');
  return showPrefix ? `Rp ${formatted}` : formatted;
}

/**
 * Parse an input string or number to clean integer
 * @param {string|number} value
 * @returns {number}
 */
export function parseNumber(value) {
  if (typeof value === 'number') return isNaN(value) ? 0 : Math.max(0, value);
  if (!value) return 0;
  const cleaned = String(value).replace(/[^0-9]/g, '');
  return cleaned ? parseInt(cleaned, 10) : 0;
}

/**
 * Calculate single item subtotal
 * @param {number} qty
 * @param {number} price
 * @returns {number}
 */
export function calculateItemSubtotal(qty, price) {
  const q = Math.max(0, parseInt(qty, 10) || 0);
  const p = Math.max(0, parseFloat(price) || 0);
  return q * p;
}

/**
 * Centralized calculation for an Order
 * @param {Array} items - array of { price, qty, ... }
 * @param {number} amountPaid - amount already paid
 * @returns {Object} totals breakdown
 */
export function calculateOrderTotals(items = [], amountPaid = 0) {
  const totalQty = items.reduce((sum, item) => sum + (parseInt(item.qty, 10) || 0), 0);
  const subtotal = items.reduce((sum, item) => {
    const itemSubtotal = item.subtotal !== undefined
      ? (parseFloat(item.subtotal) || 0)
      : calculateItemSubtotal(item.qty, item.price);
    return sum + itemSubtotal;
  }, 0);

  const total = subtotal; // extensible for discounts/taxes/shipping if needed
  const validAmountPaid = Math.min(Math.max(0, parseFloat(amountPaid) || 0), total);
  const remaining = Math.max(0, total - validAmountPaid);

  let paymentStatus = 'unpaid';
  if (validAmountPaid >= total && total > 0) {
    paymentStatus = 'paid';
  } else if (validAmountPaid > 0) {
    paymentStatus = 'dp';
  }

  return {
    totalQty,
    subtotal,
    total,
    amountPaid: validAmountPaid,
    remaining,
    paymentStatus,
  };
}

/**
 * Centralized Financial & Cashflow Calculations
 * Rule 13 & 14:
 * Revenue = all confirmed/active orders (omzet)
 * Cash Received = money actually collected (amountPaid across orders)
 * Receivables = remaining unpaid amount (piutang)
 * Expenses = sum of all logged expenses
 * Net Cashflow = Cash Received - Expenses
 * Estimated Profit = Revenue - Expenses (clearly labelled as estimated)
 *
 * @param {Array} orders
 * @param {Array} expenses
 * @returns {Object} Financial metrics
 */
export function calculateFinancials(orders = [], expenses = []) {
  // Exclude cancelled orders from revenue & cashflow
  const activeOrders = orders.filter((o) => o.orderStatus !== 'cancelled');

  const revenue = activeOrders.reduce((sum, o) => sum + (parseFloat(o.total) || 0), 0);
  const cashReceived = activeOrders.reduce((sum, o) => sum + (parseFloat(o.amountPaid) || 0), 0);
  const receivables = activeOrders.reduce((sum, o) => sum + (parseFloat(o.remaining) || 0), 0);

  const totalExpenses = expenses.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);

  const netCashflow = cashReceived - totalExpenses;
  const estimatedProfit = revenue - totalExpenses;
  const orderCount = activeOrders.length;
  const averageOrderValue = orderCount > 0 ? revenue / orderCount : 0;

  // Breakdown by payment status
  const unpaidCount = activeOrders.filter((o) => o.paymentStatus === 'unpaid').length;
  const dpCount = activeOrders.filter((o) => o.paymentStatus === 'dp').length;
  const paidCount = activeOrders.filter((o) => o.paymentStatus === 'paid').length;

  return {
    revenue,
    cashReceived,
    receivables,
    expenses: totalExpenses,
    netCashflow,
    estimatedProfit,
    orderCount,
    averageOrderValue,
    paymentBreakdown: {
      unpaidCount,
      dpCount,
      paidCount,
    },
  };
}
