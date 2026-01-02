
export const DOCUMENT_PLACEHOLDERS = [
    // 1. INVESTIGASI & IDENTITAS
    { label: "Tanggal Call Memo", value: "{{tgl_call_memo}}" },
    { label: "Nama Pemohon", value: "{{nama_pemohon}}" },
    { label: "No Telepon", value: "{{no_telepon}}" },
    { label: "Alamat KTP", value: "{{alamat_ktp}}" },
    { label: "Alamat Domisili", value: "{{alamat_domisili}}" },
    { label: "Status Rumah", value: "{{status_rumah}}" },
    { label: "Lama Tinggal", value: "{{lama_tinggal}}" },
    { label: "Tanggal Lahir", value: "{{tgl_lahir}}" },
    { label: "No KTP", value: "{{no_ktp}}" },
    { label: "Tanggal Terbit KTP", value: "{{tgl_terbit_ktp}}" },
    { label: "Usia Pemohon", value: "{{usia_pemohon}}" },
    { label: "Status Perkawinan", value: "{{status_perkawinan}}" },
    { label: "Instansi", value: "{{instansi}}" },
    { label: "Jabatan", value: "{{jabatan}}" },
    { label: "Golongan", value: "{{golongan}}" },
    { label: "NIP", value: "{{nip}}" },
    { label: "NOPEN", value: "{{nopen}}" },
    { label: "TMT Pensiun", value: "{{tgl_pensiun_tmt}}" },
    { label: "Tanggal Pensiun", value: "{{tgl_pensiun}}" },
    { label: "No SK Pensiun", value: "{{no_sk_pensiun}}" },
    { label: "Tanggal SK Pensiun", value: "{{tgl_sk_pensiun}}" },
    { label: "Plafon Kredit (Investigasi)", value: "{{plafon}}" },
    { label: "Jangka Waktu (Investigasi)", value: "{{tenor}}" },
    { label: "Tujuan Kredit", value: "{{tujuan_kredit}}" },
    { label: "Segmentasi", value: "{{segmentasi}}" },
    { label: "Jenis Pengajuan", value: "{{jenis_pengajuan}}" },
    { label: "Kategori (Purna/Prapurna)", value: "{{kategori}}" },
    { label: "Pensiunan", value: "{{pensiunan}}" },

    // 2. INFO SLIK
    { label: "Tanggal SLIK", value: "{{tgl_slik}}" },
    { label: "Fasilitas Nihil (Ya/Tidak)", value: "{{fasilitas_nihil}}" },
    { label: "Fasilitas Nihil (Text)", value: "{{fasilitas_nihil_text}}" },
    { label: "SLIK Nihil (Boolean)", value: "{{slik_nihil}}" },
    { label: "SLIK Ada Fasilitas (Boolean)", value: "{{slik_ada_fasilitas}}" },
    { label: "Jumlah Fasilitas SLIK", value: "{{slik_jumlah_fasilitas}}" },
    // Local SLIK Placeholders (Context Aware)
    { label: "Nomor Rekening Pinjaman (Fasilitas)", value: "{{nomor_rekening_pinjaman}}" },
    { label: "Nomor PK (Fasilitas)", value: "{{nomor_pk}}" },
    { label: "Nama Bank (Fasilitas)", value: "{{nama_bank}}" },
    { label: "Jenis Kredit (Fasilitas)", value: "{{jenis_kredit}}" },
    { label: "Plafon Maks (Fasilitas)", value: "{{plafon_maks}}" },
    { label: "Outstanding (Fasilitas)", value: "{{outstanding}}" },
    { label: "Angsuran (Fasilitas)", value: "{{angsuran}}" },
    { label: "Kolektibilitas (Fasilitas)", value: "{{kolektibilitas}}" },

    // 3. VERIFIKASI PENGHASILAN
    { label: "Bank Pembayaran", value: "{{payroll_bank}}" },
    { label: "Nama Bank Pembayaran", value: "{{nama_bank_pembayaran}}" },
    { label: "No Rekening Payroll", value: "{{payroll_no_rek}}" },

    // Purna
    { label: "Bulan Pensiun 1 (Nama)", value: "{{pensiun_bulan_1_nama}}" },
    { label: "Bulan Pensiun 1 (Jumlah)", value: "{{pensiun_bulan_1}}" },
    { label: "Bulan Pensiun 2 (Nama)", value: "{{pensiun_bulan_2_nama}}" },
    { label: "Bulan Pensiun 2 (Jumlah)", value: "{{pensiun_bulan_2}}" },
    { label: "Bulan Pensiun 3 (Nama)", value: "{{pensiun_bulan_3_nama}}" },
    { label: "Bulan Pensiun 3 (Jumlah)", value: "{{pensiun_bulan_3}}" },
    { label: "Hak Pensiun Bulanan", value: "{{pensiun_bulan_jumlah}}" },
    { label: "Hak Pensiun (Alias)", value: "{{hak_pensiun}}" },

    // Prapurna
    { label: "Bulan Gaji 1 (Nama)", value: "{{gaji_bulan_1_nama}}" },
    { label: "Bulan Gaji 1 (Jumlah)", value: "{{gaji_bulan_1}}" },
    { label: "Bulan Gaji 2 (Nama)", value: "{{gaji_bulan_2_nama}}" },
    { label: "Bulan Gaji 2 (Jumlah)", value: "{{gaji_bulan_2}}" },
    { label: "Bulan Gaji 3 (Nama)", value: "{{gaji_bulan_3_nama}}" },
    { label: "Bulan Gaji 3 (Jumlah)", value: "{{gaji_bulan_3}}" },
    { label: "Estimasi Hak Pensiun", value: "{{estimasi_hak_pensiun}}" },
    { label: "Estimasi THT", value: "{{estimasi_tht}}" },


    // 4. CALL MEMO (KERABAT)
    { label: "Nama Kerabat", value: "{{nama_kerabat}}" },
    { label: "Hubungan Kerabat", value: "{{hubungan_kerabat}}" },
    { label: "No Telepon Kerabat", value: "{{no_telepon_kerabat}}" },

    // 5. RPC
    { label: "Penghasilan RPC", value: "{{rpc_penghasilan}}" },
    { label: "DSC 90%", value: "{{rpc_dsc_90}}" },
    { label: "Total Angsuran Eksisting", value: "{{rpc_total_angsuran_eksisting}}" },
    { label: "Maksimal Angsuran", value: "{{rpc_maksimal_angsuran}}" },
    { label: "Angsuran Diusulkan", value: "{{rpc_angsuran_diusulkan}}" },
    { label: "Total Angsuran Baru", value: "{{rpc_total_angsuran_baru}}" },
    { label: "DSR (%)", value: "{{rpc_dsr}}" },

    // 6. USULAN KREDIT
    { label: "Maksimum Kredit (Usulan)", value: "{{usulan_plafon}}" },
    { label: "Jangka Waktu (Usulan)", value: "{{usulan_jangka_waktu}}" },
    { label: "Tenor (Bulan)", value: "{{tenor_bulan}}" },
    { label: "Bunga (%)", value: "{{bunga}}" },
    { label: "Bunga (Lengkap)", value: "{{bunga_persen}}" },
    { label: "Biaya Provisi (Nominal)", value: "{{biaya_provisi}}" },
    { label: "Biaya Provisi (%)", value: "{{biaya_provisi_percent}}" },
    { label: "Biaya Tata Laksana (Nominal)", value: "{{biaya_tatalaksana}}" },
    { label: "Biaya Tata Laksana (%)", value: "{{biaya_tatalaksana_percent}}" },
    { label: "Biaya PSJT (Nominal)", value: "{{biaya_psjt}}" },
    { label: "Biaya PSJT (%)", value: "{{biaya_psjt_percent}}" },
    { label: "Biaya Administrasi", value: "{{biaya_administrasi_text}}" },
    { label: "Kode Program", value: "{{kode_program}}" },
    { label: "Catatan Program Pricing", value: "{{catatan_program_pricing}}" },
    { label: "Syarat Penandatanganan (Auto)", value: "{{syarat_penandatanganan}}" },
    { label: "Syarat Pencairan Kredit (Auto)", value: "{{syarat_pencairan_kredit}}" },

    // 7. PEKERJAAN (PRAPURNA)
    { label: "Tanggal Mulai Kerja", value: "{{tgl_mulai_kerja}}" },
    { label: "Alamat Kantor", value: "{{alamat_kantor}}" },
    { label: "Tanggal Pensiun Pemohon", value: "{{tgl_pensiun_pemohon}}" },
    { label: "Masa Kerja", value: "{{masa_kerja}}" },
    { label: "Sisa Masa Kerja", value: "{{sisa_masa_kerja}}" },
    { label: "No SK CPNS", value: "{{no_sk_cpns}}" },
    { label: "Tanggal SK CPNS", value: "{{tgl_sk_cpns}}" },
    { label: "No SK Kenaikan Pangkat", value: "{{no_sk_kenaikan_pangkat}}" },
    { label: "Tanggal SK Kenaikan Pangkat", value: "{{tgl_sk_kenaikan_pangkat}}" },

    // 7a. DATA VERIFIKASI
    { label: "Nama Bendahara", value: "{{nama_bendahara}}" },
    { label: "No HP Bendahara", value: "{{no_hp_bendahara}}" },
    { label: "Nama Rekan Kerja", value: "{{nama_rekan_kerja}}" },
    { label: "No HP Rekan Kerja", value: "{{no_hp_rekan_kerja}}" },

    // 8. DATA BLOKIRAN (PRAPURNA)
    { label: "Blokiran Prapurna (Jumlah)", value: "{{blokiran_prapurna}}" },
    { label: "Blokiran Prapurna (Terbilang)", value: "{{blokiran_prapurna_terbilang}}" },
    { label: "Blokiran Pindah Gaji (Jumlah)", value: "{{blokiran_pindah_gaji}}" },
    { label: "Blokiran Pindah Gaji (Terbilang)", value: "{{blokiran_pindah_gaji_terbilang}}" },
    { label: "Blokiran Wajib (Jumlah)", value: "{{blokiran_wajib}}" },
    { label: "Blokiran Wajib (Terbilang)", value: "{{blokiran_wajib_terbilang}}" },
    { label: "Total Blokiran (Jumlah)", value: "{{total_blokiran}}" },
    { label: "Total Blokiran (Terbilang)", value: "{{total_blokiran_terbilang}}" },

    // Lists are auto-handled by backend logic now (e.g. {{#list_syarat_pencairan}})
];
