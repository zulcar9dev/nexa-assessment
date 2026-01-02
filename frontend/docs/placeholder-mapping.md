# Placeholder Mapping - Template Dokumen Kredit Konsumer BNI

> Dokumen ini berisi mapping antara placeholder template dengan field data dari `DebiturFormData`

---

## 📋 Struktur Dokumen Output

Berdasarkan analisis file `Kredit_Rukmin Jusuf_7503066501650002.docx`:

```
1. INVESTIGASI
2. VERIFIKASI PENGHASILAN PEMOHON
3. CALL MEMO (Kerabat)
4. PERHITUNGAN REPAYMENT CAPACITY
5. USULAN ASISTEN KREDIT KONSUMER
   - Syarat Penandatanganan
   - Syarat Pencairan
```

---

## 🔗 Placeholder Mapping

### 1. INVESTIGASI

| Teks di Dokumen       | Placeholder             | Data Source                             | Contoh Output                             |
| --------------------- | ----------------------- | --------------------------------------- | ----------------------------------------- |
| Tgl. Call Memo        | `{{tgl_call_memo}}`     | `new Date()` (tanggal hari ini)         | `22 April 2025`                           |
| Yang Diverifikasi     | `{{nama_pemohon}}`      | `dataLengkap.nama_pemohon`              | `Rukmin Jusuf`                            |
| Bentuk Call (Telepon) | `{{no_telepon}}`        | `dataLengkap.no_telepon`                | `085241788994`                            |
| Alamat di KTP         | `{{alamat_ktp}}`        | `dataLengkap.alamat_ktp`                | `Jl. Sudirman No. 123, RT 01/RW 02...`    |
| Alamat Domisili       | `{{alamat_domisili}}`   | `dataLengkap.alamat_domisili`           | _(Muncul jika `domisili_berbeda` = true)_ |
| Status Rumah          | `{{status_rumah}}`      | `dataLengkap.status_rumah`              | `Milik Sendiri`                           |
| Lama Tinggal          | `{{lama_tinggal}}`      | `dataLengkap.lama_tinggal`              | `40 Tahun 00 Bulan`                       |
| Tanggal Lahir         | `{{tgl_lahir}}`         | `dataLengkap.tgl_lahir_pemohon`         | `25 Januari 1965`                         |
| No KTP                | `{{no_ktp}}`            | `dataLengkap.no_ktp_pemohon`            | `7503066501650002`                        |
| Tanggal Terbit KTP    | `{{tgl_terbit_ktp}}`    | `dataLengkap.tgl_terbit_ktp`            | `01 Maret 2020`                           |
| Usia Pemohon          | `{{usia_pemohon}}`      | `dataLengkap.usia_pemohon` (calculated) | `60`                                      |
| Status Perkawinan     | `{{status_perkawinan}}` | `dataLengkap.status_perkawinan`         | `Menikah`                                 |
| Instansi              | `{{instansi}}`          | `dataLengkap.instansi`                  | `TK Melati Indah`                         |
| Jabatan               | `{{jabatan}}`           | `dataLengkap.jabatan`                   | `Guru`                                    |
| Golongan              | `{{golongan}}`          | `dataLengkap.golongan`                  | `IV/a`                                    |
| NIP                   | `{{nip}}`               | `dataLengkap.nip`                       | `196501251990032002`                      |
| NOPEN                 | `{{nopen}}`             | `dataLengkap.nopen`                     | `123456789012`                            |
| TMT Pensiun           | `{{tgl_pensiun_tmt}}`   | `dataLengkap.tgl_pensiun_tmt`           | `01 Februari 2025`                        |
| Tanggal Pensiun       | `{{tgl_pensiun}}`       | `dataLengkap.tgl_pensiun_tmt`           | `01 Februari 2025`                        |
| No SK Pensiun         | `{{no_sk_pensiun}}`     | `dataLengkap.no_sk_pensiun`             | `800.1.3/SK/BUP-BB/12/190/IX/2024`        |
| Tgl SK Pensiun        | `{{tgl_sk_pensiun}}`    | `dataLengkap.tgl_sk_pensiun`            | `19 September 2024`                       |
| Plafon Kredit         | `{{plafon}}`            | `dataLengkap.usulan_plafon_kredit`      | `367.000.000`                             |
| Jangka Waktu          | `{{tenor}}`             | `dataLengkap.usulan_jangka_waktu_bulan` | `175`                                     |
| Tujuan Kredit         | `{{tujuan_kredit}}`     | `dataLengkap.tujuan_kredit` (Label)     | `Modal Usaha` / `Renovasi Rumah`          |
| Segmentasi            | `{{segmentasi}}`        | `dataLengkap.segmentasi`                | `TASPEN` / `ASABRI`                       |
| Jenis Pengajuan       | `{{jenis_pengajuan}}`   | `dataLengkap.jenis_pengajuan`           | `Top Up`                                  |
| Kategori              | `{{kategori}}`          | Derived from debitur.kategori           | `purna` / `prapurna`                      |
| Pensiunan             | `{{pensiunan}}`         | `dataLengkap.pensiunan` (Purna only)    | `PNS Pensiunan`                           |

