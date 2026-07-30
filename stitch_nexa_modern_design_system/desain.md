# Desain Frontend & UI - Nexa Assessment

Dokumen ini menjelaskan secara komprehensif struktur, komponen, sistem desain, dan aturan UI (User Interface) yang digunakan pada frontend aplikasi **Nexa Assessment**.

---

## 1. Teknologi & Stack Utama

Frontend aplikasi ini dibangun menggunakan stack modern yang berfokus pada performa, konsistensi desain, dan kemudahan pengembangan:

- **Framework:** Next.js (App Router, kompatibel dengan React 19)
- **Styling:** Tailwind CSS v4, dengan kustomisasi melalui `globals.css`
- **UI Components:** Shadcn UI (Radix UI)
- **State Management:** Zustand (terutama untuk UI state seperti toggle sidebar dan tema)
- **Icons:** Lucide React
- **Forms & Validasi:** React Hook Form + Zod

---

## 2. Sistem Tema & Warna (Design System)

Aplikasi mendukung dua mode tema (Terang / Gelap) yang dikonfigurasi melalui CSS Variables di dalam file `globals.css`. 

### Warna Utama (Brand & Accent)
- **Brand (Indigo):** `#4f46e5` (Terang) / `#a5b4fc` (Gelap)
- **Brand Dark:** `#4338ca`
- **Accent (Cyan):** `#06b6d4` (Terang) / `#67e8f9` (Gelap)
- **Accent Dark:** `#0891b2`

### Warna Latar & Teks (Background & Foreground)
- **Terang:** Background `hsl(210 40% 98%)`, Foreground `hsl(222.2 84% 4.9%)`
- **Gelap:** Background `hsl(240 19% 17%)`, Foreground `hsl(240 31% 89%)`
- **Sidebar & Card:** Diberikan warna spesifik yang beradaptasi dengan mode gelap (contoh: `#2b2c40` pada mode gelap).

### Warna Status (Feedback Colors)
- **Success:** Hijau (`#22c55e`)
- **Warning:** Oranye/Kuning (`#f59e0b`)
- **Danger:** Merah (`#ef4444`)
- **Info:** Biru (`#3b82f6`)

### Tipografi
- **Font Family:** `Inter`, system-ui, sans-serif.
- **Ukuran Dasar:** `0.875rem` (14px) untuk teks reguler.

---

## 3. Struktur Layout & Navigasi

Aplikasi menggunakan layout responsif yang diatur dalam `MainLayout.tsx` (untuk rute dashboard/internal).

### Komponen Layout
1. **Sidebar (`Sidebar.tsx`)**:
   - Menu navigasi kiri yang bersifat *collapsible* (bisa dilipat).
   - Di perangkat seluler, Sidebar tampil sebagai *overlay* (laci geser).
   - Menu utama: *Dashboard Input*, *Riwayat Client*, *Pengaturan*.
   - Menu Knowledge Base: *Knowledge Base*, *Upload Dokumen*.
   - Menu khusus Admin: *Kelola Template* (hanya muncul jika user adalah admin).
   - Tombol toggle mode terang/gelap (*ThemeToggle*).
2. **Header (`Header.tsx`)**:
   - Berada di atas area konten utama.
   - Memiliki tombol humberger/menu untuk membuka/menutup sidebar.
3. **Main Content**:
   - Area tengah tempat halaman (pages) dimuat.
   - Dibungkus dengan animasi `fade-in` agar transisi halaman terasa mulus.

---

## 4. Komponen UI Kustom & Utilities

Selain komponen bawaan Shadcn, terdapat beberapa elemen desain khusus (ditulis dalam `globals.css` dan `Tailwind classes`):

- **Cards (`.card`, `.card-hover`)**: Kotak konten dengan border, radius (`0.75rem`), dan efek shadow. Memiliki efek *lift-up* (`translateY(-5px)`) dan shadow membesar saat di-hover.
- **Buttons (`.btn-primary`, `.btn-outline`)**: Tombol dengan transisi halus, menggunakan warna utama (Brand) atau Accent.
- **Badges (`.badge`)**: Label status kecil dengan sudut membulat penuh (`rounded-full`), memiliki varian *primary, warning, danger, success*, dan *info*.
- **Form Elements (`.form-input`, `.form-select`)**: Field input yang disesuaikan dengan warna background dan border tema aktif. Memiliki ring biru terang saat fokus.
- **Avatar (`.avatar`)**: Foto profil melingkar dengan indikator status *online* di pojok bawah.
- **Scrollbar Khusus**: Scrollbar kustom pada WebKit dengan lebar 8px, track muted, dan thumb abu-abu.
- **Animasi**: Animasi *pulse subtle* untuk elemen loading/indikator (`.animate-pulse-subtle`).

---

## 5. Halaman & Tampilan Utama

1. **Dashboard (`/`)**:
   - Halaman penyambutan pengguna ("Halo, Selamat Datang! 👋").
   - Menampilkan *Product Cards* berupa pilihan formulir assessment:
     - **Assessment Type C (Active)** - Payroll Nexa.
     - **Assessment Type A (Pre-Period)** - Transisi pekerja.
     - **Assessment Type B (Full-Period)** - Pensiunan.
   - Setiap kartu memiliki gradien header dan ikon kustom yang membesar saat di-hover.

2. **Form Input (`/form/*`)**:
   - Halaman formulir multi-langkah (multi-step) atau formulir dinamis sesuai jenis assessment.
   - Menggunakan validasi yang kuat, dan dilengkapi *Preview Modal* untuk meninjau data sebelum submit.

3. **Riwayat Client (`/clients`)**:
   - Halaman berupa tabel (Tabel data Shadcn) untuk melihat daftar riwayat client/assessment yang sudah diproses.

4. **Knowledge Base (`/knowledge-base`)**:
   - Area untuk mencari dokumen referensi atau panduan kerja.
   - Area *Upload Dokumen* untuk menambah basis pengetahuan.

5. **Pengaturan & Admin (`/settings`, `/admin/template`)**:
   - Halaman untuk mengatur profil, preferensi, dan bagi admin, mengelola template penilaian/dokumen.

---

## 6. Pola & Praktik Terbaik UI

- **Konsistensi Visual:** Gunakan CSS variable (`var(--color-brand)`) atau class Tailwind kustom (`text-brand`, `bg-accent`) agar komponen mematuhi sistem warna otomatis saat berganti tema.
- **Responsivitas:** Semua tampilan harus *mobile-first*. Gunakan class `md:` dan `lg:` untuk menyesuaikan layout di tablet dan desktop (contoh: menyembunyikan sidebar di seluler menjadi *off-canvas*).
- **Aksesibilitas:** Komponen berbasis Radix UI (via Shadcn) sudah memenuhi standar aksesibilitas (WAI-ARIA). Pertahankan struktur label dan input yang jelas.
- **Feedback Visual:** Selalu berikan respon visual saat hover tombol, fokus input, dan status sukses/gagal pengiriman formulir (bisa menggunakan komponen `Toast`/notifikasi).
