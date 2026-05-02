# LOGIKA KLINIK KECANTIKAN

## 1. OVERVIEW SISTEM

```
KLINIK KECANTIKAN
├── Manajemen Pelanggan
├── Layanan & Treatment
├── Booking & Reservasi
├── Pembayaran & Invoice
├── Manajemen Terapis
├── Inventory & Supply
├── Laporan & Analitik
└── Marketing & CRM
```

---

## 2. ALUR UTAMA PELANGGAN

### 2.1 Customer Journey

```
PELANGGAN BARU
    ↓
1. Pendaftaran/Registrasi
    ↓
2. Konsultasi Awal (Free/Berbayar)
    ↓
3. Diagnosa & Rekomendasi Treatment
    ↓
4. Membuat Treatment Plan
    ↓
5. Booking Jadwal
    ↓
6. Pembayaran (DP/Lunas)
    ↓
7. Perawatan/Treatment
    ↓
8. Evaluasi & Follow-up
    ↓
PELANGGAN LOYAL → Program Member → Repeat Treatment
```

---

## 3. MODUL SISTEM

### 3.1 MANAJEMEN PELANGGAN

**Data Pelanggan:**

- ID Pelanggan (Unique)
- Nama Lengkap
- Nomor Telepon/WhatsApp
- Email
- Alamat
- Jenis Kelamin
- Tanggal Lahir
- Tipe Kulit
- Alergi & Kondisi Kesehatan
- Riwayat Treatment
- Tanggal Registrasi
- Status Member

**Segmentasi Pelanggan:**

```
- VIP (Transaksi > 10 juta/tahun)
- Regular (Transaksi 3-10 juta/tahun)
- New (Pelanggan < 6 bulan)
- Inactive (Tidak ada transaksi > 6 bulan)
```

---

### 3.2 MANAJEMEN LAYANAN/TREATMENT

**Kategori Layanan:**

| Kategori            | Contoh Treatment                         | Durasi     | Harga      |
| ------------------- | ---------------------------------------- | ---------- | ---------- |
| **Facial**          | Facial Dasar, Hydrafacial, Chemical Peel | 45-90 min  | 500K-2jt   |
| **Peeling & Scrub** | Microdermabrasion, Laser Peeling         | 60 min     | 1-3jt      |
| **Hair Removal**    | Waxing, Laser Hair Removal               | 30-90 min  | 200K-2jt   |
| **Body Spa**        | Massage, Body Scrub, Body Treatment      | 60-120 min | 500K-2jt   |
| **Skincare**        | Creambath, Facial Massage                | 45-60 min  | 300K-1jt   |
| **Make-up**         | Make-up Artistry, Bridal Make-up         | 60-120 min | 400K-1.5jt |
| **Nail Care**       | Manicure, Pedicure, Nail Art             | 30-60 min  | 150K-500K  |

**Data Treatment:**

```
ID Treatment
├── Nama Treatment
├── Kategori
├── Deskripsi
├── Durasi (menit)
├── Harga
├── Terapis yang Diperlukan
├── Material/Supply yang Digunakan
├── Kontra Indikasi
└── Package (Bisa digabung)
```

---

### 3.3 BOOKING & RESERVASI

**Status Booking:**

```
1. PENDING → Espera konfirmasi
2. CONFIRMED → Sudah dikonfirmasi
3. REMINDER SENT → Pengingat sudah dikirim
4. COMPLETED → Sudah selesai
5. CANCELLED → Dibatalkan
6. NO SHOW → Tidak datang
```

**Logika Booking:**

```
PELANGGAN BOOKING
    ↓
1. Pilih Tanggal & Jam (Cek Ketersediaan)
    ↓
2. Pilih Treatment & Terapis
    ↓
3. Konfirmasi Detail & Harga
    ↓
4. Sistem Cek Konflik Jadwal Terapis
    ↓
    Tersedia? → YES → CONFIRMED
           ↓ NO → Tawarkan Alternatif
    ↓
5. Jadwal Booking Disimpan
    ↓
6. Send Reminder (H-1, H-Hari)
    ↓
7. Pelanggan Datang & Treatment Dimulai
```