---

### 2. INFO SLIK

| Teks di Dokumen      | Placeholder                | Data Source                      | Contoh Output                        |
| -------------------- | -------------------------- | -------------------------------- | ------------------------------------ |
| Tanggal SLIK         | `{{tgl_slik}}`             | `new Date()`                     | `22 April 2025`                      |
| Fasilitas Nihil      | `{{fasilitas_nihil}}`      | Auto dari jumlah slik_facilities | `NIHIL` / `Tidak`                    |
| Fasilitas Nihil Text | `{{fasilitas_nihil_text}}` | Auto dari jumlah slik_facilities | `Nihil - Tidak ada fasilitas kredit` |

#### Conditional Rendering SLIK

Gunakan placeholder boolean berikut untuk menampilkan bagian dokumen secara kondisional:

| Placeholder                 | Data Source                    | Deskripsi                              |
| --------------------------- | ------------------------------ | -------------------------------------- |
| `{{slik_nihil}}`            | `slik_facilities.length === 0` | `true` jika tidak ada fasilitas kredit |
| `{{slik_ada_fasilitas}}`    | `slik_facilities.length > 0`   | `true` jika ada fasilitas kredit       |
| `{{slik_jumlah_fasilitas}}` | `slik_facilities.length`       | Jumlah fasilitas kredit yang diinput   |

**Contoh penggunaan di template Word:**

```
{{#slik_nihil}}
Nihil - Tidak ada fasilitas kredit
{{/slik_nihil}}
{{#slik_ada_fasilitas}}
[Tabel Data SLIK]
{{/slik_ada_fasilitas}}
```

#### SLIK Bank (Index 1-15)

| Placeholder                      | Data Source                              | Contoh Output                       |
| -------------------------------- | ---------------------------------------- | ----------------------------------- |
| `{{slik_bank_1_ada}}`            | Boolean: `nama_bank` tidak kosong        | `true` / `false`                    |
| `{{slik_bank_1_nama}}`           | `slik_facilities[0].nama_bank`           | `PT Hasjrat Multifinance`           |
| `{{slik_bank_1_jenis}}`          | Manual input: `jenis_kredit`             | `Konsumtif` / `Produktif` / dll     |
| `{{slik_bank_1_maks}}`           | `slik_facilities[0].plafon_maks`         | `102.661.552`                       |
| `{{slik_bank_1_outs}}`           | `slik_facilities[0].outstanding`         | `66.393.279`                        |
| `{{slik_bank_1_coll}}`           | `slik_facilities[0].kolektibilitas`      | `1`                                 |
| `{{slik_bank_1_angsuran}}`       | `slik_facilities[0].angsuran`            | `0`                                 |
| `{{slik_bank_1_alasan}}`         | Manual input: `alasan` (Support Mention) | `Ket: Top Up` / `Di takeover` / dll |
| `{{slik_bank_1_norek_existing}}` | Manual input: `nomor_rekening_pinjaman`  | `015xxx`                            |
| `{{slik_bank_1_nopk_existing}}`  | Manual input: `nomor_pk`                 | `123xxx`                            |

> **Fitur Mention & Global Placeholder:**
> Aplikasi mendukung placeholder global yang akan menggabungkan semua nilai dari data SLIK yang tersedia:
>
> - `{{nomor_rekening_pinjaman}}`: Menggabungkan semua no rek yang diinput (dipisah koma).
> - `{{nomor_pk}}`: Menggabungkan semua no PK yang diinput (dipisah koma).
> - `{{nama_bank}}`: Mengambil nama bank (biasanya digunakan per baris/context aware).
>
> Placeholder ini dapat digunakan di dalam **Input Manual Syarat** (Syarat Pencairan/Penandatanganan) dan akan otomatis terisi nilai dari SLIK jika jenis pengajuan relevan (Top Up).

> Template mendukung hingga 15 bank: `slik_bank_1` sampai `slik_bank_15`

**Contoh Conditional Rendering per Bank:**

Gunakan `{{#slik_bank_N_ada}}...{{/slik_bank_N_ada}}` untuk menampilkan baris hanya jika data ada.

> **PENTING:** Tag penutup `{{/slik_bank_N_ada}}` harus langsung disambung dengan tag pembuka berikutnya tanpa line break untuk menghindari paragraf kosong.

**Template Lengkap SLIK:**

