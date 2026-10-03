# 🔮 NEXA — Pre-Order & Business Operations Suite

<p align="center">
  <img src="https://img.shields.io/badge/Version-3.0.0-6366f1?style=for-the-badge&logo=appveyor" alt="Version 3.0.0" />
  <img src="https://img.shields.io/badge/Design-Glassmorphism-06b6d4?style=for-the-badge" alt="Glassmorphism Design" />
  <img src="https://img.shields.io/badge/Google%20Sheets-Realtime%20Sync-10b981?style=for-the-badge&logo=googlesheets" alt="Google Sheets Sync" />
  <img src="https://img.shields.io/badge/Offline-Queue%20Resilient-f59e0b?style=for-the-badge" alt="Offline Resilient" />
</p>

**NEXA** adalah sistem operasional bisnis dan manajemen pesanan pre-order (PO) modern dengan antarmuka **Glassmorphism**, dirancang khusus untuk katering, bakery, UMKM kuliner, dan bisnis pesanan terjadwal. Dilengkapi integrasi dua arah ke **Google Spreadsheet**, pelacakan uang muka (DP) dan pelunasan, invoice WhatsApp otomatis, serta laporan laba bersih riil.

---

## ✨ Fitur Unggulan

### 1. 📋 Manajemen Alur Kerja Pre-Order (PO) Lengkap

- **Status Siklus Pesanan**: _Baru_, _Dikonfirmasi_, _Diproses_, _Siap Kirim_, _Selesai_, hingga _Dibatalkan_.
- **Pilihan Tanggal Khusus**: Tanggal pemesanan dan tanggal pengiriman/pengambilan dengan filter cerdas (_Hari Ini_, _Besok_, _Minggu Ini_).
- **Multi-Item Cart**: Pilih aneka produk dari katalog dengan kalkulasi otomatis subtotal dan kuantitas.
- **Pencarian Cepat & Filter**: Cari instan berdasarkan nama pemesan, nomor WhatsApp, nomor invoice, atau produk.

### 2. 💳 Pelacakan Pembayaran Multi-Tahap (DP & Pelunasan)

- **Status Pembayaran**: _Belum Bayar (Unpaid)_, _Uang Muka (DP)_, dan _Lunas (Paid)_.
- **Kalkulasi Sisa Tagihan Otomatis**: Menghitung sisa pembayaran secara matematis tanpa risiko salah hitung.
- **Multi-Metode Pembayaran**: Transfer Bank, QRIS, Tunai / COD, dan E-Wallet.
- **Pelunasan 1-Klik**: Perbarui status menjadi lunas dengan satu sentuhan.

### 3. 💬 Faktur & Notifikasi WhatsApp 1-Klik

- **Template Pesan WhatsApp Otomatis**:
  - Konfirmasi Pemesanan & Tagihan Awal (dengan instruksi transfer bank / QRIS).
  - Tanda Terima Pembayaran DP & Sisa Pelunasan.
  - Pengingat Tagihan (Invoice Reminder).
  - Notifikasi Pesanan Siap / Sedang Dikirim.
- Membuka WhatsApp Web atau aplikasi mobile langsung dengan teks rapi berformat emoji.

### 4. 📊 Arus Kas & Analisis Keuangan Riil

- **Omzet vs Kas Riil**: Membedakan nilai penjualan buku dengan kas nyata yang sudah diterima.
- **Catat Pengeluaran Operasional**: Input biaya bahan baku, packaging, ongkir, gaji, dan utilitas.
- **Laba Bersih Riil**: Dihitung dari kas diterima dikurangi pengeluaran riil (`Kas Diterima - Pengeluaran`).
- **Laporan Keuangan & Ekspor CSV**: Unduh rekapitulasi data pesanan dan keuangan ke format spreadsheet.

### 5. ☁️ Sinkronisasi Dua Arah ke Google Spreadsheet (Apps Script)

- Database Anda disimpan di **Google Spreadsheet pribadi milik Anda** — 100% kepemilikan data tanpa biaya database bulanan.
- **Auto-Sync Otomatis**: Setiap pesanan, perubahan status, produk, dan pengeluaran langsung tercatat ke baris Google Sheets.
- **Tarik Data (Pull)**: Sinkronkan seluruh data dari spreadsheet ke perangkat baru dalam hitungan detik.
- **Antrean Offline**: Jika internet terputus, perubahan disimpan di antrean lokal dan disinkronkan saat koneksi kembali online.

---

## 🎨 Tampilan Glassmorphism Modern

NEXA menggunakan bahasa desain **Glassmorphism** terkini:

- **Frosted Glass Surfaces**: Transparansi blur dinamis (`backdrop-blur-xl bg-white/75`) berpadu dengan aksen garis tipis luminous (`border-white/80`).
- **Ambient Gradient Mesh**: Latar belakang orbs gradien lembut yang memberikan kedalaman visual dan estetika premium.
- **Tipografi Inter & JetBrains Mono**: Angka tabular sejajar untuk kemudahan membaca laporan keuangan.
- **Responsif Penuh**: Sidebar desktop yang dapat dilipat dan navigasi bottom bar mobile dengan tombol aksi cepat melayang (_floating action button_).

---

## 🚀 Panduan Pemasangan Google Apps Script (1 Menit)

