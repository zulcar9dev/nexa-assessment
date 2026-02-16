# Aplikasi Kredit Konsumer BNI (Web Based)

Aplikasi berbasis web untuk mempermudah proses input, validasi, perhitungan kelayakan kredit (RPC/DSR), dan pembuatan dokumen (Surat/Laporan) secara otomatis untuk produk Kredit Pensiun (Fleksi Purna & Prapurna).

Dibangun dengan **Next.js + TypeScript + Prisma**, aplikasi ini dirancang untuk efisiensi operasional dengan antarmuka yang ramah pengguna dan fitur validasi risiko terintegrasi.

---

## 🚀 Fitur Utama

- **Autentikasi & Otorisasi**: Sistem login dengan NextAuth.js, mendukung role ADMIN dan USER.
- **Manajemen Debitur**: Input data debitur Prapurna dan Purna dengan formulir yang dinamis.
- **Kalkulator Kredit Real-time**:
  - Perhitungan angsuran (PMT) otomatis.
  - Validasi **DSR (Debt Service Ratio)** dengan batas maksimal 90% (Hard Block).
  - Perhitungan biaya (Provisi, Admin, dll) otomatis.
- **Generate Dokumen Otomatis**: Menghasilkan file `.docx` siap cetak berdasarkan template yang bisa diatur.
- **Riwayat & Pencarian**: Filter data berdasarkan Nama, NIK, Jenis Pengajuan (Baru/TopUp/TakeOver), dan Segmentasi (Taspen/Asabri).
- **Manajemen Template**: Admin dapat mengganti file template `.docx` langsung dari aplikasi.
- **UI Modern**: Tema BNI dengan dark mode support menggunakan TailwindCSS.

---

## 🛠️ Teknologi yang Digunakan

| Layer                   | Teknologi                   |
| ----------------------- | --------------------------- |
| **Framework**           | Next.js 16.1.1 (App Router) |
| **Language**            | TypeScript 5.x              |
| **Database**            | PostgreSQL (via Prisma ORM) |
| **Auth**                | NextAuth.js v4              |
| **Styling**             | TailwindCSS 4.x             |
| **State Management**    | Zustand 5.x                 |
| **Document Generation** | docxtemplater + PizZip      |
| **Validation**          | Zod 4.x                     |
| **Icons**               | Lucide React                |
| **Runtime**             | React 19.2.3                |

---

## 📂 Struktur Folder Proyek

```text
APP_KREDIT_KONSUMER_BNI/
├── .github/                     # GitHub workflows & configurations
├── backups/                     # Database backup files (gitignored)
├── frontend/                    # Aplikasi Next.js utama
│   ├── prisma/
│   │   └── schema.prisma        # Database schema
│   ├── public/                  # Static assets
│   ├── scripts/                 # Database seeding scripts
│   ├── src/
│   │   ├── app/                 # Next.js App Router pages
│   │   │   ├── (auth)/          # Login page
│   │   │   ├── (dashboard)/     # Dashboard, form, debitur pages
│   │   │   └── api/             # API routes
│   │   ├── backend/             # Backend services & lib
│   │   ├── components/          # React components
│   │   ├── hooks/               # Custom React hooks
│   │   ├── lib/                 # Utility libraries
│   │   ├── stores/              # Zustand stores
│   │   └── types/               # TypeScript types
│   ├── templates/               # Template DOCX untuk generate dokumen
│   ├── .env.example             # Template environment variables
│   └── package.json
├── scripts/                     # Utility scripts
│   ├── backup-db.bat            # Backup database (Windows)
│   ├── backup-db.sh             # Backup database (Linux)
│   ├── restore-db.bat           # Restore database (Windows)
│   ├── restore-db.sh            # Restore database (Linux)
│   └── sync-to-pc.bat           # Sinkronisasi database antar PC
├── tools/                       # Portable development tools
│   ├── node-v*/                 # Portable Node.js
│   └── pgsql/                   # Portable PostgreSQL
├── run-app.bat                  # Menjalankan aplikasi (portable)
├── setup-db.bat                 # Setup database pertama kali
└── README.md
```

---

## ⚙️ Cara Instalasi & Menjalankan Aplikasi

### Opsi 1: Setup PC Baru (Pertama Kali)

Untuk menjalankan aplikasi di PC baru yang belum pernah di-setup:

```bash
# 1. Inisialisasi database (hanya sekali)
setup-db.bat

# 2. Jalankan aplikasi
run-app.bat
```

`setup-db.bat` akan otomatis:
- Inisialisasi PostgreSQL data directory
- Membuat user dan database
- Install dependencies (npm install)
- Menjalankan migration dan seed data awal

### Opsi 2: Menjalankan Aplikasi (Sudah Ter-setup)

```bash
run-app.bat
```

Script ini akan otomatis:
- Mendeteksi versi Node.js yang tersedia di `tools/`
- Memulai PostgreSQL jika belum berjalan
- Menyalin `.env.example` → `.env` jika belum ada
- Menjalankan migration database
- Menjalankan seed jika database kosong
- Memulai development server di `http://localhost:3000`

### Opsi 3: Instalasi Manual

#### 1. Prasyarat

- **Node.js** versi 18.x atau lebih baru
- **PostgreSQL** untuk database

