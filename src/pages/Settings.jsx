// Settings & Configuration Page Component
import React, { useState } from 'react';
import {
  Save,
  Building,
  CreditCard,
  Sheet,
  Database,
  RefreshCw,
  Copy,
  Check,
  ExternalLink,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  DownloadCloud,
  Share2,
  Smartphone,
} from 'lucide-react';
import { Button } from '../components/ui/Button.jsx';
import { Input } from '../components/ui/Input.jsx';
import { ConfirmDialog } from '../components/ui/ConfirmDialog.jsx';
import { useToast } from '../components/ui/Toast.jsx';
import { getGoogleAppsScriptTemplate } from '../services/googleSheets.js';

export function Settings({
  settings = {},
  onUpdateSettings,
  connectionStatus = 'unconfigured',
  testingConnection = false,
  onTestConnection,
  offlineQueueCount = 0,
  onTriggerSync,
  onClearQueue,
  onResetToSampleData,
  onClearAllData,
  onSyncAllData = null,
  onPullData = null,
  pullingData = false,
}) {
  const { toastSuccess, toastError, toastInfo } = useToast();

  const [formData, setFormData] = useState({
    businessName: settings.businessName || '',
    businessTagline: settings.businessTagline || '',
    phone: settings.phone || '',
    address: settings.address || '',
    bankName: settings.bankName || '',
    accountName: settings.accountName || '',
    accountNumber: settings.accountNumber || '',
    qrisNote: settings.qrisNote || '',
    googleAppsScriptUrl: settings.googleAppsScriptUrl || '',
  });

  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedShareLink, setCopiedShareLink] = useState(false);
  const [confirmResetSample, setConfirmResetSample] = useState(false);
  const [confirmClearData, setConfirmClearData] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const handleCopyShareLink = () => {
    const url = formData.googleAppsScriptUrl?.trim();
    if (!url) {
      toastError('Simpan URL Google Apps Script terlebih dahulu untuk membuat tautan berbagi.');
      return;
    }
    const shareUrl = `${window.location.origin}${window.location.pathname}?scriptUrl=${encodeURIComponent(url)}`;
    navigator.clipboard.writeText(shareUrl);
    setCopiedShareLink(true);
    toastSuccess('Tautan sinkronisasi disalin! Kirim ke WhatsApp dan buka di HP Anda.');
    setTimeout(() => setCopiedShareLink(false), 3000);
  };

  const handleSave = (e) => {
    e?.preventDefault();
    onUpdateSettings(formData);
    toastSuccess('Setelan usaha berhasil disimpan.');
  };

  const handleTestConnection = async () => {
    const url = formData.googleAppsScriptUrl?.trim();
    if (!url) {
      toastError('Harap masukkan URL Google Apps Script terlebih dahulu.');
      return;
    }

    // Auto-save settings directly so the new link/device immediately saves this URL!
    onUpdateSettings({ ...formData, googleAppsScriptUrl: url });

    const res = await onTestConnection(url);
    if (res?.ok) {
      toastSuccess(res.message);
      toastInfo('URL Google Apps Script telah otomatis tersimpan di perangkat ini.');
    } else {
      toastError(res?.message || 'Koneksi gagal.');
    }
  };

  const handleCopyScript = () => {
    const script = getGoogleAppsScriptTemplate();
    navigator.clipboard.writeText(script);
    setCopiedCode(true);
    toastSuccess('Kode Google Apps Script disalin ke clipboard!');
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleSyncNow = async () => {
    setSyncing(true);
    const res = await onTriggerSync();
    setSyncing(false);
    if (res?.successCount > 0) {
      toastSuccess(`${res.successCount} data berhasil disinkronkan ke Google Sheets!`);
    } else if (res?.failCount > 0) {
      toastError(`${res.failCount} data gagal disinkronkan. Pastikan URL Apps Script valid.`);
    } else {
      toastInfo('Tidak ada antrean data yang perlu disinkronkan.');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-xl border border-stone-200/90 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Pengaturan Sistem & Integrasi
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Konfigurasi profil usaha, rekening pembayaran, dan integrasi Google Sheets.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          icon={Save}
          onClick={handleSave}
        >
          Simpan Setelan
        </Button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* 1. Business Profile Card */}
        <div className="bg-white p-5 rounded-xl border border-stone-200/90 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-stone-100">
            <Building className="w-4 h-4 text-slate-700" />
            <h3 className="text-sm font-bold text-slate-900">
              1. Profil Usaha & Kontak
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Nama Usaha / Toko"
              value={formData.businessName}
              onChange={(e) =>
                setFormData({ ...formData, businessName: e.target.value })
              }
              placeholder="Contoh: Dapur Berkah Nusantara"
              required
            />

            <Input
              label="Slogan / Keterangan Usaha"
              value={formData.businessTagline}
              onChange={(e) =>
                setFormData({ ...formData, businessTagline: e.target.value })
              }
              placeholder="Contoh: Aneka Nasi Box & Catering Sehat"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Nomor WhatsApp Bisnis"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              placeholder="081234567890"
              helperText="Nomor ini akan tercetak pada invoice/struk pemesanan."
            />

            <Input
              label="Alamat Toko / Dapur"
              value={formData.address}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
              placeholder="Jl. Melati No. 18, Kebayoran Baru, Jakarta"
            />
          </div>
        </div>

        {/* 2. Payment Account Card */}
        <div className="bg-white p-5 rounded-xl border border-stone-200/90 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-stone-100">
            <CreditCard className="w-4 h-4 text-slate-700" />
            <h3 className="text-sm font-bold text-slate-900">
              2. Rekening Pembayaran Pelanggan
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Nama Bank / E-Wallet"
              value={formData.bankName}
              onChange={(e) =>
                setFormData({ ...formData, bankName: e.target.value })
              }
              placeholder="BCA / Mandiri / GoPay"
            />

            <Input
              label="Nomor Rekening"
              value={formData.accountNumber}
              onChange={(e) =>
                setFormData({ ...formData, accountNumber: e.target.value })
              }
              placeholder="8830192841"
            />

            <Input
              label="Atas Nama (Pemilik)"
              value={formData.accountName}
              onChange={(e) =>
                setFormData({ ...formData, accountName: e.target.value })
              }
              placeholder="Dapur Berkah Nusantara"
            />
          </div>

          <Input
            label="Catatan QRIS / Pembayaran Lainnya"
            value={formData.qrisNote}
            onChange={(e) =>
              setFormData({ ...formData, qrisNote: e.target.value })
            }
            placeholder="Tersedia QRIS statis di kasir atau scan saat pengiriman."
          />
        </div>

        {/* 3. Google Sheets Integration Card */}
        <div className="bg-white p-5 rounded-xl border border-stone-200/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-stone-100">
            <div className="flex items-center gap-2">
              <Sheet className="w-4 h-4 text-emerald-700" />
              <h3 className="text-sm font-bold text-slate-900">
                3. Integrasi Google Sheets & Google Apps Script
              </h3>
            </div>

            <span
              className={`text-xs px-2.5 py-0.5 rounded-full font-semibold flex items-center gap-1.5 ${
                connectionStatus === 'connected'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : connectionStatus === 'error'
                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                  : 'bg-stone-100 text-slate-600'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  connectionStatus === 'connected'
                    ? 'bg-emerald-500'
                    : connectionStatus === 'error'
                    ? 'bg-rose-500'
                    : 'bg-slate-400'
                }`}
              />
              <span>
                {connectionStatus === 'connected'
                  ? 'Tersambung'
                  : connectionStatus === 'error'
                  ? 'Koneksi Bermasalah'
                  : 'Belum Dikonfigurasi'}
              </span>
            </span>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed">
            Data pesanan, produk, dan pengeluaran Anda disimpan secara aman di Google Spreadsheet pribadi Anda melalui Google Apps Script Web App.
          </p>

          <div className="space-y-2">
            <Input
              label="URL Web App Google Apps Script"
              value={formData.googleAppsScriptUrl}
              onChange={(e) =>
                setFormData({ ...formData, googleAppsScriptUrl: e.target.value })
              }
              onBlur={() => {
                if (formData.googleAppsScriptUrl?.trim()) {
                  onUpdateSettings(formData);
                }
              }}
              placeholder="https://script.google.com/macros/s/.../exec"
              helperText="Tempelkan URL Web App yang didapat setelah deploy Apps Script (otomatis tersimpan saat klik luar atau uji koneksi)."
            />

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <Button
                variant="outline"
                size="sm"
                onClick={handleTestConnection}
                loading={testingConnection}
              >
                Uji Koneksi Apps Script
              </Button>

              <Button
                variant="primary"
                size="sm"
                icon={RefreshCw}
                onClick={async () => {
                  const urlToUse = formData.googleAppsScriptUrl ? formData.googleAppsScriptUrl.trim() : '';
                  if (!urlToUse || !urlToUse.startsWith('https://script.google.com')) {
                    toastError('Harap isi URL Web App Google Apps Script yang valid terlebih dahulu.');
                    return;
                  }

                  // Auto-save settings first so URL is definitely stored
                  onUpdateSettings(formData);

                  if (onSyncAllData) {
                    setSyncing(true);
                    toastInfo('Sedang mengunggah data ke Google Sheets...');
                    const res = await onSyncAllData(urlToUse);
                    setSyncing(false);
                    if (res?.success) {
                      toastSuccess('Berhasil! Data pesanan, produk & pengeluaran telah masuk ke Google Sheets.');
                    } else {
                      toastError(res?.error || 'Gagal sinkronisasi data. Periksa URL Apps Script Anda.');
                    }
                  }
                }}
                loading={syncing}
                title="Unggah seluruh data pesanan, produk, dan pengeluaran yang ada saat ini ke Google Sheets"
              >
                Unggah Semua Data ke Sheets
              </Button>

              <Button
                variant="outline"
                size="sm"
                icon={DownloadCloud}
                onClick={async () => {
                  const urlToUse = formData.googleAppsScriptUrl ? formData.googleAppsScriptUrl.trim() : '';
                  if (!urlToUse || !urlToUse.startsWith('https://script.google.com')) {
                    toastError('Harap isi URL Web App Google Apps Script yang valid terlebih dahulu.');
                    return;
                  }
                  if (onPullData) {
                    await onPullData(urlToUse, true);
                  }
                }}
                loading={pullingData}
                title="Tarik dan muat ulang data pesanan, produk & pengeluaran terbaru dari Google Sheets ke perangkat ini"
              >
                Tarik Data dari Sheets
              </Button>

              <Button
                variant="outline"
                size="sm"
                icon={Copy}
                onClick={handleCopyScript}
              >
                {copiedCode ? 'Tersalin!' : 'Salin Kode Google Apps Script'}
              </Button>
            </div>
          </div>

          {/* Setup Guide Accordion / Box */}
          <div className="bg-stone-50 border border-stone-200/90 rounded-lg p-4 text-xs space-y-2.5">
            <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
              <span>Panduan Pasang & Update di Google Spreadsheet:</span>
            </h4>
            <ol className="list-decimal list-inside space-y-1.5 text-slate-600 leading-relaxed">
              <li>Buka Google Spreadsheet Anda &gt; menu <strong>Ekstensi (Extensions)</strong> &gt; <strong>Apps Script</strong>.</li>
              <li>Klik tombol <em>"Salin Kode Google Apps Script"</em> di atas, lalu tempelkan menggantikan seluruh isi editor script.</li>
              <li><strong>Penting (Otorisasi Izin Google):</strong> Pada dropdown fungsi di bilah atas editor, pilih <code>setupSheets</code> lalu klik tombol <strong>Run (Jalankan)</strong>. Jika muncul popup <em>"Authorization required"</em>, klik <strong>Review permissions</strong> &gt; pilih akun Google Anda &gt; klik <strong>Advanced (Lanjutan)</strong> &gt; klik <strong>Go to PO Universal (unsafe)</strong> &gt; klik <strong>Allow (Izinkan)</strong>.</li>
              <li>Klik tombol biru <strong>Deploy (Terapkan)</strong> &gt; <strong>Manage deployments (Kelola penerapan)</strong>.</li>
              <li>Klik ikon <strong>Pensil (Edit)</strong> &gt; pada baris <em>Version</em> pilih <strong>New version</strong> &gt; pastikan <em>Who has access</em> adalah <strong>Anyone</strong> &gt; klik <strong>Deploy</strong>.</li>
              <li>Salin URL Web App yang dihasilkan (berakhiran <code>/exec</code>), tempelkan ke kolom URL di atas lalu klik <em>Uji Koneksi</em>.</li>
            </ol>
          </div>
        </div>

        {/* 4. Multi-Device Sharing & Sync */}
        <div className="bg-white p-5 rounded-xl border border-stone-200/90 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-stone-100">
            <Smartphone className="w-4 h-4 text-emerald-700" />
            <h3 className="text-sm font-bold text-slate-900">
              4. Sinkronisasi Antar-Perangkat (Buka di HP / Laptop Lain)
            </h3>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed">
            Data tersimpan secara aman di Google Spreadsheet Anda. Jika Anda membuka link di HP atau perangkat lain, gunakan tautan berbagi di bawah ini agar perangkat tersebut langsung otomatis terhubung ke spreadsheet Anda tanpa perlu mengetik ulang URL Apps Script.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              icon={Share2}
              onClick={handleCopyShareLink}
              title="Salin tautan instan dengan konfigurasi spreadsheet terpasang"
            >
              {copiedShareLink ? 'Tautan Tersalin!' : 'Salin Link untuk Buka di HP / Tim'}
            </Button>

            <Button
              variant="outline"
              size="sm"
              icon={DownloadCloud}
              onClick={() => onPullData && onPullData(formData.googleAppsScriptUrl, true)}
              loading={pullingData}
            >
              Tarik Data Terbaru Sekarang
            </Button>
          </div>

          <div className="bg-stone-50 border border-stone-200/80 rounded-lg p-3 text-xs text-slate-600 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>
              <strong>Tips Kerja Sama Tim:</strong> Setiap perubahan yang Anda buat di satu perangkat otomatis tersimpan di Google Sheets. Pada perangkat lain, cukup klik tombol <strong>"Tarik Data"</strong> di bilah atas untuk menyegarkan data seketika.
            </span>
          </div>
        </div>

        {/* 5. Offline Queue & Demo Data Management */}
        <div className="bg-white p-5 rounded-xl border border-stone-200/90 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-stone-100">
            <Database className="w-4 h-4 text-slate-700" />
            <h3 className="text-sm font-bold text-slate-900">
              5. Antrean Offline & Pengelolaan Data
            </h3>
          </div>

          {/* Offline Queue Status */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-stone-50 rounded-lg border border-stone-200">
            <div>
              <div className="text-xs font-bold text-slate-900">
                Antrean Sinkronisasi Lokal: {offlineQueueCount} perubahan
              </div>
              <div className="text-[11px] text-slate-500">
                Jika internet Anda terputus, perubahan akan disimpan di browser ini hingga Anda melakukan sinkronisasi ulang.
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                icon={RefreshCw}
                onClick={handleSyncNow}
                loading={syncing}
                disabled={offlineQueueCount === 0}
              >
                Sinkronkan Antrean
              </Button>
              {offlineQueueCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClearQueue}
                  className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                >
                  Bersihkan
                </Button>
              )}
            </div>
          </div>

          {/* Sample Data Toggles */}
          <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-stone-100">
            <div>
              <div className="text-xs font-bold text-slate-800">
                Data Sampel / Demo UMKM
              </div>
              <div className="text-[11px] text-slate-500">
                Muat ulang 5 produk, 5 pesanan, dan 3 pengeluaran demo untuk presentasi atau pengujian.
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                icon={RotateCcw}
                onClick={() => setConfirmResetSample(true)}
              >
                Muat Ulang Data Sampel
              </Button>
              <Button
                variant="outline"
                size="sm"
                icon={Trash2}
                onClick={() => setConfirmClearData(true)}
                className="text-rose-600 border-rose-300 hover:bg-rose-50"
              >
                Kosongkan Semua Data
              </Button>
            </div>
          </div>
        </div>
      </form>

      {/* Confirmation: Reset to Sample Data */}
      <ConfirmDialog
        isOpen={confirmResetSample}
        onClose={() => setConfirmResetSample(false)}
        onConfirm={() => {
          onResetToSampleData();
          setConfirmResetSample(false);
          toastSuccess('Data sampel (5 produk, 5 pesanan, 3 pengeluaran) berhasil dimuat!');
        }}
        title="Muat Data Sampel"
        message="Ini akan menggantikan data yang sedang tampil dengan data sampel awal (5 Produk, 5 Pesanan, 3 Pengeluaran). Lanjutkan?"
        confirmText="Muat Sampel"
        variant="primary"
      />

      {/* Confirmation: Clear All Data */}
      <ConfirmDialog
        isOpen={confirmClearData}
        onClose={() => setConfirmClearData(false)}
        onConfirm={() => {
          onClearAllData();
          setConfirmClearData(false);
          toastSuccess('Seluruh data lokal berhasil dikosongkan.');
        }}
        title="Kosongkan Semua Data"
        message="Apakah Anda yakin ingin menghapus seluruh data pesanan, produk, dan pengeluaran di browser ini untuk memulai data riil dari nol?"
        confirmText="Kosongkan Database"
        variant="danger"
      />
    </div>
  );
}
