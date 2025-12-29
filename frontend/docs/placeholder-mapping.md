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

| Teks di Dokumen | Placeholder | Data Source | Contoh Output |
|-----------------|-------------|-------------|---------------|
| Tgl. Call Memo | `{{ tgl_call_memo }}` | `new Date()` (tanggal hari ini) | `22 April 2025` |
| Yang Diverifikasi | `{{ nama_pemohon }}` | `dataLengkap.nama_pemohon` | `Rukmin Jusuf` |
| Bentuk Call (Telepon) | `{{ no_telepon }}` | `dataLengkap.no_telepon` | `085241788994` |
| Alamat di KTP | `{{ alamat_ktp }}` | `dataLengkap.alamat_ktp` | `Jl. Sudirman No. 123, RT 01/RW 02...` |
| Alamat Domisili | `{{ alamat_domisili }}` | `dataLengkap.alamat_domisili` | *(Muncul jika `domisili_berbeda` = true)* |
| Status Rumah | `{{ status_rumah }}` | `dataLengkap.status_rumah` | `Milik Sendiri` |
| Lama Tinggal | `{{ lama_tinggal }}` | `dataLengkap.lama_tinggal` | `40 Tahun 00 Bulan` |
| Tanggal Lahir | `{{ tgl_lahir }}` | `dataLengkap.tgl_lahir_pemohon` | `25 Januari 1965` |
| No KTP | `{{ no_ktp }}` | `dataLengkap.no_ktp_pemohon` | `7503066501650002` |
| Status Perkawinan | `{{ status_perkawinan }}` | `dataLengkap.status_perkawinan` | `Menikah` |
| Instansi | `{{ instansi }}` | `dataLengkap.instansi` | `TK Melati Indah` |
| TMT Pensiun | `{{ tgl_pensiun_tmt }}` | `dataLengkap.tgl_pensiun_tmt` | `01 Februari 2025` |
| No SK Pensiun | `{{ no_sk_pensiun }}` | `dataLengkap.no_sk_pensiun` | `800.1.3/SK/BUP-BB/12/190/IX/2024` |
| Tgl SK Pensiun | `{{ tgl_sk_pensiun }}` | `dataLengkap.tgl_sk_pensiun` | `19 September 2024` |
| Plafon Kredit | `{{ plafon }}` | `dataLengkap.usulan_plafon_kredit` | `367.000.000` |
| Jangka Waktu | `{{ tenor }}` | `dataLengkap.usulan_jangka_waktu_bulan` | `175` |
| Tujuan Kredit | `{{ tujuan_kredit }}` | `dataLengkap.tujuan_kredit` | `Biaya Modal Usaha` |

---

### 2. INFO SLIK

| Teks di Dokumen | Placeholder | Data Source | Contoh Output |
|-----------------|-------------|-------------|---------------|
| Tanggal SLIK | `{{ tgl_slik }}` | `new Date()` | `22 April 2025` |
| Fasilitas Nihil | `{{ fasilitas_nihil }}` | `dataLengkap.fasilitas_nihil` | `ya` / `tidak` |

#### SLIK Bank (Index 1-15)

| Placeholder | Data Source | Contoh Output |
|-------------|-------------|---------------|
| `{{ slik_bank_1_nama }}` | `slik_facilities[0].nama_bank` | `PT Hasjrat Multifinance` |
| `{{ slik_bank_1_jenis }}` | Fixed: `Konsumtif` | `Konsumtif` |
| `{{ slik_bank_1_maks }}` | `slik_facilities[0].plafon_maks` | `102.661.552` |
| `{{ slik_bank_1_outs }}` | `slik_facilities[0].outstanding` | `66.393.279` |
| `{{ slik_bank_1_coll }}` | `slik_facilities[0].kolektibilitas` | `1` |
| `{{ slik_bank_1_angsuran }}` | `slik_facilities[0].angsuran` | `0` |
| `{{ slik_bank_1_takeover }}` | `slik_facilities[0].is_takeover` | `ya` / `tidak` |

> Template mendukung hingga 15 bank: `slik_bank_1` sampai `slik_bank_15`

---

### 3. VERIFIKASI PENGHASILAN

| Teks di Dokumen | Placeholder | Data Source | Contoh Output |
|-----------------|-------------|-------------|---------------|
| Bank Pembayaran | `{{ payroll_bank }}` | `dataLengkap.nama_bank_pembayaran` | `Bank Sulutgo` |
| No Rekening | `{{ payroll_no_rek }}` | `dataLengkap.payroll_no_rek` | `01502060066122` |

#### Untuk Purna (Pensiunan)