#### 2. Clone & Install Dependencies

```bash
# Clone repository
git clone <repository-url>
cd app_kredit_konsumer_bni/frontend

# Install dependencies
npm install
```

#### 3. Setup Environment

Buat file `.env` di folder `frontend/`:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/kredit_konsumer"

# NextAuth
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

#### 4. Setup Database

```bash
# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate

# (Optional) Seed initial data
npm run db:seed
```

#### 5. Jalankan Aplikasi

```bash
# Development mode
npm run dev
```

Aplikasi akan berjalan di `http://localhost:3000`

---

## 🔄 Sinkronisasi Database Antar PC

Untuk memindahkan database dari satu PC ke PC lainnya (misal: laptop kantor → PC pribadi):

### Di PC Sumber (Laptop Kantor):

```bash
# Pastikan aplikasi/PostgreSQL berjalan, lalu:
scripts\sync-to-pc.bat
# Pilih: 1 (EXPORT)
# File backup akan dibuat di folder backups\
```

### Pindahkan File:

Copy file `.sql` dari folder `backups\` ke PC tujuan (via flashdisk, cloud, dll).

### Di PC Tujuan (PC Pribadi):

```bash
# Letakkan file .sql di folder backups\
# Pastikan PostgreSQL berjalan (jalankan run-app.bat dulu), lalu:
scripts\sync-to-pc.bat
# Pilih: 2 (IMPORT)
```

### Backup & Restore Manual:

```bash
# Backup
scripts\backup-db.bat

# Restore
scripts\restore-db.bat
```

---

## 📖 Panduan Penggunaan

1. **Login**: Masuk dengan akun yang sudah terdaftar.
2. **Dashboard**: Pilih jenis produk kredit (Prapurna/Purna) untuk memulai input.
3. **Formulir Input**:
   - Isi data sesuai tab (Data Pribadi, Data Kredit, dll).
   - **Perhatian**: Jika DSR > 90%, sistem akan menolak penyimpanan data.
   - Gunakan fitur **Preview** untuk mengecek data sebelum disimpan.
4. **Riwayat Debitur**:
   - Gunakan filter untuk mencari debitur.
   - Klik tombol **Download** untuk mengunduh dokumen Word.
   - Klik tombol **Edit** untuk mengubah data.
5. **Admin (Kelola Template)**:
   - Akses menu khusus Admin untuk mengelola template dokumen.

**Login Credentials (Default):**
| Role  | Email              | Password |
|-------|--------------------|----------|
| Admin | admin@bni.co.id    | admin123 |
| User  | user@bni.co.id     | user123  |

---

## 🔧 Script yang Tersedia

### Launcher Scripts (Root)

| Script          | Keterangan                                      |
| --------------- | ----------------------------------------------- |
| `run-app.bat`   | Jalankan aplikasi (portable mode)               |
| `setup-db.bat`  | Inisialisasi database untuk PC baru             |

### Database Scripts (`scripts/`)

| Script              | Keterangan                                |
| ------------------- | ----------------------------------------- |
| `backup-db.bat`     | Backup database ke file .sql              |
| `restore-db.bat`    | Restore database dari file backup         |
| `sync-to-pc.bat`    | Export/Import database antar PC            |

### NPM Scripts (`frontend/`)

| Script                | Keterangan                            |
| --------------------- | ------------------------------------- |
| `npm run dev`         | Jalankan development server           |
| `npm run build`       | Build untuk production                |
| `npm run start`       | Jalankan production server            |
| `npm run lint`        | Jalankan ESLint                       |
| `npm run db:generate` | Generate Prisma client                |
| `npm run db:migrate`  | Jalankan database migration           |
| `npm run db:push`     | Push schema ke database tanpa migrasi |
| `npm run db:seed`     | Seed data awal ke database            |
| `npm run db:studio`   | Buka Prisma Studio (GUI database)     |

---

## ❓ Troubleshooting

### PostgreSQL gagal start
- Cek log di `tools/pgsql/log.txt`
- Pastikan port 5432 tidak digunakan aplikasi lain
- Jika data corrupt, hapus folder `tools/pgsql/data/` dan jalankan `setup-db.bat` ulang

### npm install gagal
- Pastikan Node.js terdeteksi: jalankan `tools\node-*\node.exe --version`
- Hapus folder `frontend/node_modules` dan coba lagi
- Jika di laptop kantor, pastikan tidak ada proxy/firewall yang memblokir npm

### Database kosong setelah restore
- Pastikan file `.sql` tidak corrupt (buka dengan text editor, cek isinya)
- Pastikan PostgreSQL berjalan saat menjalankan restore
- Coba jalankan manual: `tools\pgsql\bin\psql.exe -U bni_user -d bni_kredit_konsumer -f backups\namafile.sql`

### Aplikasi error "Cannot connect to database"
- Pastikan PostgreSQL berjalan (`tools\pgsql\bin\pg_isready.exe -h localhost -p 5432`)
- Cek file `frontend/.env` — pastikan `DATABASE_URL` sesuai
- Pastikan user `bni_user` dan database `bni_kredit_konsumer` sudah dibuat

---

## 📝 Lisensi & Kredit

**Dikembangkan untuk:** BNI (Internal Use)  
**Tahun:** 2024/2025