**Aturan Booking:**

- Minimal booking 24 jam sebelumnya
- Maksimal booking 3 bulan ke depan
- Satu terapis tidak bisa 2 treatment sekaligus
- Istirahat antar treatment minimum 15 menit
- Jam operasional: 09:00 - 21:00 (Senin-Minggu)

---

### 3.4 SISTEM PEMBAYARAN

**Metode Pembayaran:**

```
1. Cash (Tunai)
2. Debit/Kartu Kredit
3. Transfer Bank
4. E-Wallet (GCash, OVO, Dana, dll)
5. Cicilan (cicilan 0%)
6. Member Point/Balance
```

**Alur Pembayaran:**

```
TREATMENT SELESAI
    ↓
GENERATE INVOICE
    ↓
PILIH METODE PEMBAYARAN
    ↓
    Bayar Penuh → Receipt + Poin Member
    Cicilan → Cicilan Schedule + Reminder
    Member Point → Kurangi Balance
    ↓
KONFIRMASI PEMBAYARAN
    ↓
RECEIPT PRINTED/EMAIL
```

**Diskon & Promo:**

```
- Diskon Member: 10-20%
- Diskon Pertama Kali: 15%
- Bundle Package: 15-25%
- Referral Program: Diskon untuk Referrer & Referee
- Seasonal Promo: Flash Sale, Member Day
- Loyalty Points: 1% dari setiap transaksi
```

---

### 3.5 MANAJEMEN TERAPIS

**Data Terapis:**

```
ID Terapis
├── Nama Lengkap
├── No. Telepon
├── Email
├── Alamat
├── Sertifikasi/Lisensi
├── Spesialisasi (Treatment)
├── Jadwal Kerja
├── Status (Aktif/Cuti/Resign)
├── Rating & Review
├── Gaji/Commission
└── Dokumen (SIM, KTP, Foto, dll)
```

**Sistem Rating Terapis:**

```
Setelah Treatment Selesai
    ↓
PELANGGAN BERI RATING (1-5 bintang)
    ↓
RATING TERAPIS TERUPDATE
    ↓
Target Rating: Minimum 4.0 bintang
    ↓
Reward/Bonus untuk Rating Tinggi
    ↓
Coaching/Training untuk Rating Rendah
```

**Penjadwalan Terapis:**

```
1. Setiap Terapis Punya Jadwal Kerja
2. Hari Libur Per Terapis
3. Cuti Tahunan Diatur di Awal Tahun
4. Sistem Otomatis Block Jadwal jika Ada Booking
5. Sisa Waktu Terapis untuk Istirahat/Admin
```

---

### 3.6 INVENTORY & SUPPLY MANAGEMENT

**Kategori Inventory:**

```
1. PRODUK PERAWATAN
   - Skincare (Cleanser, Toner, Serum, dll)
   - Masker & Treatment
   - Sun Protection

2. ALAT/EQUIPMENT
   - Facial Machine
   - Laser Equipment
   - Massage Chair
   - Steamer
   - Dll

3. CONSUMABLES
   - Bed Sheet/Handuk
   - Kapas Pembersih
   - Applicator
   - Packaging

4. SUPPLIES LAINNYA
   - Pembersih Alat
   - Disinfektan
   - Stock Card
```

**Logika Inventory:**

```
TREATMENT DILAKUKAN
    ↓
CATAT MATERIAL YANG DIGUNAKAN
    ↓
KURANGI STOK INVENTORY
    ↓
STOK < MINIMAL THRESHOLD?
    ↓
    YES → AUTOMATIC PO (Purchase Order)
    NO → NORMAL
    ↓
SUPPLIER DELIVER
    ↓
UPDATE STOK
    ↓
CATATKAN KE LAPORAN BARANG MASUK
```

**Parameter Inventory:**

```
- Stock Awal
- Pembelian (Qty, Harga, Tanggal)
- Penggunaan (Treatment, Qty, Tanggal)
- Expired Date
- Stock Akhir
- Nilai Inventory
```