```
Cfm. Info SLIK Ideb posisi terakhir Tanggal {{tgl_slik}} Pemohon memiliki Fasilitas Kredit sebagai berikut :{{#slik_nihil}}
-{{fasilitas_nihil}}{{/slik_nihil}}{{#slik_ada_fasilitas}}
{{#slik_bank_1_ada}}-Fasilitas Kredit {{slik_bank_1_jenis}} di {{slik_bank_1_nama}} maks Rp. {{slik_bank_1_maks}} outs Rp. {{slik_bank_1_outs}} angsuran Rp. {{slik_bank_1_angsuran}} Coll {{slik_bank_1_coll}}. {{slik_bank_1_alasan}}
{{/slik_bank_1_ada}}{{#slik_bank_2_ada}}-Fasilitas Kredit {{slik_bank_2_jenis}} di {{slik_bank_2_nama}} maks Rp. {{slik_bank_2_maks}} outs Rp. {{slik_bank_2_outs}} angsuran Rp. {{slik_bank_2_angsuran}} Coll {{slik_bank_2_coll}}. {{slik_bank_2_alasan}}
{{/slik_bank_2_ada}}{{#slik_bank_3_ada}}-Fasilitas Kredit {{slik_bank_3_jenis}} di {{slik_bank_3_nama}} maks Rp. {{slik_bank_3_maks}} outs Rp. {{slik_bank_3_outs}} angsuran Rp. {{slik_bank_3_angsuran}} Coll {{slik_bank_3_coll}}. {{slik_bank_3_alasan}}
{{/slik_bank_3_ada}}...dan seterusnya sampai slik_bank_15_ada...
{{/slik_bank_15_ada}}{{slik_mitigasi_risiko}}{{/slik_ada_fasilitas}}
```

**Format per baris:**

```
-Fasilitas Kredit [jenis] di [nama] maks Rp. [maks] outs Rp. [outs] angsuran Rp. [angsuran] Coll [coll]. [alasan]
```

#### Mitigasi Risiko SLIK

| Placeholder                | Data Source                 | Deskripsi                                             |
| :------------------------- | :-------------------------- | :---------------------------------------------------- |
| `{{slik_mitigasi_risiko}}` | Check `kolektibilitas != 1` | Muncul teks mitigasi jika ada kolektibilitas selain 1 |

> **Teks Mitigasi**: "Mitigasi Risiko Cfm. Surat No. DNS/5.4/5645 Tanggal 09 Juli 2025 Perihal Penyampaian Program Relaksasi SLIK untuk Pemrosesan BNI Fleksi Pensiun Semester II Tahun 2025."

#### Field Manual Input

| Field          | Default (jika kosong) | Deskripsi                                |
| -------------- | --------------------- | ---------------------------------------- |
| `jenis_kredit` | "Konsumtif"           | Jenis kredit (Konsumtif, Produktif, dll) |
| `alasan`       | `""` (kosong)         | Keterangan/alasan (bebas diisi)          |

> **Catatan:** Checkbox "Takeover" dan "Top Up" sudah dihapus. Gunakan field `alasan` untuk mencatat keterangan seperti "Ket: Top Up" atau "Di Takeover".

---

### 3. VERIFIKASI PENGHASILAN

| Teks di Dokumen | Placeholder                | Data Source                        | Contoh Output    |
| --------------- | -------------------------- | ---------------------------------- | ---------------- |
| Bank Pembayaran | `{{payroll_bank}}`         | `dataLengkap.nama_bank_pembayaran` | `Bank Sulutgo`   |
| Nama Bank       | `{{nama_bank_pembayaran}}` | `dataLengkap.nama_bank_pembayaran` | `Bank Sulutgo`   |
| No Rekening     | `{{payroll_no_rek}}`       | `dataLengkap.payroll_no_rek`       | `01502060066122` |

#### Untuk Purna (Pensiunan)

| Placeholder                | Data Source                          | Contoh Output   |
| -------------------------- | ------------------------------------ | --------------- |
| `{{pensiun_bulan_1_nama}}` | `dataLengkap.pensiun_bulan_1_nama`   | `Januari 2025`  |
| `{{pensiun_bulan_1}}`      | `dataLengkap.pensiun_bulan_1_jumlah` | `4.733.300`     |
| `{{pensiun_bulan_2_nama}}` | `dataLengkap.pensiun_bulan_2_nama`   | `Februari 2025` |
| `{{pensiun_bulan_2}}`      | `dataLengkap.pensiun_bulan_2_jumlah` | `4.733.300`     |
| `{{pensiun_bulan_3_nama}}` | `dataLengkap.pensiun_bulan_3_nama`   | `Maret 2025`    |
| `{{pensiun_bulan_3}}`      | `dataLengkap.pensiun_bulan_3_jumlah` | `4.733.300`     |

#### Untuk Prapurna (PNS Aktif)

| Placeholder                | Data Source                        | Contoh Output   |
| -------------------------- | ---------------------------------- | --------------- |
| `{{gaji_bulan_1_nama}}`    | `dataLengkap.gaji_bulan_1_nama`    | `Januari 2025`  |
| `{{gaji_bulan_1}}`         | `dataLengkap.gaji_bulan_1_jumlah`  | `5.000.000`     |
| `{{gaji_bulan_2_nama}}`    | `dataLengkap.gaji_bulan_2_nama`    | `Februari 2025` |
| `{{gaji_bulan_2}}`         | `dataLengkap.gaji_bulan_2_jumlah`  | `5.000.000`     |
| `{{gaji_bulan_3_nama}}`    | `dataLengkap.gaji_bulan_3_nama`    | `Maret 2025`    |
| `{{gaji_bulan_3}}`         | `dataLengkap.gaji_bulan_3_jumlah`  | `5.000.000`     |
| `{{estimasi_hak_pensiun}}` | `dataLengkap.estimasi_hak_pensiun` | `4.500.000`     |

