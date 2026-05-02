# Product Requirements Document (PRD) - Serene Clinical

## 1. Pendahuluan
**Nama Produk:** Serene Clinical Management System  
**Tujuan Produk:** Menyediakan platform digital berbasis *web* berskala *enterprise* bagi klinik estetika untuk mengelola operasi harian mulai dari penjadwalan (*booking*), manajemen rekam medis pasien, pelacakan inventaris, dan pelaporan keuangan secara otomatis dan *real-time*.

## 2. Ruang Lingkup Sistem (Scope)
Sistem ini terdiri dari dua antar muka utama:
1. **Portal Pasien (Client-facing)**: Antarmuka premium bagi pasien untuk melakukan reservasi, melihat layanan, dan memperbarui profil medis secara mandiri.
2. **Dashboard Admin (Staff-facing)**: Antarmuka komprehensif bagi dokter, manajer klinik, dan staf untuk mengatur operasional penuh.

## 3. Kebutuhan Fitur Inti (Core Features)

### 3.1. Manajemen Pengguna & Keamanan
- Registrasi dan Login mandiri (via Email/Password) terintegrasi dengan Supabase Auth.
- Pembagian peran pengguna (Role-based access): Admin, Staf, dan Pasien.
- Integrasi profil demografi (Nama, Nomor Telepon, dsb).

### 3.2. Portal Reservasi (Booking System)
- Alur *booking* dengan langkah-langkah *step-by-step*: Pemilihan Layanan -> Pemilihan Dokter Spesialis -> Pemilihan Tanggal & Waktu -> Konfirmasi.
- Tampilan daftar layanan dan spesialis berbasis *grid* dengan filter kategori.
- Validasi kalender untuk mencegah bentrok jadwal (Double-booking prevention).

### 3.3. Dashboard Klinikal & Operasional (Admin)
- **Financial & Statistics**: Analitik *real-time* tentang pendapatan masuk dan demografi pasien.
- **Inventory Ledger**: Pemantauan stok *skincare* dan obat, notifikasi batas minimum stok, serta kemampuan estimasi valuasi aset.
- **Services & Products Catalog**: Modul untuk manajer mengatur harga dasar, durasi tindakan, dan diskon promo tindakan medis.
- **Specialists Management**: Pengaturan daftar dokter, kredensial, dan jadwal spesifik.
- **PDF Exporting**: Pengeksporan laporan (*Inventory*, *Financial*) menjadi format PDF dengan standar dokumen *printable* (dilengkapi *letterhead* dan *signature placeholder*).

## 4. Spesifikasi Teknis
- **UI/UX Design**: Mengusung arsitektur "Glassmorphism" dengan kombinasi warna monokrom mewah (Slate/White/Black) dan desain responsif (Mobile-first).
- **Performa Server**: Memanfaatkan Next.js 16 (App Router) menggunakan strategi rendering `force-dynamic` pada modul yang krusial untuk kestabilan server di Vercel, dikombinasikan dengan React Server Components.
- **Data Fetching**: Komunikasi asinkron via *Supabase Javascript Client* dengan struktur relasional di PostgreSQL.

## 5. Parameter Kesuksesan (Success Metrics)
- Penurunan waktu administratif staf dalam mengatur janji temu pasien (Target: < 2 menit per *booking*).
- Nol kejadian kesalahan jadwal (*zero overlapping appointments*).
- 100% *Uptime* proses build dan deployment tanpa *prerender error*.