---

### 3.7 SISTEM LAPORAN & ANALITIK

**Dashboard Utama:**

```
KPI HARIAN:
├── Total Transaksi Hari Ini
├── Total Revenue
├── Jumlah Customer Hari Ini
├── Treatment Terlaku
├── Terapis dengan Revenue Tertinggi
└── Occupancy Rate (%)

KPI BULANAN:
├── Total Revenue
├── Jumlah Customer
├── Average Transaksi per Customer
├── Most Popular Treatment
├── Customer Retention Rate
├── Gross Profit
└── Net Profit

KPI TAHUNAN:
├── Annual Revenue
├── YoY Growth
├── Customer Lifetime Value
├── Total Customer
└── Market Analysis
```

**Laporan Penjualan:**

```
- Sales by Treatment Category
- Sales by Terapis
- Sales by Payment Method
- Sales by Time Period
- Peak Hours Analysis
```

**Laporan Pelanggan:**

```
- New Customer
- Repeat Customer
- Churn Customer
- VIP Customer
- Customer Lifetime Value
- Net Promoter Score (NPS)
```

**Laporan Keuangan:**

```
- Income Statement
- Cost Analysis
- Profit & Loss
- Cash Flow
- Budget vs Actual
```

---

## 4. WORKFLOW OPERASIONAL HARIAN

### 4.1 PRE-OPENING (Pukul 08:30)

```
1. Manager Cek Sistem
   - Lihat Booking Hari Ini
   - Konfirmasi Terapis Masuk
   - Cek Inventory Penting

2. Sterilisasi Alat & Area
   - Bersihkan Semua Equipment
   - Disinfektan Treatment Area
   - Setup Treatment Room

3. Terapis Tiba
   - Check In
   - Briefing Jadwal
   - Siapkan Personal Kit

4. Customer Service
   - Buka System
   - Siapkan Welcome Amenity
   - Cek Reminder Call Status
```

### 4.2 JAM OPERASIONAL (09:00 - 21:00)

```
PELANGGAN DATANG
    ↓
1. RECEPTION
   - Welcome
   - Cek Jadwal Booking
   - Isi/Update Data Pelanggan
   - Perkenalkan Terapis

2. KONSULTASI (jika baru)
   - Tanya Kondisi Kulit
   - Tanya Alergi
   - Tanya Ekspektasi
   - Rekomendasi Treatment

3. TREATMENT
   - Terapis Mulai Perawatan
   - Maintenance System
   - Monitor Kepuasan Pelanggan
   - Dokumentasi Foto (sebelum-sesudah)

4. EVALUASI HASIL
   - Lihat Hasil Treatment
   - Jelaskan Hasil
   - Rekomendasi Follow-up
   - Jadwalkan Treatment Berikutnya (jika ada)

5. PEMBAYARAN
   - Hitung Total
   - Pilih Metode Pembayaran
   - Proses Pembayaran
   - Berikan Receipt

6. FEEDBACK
   - Minta Rating
   - Tanya Kepuasan
   - Catat Komentar
   - Offer Loyalty Program

7. FOLLOW-UP
   - Kasih Care Instructions
   - Jadwalkan Next Appointment
   - Bagikan Produk Recommendation
```

### 4.3 POST-OPERATING (Pukul 21:00+)

```
1. Cleaning & Sterilisasi
   - Bersihkan Semua Alat
   - Buang Consumables
   - Sterilisasi Equipment

2. Stock Check
   - Cek Inventory Harian
   - Catat Pemakaian
   - Flag Item yang Habis

3. Daily Closing
   - Hitung Cash Register
   - Rekonsiliasi Transaksi
   - Backup Data System
   - Cek Booking Besok Hari

4. Terapis Closing
   - Check Out
   - Serahkan Commission/Gaji
   - Debrief Harian
```

---

## 5. SISTEM MEMBER

**Tipe Membership:**

