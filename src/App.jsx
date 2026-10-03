// Main Application Root Component
import React, { useState, useEffect, useCallback } from 'react';
import { ToastProvider, useToast } from './components/ui/Toast.jsx';
import { Sidebar } from './components/layout/Sidebar.jsx';
import { TopHeader } from './components/layout/TopHeader.jsx';
import { MobileNav } from './components/layout/MobileNav.jsx';
import { GlobalSearchModal } from './components/layout/GlobalSearchModal.jsx';
import { NotificationCenterModal } from './components/layout/NotificationCenterModal.jsx';

// Pages
import { Dashboard } from './pages/Dashboard.jsx';
import { Orders } from './pages/Orders.jsx';
import { CreateOrder } from './pages/CreateOrder.jsx';
import { Products } from './pages/Products.jsx';
import { Finance } from './pages/Finance.jsx';
import { Reports } from './pages/Reports.jsx';
import { Settings } from './pages/Settings.jsx';

// Modals
import { OrderDetailModal } from './components/orders/OrderDetailModal.jsx';
import { QuickPayModal } from './components/orders/QuickPayModal.jsx';
import { OrderReceiptModal } from './components/orders/OrderReceiptModal.jsx';
import { ConfirmDialog } from './components/ui/ConfirmDialog.jsx';

// Custom Hooks
import { useOrders } from './hooks/useOrders.js';
import { useProducts } from './hooks/useProducts.js';
import { useExpenses } from './hooks/useExpenses.js';
import { useSettings } from './hooks/useSettings.js';
import { executeAppsScript, fetchSheetsData } from './services/googleSheets.js';

