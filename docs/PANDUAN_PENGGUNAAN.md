# 📖 Panduan Lengkap - Aplikasi Kredit Konsumer BNI

> **Versi:** 1.1.0  
> **Terakhir Diperbarui:** Februari 2026  
> **Platform:** Windows 11 (Mode Portable)

---

## Daftar Isi

1. [Pendahuluan](#-pendahuluan)
2. [Persyaratan Sistem](#-persyaratan-sistem)
3. [Setup PC Baru (Pertama Kali)](#-setup-pc-baru-pertama-kali)
4. [Menjalankan Aplikasi (Sehari-hari)](#-menjalankan-aplikasi-sehari-hari)
5. [Migrasi Database Antar PC](#-migrasi-database-antar-pc)
6. [Backup & Restore Database](#-backup--restore-database)
7. [Panduan Penggunaan Aplikasi](#-panduan-penggunaan-aplikasi)
8. [Manajemen Template Dokumen](#-manajemen-template-dokumen)
9. [Upgrade Node.js](#-upgrade-nodejs)
10. [Troubleshooting](#-troubleshooting)
11. [FAQ](#-faq)

---

## 📌 Pendahuluan

Aplikasi Kredit Konsumer BNI adalah aplikasi web internal untuk memproses pengajuan kredit pensiun (Fleksi Purna & Prapurna). Aplikasi ini berjalan secara **portable** — artinya tidak perlu menginstal software apapun di komputer. Semua tools (Node.js dan PostgreSQL) sudah tersedia di dalam folder project.

### Arsitektur Aplikasi

```
┌─────────────────────────────────────────────────┐
│                   Browser                        │
│            http://localhost:3000                  │
└────────────────────┬────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────┐
│           Next.js Application (Frontend)         │
│  ┌──────────┐  ┌──────────┐  ┌───────────────┐ │
│  │  Login    │  │Dashboard │  │  Form Input   │ │
│  │  Page     │  │  Page    │  │  Debitur      │ │
│  └──────────┘  └──────────┘  └───────────────┘ │
│  ┌──────────┐  ┌──────────┐  ┌───────────────┐ │
│  │  API     │  │ Generate │  │  Riwayat      │ │
│  │  Routes  │  │ Dokumen  │  │  Debitur      │ │
│  └──────────┘  └──────────┘  └───────────────┘ │
└────────────────────┬────────────────────────────┘
                     │
┌─────────────────────────────────────────────────┐
│         PostgreSQL Database (Portable)           │
│         Port: 5433                               │
│         Database: bni_kredit_konsumer            │
└─────────────────────────────────────────────────┘
```

---

## 💻 Persyaratan Sistem

| Item | Minimum |
|------|---------|
| **OS** | Windows 10 / 11 (64-bit) |
| **RAM** | 4 GB (disarankan 8 GB) |
| **Storage** | ~500 MB ruang kosong |
| **Browser** | Chrome, Edge, atau Firefox terbaru |
| **Instalasi** | **Tidak diperlukan** |

> ⚠️ **Catatan:** Aplikasi ini sepenuhnya portable. Tidak membutuhkan hak Administrator atau instalasi software apapun.

---

## 🆕 Setup PC Baru (Pertama Kali)

### Opsi Utama: Setup Otomatis dari Git Clone (Direkomendasikan)

Jika Anda mendapatkan aplikasi ini dari Git, folder `tools/pgsql/` dan `tools/node-*` tidak akan ikut tersimpan karena ukurannya yang besar. Untuk men-setup lingkungan:

1. **Jalankan script setup utama**:
   ```text
   Klik 2x pada: setup.bat
   ```
   Script ini akan otomatis mengunduh **Node.js v24.16.0 LTS** dan **PostgreSQL v17.10**, mengekstraknya ke folder `tools/`, serta menginisialisasi database dari awal (termasuk instalasi dependencies via internet).
   *Catatan: Pastikan Anda terhubung ke internet saat pertama kali menjalankan setup.*

2. **Jalankan aplikasi**:
   ```text
   Klik 2x pada: run-app.bat
   ```

3. **Buka di Browser**:
   Akses **`http://localhost:3000`** di browser Anda.

### Opsi 2: Setup dari Salinan Folder Lengkap (Offline)

Jika memindahkan aplikasi secara offline via Flashdisk, Anda dapat menyalin seluruh folder project (pastikan file ZIP/installer pendukung di folder `tools/downloads/` ikut disalin agar tidak perlu mengunduh ulang):

```
📁 app_kredit_konsumer_bni/
├── 📁 frontend/          ← Kode aplikasi
├── 📁 tools/
│   └── 📁 downloads/     ← Cache file ZIP tools (opsional)
├── 📁 scripts/           ← Script pembantu
├── 📄 setup.bat          ← Setup utama (auto-download + db)
├── 📄 run-app.bat        ← Launcher utama aplikasi
├── 📄 setup-db.bat       ← Inisialisasi database saja
└── 📄 README.md
```

Jalankan `setup.bat` untuk memverifikasi tools dan inisialisasi database lokal, lalu jalankan `run-app.bat`.

### Akun Login Default

Gunakan kredensial berikut untuk masuk pertama kali:

| Role | Email | Password |
|------|-------|----------|
| **Admin** | `admin@bni.co.id` | `admin123` |
| **User** | `user@bni.co.id` | `user123` |

---

## ▶️ Menjalankan Aplikasi (Sehari-hari)

Setelah setup pertama kali, untuk penggunaan sehari-hari cukup:

```
Klik 2x pada: run-app.bat
```

### Apa yang Terjadi Saat `run-app.bat` Dijalankan?

```
1. Mendeteksi Node.js dari folder tools/
2. Memulai PostgreSQL (jika belum jalan)
3. Memeriksa file .env
4. Memeriksa dependencies (node_modules)
5. Generate Prisma Client
6. Menjalankan database migration (jika ada perubahan schema)
7. Memeriksa apakah database perlu di-seed
8. Memulai development server → http://localhost:3000
```

### Menghentikan Aplikasi

1. Tekan `Ctrl + C` di jendela command prompt
2. Akan muncul pertanyaan: *"Apakah ingin menghentikan PostgreSQL juga?"*
   - Ketik `Y` lalu Enter → PostgreSQL juga berhenti
   - Ketik `N` lalu Enter → PostgreSQL tetap berjalan di background

> 💡 **Tips:** Jika PostgreSQL tetap berjalan, aplikasi akan lebih cepat start di percobaan berikutnya.

---

## 🔄 Migrasi Database Antar PC

Gunakan fitur ini untuk memindahkan **seluruh data** dari satu PC ke PC lainnya.

### Skenario Umum

```
Laptop Kantor (data asli)  ──→  PC Pribadi (data salinan)
```

### Langkah-Langkah

#### A. Di PC Sumber (contoh: Laptop Kantor)

**Prasyarat:** Aplikasi/PostgreSQL harus sudah berjalan. Jika belum, jalankan `run-app.bat` dahulu.

1. Buka **Command Prompt baru** (jangan tutup `run-app.bat`)
2. Navigasi ke folder project:
   ```
   cd C:\path\ke\app_kredit_konsumer_bni-main
   ```
3. Jalankan script sync:
   ```
   scripts\sync-to-pc.bat
   ```
4. Pilih **1 (EXPORT)**
5. Tunggu proses selesai
6. File backup akan tersimpan di folder `backups\` dengan format:
   ```
   backups\sync_20260216_1030.sql
   ```

#### B. Pindahkan File

Copy file `.sql` dari folder `backups\` ke PC tujuan menggunakan:
- Flashdisk
- Email
- Cloud storage
- Transfer jaringan lokal

Letakkan di folder `backups\` di PC tujuan:
```
app_kredit_konsumer_bni-main\backups\sync_20260216_1030.sql
```

#### C. Di PC Tujuan (contoh: PC Pribadi)

**Prasyarat:** Setup PC sudah dilakukan dan PostgreSQL harus berjalan.

1. Jalankan `run-app.bat` jika belum (untuk start PostgreSQL)
2. Buka **Command Prompt baru**
3. Navigasi ke folder project:
   ```
   cd C:\path\ke\app_kredit_konsumer_bni-main
   ```
4. Jalankan script sync:
   ```
   scripts\sync-to-pc.bat
   ```
5. Pilih **2 (IMPORT)**
6. Masukkan nama file (contoh: `sync_20260216_1030.sql`)
7. Konfirmasi dengan `Y`
8. Tunggu proses selesai

> ⚠️ **Perhatian:** Import akan **menghapus semua data** yang ada di database tujuan dan menggantinya dengan data dari file backup!

---

## 💾 Backup & Restore Database

### Backup (Menyimpan Data)

Direkomendasikan untuk backup secara berkala agar data tidak hilang.

1. Pastikan PostgreSQL berjalan (aplikasi sedang aktif)
2. Buka **Command Prompt baru**
3. Jalankan:
   ```
   cd C:\path\ke\app_kredit_konsumer_bni-main
   scripts\backup-db.bat
   ```
4. File backup tersimpan di folder `backups\`

### Restore (Memulihkan Data)

1. Pastikan PostgreSQL berjalan
2. Letakkan file `.sql` di folder `backups\`
3. Jalankan:
   ```
   cd C:\path\ke\app_kredit_konsumer_bni-main
   scripts\restore-db.bat
   ```
4. Pilih file backup yang ingin di-restore
5. Konfirmasi dengan `Y`

> ⚠️ **Perhatian:** Restore akan menghapus semua data yang ada dan menggantinya!

### Jadwal Backup yang Disarankan

| Frekuensi | Kondisi |
|-----------|---------|
| **Harian** | Jika ada input data baru setiap hari |
| **Mingguan** | Jika penggunaan moderat |
| **Sebelum migrasi** | Selalu backup sebelum pindah ke PC lain |

---

## 📋 Panduan Penggunaan Aplikasi

### Login

1. Buka `http://localhost:3000` di browser
2. Masukkan email dan password
3. Klik **Login**

### Dashboard

Setelah login, Anda akan melihat dashboard dengan:
- Ringkasan jumlah debitur
- Akses cepat ke formulir input
- Menu navigasi di sidebar

### Input Data Debitur Baru

1. Dari dashboard, klik **Input Debitur Baru** atau pilih dari menu
2. Pilih kategori: **Prapurna** atau **Purna**
3. Isi formulir berdasarkan tab-tab yang tersedia:
   - **Data Pribadi** — nama, NIK, alamat, dll
   - **Data Kredit** — plafon, jangka waktu, bunga
   - **Data Penghasilan** — gaji, tunjangan
4. Sistem akan otomatis menghitung:
   - Angsuran per bulan (PMT)
   - DSR (Debt Service Ratio)
   - Biaya-biaya (Provisi, Admin, dll)

> ⚠️ **Aturan DSR:** Jika DSR melebihi **90%**, sistem akan **menolak** penyimpanan data (Hard Block).

5. Gunakan tombol **Preview** untuk mengecek data
6. Klik **Simpan** untuk menyimpan data

### Riwayat Debitur

1. Buka menu **Riwayat Debitur**
2. Gunakan filter untuk mencari:
   - Nama pemohon
   - NIK
   - Jenis pengajuan (Baru/TopUp/TakeOver)
   - Segmentasi (Taspen/Asabri)
3. Aksi yang tersedia:
   - 📥 **Download** — unduh dokumen Word (.docx) yang sudah di-generate
   - ✏️ **Edit** — ubah data debitur
   - 🔍 **Detail** — lihat detail lengkap

### Generate Dokumen

Dokumen Word (.docx) di-generate secara otomatis berdasarkan template yang telah dikonfigurasi. Setiap kategori (Prapurna/Purna/Aktif) memiliki template masing-masing.

---

## 📄 Manajemen Template Dokumen

> Fitur ini hanya tersedia untuk user dengan role **ADMIN**.

### Melihat Template

1. Login sebagai Admin
2. Buka menu **Kelola Template**
3. Daftar template akan ditampilkan per kategori

### Mengganti Template

1. Di halaman Kelola Template, klik **Upload** pada kategori yang diinginkan
2. Pilih file `.docx` baru
3. Template lama akan digantikan

### Lokasi File Template

Template .docx tersimpan di:
```
frontend/templates/
├── template_prapurna.docx
├── template_purna.docx
└── template_aktif.docx
```

---

## ⬆️ Upgrade Node.js

Jika perlu mengupgrade versi Node.js:

1. Download versi baru Node.js **portable** (ZIP/binary) dari https://nodejs.org
2. Pilih versi **Windows Binary (.zip)** 64-bit
3. Extract ke folder `tools/`:
   ```
    tools/node-v26.0.0-win-x64/    ← folder baru
    ```
4. (Opsional) Hapus folder Node.js lama:
   ```
   tools/node-v24.16.0-win-x64/   ← bisa dihapus
   ```
5. Jalankan `run-app.bat` — Node.js baru akan otomatis terdeteksi

> 💡 **Tips:** Script `run-app.bat` mendeteksi folder `tools/node-*` secara dinamis, jadi tidak perlu edit script apapun saat upgrade.

---

## ❓ Troubleshooting

### 1. PostgreSQL Gagal Start

**Gejala:** Muncul `[ERROR] Gagal memulai PostgreSQL!`

**Solusi:**
1. Cek log di `tools\pgsql\log.txt`
2. Pastikan port 5433 tidak digunakan aplikasi lain:
   ```
   netstat -ano | findstr :5433
   ```
3. Jika ada proses yang menggunakan port 5433, hentikan proses tersebut
4. Jika data corrupt:
   - Backup data penting terlebih dahulu
   - Hapus folder `tools\pgsql\data\`
   - Jalankan `setup.bat` ulang

### 2. npm install Gagal

**Gejala:** Muncul `[ERROR] npm install gagal!`

**Solusi:**
1. Pastikan ada koneksi internet (untuk download dependencies pertama kali)
2. Jika di jaringan kantor dengan proxy:
   ```
   tools\node-v24.16.0-win-x64\npm.cmd config set proxy http://proxy-server:port
   tools\node-v24.16.0-win-x64\npm.cmd config set https-proxy http://proxy-server:port
   ```
3. Coba hapus folder `frontend\node_modules` dan jalankan ulang
4. Jika disk penuh, kosongkan ruang dan coba lagi

### 3. "Cannot Connect to Database"

**Gejala:** Aplikasi error saat dibuka di browser

**Solusi:**
1. Pastikan PostgreSQL berjalan di port 5433:
   ```
   pg_isready -h localhost -p 5433
   ```
2. Cek file `frontend\.env` — pastikan `DATABASE_URL` benar (menggunakan port 5433):
   ```
   DATABASE_URL="postgresql://bni_user:bni_password@localhost:5433/bni_kredit_konsumer?schema=public"
   ```
3. Pastikan database sudah dibuat:
   ```
   psql -h localhost -p 5433 -U postgres -l
   ```
   Cari `bni_kredit_konsumer` di daftar

### 4. Halaman Muncul Tapi Kosong / Error

**Gejala:** Browser bisa akses `localhost:3000` tapi ada error

**Solusi:**
1. Buka Developer Tools browser (F12) → tab Console
2. Jika error terkait database, jalankan migration ulang:
   ```
   cd frontend
   npx prisma migrate deploy
   ```
3. Jika error terkait dependencies, install ulang:
   ```
   cd frontend
   del /s /q node_modules
   npm install
   ```

### 5. Port 3000 Sudah Digunakan

**Gejala:** `Error: listen EADDRINUSE: address already in use :::3000`

**Solusi:**
1. Cari proses yang menggunakan port 3000:
   ```
   netstat -ano | findstr :3000
   ```
2. Hentikan proses tersebut (catat PID dari output di atas):
   ```
   taskkill /PID <nomor-pid> /F
   ```
3. Jalankan `run-app.bat` ulang

### 6. Database Kosong Setelah Restore

**Gejala:** Login berhasil tapi tidak ada data debitur

**Solusi:**
1. Pastikan file `.sql` tidak corrupt — buka dengan Notepad, cek isinya ada SQL statements
2. Coba restore manual (port 5433):
   ```
   psql -h localhost -p 5433 -U bni_user -d bni_kredit_konsumer -f backups\namafile.sql
   ```
3. Perhatikan pesan error yang muncul

---

## ❓ FAQ

### Q: Apakah saya perlu menginstal sesuatu?
**A:** Tidak. Aplikasi ini sepenuhnya portable. Node.js dan PostgreSQL sudah tersedia di folder `tools/`.

### Q: Apakah data aman jika PC mati mendadak?
**A:** PostgreSQL memiliki mekanisme WAL (Write-Ahead Logging) yang melindungi data dari crash. Namun, tetap disarankan untuk backup berkala.

### Q: Bagaimana cara menambahkan user baru?
**A:** Login sebagai Admin → kelola user dari panel admin. Atau edit `frontend/scripts/seed.ts` dan jalankan `npx prisma db seed`.

### Q: Bisa diakses dari komputer lain di jaringan yang sama?
**A:** Secara default hanya bisa diakses dari `localhost`. Untuk akses jaringan, edit file `frontend/.env`:
```
NEXTAUTH_URL="http://IP-KOMPUTER-ANDA:3000"
```
Dan jalankan dengan:
```
cd frontend
npx next dev -H 0.0.0.0
```

### Q: Berapa besar folder project?
**A:** Sekitar 300-500 MB setelah ter-setup (termasuk tools portable dan node_modules). Namun sebelum setup, ukuran repository sangat kecil (~2 MB) karena binary tools diabaikan oleh Git.

### Q: Apakah perlu koneksi internet?
**A:** Koneksi internet hanya dibutuhkan saat pertama kali menjalankan `setup.bat` (atau `setup.sh`) untuk mengunduh tools pendukung (Node.js & PostgreSQL) dan menginstal dependencies NPM. File unduhan tools akan di-cache di `tools/downloads/` sehingga setup berikutnya atau setup di PC lain yang menyertakan folder cache tersebut bisa dilakukan secara offline. Setelah setup selesai, aplikasi berjalan sepenuhnya offline.

---

## 📞 Bantuan

Jika mengalami masalah yang tidak tercantum di panduan ini:
1. Cek file log PostgreSQL: `tools\pgsql\log.txt`
2. Cek output error di command prompt saat menjalankan `run-app.bat`
3. Hubungi tim pengembang