```
1. BASIC MEMBER (Gratis)
   - Akses Info & Promo
   - Diskon 5%
   - Poin Loyalty 0.5%

2. SILVER MEMBER (Rp 500K)
   - Valid 1 Tahun
   - Diskon 10%
   - Poin Loyalty 1%
   - Priority Booking
   - Free Consultation

3. GOLD MEMBER (Rp 1.5jt)
   - Valid 1 Tahun
   - Diskon 15%
   - Poin Loyalty 2%
   - Priority Booking
   - Free Consultation + Follow-up
   - Birthday Voucher (Rp 300K)
   - Free 1 Treatment/Bulan

4. PLATINUM MEMBER (Rp 3jt)
   - Valid 1 Tahun
   - Diskon 20%
   - Poin Loyalty 3%
   - VIP Booking
   - Dedicated Terapis
   - Free 2 Treatment/Bulan
   - Birthday Voucher (Rp 500K)
   - Personal Consultation
```

**Loyalty Point System:**

```
1 Poin = Rp 100 (pembulatan)
Contoh:
- Member Basic: Transaksi Rp 1jt = 5.000 Poin (Rp 500K)
- Member Gold: Transaksi Rp 1jt = 20.000 Poin (Rp 2jt)

Point Bisa Digunakan Untuk:
- Diskon Transaksi
- Gratis Treatment
- Voucher
- Merchandise

Point Expired: 12 bulan dari tanggal earning
```

---

## 6. SISTEM CRM & MARKETING

**Campaign Management:**

```
1. GREETING CAMPAIGN
   - Birthday Greeting + Voucher
   - Member Anniversary

2. RETENTION CAMPAIGN
   - Inactive Customer Reactivation
   - Special Promo untuk Inactive
   - Follow-up Message

3. UPSELL CAMPAIGN
   - Package Bundle Recommendation
   - New Treatment Announcement
   - Seasonal Promotion

4. REFERRAL PROGRAM
   - Bonus untuk Referrer
   - Diskon untuk New Customer (Referee)
   - Tracking Referral
```

**Communication Channel:**

```
- WhatsApp (Reminder, Promo)
- Email (Newsletter, Treatment Plan)
- SMS (Urgent Alert)
- Social Media (Instagram, Facebook)
- In-App Notification
- Telepon Call
```

---

## 7. ALUR TRANSAKSI LENGKAP

```
┌─────────────────────────────────────────────────────┐
│           ALUR TRANSAKSI LENGKAP                    │
└─────────────────────────────────────────────────────┘

STEP 1: BOOKING
├─ Pelanggan Pilih Tanggal/Jam
├─ Pilih Treatment & Terapis
├─ System Validasi Ketersediaan
└─ Booking Confirmed

STEP 2: REMINDER
├─ H-7: Email Reminder
├─ H-3: WhatsApp Reminder
├─ H-1: Konfirmasi Final
└─ Hari H: 2 jam Sebelumnya

STEP 3: CHECK-IN
├─ Pelanggan Datang
├─ Reception Scan Booking
├─ Update Status Check-in
└─ Assign Treatment Room

STEP 4: PRE-TREATMENT
├─ Konsultasi Singkat
├─ Foto Kondisi Awal
├─ Jelaskan Alur Treatment
└─ Persiapan Treatment

STEP 5: TREATMENT EXECUTION
├─ Mulai Treatment Sesuai Jadwal
├─ Terapis Catat Proses
├─ Maintenance Alat
└─ Monitoring Klien

STEP 6: POST-TREATMENT
├─ Foto Hasil
├─ Evaluasi Hasil
├─ Care Instruction
└─ Rekomendasi Follow-up

STEP 7: CHECKOUT & PAYMENT
├─ Hitung Invoice
├─ Pilih Metode Bayar
├─ Proses Pembayaran
├─ Cek Saldo Point
└─ Apply Voucher/Diskon (jika ada)

STEP 8: FEEDBACK
├─ Rating Treatment (1-5)
├─ Rating Terapis (1-5)
├─ Komentar/Saran
└─ Preference untuk Next Visit

STEP 9: BOOKING FOLLOW-UP
├─ Tawarkan Next Appointment
├─ Input ke Kalender
├─ DP Payment (jika ada)
└─ Confirm Booking

STEP 10: POST-TRANSACTION
├─ Send Thank You Message
├─ Care Tips via WhatsApp
├─ Product Recommendation
├─ Update Customer Record
└─ Trigger Follow-up Campaign
```

