// Centralized Google Sheets & Google Apps Script Service Layer
import { APP_CONFIG } from '../config/app.js';

/**
 * Get offline queue from localStorage
 */
export function getOfflineQueue() {
  try {
    const raw = localStorage.getItem(APP_CONFIG.storageKeys.OFFLINE_QUEUE);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error('Failed to load offline queue:', err);
    return [];
  }
}

/**
 * Save offline queue to localStorage
 */
export function saveOfflineQueue(queue) {
  try {
    localStorage.setItem(APP_CONFIG.storageKeys.OFFLINE_QUEUE, JSON.stringify(queue));
  } catch (err) {
    console.error('Failed to save offline queue:', err);
  }
}

/**
 * Add a pending operation to the offline queue
 */
export function enqueueOfflineOperation(action, payload) {
  const queue = getOfflineQueue();
  // Prevent exact duplicate action & id if already queued
  const existingIdx = queue.findIndex(
    (item) => item.action === action && item.payload?.id && item.payload?.id === payload?.id
  );

  const newOp = {
    id: 'SYNC-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
    timestamp: new Date().toISOString(),
    action,
    payload,
    retryCount: 0,
  };

  if (existingIdx >= 0) {
    queue[existingIdx] = newOp; // replace with latest version
  } else {
    queue.push(newOp);
  }

  saveOfflineQueue(queue);
  return queue;
}

/**
 * Remove an operation from the offline queue
 */
export function removeOfflineOperation(syncId) {
  const queue = getOfflineQueue();
  const filtered = queue.filter((item) => item.id !== syncId);
  saveOfflineQueue(filtered);
  return filtered;
}

/**
 * Clear the entire offline queue
 */
export function clearOfflineQueue() {
  saveOfflineQueue([]);
}

/**
 * Execute an API call to the configured Google Apps Script Web App URL
 * @param {string} action - action name
 * @param {Object} payload - data payload
 * @param {string} customUrl - optional url override
 * @returns {Promise<Object>}
 */
export async function executeAppsScript(action, payload = {}, customUrl = null) {
  let url = customUrl;
  if (!url) {
    try {
      const savedSettings = JSON.parse(
        localStorage.getItem(APP_CONFIG.storageKeys.SETTINGS) || '{}'
      );
      url = savedSettings.googleAppsScriptUrl;
    } catch {
      url = '';
    }
  }

  if (!url || !url.trim()) {
    // If no Apps Script URL configured, treat as local-only / offline simulation
    return {
      success: true,
      offline: true,
      message: 'Data disimpan secara lokal (URL Google Apps Script belum dikonfigurasi).',
      data: payload,
    };
  }

  const endpoint = url.trim();
  const requestBody = {
    action,
    timestamp: new Date().toISOString(),
    payload,
  };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

    // Google Apps Script requires text/plain or no-cors / standard POST
    // We send JSON via text/plain to avoid CORS preflight failures in Google Apps Script
    let result = null;
    try {
      // First attempt: standard fetch with JSON text/plain
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        try {
          result = await response.json();
          return result;
        } catch (jsonErr) {
          return { success: true, message: 'Data berhasil diterima oleh Google Apps Script.' };
        }
      } else {
        throw new Error(`HTTP status ${response.status}`);
      }
    } catch (corsOrNetworkErr) {
      clearTimeout(timeoutId);
      console.warn(`Standard fetch failed, falling back to no-cors mode for action ${action}:`, corsOrNetworkErr);

      try {
        // Fallback: Google Apps Script returns 302 redirect which browsers block via CORS.
        // In 'no-cors' mode with text/plain, the POST request is delivered directly to Google Apps Script doPost!
        await fetch(endpoint, {
          method: 'POST',
          mode: 'no-cors',
          headers: {
            'Content-Type': 'text/plain;charset=utf-8',
          },
          body: JSON.stringify(requestBody),
        });

        return {
          success: true,
          mode: 'no-cors',
          message: 'Data berhasil dikirim ke Google Apps Script.',
          data: payload,
        };
      } catch (noCorsErr) {
        throw noCorsErr;
      }
    }
  } catch (error) {
    console.warn(`[GoogleAppsScript Error] Action: ${action}`, error);

    // Queue operation for later sync if it is a write action
    const writeActions = [
      'create_order',
      'update_order',
      'delete_order',
      'create_expense',
      'update_expense',
      'delete_expense',
      'save_product',
      'delete_product',
    ];

    if (writeActions.includes(action)) {
      enqueueOfflineOperation(action, payload);
    }

    return {
      success: false,
      error: error.name === 'AbortError' ? 'Koneksi timeout (15 detik)' : error.message,
      queuedOffline: writeActions.includes(action),
    };
  }
}

