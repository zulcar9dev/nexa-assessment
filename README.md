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
| **Framework**           | Next.js 16.x (App Router)   |
| **Language**            | TypeScript                  |
| **Database**            | PostgreSQL (via Prisma ORM) |
| **Auth**                | NextAuth.js v4              |
| **Styling**             | TailwindCSS 4               |
| **State Management**    | Zustand                     |
| **Document Generation** | docxtemplater + PizZip      |
| **Validation**          | Zod                         |
| **Icons**               | Lucide React                |

---

## 📂 Struktur Folder Proyek

```text
APP_KREDIT_KONSUMER_BNI/
├── docs/                        # Dokumentasi implementasi
│   ├── backend_implementation_plan.md
│   ├── frontend_implementation_plan.md
│   └── implementation_plan.md
├── frontend/                    # Aplikasi Next.js utama
│   ├── prisma/
│   │   ├── schema.prisma        # Database schema
│   │   └── migrations/          # Database migrations
│   ├── public/                  # Static assets
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
│   ├── package.json
│   └── tsconfig.json
└── README.md
```

---

## ⚙️ Cara Instalasi & Menjalankan Aplikasi

### 1. Prasyarat

- **Node.js** versi 18.x atau lebih baru
- **PostgreSQL** untuk database (atau gunakan SQLite untuk development)

### 2. Clone & Install Dependencies

```bash
# Clone repository
git clone <repository-url>
cd app_kredit_konsumer_bni/frontend

# Install dependencies
npm install
```

### 3. Setup Environment

Buat file `.env` di folder `frontend/`:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/kredit_konsumer"

# NextAuth
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

### 4. Setup Database

```bash
# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate

# (Optional) Seed initial data
npm run db:seed
```

### 5. Jalankan Aplikasi

```bash
# Development mode
npm run dev
```

Aplikasi akan berjalan di `http://localhost:3000`

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

---

## 🔧 Script yang Tersedia

| Script                | Keterangan                        |
| --------------------- | --------------------------------- |
| `npm run dev`         | Jalankan development server       |
| `npm run build`       | Build untuk production            |
| `npm run start`       | Jalankan production server        |
| `npm run lint`        | Jalankan ESLint                   |
| `npm run db:generate` | Generate Prisma client            |
| `npm run db:migrate`  | Jalankan database migration       |
| `npm run db:studio`   | Buka Prisma Studio (GUI database) |

---

## 📝 Lisensi & Kredit

**Dikembangkan untuk:** BNI (Internal Use)  
**Tahun:** 2024/2025