---

### 4. CALL MEMO (Kerabat)

| Teks di Dokumen    | Placeholder              | Data Source                      | Contoh Output     |
| ------------------ | ------------------------ | -------------------------------- | ----------------- |
| Nama Kerabat       | `{{nama_kerabat}}`       | `dataLengkap.nama_kerabat`       | `Fiky Paputungan` |
| Hubungan           | `{{hubungan_kerabat}}`   | `dataLengkap.hubungan_kerabat`   | `Anak Kandung`    |
| No Telepon Kerabat | `{{no_telepon_kerabat}}` | `dataLengkap.no_telepon_kerabat` | `085390264917`    |

---

### 5. PERHITUNGAN REPAYMENT CAPACITY (RPC)

| Teks di Dokumen          | Placeholder                        | Data Source                        | Contoh Output |
| ------------------------ | ---------------------------------- | ---------------------------------- | ------------- |
| Penghasilan Pemohon      | `{{rpc_penghasilan}}`              | Calculated                         | `4.733.300`   |
| DSC 90%                  | `{{rpc_dsc_90}}`                   | `penghasilan * 0.9`                | `4.259.970`   |
| Total Angsuran Eksisting | `{{rpc_total_angsuran_eksisting}}` | Sum of SLIK angsuran               | `0`           |
| Maksimal Angsuran        | `{{rpc_maksimal_angsuran}}`        | `dsc90 - total_angsuran`           | `4.259.970`   |
| Angsuran Diusulkan       | `{{rpc_angsuran_diusulkan}}`       | Calculated annuity                 | `4.218.559`   |
| Total Angsuran Baru      | `{{rpc_total_angsuran_baru}}`      | `eksisting + diusulkan`            | `4.218.559`   |
| DSR                      | `{{rpc_dsr}}`                      | `(total_baru / penghasilan) * 100` | `89,13`       |

---

### 6. USULAN ASISTEN KREDIT KONSUMER

| Teks di Dokumen               | Placeholder                                                               | Data Source                             | Contoh Output                                                            |
| ----------------------------- | ------------------------------------------------------------------------- | --------------------------------------- | ------------------------------------------------------------------------ |
| Maksimum Kredit               | `{{usulan_plafon}}`                                                       | `dataLengkap.usulan_plafon_kredit`      | `367.000.000`                                                            |
| Jangka Waktu                  | `{{usulan_jangka_waktu}}`                                                 | `dataLengkap.usulan_jangka_waktu_bulan` | `175 Bulan`                                                              |
| Tenor (bulan saja)            | `{{tenor}}`                                                               | `dataLengkap.usulan_jangka_waktu_bulan` | `175`                                                                    |
| Tenor (dengan label)          | `{{tenor_bulan}}`                                                         | `dataLengkap.usulan_jangka_waktu_bulan` | `175 Bulan`                                                              |
| Bunga (angka saja)            | `{{bunga}}`                                                               | `dataLengkap.usulan_bunga_persen`       | `11`                                                                     |
| Bunga (dengan label)          | `{{bunga_persen}}`                                                        | `dataLengkap.usulan_bunga_persen`       | `11% p.a Efektif Anuitas`                                                |
| Biaya Provisi                 | `{{biaya_provisi}}`                                                       | `plafon * (input_persen / 100)`         | `3.670.000`                                                              |
| Biaya Provisi (%)             | `{{biaya_provisi_percent}}`                                               | `input_persen`                          | `1%`                                                                     |
| Biaya Tata Laksana            | `{{biaya_tatalaksana}}`                                                   | `plafon * (input_persen / 100)`         | `7.340.000`                                                              |
| Biaya Tata Laksana (%)        | `{{biaya_tatalaksana_percent}}`                                           | `input_persen`                          | `2%`                                                                     |
| Biaya PSJT                    | `{{biaya_psjt}}`                                                          | `plafon * (input_persen / 100)`         | `5.000.000`                                                              |
| Biaya PSJT (%)                | `{{biaya_psjt_percent}}`                                                  | `dataLengkap.biaya_psjt_percent`        | `0.5%`                                                                   |
| Biaya Administrasi            | `{{biaya_administrasi_text}}`                                             | Toggle Logic (Bebas/Charged)            | `Bebas Biaya Administrasi` OR `Biaya Administrasi sebesar Rp. 500.000,-` |
| Kode Program                  | `{{kode_program}}`                                                        | `dataLengkap.kode_program`              | `KK001`                                                                  |
| Catatan Program Pricing       | `{{catatan_program_pricing}}`                                             | Settings (Pengaturan Aplikasi)          | `Cfm Surat No DNS/5.4/8023...`                                           |
| Syarat Penandatanganan        | `{{syarat_penandatanganan}}`                                              | Logic: `Auto (Jenis Kredit) Only`       | `Menyerahkan Asli...`                                                    |
| Syarat Pencairan Kredit       | `{{syarat_pencairan_kredit}}`                                             | Logic: `Auto (Jenis & Payroll)`         | `Rekening Payroll...`                                                    |
| Syarat Penandatanganan (List) | `{{#list_syarat_penandatanganan}}` ... `{{/list_syarat_penandatanganan}}` | `list_syarat_penandatanganan`           | Loop untuk teks otomatis ATAU manual (Overridden)                        |
| Syarat Pencairan (List)       | `{{#list_syarat_pencairan}}` ... `{{/list_syarat_pencairan}}`             | `list_syarat_pencairan`                 | Loop untuk teks syarat pencairan manual                                  |

