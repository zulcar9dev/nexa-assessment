// Debitur Types

export type Kategori =
    | "prapurna_reguler"
    | "prapurna_takeover"
    | "purna_reguler"
    | "purna_takeover";

export type JenisPengajuan =
    | "baru"
    | "top_up"
    | "top_up_sisa_gaji"
    | "takeover";

export type Segmentasi = "taspen" | "asabri";

export interface Debitur {
    id: string;
    namaPemohon: string;
    noKtp: string;
    kategori: Kategori;
    jenisPengajuan: JenisPengajuan;
    segmentasi: Segmentasi;
    dataLengkap: DebiturFormData;
    createdAt: string;
    updatedAt: string;
    userId?: string;
}

export interface DebiturFormData {
    // Tab A - Identitas
    nama_pemohon: string;
    no_ktp_pemohon: string;
    tgl_lahir_pemohon: string;
    alamat_ktp: string;
    alamat_domisili: string;
    no_telepon: string;
    status_perkawinan: string;
    status_rumah?: string;
    lama_tinggal?: string;
    nama_lengkap?: string; // Legacy field used in edit page

    // Tab A - Kerabat (untuk Purna)
    nama_kerabat?: string;
    hubungan_kerabat?: string;
    no_telepon_kerabat?: string;

    // Tab B - Pekerjaan / Pensiun
    segmentasi: Segmentasi;
    jenis_pengajuan: JenisPengajuan;
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

    // Tab C - Penghasilan
    nama_bank_pembayaran?: string;
    payroll_no_rek?: string;
    gaji_bulan_1_nama?: string;
    gaji_bulan_1_jumlah?: string;
    gaji_bulan_2_nama?: string;
    gaji_bulan_2_jumlah?: string;
    gaji_bulan_3_nama?: string;
    gaji_bulan_3_jumlah?: string;
    estimasi_hak_pensiun?: string;
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
}

export interface SlikFacility {
    nama_bank: string;
    plafon_maks: string;
    outstanding: string;
    angsuran: string;
    kolektibilitas: string;
    is_takeover?: boolean;
    is_topup_lunas?: boolean;
}

export interface DSRResult {
    dsr: number;
    dsc90: number;
    penghasilan: number;
    totalAngsuranEksisting: number;
    totalAngsuranBaru: number;
    maksimalAngsuran: number;
    isValid: boolean;
}
