// Hook: useProducts
import { useState, useEffect, useCallback, useMemo } from 'react';
import { APP_CONFIG } from '../config/app.js';
import { SAMPLE_PRODUCTS } from '../utils/sampleData.js';
import { executeAppsScript } from '../services/googleSheets.js';

export function useProducts(orders = []) {
  const [products, setProducts] = useState(() => {
    try {
      const saved = localStorage.getItem(APP_CONFIG.storageKeys.PRODUCTS);
      if (saved) {
        return JSON.parse(saved);
      }
      localStorage.setItem(APP_CONFIG.storageKeys.PRODUCTS, JSON.stringify(SAMPLE_PRODUCTS));
      return SAMPLE_PRODUCTS;
    } catch (e) {
      console.error('Failed to parse products from localStorage:', e);
      return SAMPLE_PRODUCTS;
    }
  });

  const [loading, setLoading] = useState(false);

  // Sync to localStorage whenever products change
  useEffect(() => {
    try {
      localStorage.setItem(APP_CONFIG.storageKeys.PRODUCTS, JSON.stringify(products));
    } catch (e) {
      console.error('Failed to save products to localStorage:', e);
    }
  }, [products]);

  // Product Analytics mapped from orders
  const productAnalytics = useMemo(() => {
    const stats = {};
    // initialize
    products.forEach((p) => {
      stats[p.id] = { unitsSold: 0, revenue: 0, orderCount: 0 };
    });

    orders.forEach((order) => {
      if (order.orderStatus === 'cancelled') return;
      (order.items || []).forEach((item) => {
        const pId = item.productId;
        if (!stats[pId]) {
          stats[pId] = { unitsSold: 0, revenue: 0, orderCount: 0 };
        }
        const qty = parseInt(item.qty, 10) || 0;
        const subtotal = item.subtotal !== undefined
          ? parseFloat(item.subtotal) || 0
          : qty * (parseFloat(item.price) || 0);

        stats[pId].unitsSold += qty;
        stats[pId].revenue += subtotal;
        stats[pId].orderCount += 1;
      });
    });

    return stats;
  }, [products, orders]);

  // Add Product
  const addProduct = useCallback(async (productData) => {
    setLoading(true);
    const newId = 'PRD-' + String(Date.now()).slice(-5);
    const newProduct = {
      ...productData,
      id: newId,
      price: parseFloat(productData.price) || 0,
      status: productData.status || 'active',
      createdAt: new Date().toISOString(),
    };

    setProducts((prev) => [newProduct, ...prev]);

    // Sync to Google Sheets
    const res = await executeAppsScript('save_product', newProduct);
    setLoading(false);
    return { success: true, product: newProduct, syncResult: res };
  }, []);

  // Update Product
  const updateProduct = useCallback(async (productId, updatedFields) => {
    setLoading(true);

    const existingProduct = products.find((p) => p.id === productId);
    if (!existingProduct) {
      setLoading(false);
      return { success: false, error: 'Produk tidak ditemukan' };
    }

    const updatedItem = {
      ...existingProduct,
      ...updatedFields,
      price: parseFloat(updatedFields.price !== undefined ? updatedFields.price : existingProduct.price) || 0,
      updatedAt: new Date().toISOString(),
    };

    setProducts((prev) =>
      prev.map((item) => (item.id === productId ? updatedItem : item))
    );

    const res = await executeAppsScript('save_product', updatedItem);
    setLoading(false);
    return { success: true, product: updatedItem, syncResult: res };
  }, [products]);

  // Duplicate Product
  const duplicateProduct = useCallback(async (product) => {
    const duplicated = {
      name: `${product.name} (Salinan)`,
      description: product.description || '',
      category: product.category,
      price: product.price,
      unit: product.unit,
      status: product.status,
    };
    return await addProduct(duplicated);
  }, [addProduct]);

  // Toggle Status (active/inactive)
  const toggleStatus = useCallback(async (productId) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;
    const newStatus = product.status === 'active' ? 'inactive' : 'active';
    return await updateProduct(productId, { status: newStatus });
  }, [products, updateProduct]);

  // Delete Product
  const deleteProduct = useCallback(async (productId) => {
    setLoading(true);
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    const res = await executeAppsScript('delete_product', { id: productId });
    setLoading(false);
    return { success: true, syncResult: res };
  }, []);

  // Reset to sample products
  const resetToSample = useCallback(() => {
    setProducts(SAMPLE_PRODUCTS);
    localStorage.setItem(APP_CONFIG.storageKeys.PRODUCTS, JSON.stringify(SAMPLE_PRODUCTS));
  }, []);

  return {
    products,
    setProducts,
    loading,
    productAnalytics,
    addProduct,
    updateProduct,
    duplicateProduct,
    toggleStatus,
    deleteProduct,
    resetToSample,
  };
}