> **Update Terakhir: List Format untuk Manual Input**
>
> 1.  **Syarat Penandatanganan**:
>
>     - Jika User mengisi input manual, sistem akan **menimpa (override)** list otomatis.
>     - Gunakan template loop: `{{#list_syarat_penandatanganan}} - {{text}} {{/list_syarat_penandatanganan}}`.
>
> 2.  **Syarat Pencairan**:
>     - Untuk menampilkan input manual Syarat Pencairan, gunakan format list.
>     - Gunakan template loop: `{{#list_syarat_pencairan}} - {{text}} {{/list_syarat_pencairan}}`.
>
> **Fitur Mention**:
>
> - Input manual mendukung fitur mention (`@`) untuk menyisipkan nilai dinamis (misal: `@Biaya Provisi`).
> - Placeholder hasil mention akan diproses terlebih dahulu sebelum dokumen dibuat.

---

### 7. PEKERJAAN (Prapurna Only)

| Teks di Dokumen         | Placeholder                   | Data Source                           | Contoh Output                      |
| ----------------------- | ----------------------------- | ------------------------------------- | ---------------------------------- |
| Tanggal Mulai Kerja     | `{{tgl_mulai_kerja}}`         | `dataLengkap.tgl_mulai_kerja`         | `01 Maret 1990`                    |
| Masa Kerja              | `{{masa_kerja}}`              | `dataLengkap.masa_kerja`              | `35 Tahun 2 Bulan 1 Minggu 0 Hari` |
| Alamat Kantor           | `{{alamat_kantor}}`           | `dataLengkap.alamat_kantor`           | `Jl. Pendidikan No. 1`             |
| Tanggal Pensiun Pemohon | `{{tgl_pensiun_pemohon}}`     | `dataLengkap.tgl_pensiun_pemohon`     | `01 Februari 2025`                 |
| Sisa Masa Kerja         | `{{sisa_masa_kerja}}`         | `dataLengkap.sisa_masa_kerja`         | `5 Tahun 2 Bulan 1 Minggu 0 Hari`  |
| **SK CPNS**             |                               |                                       |                                    |
| No SK CPNS              | `{{no_sk_cpns}}`              | `dataLengkap.no_sk_cpns`              | `813/KEP-CPNS/2000`                |
| Tanggal SK CPNS         | `{{tgl_sk_cpns}}`             | `dataLengkap.tgl_sk_cpns`             | `01 Januari 2000`                  |
| **SK Pangkat**          |                               |                                       |                                    |
| No SK Kenaikan Pangkat  | `{{no_sk_kenaikan_pangkat}}`  | `dataLengkap.no_sk_kenaikan_pangkat`  | `823/KEP-KP/2020`                  |
| Tgl SK Kenaikan Pangkat | `{{tgl_sk_kenaikan_pangkat}}` | `dataLengkap.tgl_sk_kenaikan_pangkat` | `01 Januari 2020`                  |

---

### 7.a DATA VERIFIKASI (Bendahara & Rekan Kerja)

| Teks di Dokumen   | Placeholder             | Data Source                     | Contoh Output  |
| ----------------- | ----------------------- | ------------------------------- | -------------- |
| Nama Bendahara    | `{{nama_bendahara}}`    | `dataLengkap.nama_bendahara`    | `Budi Santoso` |
| No HP Bendahara   | `{{no_hp_bendahara}}`   | `dataLengkap.no_hp_bendahara`   | `081234567890` |
| Nama Rekan Kerja  | `{{nama_rekan_kerja}}`  | `dataLengkap.nama_rekan_kerja`  | `Siti Aminah`  |
| No HP Rekan Kerja | `{{no_hp_rekan_kerja}}` | `dataLengkap.no_hp_rekan_kerja` | `089876543210` |

---

### 8. HAK PENSIUN (Purna Only)

