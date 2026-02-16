# Dokumentasi Output List Investigasi - BNI Fleksi Aktif

Dokumen ini berisi seluruh output list investigasi yang di-generate untuk produk **BNI Fleksi Aktif** pada aplikasi Kredit Konsumer BNI.

---

## Daftar Isi

1. [List Investigasi Utama](#1-list-investigasi-utama)
2. [List Verifikasi Bendahara](#2-list-verifikasi-bendahara)
3. [List Verifikasi Kepegawaian/SDM (BUMN/BUMD)](#3-list-verifikasi-kepegawaiansdm-bumnbumd)
4. [List Verifikasi Rekan Kerja](#4-list-verifikasi-rekan-kerja)
5. [List Verifikasi Kerabat Aktif](#5-list-verifikasi-kerabat-aktif)
6. [List RPC Aktif](#6-list-rpc-aktif)
7. [List Verifikasi Penghasilan Aktif](#7-list-verifikasi-penghasilan-aktif)
8. [Konfigurasi Khusus Instansi](#8-konfigurasi-khusus-instansi)

---

## 1. List Investigasi Utama

### Deskripsi

List investigasi utama berisi poin-poin verifikasi data debitur yang akan muncul pada dokumen hasil generate. Struktur kini distandarisasi berdasarkan segmentasi, dengan penyesuaian teks hardcoded untuk instansi tertentu.

### Format Output (Poin Umum)

### Variabel Dinamis Template

Tambahkan variabel ini pada judul/header tabel verifikasi di template Word Anda agar menyesuaikan dengan segmentasi (Bendahara vs SDM):

- `{{label_verifikator}}` : Menghasilkan "Bendahara" atau "SDM/Kepegawaian"
- `{{label_verifikator_upper}}` : Menghasilkan "BENDAHARA" atau "SDM/KEPEGAWAIAN"

### Template Placeholder (Untuk File .docx)

Gunakan kode berikut di dalam template Word Anda untuk menampilkan list ini secara otomatis:

```text
{#list_investigasi}
{{text}}
{/list_investigasi}
```

```
1. Alamat Pemohon sesuai KTP di {alamat_ktp}
2. Alamat tempat tinggal saat ini di {alamat_tempat_tinggal} (jika berbeda dengan KTP)
3. Status Rumah Pemohon saat ini adalah {status_rumah} dengan lama tinggal ± {lama_tinggal}.
4. {cfm_status_perkawinan} (atau fallback: Pemohon berstatus {status_perkawinan})
5. Pemohon berumur ± {usia_pemohon} Tahun ({tgl_lahir}) Cfm. KTP Nomor {no_ktp} tanggal {tgl_terbit_ktp}
```

### Poin Khusus Segmentasi: BUMN/BUMD

```
6. Pemohon adalah {status_kepegawaian_manual} pada {instansi} dengan lama bekerja ± {masa_kerja} sejak {tgl_mulai_kerja} Cfm. Surat Keputusan (SK) Pengangkatan Pegawai Nomor {no_sk_cpns} tanggal {tgl_sk_cpns}
7. (Jika ada konfigurasi alamat kantor pusat) {alamat_kantor_pusat_hardcoded}
   ATAU
   Alamat Kantor {instansi} di {alamat_kantor}
8. (Jika ada Info Kelolaan/SLN) {info_kelolaan_hardcoded}
9. Jabatan Pemohon saat ini adalah {jabatan}.
   ATAU (jika menggunakan SK Mutasi - ex: PLN):
   Pemohon ditempatkan di {penempatan_unit} dengan jabatan sebagai {jabatan} Cfm. Surat Keputusan (SK) Mutasi Jabatan {no_sk_mutasi} tanggal {tgl_sk_mutasi}
10. (Opsional) Pemohon akan memasuki Batas Usia Pensiun per Tanggal {tgl_pensiun}... (default: Aktif untuk BUMN)
```

### Poin Khusus Segmentasi: Pemerintahan

```
6. Pemohon adalah {status_kepegawaian_manual} di {instansi}
7. Alamat Kantor yang terletak di {alamat_kantor}
8. (Jika ada Info Kelolaan/HLB) {info_kelolaan_hardcoded}
9. Lama Masa Kerja Pemohon -/+ {masa_kerja} atau sejak Tahun {tgl_mulai_kerja} Cfm. SK No. {no_sk_cpns} tanggal {tgl_sk_cpns}
10. Status/ Pangkat Golongan Pemohon saat ini adalah {golongan} Cfm. Surat Keputusan Nomor (SK) Nomor {no_sk_kenaikan_pangkat} tanggal {tgl_sk_kenaikan_pangkat}
11. Jabatan Pemohon saat ini adalah {jabatan}
12. Pemohon akan memasuki Batas Usia Pensiun per Tanggal {tgl_pensiun}... (default: Aktif untuk PNS)
```

### Poin Khusus Segmentasi: Swasta / Lainnya

```
6. Pemohon adalah {status_kepegawaian_manual} pada {instansi} Cfm. SK Pengangkatan No {no_sk_cpns} tanggal {tgl_sk_cpns}.
7. Lama bekerja Pemohon ± {masa_kerja} sejak {tgl_mulai_kerja}.
8. Alamat Kantor Pemohon di {alamat_kantor}.
9. Jabatan Pemohon saat ini adalah {jabatan}.
```

### Poin Penutup (Semua Segmentasi)

```
Maksud mengajukan fasilitas kredit Fasilitas Kredit Fleksi {jenis_pengajuan} sebesar Rp. {plafon} Jangka Waktu {tenor} Bulan.
Tujuan penggunaan Kredit untuk {tujuan_kredit}.
```

---

## 2. List Verifikasi Bendahara

_(Sama dengan sebelumnya)_

## 2. List Verifikasi Bendahara

_(Sama dengan sebelumnya)_

### Template Placeholder (Untuk File .docx)

Gunakan kode berikut untuk menampilkan list verifikasi. Berkat update terbaru, **placeholder ini sekarang mendukung SEMUA segmentasi (BUMN/BUMD, Swasta, PNS)**.

Gunakan bersama dengan variabel `{{label_verifikator}}` pada judulnya.

```text
{#list_verifikasi_bendahara}
{{text}}
{/list_verifikasi_bendahara}
```

```
1. Memang benar Pemohon adalah {status_kepegawaian_manual} di {instansi}.
2. Jabatan saat ini Pemohon sebagai {jabatan}.
3. Lama Masa Kerja Pemohon -/+ {masa_kerja} atau sejak {tgl_mulai_kerja}.
4. Gaji Aktif Pemohon saat ini berkisar Rp. {gaji_bulan_3},-, dan pendapatan lainnya atau dapat dicocokkan pada Rekening Payroll {payroll_bank} (terlampir).
5. Karakter dan Integritas yang baik dan bertanggung jawab.
```

---

## 3. List Verifikasi Kepegawaian/SDM (BUMN/BUMD)

### Deskripsi

List ini identik dengan List Verifikasi Bendahara, tetapi khusus untuk segmentasi BUMN/BUMD dengan verifikator SDM/Kepegawaian.

### Deskripsi

List ini secara teknis masih ada untuk kompatibilitas, namun **SANGAT DISARANKAN** untuk menggunakan `{#list_verifikasi_bendahara}` saja (metode universal) seperti yang dijelaskan di atas, agar Anda cukup main satu template.

### Template Placeholder (Legacy/Opsional)

Kode ini hanya akan terisi jika segmentasi adalah BUMN/BUMD.

```text
{#list_verifikasi_kepegawaian}
{{text}}
{/list_verifikasi_kepegawaian}
```

```
1. Memang benar Pemohon adalah {status_kepegawaian_manual} di {instansi}.
2. Jabatan saat ini Pemohon sebagai {jabatan}.
3. Lama Masa Kerja Pemohon -/+ {masa_kerja} atau sejak {tgl_mulai_kerja}.
4. Gaji Aktif Pemohon saat ini berkisar Rp. {gaji_bulan_3},-, dan pendapatan lainnya atau dapat dicocokkan pada Rekening Payroll {payroll_bank} (terlampir).
5. Karakter dan Integritas yang baik dan bertanggung jawab.
```

---

## 4. List Verifikasi Rekan Kerja

_(Sama dengan sebelumnya)_

## 4. List Verifikasi Rekan Kerja

_(Sama dengan sebelumnya)_

### Template Placeholder (Untuk File .docx)

```text
{#list_verifikasi_rekan_kerja}
{{text}}
{/list_verifikasi_rekan_kerja}
```

```
1. Memang benar Pemohon adalah {status_kepegawaian_manual} di {instansi}.
2. Jabatan saat ini Pemohon sebagai {jabatan}.
3. Lama Masa Kerja Pemohon -/+ {masa_kerja} atau sejak {tgl_mulai_kerja}.
4. Karakter dan Integritas yang baik dan bertanggung jawab.
```

---

## 5. List Verifikasi Kerabat Aktif

_(Sama dengan sebelumnya)_

## 5. List Verifikasi Kerabat Aktif

_(Sama dengan sebelumnya)_

### Template Placeholder (Untuk File .docx)

```text
{#list_verifikasi_kerabat}
{{text}}
{/list_verifikasi_kerabat}
```

```
1. Memang benar Pemohon adalah {status_kepegawaian_manual} di {instansi}.
2. Menurut Ybs. rumah yang di tempati Pemohon saat ini adalah Rumah {status_rumah}.
3. Ybs. menyampaikan bahwa Pemohon memiliki kemampuan untuk menyetor angsuran atas kredit yang dimohon, dan Ybs bersedia untuk mengingatkan Pemohon untuk kewajiban angsuran perbulan.
4. Pemohon dikenal baik dan bertanggung jawab.
```

---

## 6. List RPC Aktif

_(Sama dengan sebelumnya)_

## 6. List RPC Aktif

_(Sama dengan sebelumnya)_

### Template Placeholder (Untuk File .docx)

**Catatan:** Output untuk RPC Aktif berupa satu blok teks panjang (string), bukan list/loop. Gunakan sintaks berikut tanpa tanda `#`:

```text
{{list_rpc_aktif}}
```

```
PERHITUNGAN REPAYMENT CAPACITY :
Penghasilan Pemohon Cfm. Slip Gaji dan Rekening Koran Gaji Pemohon di BNI Nomor Rekening {aktif_nomor_rekening_gaji} atas nama {nama_pemohon} dengan data sebagai berikut :

Gaji Bulan {aktif_gaji_bulan_nama} ({metode_hitung})		: Rp. {aktif_gaji_variance},-
{Tunjangan Kinerja Bulan X (metode_hitung)}	: Rp. {nilai},-  (jika ada)
{Uang Makan Bulan X (metode_hitung)}		: Rp. {nilai},-  (jika ada)
{Penghasilan Tambahan Lainnya... (metode_hitung)}	: Rp. {nilai},-  (jika ada)

Penghasilan Calon Debitur		: Rp. {aktif_penghasilan_calon_debitur},-
DSC {aktif_dsc_percent}			: Rp. {aktif_dsc},-

Cfm. Info SLIK Ideb posisi terakhir Tanggal {tgl_slik} Pemohon memiliki Fasilitas Kredit sebagai berikut :
-Fasilitas Kredit {jenis_kredit} di {nama_bank} maks Rp. {plafon_maks} outs Rp. {outstanding} angsuran Rp. {angsuran} Coll {kolektibilitas}. {alasan}
(atau)
-Nihil - Tidak ada fasilitas kredit

Total Angsuran Calon Debitur			: Rp. {aktif_total_angsuran_calon_debitur},-
Maksimal Angsuran Kredit yang dapat diberikan s.d	: Rp. {aktif_maksimal_angsuran},-
Angsuran Kredit yang dapat diusulkan			: Rp. {aktif_angsuran_diusulkan},-
Total Angsuran Kredit Eksisting & Angsuran yg diusul	: Rp. {aktif_total_angsuran_all},-

DSR : {aktif_dsr}%
{aktif_dsr_keterangan}
```

---

## 7. List Verifikasi Penghasilan Aktif

_(Sama dengan sebelumnya)_

### Format Output

```
VERIFIKASI PENGHASILAN PEMOHON
Penghasilan Pemohon Cfm. Rekening Koran Gaji {payroll_bank} nomor {payroll_no_rek} atas nama {nama_pemohon} dengan data sebagai berikut :

-Gaji Bulan {gaji_bulan_1_nama}	:	Rp. {gaji_bulan_1},-
-Gaji Bulan {gaji_bulan_2_nama}	:	Rp. {gaji_bulan_2},-
-Gaji Bulan {gaji_bulan_3_nama}	:	Rp. {gaji_bulan_3},-
-Tunjangan Kinerja	:	Rp. {tukin},- (jika ada)
-Uang Makan	:	Rp. {uang_makan},- (jika ada)
-{label_tambahan} {bulan_1_nama}	:	Rp. {nilai},-
-{label_tambahan} {bulan_2_nama}	:	Rp. {nilai},-
-{label_tambahan} {bulan_3_nama}	:	Rp. {nilai},-
```

---

## 8. Konfigurasi Khusus Instansi

Berikut adalah teks hardcoded yang dikonfigurasi dalam `instansi-config.ts` dan akan disuntikkan ke dalam template standar di atas jika nama instansi cocok.

| Instansi Trigger (Pattern)         | Segmentasi   | Detail Konfigurasi Tambahan                                                                                                                                                                                                                                                                         |
| :--------------------------------- | :----------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Mitra Karya Prima (MKP)**        | BUMN/BUMD    | - **Alamat Kantor Pusat**: "Alamat Kantor Pusat MKP di JBC Blok A No 4-6 Jl. Raya Juanda No. 1 Sidoarjo Jawa Timur."<br>- **Info Kelolaan**: "PT. Mitra Karya Prima (MKP) termasuk Daftar Kelolaan SLN"                                                                                             |
| **Kejaksaan Negeri**               | PEMERINTAHAN | - **Info Kelolaan/HLB**: "Cfm. Surat No. PDM/9.2/10373 Tanggal 20 Desember 2017 Kejaksaan Negeri termasuk dalam Daftar Kelolaan HLB (Kejaksaan Agung Group)."<br>- **Golongan**: Ya (Standard PNS)                                                                                                  |
| **Universitas Negeri Gorontalo**   | PEMERINTAHAN | - **Info Kelolaan**: "Cfm. Surat Divisi PDM dan CLN No. PDM/9.2/1682 dan CLN/1/1626 tanggal 2 Maret 2018 Kementrian Riset Tekhnologi dan Pendidikan Tinggi termasuk dalam Program BNI Fleksi Selected Partner Kelolaan Divisi HLB Group..."<br>- **Batas Usia Pensiun**: Ya                         |
| **KSOP Anggrek**                   | PEMERINTAHAN | - **Info Kelolaan**: "Cfm. Surat Divisi PDM dan CLN No. PDM/9.2/1682 dan CLN/1/1626 Tanggal 2 Maret, Direktorat Jenderal Perhubungan Laut Up Pelabuhan Kelas II termasuk dalam Kementerian Perhubungan Group termasuk Daftar Kelolaan HLB."                                                         |
| **PLN UP3 Gorontalo**              | BUMN/BUMD    | - **Info Kelolaan**: "PT. PLN (Persero) termasuk Daftar Kelolaan SLN"<br>- **Info Pensiun**: "Pemohon Pensiun sampai dengan usia 56 tahun"<br>- **SK Mutasi**: Ya (Menggantikan format Jabatan standar)                                                                                             |
| **Paguntaka / Cahaya Nusantara**   | BUMN/BUMD    | - **Info Kelolaan**: "{instansi} adalah anak Perusahaan dari PT. PLN Nusa Daya yang termasuk Daftar Kelolaan SLN"<br>- **Format Alamat**: "Alamat {instansi} di {alamat_kantor}"                                                                                                                    |
| **BKKBN**                          | PEMERINTAHAN | - **Info Kelolaan**: "Cfm. Surat No. PDM/9.2/10373 Tanggal 20 Desember 2017 BKKBN termasuk dalam Daftar Kelolaan SLN."                                                                                                                                                                              |
| **BPK Perwakilan Prov. Gorontalo** | PEMERINTAHAN | - **Info Kelolaan**: "Cfm. Surat Divisi PDM dan CLN, No. PDM/9.2/1682 dan CLN/1/1626 Tanggal 2 Maret 2018 BPK termasuk dalam Program BNI Fleksi selected partner Kelolaan Divisi HLB Group BPK RI Costumer name Group BPK RI."<br>- **Golongan**: Ya (Standard PNS)<br>- **Batas Usia Pensiun**: Ya |

---

## Catatan Implementasi

1. **File Sumber**: `frontend/src/backend/services/document/list-generators.ts`
2. **File Konfigurasi**: `frontend/src/backend/services/document/instansi-config.ts`
3. **Class**: `ListGenerators`
4. **Method Utama**: `generateInvestigasiList(context)` (Routing)
5. **Logic**: Menggunakan `generateAktifInvestigasiList` yang bersifat generik dengan injeksi `InstansiConfig` sesuai pattern nama instansi.

---

_Dokumen ini diperbarui pada tanggal 5 Februari 2026._