| Placeholder | Data Source | Contoh Output |
|-------------|-------------|---------------|
| `{{ pensiun_bulan_1_nama }}` | `dataLengkap.pensiun_bulan_1_nama` | `Januari 2025` |
| `{{ pensiun_bulan_1 }}` | `dataLengkap.pensiun_bulan_1_jumlah` | `4.733.300` |
| `{{ pensiun_bulan_2_nama }}` | `dataLengkap.pensiun_bulan_2_nama` | `Februari 2025` |
| `{{ pensiun_bulan_2 }}` | `dataLengkap.pensiun_bulan_2_jumlah` | `4.733.300` |
| `{{ pensiun_bulan_3_nama }}` | `dataLengkap.pensiun_bulan_3_nama` | `Maret 2025` |
| `{{ pensiun_bulan_3 }}` | `dataLengkap.pensiun_bulan_3_jumlah` | `4.733.300` |

#### Untuk Prapurna (PNS Aktif)

| Placeholder | Data Source | Contoh Output |
|-------------|-------------|---------------|
| `{{ gaji_bulan_1_nama }}` | `dataLengkap.gaji_bulan_1_nama` | `Januari 2025` |
| `{{ gaji_bulan_1 }}` | `dataLengkap.gaji_bulan_1_jumlah` | `5.000.000` |
| `{{ gaji_bulan_2_nama }}` | `dataLengkap.gaji_bulan_2_nama` | `Februari 2025` |
| `{{ gaji_bulan_2 }}` | `dataLengkap.gaji_bulan_2_jumlah` | `5.000.000` |
| `{{ gaji_bulan_3_nama }}` | `dataLengkap.gaji_bulan_3_nama` | `Maret 2025` |
| `{{ gaji_bulan_3 }}` | `dataLengkap.gaji_bulan_3_jumlah` | `5.000.000` |
| `{{ estimasi_hak_pensiun }}` | `dataLengkap.estimasi_hak_pensiun` | `4.500.000` |

---

### 4. CALL MEMO (Kerabat)

| Teks di Dokumen | Placeholder | Data Source | Contoh Output |
|-----------------|-------------|-------------|---------------|
| Nama Kerabat | `{{ nama_kerabat }}` | `dataLengkap.nama_kerabat` | `Fiky Paputungan` |
| Hubungan | `{{ hubungan_kerabat }}` | `dataLengkap.hubungan_kerabat` | `Anak Kandung` |
| No Telepon Kerabat | `{{ no_telepon_kerabat }}` | `dataLengkap.no_telepon_kerabat` | `085390264917` |

---

### 5. PERHITUNGAN REPAYMENT CAPACITY (RPC)

| Teks di Dokumen | Placeholder | Data Source | Contoh Output |
|-----------------|-------------|-------------|---------------|
| Penghasilan Pemohon | `{{ rpc_penghasilan }}` | Calculated | `4.733.300` |
| DSC 90% | `{{ rpc_dsc_90 }}` | `penghasilan * 0.9` | `4.259.970` |
| Total Angsuran Eksisting | `{{ rpc_total_angsuran_eksisting }}` | Sum of SLIK angsuran | `0` |
| Maksimal Angsuran | `{{ rpc_maksimal_angsuran }}` | `dsc90 - total_angsuran` | `4.259.970` |
| Angsuran Diusulkan | `{{ rpc_angsuran_diusulkan }}` | Calculated annuity | `4.218.559` |
| Total Angsuran Baru | `{{ rpc_total_angsuran_baru }}` | `eksisting + diusulkan` | `4.218.559` |
| DSR | `{{ rpc_dsr }}` | `(total_baru / penghasilan) * 100` | `89,13` |

---

### 6. USULAN ASISTEN KREDIT KONSUMER

| Teks di Dokumen | Placeholder | Data Source | Contoh Output |
|-----------------|-------------|-------------|---------------|
| Maksimum Kredit | `{{ usulan_plafon }}` | `dataLengkap.usulan_plafon_kredit` | `367.000.000` |
| Jangka Waktu | `{{ usulan_jangka_waktu }}` | `dataLengkap.usulan_jangka_waktu_bulan` | `175 Bulan` |
| Bunga | `{{ bunga_persen }}` | `dataLengkap.usulan_bunga_persen` | `11% p.a Efektif Anuitas` |
| Biaya Provisi (1%) | `{{ biaya_provisi }}` | `plafon * 0.01` | `3.670.000` |
| Biaya Tata Laksana (2%) | `{{ biaya_tatalaksana }}` | `plafon * 0.02` | `7.340.000` |

---

### 7. ALIASES & ADDITIONAL FIELDS
(Untuk memastikan kompatibilitas template)