| Teks di Dokumen     | Placeholder                | Data Source                        | Contoh Output |
| ------------------- | -------------------------- | ---------------------------------- | ------------- |
| Hak Pensiun Bulanan | `{{pensiun_bulan_jumlah}}` | `dataLengkap.pensiun_bulan_jumlah` | `4.733.300`   |
| Hak Pensiun (Alias) | `{{hak_pensiun}}`          | `dataLengkap.pensiun_bulan_jumlah` | `4.733.300`   |

---

## 📝 ALIASES & CAPITALIZED VARIANTS

Semua placeholder memiliki alias dengan format **Title_Case** untuk kompatibilitas template. Contoh:

| Original Placeholder             | Alias Placeholder                  |
| -------------------------------- | ---------------------------------- |
| `{{nama_pemohon}}`               | `{{Nama_Pemohon}}`                 |
| `{{no_ktp}}`                     | `{{No_Ktp}}`, `{{NIK}}`            |
| `{{tgl_call_memo}}`              | `{{Tgl_Call_Memo}}`                |
| `{{no_telepon}}`                 | `{{No_Telepon}}`                   |
| `{{alamat_ktp}}`                 | `{{Alamat_Ktp}}`, `{{Alamat}}`     |
| `{{tgl_lahir}}`                  | `{{Tgl_Lahir}}`                    |
| `{{status_perkawinan}}`          | `{{Status_Perkawinan}}`            |
| `{{status_rumah}}`               | `{{Status_Rumah}}`                 |
| `{{lama_tinggal}}`               | `{{Lama_Tinggal}}`                 |
| `{{tgl_terbit_ktp}}`             | `{{Tgl_Terbit_Ktp}}`               |
| `{{usia_pemohon}}`               | `{{Usia_Pemohon}}`                 |
| `{{pensiunan}}`                  | `{{Pensiunan}}`                    |
| `{{instansi}}`                   | `{{Instansi}}`                     |
| `{{jabatan}}`                    | `{{Jabatan}}`                      |
| `{{golongan}}`                   | `{{Golongan}}`                     |
| `{{nip}}`                        | `{{NIP}}`                          |
| `{{nopen}}`                      | `{{NOPEN}}`                        |
| `{{tgl_pensiun}}`                | `{{Tgl_Pensiun}}`                  |
| `{{tgl_pensiun_tmt}}`            | `{{Tgl_Pensiun_Tmt}}`              |
| `{{no_sk_pensiun}}`              | `{{No_Sk_Pensiun}}`                |
| `{{tgl_sk_pensiun}}`             | `{{Tgl_Sk_Pensiun}}`               |
| `{{segmentasi}}`                 | `{{Segmentasi}}`                   |
| `{{jenis_pengajuan}}`            | `{{Jenis_Pengajuan}}`              |
| `{{kategori}}`                   | `{{Kategori}}`                     |
| `{{payroll_bank}}`               | `{{Payroll_Bank}}`                 |
| `{{payroll_no_rek}}`             | `{{Payroll_No_Rek}}`, `{{No_Rek}}` |
| `{{nama_kerabat}}`               | `{{Nama_Kerabat}}`                 |
| `{{hubungan_kerabat}}`           | `{{Hubungan_Kerabat}}`             |
| `{{no_telepon_kerabat}}`         | `{{No_Telepon_Kerabat}}`           |
| `{{plafon}}`                     | `{{Plafon}}`                       |
| `{{usulan_plafon}}`              | `{{Usulan_Plafon}}`                |
| `{{tenor}}`                      | `{{Tenor}}`                        |
| `{{tenor_bulan}}`                | `{{Tenor_Bulan}}`                  |
| `{{bunga}}`                      | `{{Bunga}}`                        |
| `{{bunga_persen}}`               | `{{Bunga_Persen}}`                 |
| `{{tujuan_kredit}}`              | `{{Tujuan_Kredit}}`                |
| `{{biaya_provisi}}`              | `{{Biaya_Provisi}}`                |
| `{{biaya_provisi_percent}}`      | `{{Biaya_Provisi_Percent}}`        |
| `{{biaya_tatalaksana}}`          | `{{Biaya_Tatalaksana}}`            |
| `{{biaya_tatalaksana_percent}}`  | `{{Biaya_Tatalaksana_Percent}}`    |
| `{{biaya_psjt}}`                 | `{{Biaya_Psjt}}`                   |
| `{{biaya_psjt_percent}}`         | `{{Biaya_Psjt_Percent}}`           |
| `{{biaya_administrasi_text}}`    | `{{Biaya_Administrasi_Text}}`      |
| `{{biaya_administrasi_nominal}}` | `{{Biaya_Administrasi_Nominal}}`   |
| `{{kode_program}}`               | `{{Kode_Program}}`                 |
| `{{catatan_program_pricing}}`    | `{{Catatan_Program_Pricing}}`      |
| `{{syarat_penandatanganan}}`     | `{{Syarat_Penandatanganan}}`       |
| `{{syarat_pencairan_kredit}}`    | `{{Syarat_Pencairan_Kredit}}`      |
| `{{tgl_mulai_kerja}}`            | `{{Tgl_Mulai_Kerja}}`              |
| `{{alamat_kantor}}`              | `{{Alamat_Kantor}}`                |
| `{{nama_bendahara}}`             | `{{Nama_Bendahara}}`               |
| `{{no_hp_bendahara}}`            | `{{No_Hp_Bendahara}}`              |
| `{{nama_rekan_kerja}}`           | `{{Nama_Rekan_Kerja}}`             |
| `{{no_hp_rekan_kerja}}`          | `{{No_Hp_Rekan_Kerja}}`            |
| `{{sisa_masa_kerja}}`            | `{{Sisa_Masa_Kerja}}`              |
| `{{masa_kerja}}`                 | `{{Masa_Kerja}}`                   |
| `{{no_sk_cpns}}`                 | `{{No_Sk_Cpns}}`                   |
| `{{tgl_sk_cpns}}`                | `{{Tgl_Sk_Cpns}}`                  |
| `{{no_sk_kenaikan_pangkat}}`     | `{{No_Sk_Kenaikan_Pangkat}}`       |
| `{{tgl_sk_kenaikan_pangkat}}`    | `{{Tgl_Sk_Kenaikan_Pangkat}}`      |