Agar NEXA tersambung langsung ke Google Spreadsheet Anda:

### Langkah 1: Buat Spreadsheet & Buka Editor

1. Buat **Google Spreadsheet** baru di [Google Drive](https://drive.google.com).
2. Di Google Spreadsheet, buka menu **Ekstensi (Extensions)** &gt; **Apps Script**.

### Langkah 2: Tempelkan Kode

1. Di aplikasi **NEXA**, buka menu **Pengaturan**.
2. Klik tombol **"Salin Kode Google Apps Script"**.
3. Di editor Apps Script, hapus semua kode bawaan di `Code.gs`, lalu **Tempelkan (Paste)** kode yang baru Anda salin.
4. Klik ikon **Simpan (Disket / Ctrl+S)**.

### Langkah 3: Beri Izin Otorisasi Google (Penting!)

> _Langkah ini wajib dilakukan sekali agar Google tidak menolak koneksi dengan pesan HTTP 403 Forbidden:_

1. Di bilah menu atas Apps Script (di samping ikon Debug dan Run), klik dropdown nama fungsi dan pilih: **`setupSheets`**.
2. Klik tombol **Run (Jalankan)** ▶.
3. Google akan memunculkan popup _"Authorization required"_:
   - Klik **Review permissions (Tinjau izin)**.
   - Pilih akun Google Anda.
   - Klik tulisan **Advanced (Lanjutan)** di kiri bawah.
   - Klik **Go to PO Universal / Untitled project (unsafe)**.
   - Klik tombol **Allow (Izinkan)**.

### Langkah 4: Terapkan Sebagai Web App

1. Klik tombol biru **Deploy (Terapkan)** di pojok kanan atas &gt; pilih **Manage deployments**.
2. Klik ikon **Pensil (Edit)**.
3. Pastikan konfigurasi:
   - **Execute as**: `Me (email Anda)`
   - **Who has access**: **`Anyone (Siapa saja)`** _(Wajib "Anyone" agar aplikasi web dapat mengirim dan membaca data)_
4. Pada baris **Version**, pilih **New version**.
5. Klik **Deploy**.
6. Klik tombol **`Copy`** di bawah teks **Web app - URL** (URL berakhiran `/exec`).

### Langkah 5: Sambungkan ke NEXA

1. Kembali ke aplikasi **NEXA**, masuk ke menu **Pengaturan**.
2. Tempelkan URL tersebut ke kolom **URL Web App Google Apps Script**.
3. Klik tombol **"Uji Koneksi Apps Script"** &rarr; Notifikasi hijau akan muncul menandakan koneksi aktif!
4. Klik **"Unggah Semua Data ke Sheets"** untuk menginisialisasi spreadsheet Anda.

---

## 🛠️ Arsitektur Teknologi

- **Frontend Framework**: [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Styling Engine**: [Tailwind CSS v4](https://tailwindcss.com/) dengan custom Glassmorphism utilities
- **Iconography**: [Lucide React](https://lucide.dev/)
- **State & Storage**: React Custom Hooks (`useOrders`, `useProducts`, `useExpenses`, `useSettings`) dengan LocalStorage Fallback & Offline Queue
- **Cloud Backend**: Google Apps Script REST API (`doGet` & `doPost` dengan JSONP & text/plain cross-origin bypass)
- **Audio Feedback**: Web Audio API Synthesizer terintegrasi (tanpa aset eksternal)
- **Animasi & Efek**: Canvas Confetti untuk perayaan pesanan lunas

---

## 📱 Struktur Direktori Proyek

```text
├── index.html                   # HTML Entry point dengan Plus Jakarta Sans & JetBrains Mono
├── metadata.json                # Applet configuration
├── src/
│   ├── App.jsx                  # Root App layout dengan Ambient Glass Mesh
│   ├── index.css                # Global stylesheet & Glassmorphism classes
│   ├── main.jsx                 # React DOM mount point
│   ├── config/
│   │   └── app.js               # Konfigurasi branding NEXA & kunci penyimpanan
│   ├── components/
│   │   ├── layout/              # Sidebar, TopHeader, MobileNav, Search & Notifications
│   │   ├── ui/                  # Button, Card, StatCard, Badge, Modal, Input, Select
│   │   ├── orders/              # OrderStatusBadge, PaymentStatusBadge, WhatsAppModal
│   │   ├── products/            # ProductCard, ProductModal
│   │   └── finance/             # ExpenseModal, CashflowSummary
│   ├── hooks/
│   │   ├── useOrders.js         # Pengelolaan state pesanan & sinkronisasi
│   │   ├── useProducts.js       # Katalog produk & status aktif
│   │   ├── useExpenses.js       # Pencatatan biaya operasional
│   │   └── useSettings.js       # Setelan usaha, rekening bank, & Apps Script URL
│   ├── services/
│   │   └── googleSheets.js      # Backend client, probe koneksi, & template Apps Script
│   └── utils/
│       ├── currency.js          # Format rupiah & kalkulasi finansial
│       ├── date.js              # Pemformat tanggal & rentang waktu
│       └── sounds.js            # Efek suara berbasis Web Audio API
```

---

<p align="center">
  Dibuat dengan ❤️ untuk kemajuan UMKM dan efisiensi operasional bisnis modern.
</p>