function AppContent() {
  const { toastSuccess, toastError, toastInfo } = useToast();

  // Core Data Hooks
  const {
    orders,
    createOrder,
    updateOrder,
    updateOrderStatus,
    recordPayment,
    deleteOrder,
    resetToSample: resetOrdersSample,
    setOrders,
  } = useOrders();

  const {
    products,
    productAnalytics,
    addProduct,
    updateProduct,
    duplicateProduct,
    toggleStatus,
    deleteProduct,
    resetToSample: resetProductsSample,
    setProducts,
  } = useProducts(orders);

  const {
    expenses,
    addExpense,
    updateExpense,
    deleteExpense,
    resetToSample: resetExpensesSample,
    setExpenses,
  } = useExpenses();

  const {
    settings,
    updateSettings,
    connectionStatus,
    testingConnection,
    testConnection,
    offlineQueueCount,
    triggerSync,
    clearQueue,
  } = useSettings();

  // Navigation & View State
  const [activePage, setActivePage] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [ordersInitialFilter, setOrdersInitialFilter] = useState('all');
  const [editingOrder, setEditingOrder] = useState(null);

  // Modals
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [notifModalOpen, setNotifModalOpen] = useState(false);
  const [selectedOrderDetail, setSelectedOrderDetail] = useState(null);
  const [quickPayOrder, setQuickPayOrder] = useState(null);
  const [receiptOrder, setReceiptOrder] = useState(null);
  const [confirmDeleteOrder, setConfirmDeleteOrder] = useState(null);
  const [pullingData, setPullingData] = useState(false);

  // Pull latest data from Google Sheets into local state
  const handlePullDataFromSheets = async (customUrl = null, showNotification = true) => {
    const url = customUrl || settings.googleAppsScriptUrl;
    if (!url || !url.startsWith('https://script.google.com')) {
      if (showNotification) {
        toastError('URL Google Apps Script belum dikonfigurasi di Pengaturan.');
      }
      return { success: false, error: 'URL belum dikonfigurasi' };
    }

    setPullingData(true);
    if (showNotification) {
      toastInfo('Menghubungi Google Sheets untuk menarik data terbaru...');
    }

    try {
      const res = await fetchSheetsData(url);
      setPullingData(false);

      if (res?.success && res.data) {
        let orderCount = 0;
        let productCount = 0;
        let expenseCount = 0;

        if (Array.isArray(res.data.orders) && res.data.orders.length > 0) {
          setOrders(res.data.orders);
          orderCount = res.data.orders.length;
        }
        if (Array.isArray(res.data.products) && res.data.products.length > 0) {
          setProducts(res.data.products);
          productCount = res.data.products.length;
        }
        if (Array.isArray(res.data.expenses) && res.data.expenses.length > 0) {
          setExpenses(res.data.expenses);
          expenseCount = res.data.expenses.length;
        }

        if (showNotification) {
          toastSuccess(`Berhasil memuat data dari Google Sheets! (${orderCount} pesanan, ${productCount} produk, ${expenseCount} pengeluaran).`);
        }
        return { success: true, count: { orderCount, productCount, expenseCount } };
      } else {
        if (showNotification) {
          toastError(res?.error || 'Gagal menarik data dari Google Sheets. Pastikan skrip sudah dideploy.');
        }
        return { success: false, error: res?.error };
      }
    } catch (err) {
      setPullingData(false);
      if (showNotification) {
        toastError('Terjadi kesalahan koneksi saat menarik data.');
      }
      return { success: false, error: err.message };
    }
  };

  // Auto-connect from URL param ?scriptUrl=... and auto-pull data on initial load
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const scriptUrlParam = params.get('scriptUrl');
      if (scriptUrlParam && scriptUrlParam.startsWith('https://script.google.com')) {
        updateSettings({ googleAppsScriptUrl: scriptUrlParam });
        // Clean URL without page reload
        const cleanPath = window.location.pathname;
        window.history.replaceState({}, document.title, cleanPath);
        // Automatically pull data
        handlePullDataFromSheets(scriptUrlParam, true);
        return;
      }

      // If already configured, pull latest data on startup
      if (settings?.googleAppsScriptUrl && settings.googleAppsScriptUrl.startsWith('https://script.google.com')) {
        handlePullDataFromSheets(settings.googleAppsScriptUrl, false);
      }
    } catch (e) {
      console.warn('Initial pull error:', e);
    }
  }, []);

  // Global Keyboard Shortcuts (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchModalOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handlers for Navigation
  const navigateTo = (page, filter = 'all') => {
    setOrdersInitialFilter(filter);
    if (page !== 'create-order') {
      setEditingOrder(null);
    }
    setActivePage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenCreateOrder = () => {
    setEditingOrder(null);
    setActivePage('create-order');
  };

  const handleEditOrder = (order) => {
    setEditingOrder(order);
    setActivePage('create-order');
  };

  const handleSaveOrder = async (orderPayload, existingId = null) => {
    if (existingId) {
      const res = await updateOrder(existingId, orderPayload);
      if (res?.success) {
        toastSuccess(`Pesanan #${existingId} berhasil diperbarui.`);
        setActivePage('orders');
        return res;
      }
      toastError(res?.error || 'Gagal memperbarui pesanan.');
      return res;
    } else {
      const res = await createOrder(orderPayload);
      if (res?.success) {
        toastSuccess(`Pesanan #${res.order.id} berhasil dibuat.`);
        setActivePage('orders');
        return res;
      }
      toastError(res?.error || 'Gagal membuat pesanan.');
      return res;
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    const res = await updateOrderStatus(orderId, newStatus);
    if (res?.success) {
      toastSuccess(`Status pesanan diperbarui ke "${newStatus}".`);
      if (selectedOrderDetail && selectedOrderDetail.id === orderId) {
        setSelectedOrderDetail((prev) => ({ ...prev, orderStatus: newStatus }));
      }
    }
  };

  const handleConfirmQuickPay = async (orderId, amount, method) => {
    const res = await recordPayment(orderId, amount, method);
    if (res?.success) {
      toastSuccess('Pembayaran berhasil direkam!');
      if (selectedOrderDetail && selectedOrderDetail.id === orderId) {
        setSelectedOrderDetail(res.order);
      }
    } else {
      toastError('Gagal merekam pembayaran.');
    }
  };

  const handleDeleteOrder = async () => {
    if (!confirmDeleteOrder) return;
    const res = await deleteOrder(confirmDeleteOrder.id);
    if (res?.success) {
      toastSuccess(`Pesanan #${confirmDeleteOrder.id} berhasil dihapus.`);
    } else {
      toastError('Gagal menghapus pesanan.');
    }
    setConfirmDeleteOrder(null);
  };

  // Sample data resets
  const handleResetToSample = () => {
    resetOrdersSample();
    resetProductsSample();
    resetExpensesSample();
  };

  const handleClearAllData = () => {
    setOrders([]);
    setProducts([]);
    setExpenses([]);
    localStorage.removeItem(APP_CONFIG.storageKeys.ORDERS);
    localStorage.removeItem(APP_CONFIG.storageKeys.PRODUCTS);
    localStorage.removeItem(APP_CONFIG.storageKeys.EXPENSES);
  };

  // Sync entire current database (orders, products, expenses) to Google Sheets
  const handleSyncAllData = async (customUrl = null) => {
    const targetUrl = customUrl || settings.googleAppsScriptUrl;
    if (!targetUrl || !targetUrl.trim()) {
      return {
        success: false,
        error: 'URL Google Apps Script belum disetel.',
      };
    }

    try {
      // Send every order, product, and expense item directly
      // This is supported across all versions of Code.gs
      for (const ord of orders) {
        await executeAppsScript('create_order', ord, targetUrl);
      }
      for (const prd of products) {
        await executeAppsScript('save_product', prd, targetUrl);
      }
      for (const exp of expenses) {
        await executeAppsScript('create_expense', exp, targetUrl);
      }

      return {
        success: true,
        message: `Berhasil mengunggah ${orders.length} pesanan, ${products.length} produk, dan ${expenses.length} pengeluaran ke Google Sheets!`,
      };
    } catch (err) {
      return {
        success: false,
        error: err.message || 'Gagal mengirim data.',
      };
    }
  };

  // Page title mapping
  const pageTitles = {
    dashboard: { title: 'Dashboard Bisnis', subtitle: 'Ikhtisar performa penjualan, omzet, dan pesanan' },
    orders: { title: 'Daftar Pesanan', subtitle: 'Kelola pemesanan, pelunasan DP, dan status pengiriman' },
    'create-order': {
      title: editingOrder ? `Edit Pesanan #${editingOrder.id}` : 'Buat Pesanan Baru',
      subtitle: 'Input data pelanggan, pilihan produk, dan pembayaran',
    },
    products: { title: 'Katalog Produk', subtitle: 'Daftar menu, harga jual, dan performa produk' },
    finance: { title: 'Arus Kas & Pengeluaran', subtitle: 'Catat biaya operasional dan pantau laba riil' },
    reports: { title: 'Laporan Keuangan', subtitle: 'Analisis laba rugi, ekspor CSV, dan cetak ikhtisar' },
    settings: { title: 'Pengaturan & Integrasi', subtitle: 'Profil usaha, nomor rekening, dan Google Sheets' },
  };

  const currentTitle = pageTitles[activePage] || { title: 'PO Universal', subtitle: '' };

  // Calculate unread notifications count
  const unpaidCount = orders.filter((o) => o.paymentStatus !== 'paid' && o.orderStatus !== 'cancelled').length;
  const readyCount = orders.filter((o) => o.orderStatus === 'ready').length;
  const totalNotifs = unpaidCount + readyCount + offlineQueueCount;

  return (
    <div className="relative min-h-screen bg-slate-50/70 text-slate-800 antialiased overflow-x-hidden">
      {/* Ambient Glassmorphism Mesh Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-indigo-200/45 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/4 -right-36 w-[32rem] h-[32rem] bg-emerald-200/40 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 left-1/3 w-[34rem] h-[34rem] bg-cyan-200/40 rounded-full blur-3xl" />
        <div className="absolute top-2/3 right-1/4 w-80 h-80 bg-violet-200/35 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 flex min-h-screen">
        {/* Desktop Sidebar Navigation */}
        <Sidebar
          activePage={activePage}
          onNavigate={navigateTo}
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed((prev) => !prev)}
          settings={settings}
          ordersCount={orders.length}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top Header */}
          <TopHeader
            title={currentTitle.title}
            subtitle={currentTitle.subtitle}
            onOpenSearch={() => setSearchModalOpen(true)}
            onOpenNotifications={() => setNotifModalOpen(true)}
            notificationCount={totalNotifs}
            offlineQueueCount={offlineQueueCount}
            onQuickSync={triggerSync}
            onNavigateCreateOrder={handleOpenCreateOrder}
            connectionStatus={connectionStatus}
            onPullData={() => handlePullDataFromSheets(null, true)}
            pullingData={pullingData}
            hasSheetsUrl={Boolean(settings?.googleAppsScriptUrl)}
          />

          {/* Viewport Page Content */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {activePage === 'dashboard' && (
            <Dashboard
              orders={orders}
              expenses={expenses}
              products={products}
              productAnalytics={productAnalytics}
              onNavigate={navigateTo}
              onOpenCreateOrder={handleOpenCreateOrder}
              onOpenAddProduct={() => setActivePage('products')}
              onOpenAddExpense={() => setActivePage('finance')}
              onSelectOrder={(order) => setSelectedOrderDetail(order)}
            />
          )}

          {activePage === 'orders' && (
            <Orders
              orders={orders}
              settings={settings}
              initialFilter={ordersInitialFilter}
              onOpenCreateOrder={handleOpenCreateOrder}
              onSelectOrder={(order) => setSelectedOrderDetail(order)}
              onEditOrder={handleEditOrder}
              onOpenQuickPay={(order) => setQuickPayOrder(order)}
              onOpenReceipt={(order) => setReceiptOrder(order)}
              onDeleteOrder={(order) => setConfirmDeleteOrder(order)}
            />
          )}

          {activePage === 'create-order' && (
            <CreateOrder
              products={products}
              editingOrder={editingOrder}
              onSaveOrder={handleSaveOrder}
              onCancel={() => setActivePage('orders')}
            />
          )}

          {activePage === 'products' && (
            <Products
              products={products}
              productAnalytics={productAnalytics}
              onAddProduct={addProduct}
              onUpdateProduct={updateProduct}
              onDuplicateProduct={duplicateProduct}
              onToggleStatus={toggleStatus}
              onDeleteProduct={deleteProduct}
            />
          )}

          {activePage === 'finance' && (
            <Finance
              orders={orders}
              expenses={expenses}
              onAddExpense={addExpense}
              onUpdateExpense={updateExpense}
              onDeleteExpense={deleteExpense}
            />
          )}

          {activePage === 'reports' && (
            <Reports
              orders={orders}
              expenses={expenses}
              settings={settings}
            />
          )}

          {activePage === 'settings' && (
            <Settings
              settings={settings}
              onUpdateSettings={updateSettings}
              connectionStatus={connectionStatus}
              testingConnection={testingConnection}
              onTestConnection={testConnection}
              offlineQueueCount={offlineQueueCount}
              onTriggerSync={triggerSync}
              onClearQueue={clearQueue}
              onResetToSampleData={handleResetToSample}
              onClearAllData={handleClearAllData}
              onSyncAllData={handleSyncAllData}
              onPullData={handlePullDataFromSheets}
              pullingData={pullingData}
            />
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation & Floating Quick Order */}
      <MobileNav
        activePage={activePage}
        onNavigate={navigateTo}
        onNavigateCreateOrder={handleOpenCreateOrder}
        ordersCount={orders.length}
      />

      {/* Global Search Modal (Cmd+K) */}
      <GlobalSearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
        orders={orders}
        products={products}
        onSelectOrder={(order) => setSelectedOrderDetail(order)}
        onSelectProduct={() => setActivePage('products')}
      />

      {/* Notification Center Modal */}
      <NotificationCenterModal
        isOpen={notifModalOpen}
        onClose={() => setNotifModalOpen(false)}
        orders={orders}
        offlineQueueCount={offlineQueueCount}
        onSyncOffline={triggerSync}
        onClearOffline={clearQueue}
        onSelectOrder={(order) => setSelectedOrderDetail(order)}
      />

      {/* Order Detail Modal */}
      <OrderDetailModal
        isOpen={Boolean(selectedOrderDetail)}
        onClose={() => setSelectedOrderDetail(null)}
        order={selectedOrderDetail}
        settings={settings}
        onUpdateStatus={handleUpdateOrderStatus}
        onOpenQuickPay={(order) => setQuickPayOrder(order)}
        onOpenReceipt={(order) => setReceiptOrder(order)}
        onEditOrder={handleEditOrder}
        onDeleteOrder={(order) => setConfirmDeleteOrder(order)}
      />

      {/* Quick Pay Modal */}
      <QuickPayModal
        isOpen={Boolean(quickPayOrder)}
        onClose={() => setQuickPayOrder(null)}
        order={quickPayOrder}
        onConfirmPayment={handleConfirmQuickPay}
      />

      {/* Order Receipt / Invoice Modal */}
      <OrderReceiptModal
        isOpen={Boolean(receiptOrder)}
        onClose={() => setReceiptOrder(null)}
        order={receiptOrder}
        settings={settings}
      />

      {/* Confirm Delete Order Modal */}
      <ConfirmDialog
        isOpen={Boolean(confirmDeleteOrder)}
        onClose={() => setConfirmDeleteOrder(null)}
        onConfirm={handleDeleteOrder}
        title="Hapus Pesanan"
        message={`Apakah Anda yakin ingin menghapus pesanan #${confirmDeleteOrder?.id} (${confirmDeleteOrder?.customerName})? Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Hapus Pesanan"
        variant="danger"
      />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}