---

## 📊 Data Source Summary

### Dari `DebiturFormData` (dataLengkap)

```typescript
interface DebiturFormData {
  // Tab A - Identitas
  nama_pemohon: string;
  no_ktp_pemohon: string;
  tgl_lahir_pemohon: string;
  tgl_terbit_ktp?: string; // [NEW] Tanggal terbit KTP
  usia_pemohon?: number; // [NEW] Calculated from tgl_lahir_pemohon
  pensiunan?: string; // [NEW] Only for Purna form
  alamat_ktp: string;
  domisili_berbeda?: boolean;
  alamat_domisili: string;
  no_telepon: string;
  status_perkawinan: string;
  status_rumah?: string;
  lama_tinggal?: string;
  nama_lengkap?: string; // Legacy field

  // Tab A - Kerabat (untuk Purna)
  nama_kerabat?: string;
  hubungan_kerabat?: string;
  no_telepon_kerabat?: string;

  // Tab B - Pekerjaan / Pensiun
  segmentasi: "taspen" | "asabri";
  jenis_pengajuan: "baru" | "top_up" | "top_up_sisa_gaji" | "takeover";
  instansi: string;
  jabatan?: string;
  golongan: string;
  nip?: string;
  tgl_mulai_kerja?: string;
  alamat_kantor?: string;
  tgl_pensiun_pemohon?: string;
  no_sk_pensiun?: string;
  tgl_sk_pensiun?: string;
  tgl_pensiun_tmt?: string;
  nopen?: string; // Nomor Pensiun for Purna

  // Data Verifikasi
  nama_bendahara?: string;
  no_hp_bendahara?: string;
  nama_rekan_kerja?: string;
  no_hp_rekan_kerja?: string;

  // Tab C - Penghasilan (Bank)
  nama_bank_pembayaran?: string;
  payroll_no_rek?: string;

  // Tab C - Penghasilan Gaji (Prapurna)
  gaji_bulan_1_nama?: string;
  gaji_bulan_1_jumlah?: string;
  gaji_bulan_2_nama?: string;
  gaji_bulan_2_jumlah?: string;
  gaji_bulan_3_nama?: string;
  gaji_bulan_3_jumlah?: string;
  estimasi_hak_pensiun?: string;

  // Tab C - Penghasilan Pensiun (Purna)
  pensiun_bulan_1_nama?: string;
  pensiun_bulan_1_jumlah?: string;
  pensiun_bulan_2_nama?: string;
  pensiun_bulan_2_jumlah?: string;
  pensiun_bulan_3_nama?: string;
  pensiun_bulan_3_jumlah?: string;
  pensiun_bulan_jumlah?: string;

  // Tab D - SLIK
  fasilitas_nihil: "ya" | "tidak";
  slik_facilities?: SlikFacility[];

  // Tab E - Usulan
  usulan_plafon_kredit: string;
  usulan_jangka_waktu_bulan: string;
  usulan_bunga_persen: string;
  usulan_angsuran?: string;
  tujuan_kredit?: string;
  kode_program?: string; // Kode Program
  biaya_provisi?: string; // Biaya Provisi (percentage, default: 1)
  biaya_tatalaksana?: string; // Biaya Tata Laksana (percentage, default: 2)
  syarat_penandatanganan_tambahan?: string; // [NEW] Tambahan syarat manual
}

interface SlikFacility {
  nama_bank: string;
  plafon_maks: string;
  outstanding: string;
  angsuran: string;
  kolektibilitas: string;
  is_takeover?: boolean;
  is_topup_lunas?: boolean;
}
```

### Calculated Fields