| Field / Alias | Data Source |
|---------------|-------------|
| `{{ Nama_Pemohon }}`, `{{ Nama_Lengkap }}` | Same as `{{ nama_pemohon }}` |
| `{{ No_Ktp }}`, `{{ NIK }}` | Same as `{{ no_ktp }}` |
| `{{ Tgl_Call_Memo }}`, `{{ Tanggal_Call_Memo }}` | Same as `{{ tgl_call_memo }}` |
| `{{ No_Telepon }}` | Same as `{{ no_telepon }}` |
| `{{ Alamat_Ktp }}`, `{{ Alamat }}` | Same as `{{ alamat_ktp }}` |
| `{{ pensiun_bulan_jumlah }}` | `dataLengkap.pensiun_bulan_jumlah` |
| `{{ hak_pensiun }}` | `dataLengkap.pensiun_bulan_jumlah` |
| `{{ tgl_mulai_kerja }}` | `dataLengkap.tgl_mulai_kerja` |
| `{{ alamat_kantor }}` | `dataLengkap.alamat_kantor` |

---

## 📊 Data Source Summary

### Dari `DebiturFormData` (dataLengkap)

```typescript
interface DebiturFormData {
    // Identitas
    nama_pemohon: string;           // placeholder: "e.g. Budi Santoso"
    no_ktp_pemohon: string;         // placeholder: "3201xxxxxxxxxxxx"
    tgl_lahir_pemohon: string;
    alamat_ktp: string;             // placeholder: "e.g. Jl. Sudirman No. 123, RT 01/RW 02, Kel. Menteng, Kec. Menteng, Jakarta Pusat"
    domisili_berbeda?: boolean;     // checkbox: "Alamat domisili berbeda dengan alamat KTP"
    alamat_domisili: string;        // placeholder: "Masukkan alamat domisili saat ini..." (muncul kondisional jika domisili_berbeda = true)
    no_telepon: string;             // placeholder: "812 3456 7890"
    status_perkawinan: string;
    status_rumah: string;
    lama_tinggal: string;           // placeholder: "e.g. 10 Tahun 5 Bulan"
    
    // Pekerjaan/Pensiun
    segmentasi: 'taspen' | 'asabri';
    jenis_pengajuan: string;
    instansi: string;
    jabatan: string;        // [NEW] Added to match code
    golongan: string;
    golongan: string;
    nip: string;
    nopen: string;
    tgl_pensiun_tmt: string;
    no_sk_pensiun: string;
    tgl_sk_pensiun: string;
    
    // Data Tambahan (Prapurna)
    tgl_mulai_kerja: string;
    alamat_kantor: string;
    tgl_pensiun_pemohon: string;

    // Bank Pembayaran
    nama_bank_pembayaran: string;
    payroll_no_rek: string;
    
    // Penghasilan Gaji (Prapurna)
    gaji_bulan_1_nama: string;
    gaji_bulan_1_jumlah: string;
    gaji_bulan_2_nama: string;
    gaji_bulan_2_jumlah: string;
    gaji_bulan_3_nama: string;
    gaji_bulan_3_jumlah: string;
    estimasi_hak_pensiun: string;
    
    // Penghasilan Pensiun (Purna)
    pensiun_bulan_1_nama: string;
    pensiun_bulan_1_jumlah: string;
    pensiun_bulan_2_nama: string;
    pensiun_bulan_2_jumlah: string;
    pensiun_bulan_3_nama: string;
    pensiun_bulan_3_jumlah: string;
    
    // Hak Pensiun
    pensiun_bulan_jumlah: string;
    
    // SLIK
    fasilitas_nihil: 'ya' | 'tidak';
    slik_facilities: SlikFacility[];
    
    // Usulan
    usulan_plafon_kredit: string;
    usulan_jangka_waktu_bulan: string;
    usulan_bunga_persen: string;
    tujuan_kredit: string;
    
    // Kerabat
    nama_kerabat: string;           // placeholder: "e.g. Ahmad Susanto"
    hubungan_kerabat: string;
    no_telepon_kerabat: string;     // placeholder: "812 3456 7890"
}
```

### Calculated Fields

| Field | Formula |
|-------|---------|
| `rpc_dsc_90` | `penghasilan * 0.9` |
| `rpc_total_angsuran_eksisting` | `sum(slik_facilities[].angsuran)` where `!is_takeover && !is_topup_lunas` |
| `rpc_maksimal_angsuran` | `rpc_dsc_90 - rpc_total_angsuran_eksisting` |
| `rpc_angsuran_diusulkan` | Annuity formula: `P * (r(1+r)^n) / ((1+r)^n - 1)` |
| `rpc_dsr` | `(rpc_total_angsuran_baru / penghasilan) * 100` |
| `biaya_provisi` | `plafon * 0.01` |
| `biaya_tatalaksana` | `plafon * 0.02` |

---

## ⚠️ Notes

1. **Format Tanggal**: Semua tanggal dalam format Indonesia (`DD NamaBulan YYYY`)
2. **Format Rupiah**: Angka dengan separator titik (`1.000.000`)
3. **SLIK**: Maksimal 15 fasilitas kredit yang dapat ditampilkan
4. **Nil Values**: Jika data kosong, akan ditampilkan string kosong (`""`)
