# Aplikasi Kredit Konsumer BNI (Web Based)

Aplikasi berbasis web untuk mempermudah proses input, validasi, perhitungan kelayakan kredit (RPC/DSR), dan pembuatan dokumen (Surat/Laporan) secara otomatis untuk produk Kredit Pensiun (Fleksi Purna & Prapurna).

Dibangun dengan **Python Flask**, aplikasi ini dirancang untuk efisiensi operasional dengan antarmuka yang ramah pengguna dan fitur validasi risiko terintegrasi.

---

## 🚀 Fitur Utama

* **Manajemen Debitur**: Input data debitur Prapurna dan Purna dengan formulir yang dinamis.
* **Kalkulator Kredit Real-time**:
    * Perhitungan angsuran (PMT) otomatis.
    * Validasi **DSR (Debt Service Ratio)** dengan batas maksimal 90% (Hard Block).
    * Perhitungan biaya (Provisi, Admin, dll) otomatis.
* **Generate Dokumen Otomatis**: Menghasilkan file `.docx` siap cetak berdasarkan template yang bisa diatur, menggunakan library `docxtpl`.
* **Riwayat & Pencarian**: Filter data berdasarkan Nama, NIK, Jenis Pengajuan (Baru/TopUp/TakeOver), dan Segmentasi (Taspen/Asabri).
* **Manajemen Template**: Admin dapat mengganti file template `.docx` langsung dari aplikasi tanpa mengubah kode.
* **UI Modern**: Tema BNI (Tosca & Orange) dengan fitur *Dark Mode*.

---

## 🛠️ Teknologi yang Digunakan

* **Backend**: Python 3.x, Flask 3.0.0
* **Database**: SQLite (via Flask-SQLAlchemy)
* **Templating**: Jinja2 (HTML), DocxTpl (Word Documents)
* **Frontend**: HTML5, CSS3, JavaScript (Vanilla), Bootstrap 5
* **Aset**: Boxicons (Ikon), Fonts Google (Public Sans)

---

## 📂 Struktur Folder Proyek

```text
APP_KREDIT_KONSUMER_BNI/
├── instance/
│   └── debitur.db           # Database SQLite (Otomatis dibuat saat run pertama)
├── static/
│   ├── assets/              # CSS, Images, Vendor Libraries
│   └── js/
│       └── script.js        # Logika Kalkulasi & Validasi Client-side
├── templates/
│   ├── admin.html           # Halaman Kelola Template
│   ├── base.html            # Layout Utama (Navbar/Sidebar)
│   ├── index.html           # Dashboard
│   ├── riwayat.html         # Tabel Data Debitur
│   ├── form_prapurna.html   # Form Input Prapurna
│   └── form_purna.html      # Form Input Purna
├── app.py                   # Main Application Logic (Server)
├── requirements.txt         # Daftar Library Python
├── README.md                # Dokumentasi Proyek
└── *.docx                   # Template Dokumen (e.g., template_prapurna_reguler.docx)
````

-----

## ⚙️ Cara Instalasi & Menjalankan Aplikasi

Ikuti langkah-langkah berikut untuk menjalankan aplikasi di komputer lokal (Localhost):

### 1\. Prasyarat

Pastikan **Python** (versi 3.8 ke atas) sudah terinstal di komputer Anda.

### 2\. Persiapkan Lingkungan (Environment)

Disarankan menggunakan *Virtual Environment* agar library tidak tercampur. Buka terminal/cmd di folder proyek:

```bash
# Untuk Windows
python -m venv venv
venv\Scripts\activate

# Untuk Mac/Linux
python3 -m venv venv
source venv/bin/activate
```

### 3\. Instal Library

Instal semua kebutuhan aplikasi yang tertera di `requirements.txt`:

```bash
pip install -r requirements.txt
```

### 4\. Jalankan Aplikasi

Jalankan server Flask:

```bash
python app.py
```

  * Aplikasi akan berjalan di `http://127.0.0.1:5000/`.
  * Browser akan otomatis terbuka (jika fitur auto-open aktif).
  * Database `debitur.db` akan otomatis dibuat di folder `instance/` jika belum ada.

-----

## 📖 Panduan Penggunaan

1.  **Dashboard**: Pilih jenis produk kredit (Prapurna/Purna) untuk memulai input.
2.  **Formulir Input**:
      * Isi data sesuai tab (A sampai E).
      * **Perhatian**: Jika DSR \> 90%, sistem akan menolak penyimpanan data (muncul peringatan merah).
      * Gunakan fitur **Preview** untuk mengecek data sebelum disimpan.
3.  **Riwayat**:
      * Gunakan filter di atas tabel untuk mencari debitur.
      * Klik tombol **Download (Ikon Hijau)** untuk mengunduh dokumen Word.
      * Klik tombol **Edit (Ikon Kuning)** untuk mengubah data.
4.  **Admin (Kelola Template)**:
      * Masuk ke menu *Pengaturan \> Kelola Template*.
      * Upload file `.docx` baru untuk mengganti template surat sesuai kategori produk.

-----

## ⚠️ Catatan Teknis untuk Pengembang

  * **Logic Kalkulasi**:
      * Logika perhitungan Frontend ada di `static/js/script.js`.
      * Logika verifikasi Backend & Rendering Docx ada di `app.py` (Route `/generate`).
  * **Format Template**:
      * Template Word menggunakan sintaks Jinja2, contoh: `{{ nama_pemohon }}`, `{{ usulan_plafon_kredit }}`.
      * Jangan mengubah nama variabel di dalam `.docx` kecuali Anda juga menyesuaikan *key* JSON di `app.py`.
  * **Production**:
      * Saat ini `app.py` menggunakan `debug=True`. Ubah menjadi `False` sebelum *deploy* ke server produksi (IIS/Nginx/Apache).

-----

## 📝 Lisensi & Kredit

**Dikembangkan untuk:** BNI (Internal Use)
**Tahun:** 2024/2025

```

---