| Field                          | Formula                                                                   |
| ------------------------------ | ------------------------------------------------------------------------- |
| `usia_pemohon`                 | `calculateAge(tgl_lahir_pemohon)` - Auto calculated from birth date       |
| `rpc_dsc_90`                   | `penghasilan * 0.9`                                                       |
| `rpc_total_angsuran_eksisting` | `sum(slik_facilities[].angsuran)` where `!is_takeover && !is_topup_lunas` |
| `rpc_maksimal_angsuran`        | `rpc_dsc_90 - rpc_total_angsuran_eksisting`                               |
| `rpc_angsuran_diusulkan`       | Annuity formula: `P * (r(1+r)^n) / ((1+r)^n - 1)`                         |
| `rpc_dsr`                      | `(rpc_total_angsuran_baru / penghasilan) * 100`                           |
| `biaya_provisi`                | `plafon * 0.01`                                                           |
| `biaya_tatalaksana`            | `plafon * 0.02`                                                           |

---

## 🔀 Conditional Sections

Untuk menampilkan data secara kondisional berdasarkan checkbox, gunakan syntax berikut di template Word:

### Format Kondisional

> **PENTING**: Karena template menggunakan delimiter `{{}}`, maka conditional sections juga harus menggunakan `{{#...}}` dan `{{/...}}`

| Syntax                          | Fungsi                                              |
| ------------------------------- | --------------------------------------------------- |
| `{{#variable}}...{{/variable}}` | Tampilkan jika **true/ada nilai**                   |
| `{{^variable}}...{{/variable}}` | Tampilkan jika **false/tidak ada nilai** (inverted) |

### Contoh: Alamat Domisili Kondisional

Di file template Word, gunakan:

```
{{#domisili_berbeda}}
Alamat Domisili: {{alamat_domisili}}
{{/domisili_berbeda}}
```

Atau dengan inversi (alternatif text jika tidak dicentang):

```
{{^domisili_berbeda}}
Alamat sesuai dengan KTP
{{/domisili_berbeda}}
{{#domisili_berbeda}}
Alamat Domisili: {{alamat_domisili}}
{{/domisili_berbeda}}
```

### Boolean Fields Available

| Placeholder          | Data Source                             | Deskripsi                        |
| -------------------- | --------------------------------------- | -------------------------------- |
| `domisili_berbeda`   | `dataLengkap.domisili_berbeda`          | `true` jika checkbox dicentang   |
| `slik_nihil`         | `slik_facilities.length === 0`          | `true` jika tidak ada SLIK       |
| `slik_ada_fasilitas` | `slik_facilities.length > 0`            | `true` jika ada fasilitas SLIK   |
| `is_menikah`         | `status_perkawinan === 'menikah'`       | `true` jika status menikah       |
| `is_belum_menikah`   | `status_perkawinan === 'belum menikah'` | `true` jika status belum menikah |
| `is_cerai_hidup`     | `status_perkawinan === 'cerai hidup'`   | `true` jika status cerai hidup   |
| `is_cerai_mati`      | `status_perkawinan === 'cerai mati'`    | `true` jika status cerai mati    |

### Status Perkawinan & Dokumen Konfirmasi

Untuk menampilkan teks konfirmasi dokumen berdasarkan status perkawinan, gunakan logika kondisional berikut atau gunakan placeholder otomatis `{{cfm_status_perkawinan}}`.

**Opsi 1: Otomatis (Recommended)**
Gunaka placeholder `{{cfm_status_perkawinan}}` yang akan otomatis menampilkan teks yang sesuai:

- Menikah: `Cfm. Kutipan Akta Menikah terlampir.`
- Belum Menikah: `Cfm. Surat Keterangan Belum Menikah terlampir.`
- Cerai Hidup: `Cfm. Kutipan Akta Cerai terlampir.`
- Cerai Mati: `Cfm. Akta Kematian Pasangan terlampir.`

**Opsi 2: Manual Conditional**

```
{{#is_menikah}}Cfm. Kutipan Akta Menikah terlampir.{{/is_menikah}}
{{#is_belum_menikah}}Cfm. Surat Keterangan Belum Menikah terlampir{{/is_belum_menikah}}
{{#is_cerai_hidup}}Cfm. Kutipan Akta Cerai terlampir{{/is_cerai_hidup}}
{{#is_cerai_mati}}Cfm. Akta Kematian Pasangan terlampir{{/is_cerai_mati}}
```

---

## ⚠️ Notes

1. **Format Tanggal**: Semua tanggal dalam format Indonesia (`DD NamaBulan YYYY`)
2. **Format Rupiah**: Angka dengan separator titik (`1.000.000`)
3. **SLIK**: Maksimal 15 fasilitas kredit yang dapat ditampilkan
4. **Nil Values**: Jika data kosong, akan ditampilkan string kosong (`""`)
5. **Title Case**: Field seperti `status_rumah` dan `status_perkawinan` otomatis dikonversi ke Title Case
6. **Usia Pemohon**: Dihitung otomatis dari tanggal lahir jika tidak diisi manual
7. **Pensiunan**: Field ini hanya muncul di form Purna (pensiunan)