---

## 8. SISTEM QUALITY ASSURANCE

**Quality Control Points:**

```
1. PRE-SERVICE QC
   ├─ Equipment Check
   ├─ Material Freshness
   ├─ Sterilization Verification
   └─ Staff Readiness

2. DURING-SERVICE QC
   ├─ Procedure Compliance
   ├─ Customer Comfort
   ├─ Hygiene Maintenance
   └─ Time Management

3. POST-SERVICE QC
   ├─ Result Verification
   ├─ Customer Satisfaction
   ├─ Documentation Accuracy
   └─ Equipment Cleaning
```

**KPI Kualitas:**

```
- Service Defect Rate: < 2%
- Customer Satisfaction: > 4.5/5
- Terapis Rating: > 4.0/5
- Repeat Customer Rate: > 60%
- Customer Complaint Resolution Time: < 48 jam
```

---

## 9. TEKNOLOGI & SISTEM IT

**Aplikasi Utama:**

```
1. POS System (Point of Sale)
   - Transaksi
   - Inventory
   - Laporan Penjualan

2. Appointment System
   - Booking Management
   - Jadwal Terapis
   - Reminder System

3. Customer Database
   - Data Pelanggan
   - Treatment History
   - Riwayat Pembayaran

4. Accounting System
   - Invoice
   - Financial Report
   - Expense Tracking

5. CRM System
   - Campaign Management
   - Customer Segmentation
   - Follow-up Automation

6. Mobile App
   - Self-Booking
   - Payment
   - Notification
   - Membership Card Digital
```

---

## 10. TROUBLESHOOTING & ESCALATION

**Masalah Umum & Solusi:**

| Masalah                 | Cause                              | Solution                           |
| ----------------------- | ---------------------------------- | ---------------------------------- |
| Pelanggan Tidak Puas    | Terapis Skill, Alat Rusak          | Redo Treatment / Refund / Voucher  |
| Keterlambatan Treatment | Terapis Late, Booking Overbook     | Apologize + Compensation           |
| Inventory Habis         | Misjudge Demand                    | Rush Order + Temporary Alternative |
| Payment Failed          | System Error, Insufficient Balance | Retry + Alternative Method         |
| Customer Complaint      | Berbagai Penyebab                  | Log + Investigate + Resolution     |

**Escalation Level:**

```
Level 1: Terapis/Staff → Immediate Resolution
Level 2: Supervisor → Discount/Voucher
Level 3: Manager → Refund/Redo Treatment
Level 4: Owner → Investigasi Mendalam
```

---

## 11. RINGKASAN PROSES BISNIS

```
KLINIK KECANTIKAN WORKFLOW:

┌─────────────┐
│   CUSTOMER  │
│   DATANG    │
└──────┬──────┘
       │
       ▼
┌────────────────┐
│  KONSULTASI &  │
│ REKOMENDASI    │
└──────┬─────────┘
       │
       ▼
┌────────────────┐
│    BOOKING     │
│  TREATMENT     │
└──────┬─────────┘
       │
       ▼
┌────────────────┐
│   PEMBAYARAN   │
│  (DP/Lunas)    │
└──────┬─────────┘
       │
       ▼
┌────────────────┐
│   TREATMENT    │
│   DILAKUKAN    │
└──────┬─────────┘
       │
       ▼
┌────────────────┐
│  EVALUASI      │
│  & RATING      │
└──────┬─────────┘
       │
       ▼
┌────────────────┐
│   FEEDBACK &   │
│   FOLLOW-UP    │
└──────┬─────────┘
       │
       ▼
┌────────────────┐
│ LOYALITAS      │
│ PROGRAM/REPEAT │
└────────────────┘
```

---

**SELESAI**

Dokumentasi ini mencakup semua aspek operasional klinik kecantikan dari customer journey, sistem manajemen, hingga quality assurance.