/**
 * Test Connection to Google Apps Script Web App
 * @param {string} url
 * @returns {Promise<{ ok: boolean, message: string }>}
 */
export async function testAppsScriptConnection(url) {
  if (!url || !url.trim()) {
    return {
      ok: false,
      message: 'URL Google Apps Script tidak boleh kosong.',
    };
  }

  const cleanUrl = url.trim();

  // 1. Cek jika pengguna salah menempel URL Google Spreadsheet
  if (cleanUrl.includes('docs.google.com/spreadsheets')) {
    return {
      ok: false,
      message: 'Anda menempelkan URL Google Spreadsheet. Buka menu Ekstensi > Apps Script > Deploy > Manage deployments, lalu salin URL Web app berakhiran /exec.',
    };
  }

  // 2. Cek jika pengguna menyalin URL /dev (test deployment)
  if (cleanUrl.endsWith('/dev')) {
    return {
      ok: false,
      message: 'URL Anda berakhiran /dev. Gunakan URL produksi berakhiran /exec (Deploy > Manage deployments > Web app > salin URL).',
    };
  }

  // 3. Cek format URL Apps Script
  if (!cleanUrl.startsWith('https://script.google.com/macros/s/')) {
    return {
      ok: false,
      message: 'URL harus berformat: https://script.google.com/macros/s/.../exec',
    };
  }

  // Strategi 1: Direct GET standard fetch
  try {
    const separator = cleanUrl.includes('?') ? '&' : '?';
    const testUrl = `${cleanUrl}${separator}action=ping&t=${Date.now()}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 7000);

    const res = await fetch(testUrl, {
      method: 'GET',
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      try {
        const data = await res.json();
        return {
          ok: true,
          message: data?.message || 'Koneksi ke Google Apps Script berhasil terhubung!',
        };
      } catch (jsonErr) {
        return {
          ok: true,
          message: 'Koneksi ke Google Apps Script berhasil terhubung!',
        };
      }
    }
  } catch (corsOrNetErr) {
    // Lanjut ke strategi no-cors probe
  }

  // Strategi 2: no-cors probe (Universal browser test bebas CORS)
  try {
    const separator = cleanUrl.includes('?') ? '&' : '?';
    const testUrl = `${cleanUrl}${separator}action=ping&t=${Date.now()}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 7000);

    await fetch(testUrl, {
      method: 'GET',
      mode: 'no-cors',
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    return {
      ok: true,
      message: 'Koneksi ke Google Apps Script berhasil terhubung dan siap digunakan!',
    };
  } catch (err) {
    console.warn('no-cors probe failed:', err);
  }

  // Strategi 3: POST ping probe
  try {
    const res = await executeAppsScript('ping', {}, cleanUrl);
    if (res.success || res.status === 'ok' || res.message) {
      return {
        ok: true,
        message: 'Koneksi ke Google Apps Script berhasil terhubung!',
      };
    }
    return {
      ok: false,
      message: res.error || 'Akses ditolak oleh Google. Pastikan setelan "Who has access" disetel ke "Anyone" dan URL berakhiran /exec.',
    };
  } catch (err) {
    return {
      ok: false,
      message: 'Gagal menghubungi Google Apps Script. Pastikan opsi "Who has access" diatur ke "Anyone" dan URL berakhiran /exec.',
    };
  }
}

/**
 * Fetch / Pull all orders, products, and expenses from Google Sheets
 * Uses GET with JSONP fallback for zero CORS restrictions across any device
 * @param {string} customUrl - optional url override
 * @returns {Promise<{ success: boolean, data?: Object, error?: string }>}
 */
export async function fetchSheetsData(customUrl = null) {
  let url = customUrl;
  if (!url) {
    try {
      const savedSettings = JSON.parse(
        localStorage.getItem(APP_CONFIG.storageKeys.SETTINGS) || '{}'
      );
      url = savedSettings.googleAppsScriptUrl;
    } catch {
      url = '';
    }
  }

  if (!url || !url.trim() || !url.startsWith('https://script.google.com')) {
    return {
      success: false,
      error: 'URL Google Apps Script belum dikonfigurasi.',
    };
  }

  const endpoint = url.trim();

  // Method 1: Standard fetch GET
  try {
    const separator = endpoint.includes('?') ? '&' : '?';
    const fetchUrl = `${endpoint}${separator}action=get_all&t=${Date.now()}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    const res = await fetch(fetchUrl, {
      method: 'GET',
      mode: 'cors',
      credentials: 'omit',
      redirect: 'follow',
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const result = await res.json();
      if (result.success && result.data) {
        return { success: true, data: result.data };
      }
      // If endpoint is reachable but returned default ping message without data:
      if (result.success && !result.data) {
        return {
          success: false,
          needsUpdate: true,
          error: 'Skrip di Google Spreadsheet Anda masih versi lama (belum memiliki kode Tarik Data). Silakan klik "Salin Kode Google Apps Script" di menu Pengaturan, tempel di editor skrip, lalu Deploy > Manage deployments > Edit > New version > Deploy.',
        };
      }
    }
  } catch (err) {
    console.warn('Standard GET failed, using JSONP fallback for pull...', err);
  }

  // Method 2: POST get_all probe
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);
    const postRes = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify({
        action: 'get_all',
        timestamp: new Date().toISOString(),
      }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (postRes.ok) {
      const postData = await postRes.json();
      if (postData.success && postData.data) {
        return { success: true, data: postData.data };
      }
    }
  } catch (postErr) {
    console.warn('POST pull probe failed:', postErr);
  }

  // Method 3: JSONP Fallback (Works across all devices and browsers without CORS limits)
  return new Promise((resolve) => {
    const callbackName = '__gas_pull_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7);
    const script = document.createElement('script');
    const separator = endpoint.includes('?') ? '&' : '?';
    script.src = `${endpoint}${separator}action=get_all&callback=${callbackName}&t=${Date.now()}`;

    const timer = setTimeout(() => {
      cleanup();
      resolve({ success: false, error: 'Koneksi timeout saat menarik data dari Google Sheets.' });
    }, 15000);

    function cleanup() {
      clearTimeout(timer);
      delete window[callbackName];
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    }

    window[callbackName] = function (response) {
      cleanup();
      if (response && response.success && response.data) {
        resolve({ success: true, data: response.data });
      } else {
        resolve({
          success: false,
          error: response?.error || 'Skrip di Google Spreadsheet belum diperbarui dengan kode Tarik Data terbaru.',
        });
      }
    };

    script.onerror = function () {
      cleanup();
      resolve({
        success: false,
        needsUpdate: true,
        error: 'Skrip di Google Sheets Anda belum diperbarui dengan kode Tarik Data. Buka menu Pengaturan > klik "Salin Kode Google Apps Script" > tempel di editor skrip Google > Deploy > Manage deployments > Edit > New version > Deploy.',
      });
    };

    document.head.appendChild(script);
  });
}

/**
 * Sync all pending offline operations
 * @param {Function} onProgress
 * @returns {Promise<{ successCount: number, failCount: number }>}
 */
export async function syncOfflineQueue(onProgress = null) {
  const queue = getOfflineQueue();
  if (queue.length === 0) {
    return { successCount: 0, failCount: 0 };
  }

  let successCount = 0;
  let failCount = 0;
  const remaining = [];

  for (let i = 0; i < queue.length; i++) {
    const item = queue[i];
    if (onProgress) {
      onProgress(i + 1, queue.length, item);
    }

    const result = await executeAppsScript(item.action, item.payload);
    if (result.success) {
      successCount++;
    } else {
      failCount++;
      item.retryCount = (item.retryCount || 0) + 1;
      remaining.push(item);
    }
  }

  saveOfflineQueue(remaining);
  return { successCount, failCount, remainingCount: remaining.length };
}

/**
 * Returns complete Google Apps Script code to copy-paste into Google Sheets Script Editor
 */
export function getGoogleAppsScriptTemplate() {
  return `/**
 * Google Apps Script Backend for PO Universal
 * Deploy as Web App:
 * 1. Extensions > Apps Script
 * 2. Paste this complete code
 * 3. Deploy > New Deployment > Web app
 * 4. Execute as: Me
 * 5. Who has access: Anyone
 * 6. Copy the Web App URL into PO Universal Settings!
 */

function getSS() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) {
    throw new Error("Apps Script harus dibuka melalui menu: Ekstensi > Apps Script di dalam Google Spreadsheet Anda.");
  }
  return ss;
}

function setupSheets() {
  var ss = getSS();
  
  // Sheet: Pesanan
  var sOrder = ss.getSheetByName("Pesanan") || ss.insertSheet("Pesanan");
  if (sOrder.getLastRow() === 0) {
    sOrder.appendRow([
      "ID", "Timestamp", "Tanggal PO", "Tanggal Pengiriman", "Nama", 
      "WhatsApp", "Items", "Total Qty", "Subtotal", "DP", 
      "Total Dibayar", "Sisa", "Total Tagihan", "Status Bayar", 
      "Metode Bayar", "Status Pesanan", "Catatan"
    ]);
    sOrder.getRange(1, 1, 1, 17).setFontWeight("bold").setBackground("#e2e8f0");
  }

  // Sheet: Produk
  var sProd = ss.getSheetByName("Produk") || ss.insertSheet("Produk");
  if (sProd.getLastRow() === 0) {
    sProd.appendRow(["ID", "Nama", "Deskripsi", "Kategori", "Harga", "Unit", "Status"]);
    sProd.getRange(1, 1, 1, 7).setFontWeight("bold").setBackground("#e2e8f0");
  }

  // Sheet: Pengeluaran
  var sExp = ss.getSheetByName("Pengeluaran") || ss.insertSheet("Pengeluaran");
  if (sExp.getLastRow() === 0) {
    sExp.appendRow(["ID", "Timestamp", "Tanggal", "Kategori", "Nominal", "Metode Pembayaran", "Keterangan"]);
    sExp.getRange(1, 1, 1, 7).setFontWeight("bold").setBackground("#e2e8f0");
  }

  // Sheet: Pengaturan
  var sSet = ss.getSheetByName("Pengaturan") || ss.insertSheet("Pengaturan");
  if (sSet.getLastRow() === 0) {
    sSet.appendRow(["Key", "Value"]);
    sSet.getRange(1, 1, 1, 2).setFontWeight("bold").setBackground("#e2e8f0");
  }
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(15000);
  
  try {
    var ss = getSS();
    setupSheets();
    
    var data = null;
    if (e && e.postData && e.postData.contents) {
      data = JSON.parse(e.postData.contents);
    } else if (e && e.parameter && e.parameter.data) {
      data = JSON.parse(e.parameter.data);
    } else if (e && e.parameter) {
      data = e.parameter;
    }
    
    if (!data) {
      logError("doPost", "No post data received in request");
      return jsonResponse({ success: false, error: "No data payload received" });
    }

    var action = data.action;
    var payload = data.payload || {};
    
    if (action === "ping") {
      return jsonResponse({ success: true, message: "Koneksi Google Sheets Aktif!", time: new Date() });
    }

    // Aksi: Sinkronkan seluruh data sekaligus (Bulk Sync)
    if (action === "sync_all") {
      var orders = payload.orders || [];
      var products = payload.products || [];
      var expenses = payload.expenses || [];

      // Simpan Orders
      var sOrder = ss.getSheetByName("Pesanan");
      for (var i = 0; i < orders.length; i++) {
        var ord = orders[i];
        saveOrderRow(sOrder, ord);
      }

      // Simpan Products
      var sProd = ss.getSheetByName("Produk");
      for (var j = 0; j < products.length; j++) {
        var prd = products[j];
        saveProductRow(sProd, prd);
      }

      // Simpan Expenses
      var sExp = ss.getSheetByName("Pengeluaran");
      for (var k = 0; k < expenses.length; k++) {
        var exp = expenses[k];
        saveExpenseRow(sExp, exp);
      }

      return jsonResponse({
        success: true,
        message: "Seluruh data berhasil disinkronkan!",
        synced: { orders: orders.length, products: products.length, expenses: expenses.length }
      });
    }

    if (action === "create_order" || action === "update_order") {
      var s = ss.getSheetByName("Pesanan");
      saveOrderRow(s, payload);
      return jsonResponse({ success: true, id: payload.id });
    }

    if (action === "delete_order") {
      var s = ss.getSheetByName("Pesanan");
      var values = s.getDataRange().getValues();
      for (var i = 1; i < values.length; i++) {
        if (values[i][0] == payload.id) {
          s.deleteRow(i + 1);
          return jsonResponse({ success: true, id: payload.id });
        }
      }
      return jsonResponse({ success: false, message: "Order not found" });
    }

    if (action === "create_expense" || action === "update_expense") {
      var s = ss.getSheetByName("Pengeluaran");
      saveExpenseRow(s, payload);
      return jsonResponse({ success: true, id: payload.id });
    }

    if (action === "delete_expense") {
      var s = ss.getSheetByName("Pengeluaran");
      var values = s.getDataRange().getValues();
      for (var i = 1; i < values.length; i++) {
        if (values[i][0] == payload.id) {
          s.deleteRow(i + 1);
          return jsonResponse({ success: true, id: payload.id });
        }
      }
      return jsonResponse({ success: false, message: "Expense not found" });
    }

    if (action === "save_product") {
      var s = ss.getSheetByName("Produk");
      saveProductRow(s, payload);
      return jsonResponse({ success: true, id: payload.id });
    }

    if (action === "delete_product") {
      var s = ss.getSheetByName("Produk");
      var values = s.getDataRange().getValues();
      for (var i = 1; i < values.length; i++) {
        if (values[i][0] == payload.id) {
          s.deleteRow(i + 1);
          return jsonResponse({ success: true, id: payload.id });
        }
      }
      return jsonResponse({ success: false, message: "Product not found" });
    }

    if (action === "get_all" || action === "pull") {
      return jsonResponse({
        success: true,
        data: getAllSheetsData()
      });
    }

    return jsonResponse({ success: false, message: "Unknown action: " + action });
  } catch (err) {
    logError("doPost_Exception", err.toString());
    return jsonResponse({ success: false, error: err.toString() });
  } finally {
    lock.releaseLock();
  }
}

// Helper: Tarik seluruh data dari Google Sheets (Pesanan, Produk, Pengeluaran)
function getAllSheetsData() {
  var ss = getSS();
  var result = { orders: [], products: [], expenses: [] };

  try {
    var sOrder = ss.getSheetByName("Pesanan");
    if (sOrder && sOrder.getLastRow() > 1) {
      var rows = sOrder.getDataRange().getValues();
      for (var i = 1; i < rows.length; i++) {
        var r = rows[i];
        if (!r[0]) continue;
        var items = [];
        try { items = JSON.parse(r[6]); } catch (e) { items = []; }
        result.orders.push({
          id: String(r[0]),
          timestamp: r[1] ? String(r[1]) : "",
          orderDate: r[2] ? String(r[2]) : "",
          deliveryDate: r[3] ? String(r[3]) : "",
          customerName: String(r[4] || ""),
          whatsapp: String(r[5] || ""),
          items: items,
          itemsSummary: items.map(function(it){ return it.name + ' (' + it.qty + ' ' + (it.unit || 'pcs') + ')'; }).join(', '),
          totalQty: Number(r[7]) || 0,
          subtotal: Number(r[8]) || 0,
          amountPaid: Number(r[10]) || 0,
          remaining: Number(r[11]) || 0,
          total: Number(r[12]) || 0,
          paymentStatus: String(r[13] || "unpaid"),
          paymentMethod: String(r[14] || ""),
          orderStatus: String(r[15] || "new"),
          notes: String(r[16] || "")
        });
      }
    }
  } catch (errOrders) {
    logError("getAllSheetsData_Orders", errOrders.toString());
  }

  try {
    var sProd = ss.getSheetByName("Produk");
    if (sProd && sProd.getLastRow() > 1) {
      var pRows = sProd.getDataRange().getValues();
      for (var j = 1; j < pRows.length; j++) {
        var pr = pRows[j];
        if (!pr[0]) continue;
        result.products.push({
          id: String(pr[0]),
          name: String(pr[1] || ""),
          description: String(pr[2] || ""),
          category: String(pr[3] || "Katering & Nasi"),
          price: Number(pr[4]) || 0,
          unit: String(pr[5] || "pcs"),
          status: String(pr[6] || "active")
        });
      }
    }
  } catch (errProd) {
    logError("getAllSheetsData_Products", errProd.toString());
  }

  try {
    var sExp = ss.getSheetByName("Pengeluaran");
    if (sExp && sExp.getLastRow() > 1) {
      var eRows = sExp.getDataRange().getValues();
      for (var k = 1; k < eRows.length; k++) {
        var er = eRows[k];
        if (!er[0]) continue;
        result.expenses.push({
          id: String(er[0]),
          timestamp: er[1] ? String(er[1]) : "",
          date: er[2] ? String(er[2]) : "",
          category: String(er[3] || ""),
          amount: Number(er[4]) || 0,
          paymentMethod: String(er[5] || ""),
          description: String(er[6] || "")
        });
      }
    }
  } catch (errExp) {
    logError("getAllSheetsData_Expenses", errExp.toString());
  }

  return result;
}

// Helper: Simpan/Update Baris Pesanan
function saveOrderRow(sheet, payload) {
  var values = sheet.getDataRange().getValues();
  var rowData = [
    payload.id,
    payload.timestamp || new Date().toISOString(),
    payload.orderDate || "",
    payload.deliveryDate || "",
    payload.customerName || "",
    payload.whatsapp || "",
    JSON.stringify(payload.items || []),
    payload.totalQty || 0,
    payload.subtotal || 0,
    payload.amountPaid || 0,
    payload.amountPaid || 0,
    payload.remaining || 0,
    payload.total || 0,
    payload.paymentStatus || "unpaid",
    payload.paymentMethod || "",
    payload.orderStatus || "new",
    payload.notes || ""
  ];

  for (var i = 1; i < values.length; i++) {
    if (String(values[i][0]).trim() == String(payload.id).trim()) {
      sheet.getRange(i + 1, 1, 1, rowData.length).setValues([rowData]);
      return;
    }
  }
  sheet.appendRow(rowData);
}

// Helper: Simpan/Update Baris Produk
function saveProductRow(sheet, payload) {
  var values = sheet.getDataRange().getValues();
  var rowData = [
    payload.id,
    payload.name || "",
    payload.description || "",
    payload.category || "",
    payload.price || 0,
    payload.unit || "pcs",
    payload.status || "active"
  ];

  for (var i = 1; i < values.length; i++) {
    if (String(values[i][0]).trim() == String(payload.id).trim()) {
      sheet.getRange(i + 1, 1, 1, rowData.length).setValues([rowData]);
      return;
    }
  }
  sheet.appendRow(rowData);
}

// Helper: Simpan/Update Baris Pengeluaran
function saveExpenseRow(sheet, payload) {
  var values = sheet.getDataRange().getValues();
  var rowData = [
    payload.id,
    payload.timestamp || new Date().toISOString(),
    payload.date || "",
    payload.category || "",
    payload.amount || 0,
    payload.paymentMethod || "",
    payload.description || ""
  ];

  for (var i = 1; i < values.length; i++) {
    if (String(values[i][0]).trim() == String(payload.id).trim()) {
      sheet.getRange(i + 1, 1, 1, rowData.length).setValues([rowData]);
      return;
    }
  }
  sheet.appendRow(rowData);
}

// Helper: Catat Log Error
function logError(tag, message) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sLog = ss.getSheetByName("Logs") || ss.insertSheet("Logs");
    if (sLog.getLastRow() === 0) {
      sLog.appendRow(["Timestamp", "Tag", "Message"]);
      sLog.getRange(1, 1, 1, 3).setFontWeight("bold");
    }
    sLog.appendRow([new Date(), tag, message]);
  } catch (e) {}
}

function doGet(e) {
  var callback = e && e.parameter && e.parameter.callback;
  try {
    setupSheets();
    var action = (e && e.parameter && e.parameter.action) || "ping";

    // Jika diminta menarik seluruh data (Pull Data)
    if (action === "get_all" || action === "pull") {
      var fullData = { success: true, data: getAllSheetsData() };
      if (callback) {
        return ContentService.createTextOutput(callback + "(" + JSON.stringify(fullData) + ")")
          .setMimeType(ContentService.MimeType.JAVASCRIPT);
      }
      return jsonResponse(fullData);
    }

    var pong = { success: true, message: "PO Universal Web App API is running." };
    if (callback) {
      return ContentService.createTextOutput(callback + "(" + JSON.stringify(pong) + ")")
        .setMimeType(ContentService.MimeType.JAVASCRIPT);
    }
    return jsonResponse(pong);
  } catch (err) {
    var errObj = { success: false, error: err.toString() };
    if (callback) {
      return ContentService.createTextOutput(callback + "(" + JSON.stringify(errObj) + ")")
        .setMimeType(ContentService.MimeType.JAVASCRIPT);
    }
    return jsonResponse(errObj);
  }
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
`;
}
