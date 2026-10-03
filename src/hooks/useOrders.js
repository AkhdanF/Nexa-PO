// Hook: useOrders
import { useState, useEffect, useCallback } from 'react';
import { APP_CONFIG } from '../config/app.js';
import { SAMPLE_ORDERS } from '../utils/sampleData.js';
import { calculateOrderTotals } from '../utils/currency.js';
import { executeAppsScript } from '../services/googleSheets.js';

export function useOrders() {
  const [orders, setOrders] = useState(() => {
    try {
      const saved = localStorage.getItem(APP_CONFIG.storageKeys.ORDERS);
      if (saved) {
        return JSON.parse(saved);
      }
      localStorage.setItem(APP_CONFIG.storageKeys.ORDERS, JSON.stringify(SAMPLE_ORDERS));
      return SAMPLE_ORDERS;
    } catch (e) {
      console.error('Failed to parse orders from localStorage:', e);
      return SAMPLE_ORDERS;
    }
  });

  const [loading, setLoading] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(APP_CONFIG.storageKeys.ORDERS, JSON.stringify(orders));
    } catch (e) {
      console.error('Failed to save orders to localStorage:', e);
    }
  }, [orders]);

  // Generate unique Order ID e.g. PO-2026-006
  const generateOrderId = useCallback(() => {
    const year = new Date().getFullYear();
    const existingSeq = orders
      .map((o) => {
        const match = String(o.id).match(/PO-\d{4}-(\d+)/);
        return match ? parseInt(match[1], 10) : 0;
      })
      .filter((n) => !isNaN(n));

    const nextSeq = (existingSeq.length > 0 ? Math.max(...existingSeq) : 0) + 1;
    return `PO-${year}-${String(nextSeq).padStart(3, '0')}`;
  }, [orders]);

  // Create new Order
  const createOrder = useCallback(
    async (orderData) => {
      setLoading(true);

      const items = (orderData.items || []).filter((it) => (parseInt(it.qty, 10) || 0) > 0);
      const totals = calculateOrderTotals(items, orderData.amountPaid || 0);

      // Generate items summary for clean display & sheet export
      const itemsSummary = items
        .map((it) => `${it.name} (${it.qty} ${it.unit || 'pcs'})`)
        .join(', ');

      const newOrder = {
        id: generateOrderId(),
        timestamp: new Date().toISOString(),
        orderDate: orderData.orderDate,
        deliveryDate: orderData.deliveryDate,
        customerName: orderData.customerName.trim(),
        whatsapp: orderData.whatsapp ? orderData.whatsapp.trim() : '',
        items,
        itemsSummary,
        totalQty: totals.totalQty,
        subtotal: totals.subtotal,
        total: totals.total,
        amountPaid: totals.amountPaid,
        remaining: totals.remaining,
        paymentStatus: totals.paymentStatus,
        paymentMethod: orderData.paymentMethod || 'Cash / Tunai',
        orderStatus: orderData.orderStatus || 'new',
        notes: orderData.notes ? orderData.notes.trim() : '',
      };

      setOrders((prev) => [newOrder, ...prev]);

      // Execute Google Apps Script sync
      const res = await executeAppsScript('create_order', newOrder);
      setLoading(false);
      return { success: true, order: newOrder, syncResult: res };
    },
    [generateOrderId]
  );

  // Update existing Order
  const updateOrder = useCallback(
    async (orderId, updatedFields) => {
      setLoading(true);

      const existingOrder = orders.find((o) => o.id === orderId);
      if (!existingOrder) {
        setLoading(false);
        return { success: false, error: 'Pesanan tidak ditemukan' };
      }

      const items = updatedFields.items !== undefined ? updatedFields.items : existingOrder.items;
      const validItems = items.filter((it) => (parseInt(it.qty, 10) || 0) > 0);
      const amountPaid =
        updatedFields.amountPaid !== undefined ? updatedFields.amountPaid : existingOrder.amountPaid;

      const totals = calculateOrderTotals(validItems, amountPaid);
      const itemsSummary = validItems
        .map((it) => `${it.name} (${it.qty} ${it.unit || 'pcs'})`)
        .join(', ');

      const updatedOrder = {
        ...existingOrder,
        ...updatedFields,
        items: validItems,
        itemsSummary,
        totalQty: totals.totalQty,
        subtotal: totals.subtotal,
        total: totals.total,
        amountPaid: totals.amountPaid,
        remaining: totals.remaining,
        paymentStatus: updatedFields.paymentStatus || totals.paymentStatus,
        updatedAt: new Date().toISOString(),
      };

      setOrders((prev) =>
        prev.map((order) => (order.id === orderId ? updatedOrder : order))
      );

      const res = await executeAppsScript('update_order', updatedOrder);
      setLoading(false);
      return { success: true, order: updatedOrder, syncResult: res };
    },
    [orders]
  );

  // Update Order Status (new -> processing -> ready -> completed / cancelled)
  const updateOrderStatus = useCallback(
    async (orderId, newStatus) => {
      return await updateOrder(orderId, { orderStatus: newStatus });
    },
    [updateOrder]
  );

  // Quick Pay / Mark as Paid or Partial Payment
  const recordPayment = useCallback(
    async (orderId, addedAmount, newMethod) => {
      const targetOrder = orders.find((o) => o.id === orderId);
      if (!targetOrder) return { success: false, error: 'Order not found' };

      const currentPaid = parseFloat(targetOrder.amountPaid) || 0;
      const additional = parseFloat(addedAmount) || 0;
      const newTotalPaid = Math.min(targetOrder.total, currentPaid + additional);

      const updates = {
        amountPaid: newTotalPaid,
      };
      if (newMethod) {
        updates.paymentMethod = newMethod;
      }

      return await updateOrder(orderId, updates);
    },
    [orders, updateOrder]
  );

  // Delete Order
  const deleteOrder = useCallback(async (orderId) => {
    setLoading(true);
    setOrders((prev) => prev.filter((o) => o.id !== orderId));
    const res = await executeAppsScript('delete_order', { id: orderId });
    setLoading(false);
    return { success: true, syncResult: res };
  }, []);

  // Reset to sample orders
  const resetToSample = useCallback(() => {
    setOrders(SAMPLE_ORDERS);
    localStorage.setItem(APP_CONFIG.storageKeys.ORDERS, JSON.stringify(SAMPLE_ORDERS));
  }, []);

  return {
    orders,
    setOrders,
    loading,
    createOrder,
    updateOrder,
    updateOrderStatus,
    recordPayment,
    deleteOrder,
    resetToSample,
  };
}
