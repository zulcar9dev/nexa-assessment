// export * from "./debitur"; (in index.ts)
// Reverting to lowercase types to match frontend components

export type Kategori =
  | "prapurna_reguler"
  | "prapurna_takeover"
  | "purna_reguler"
  | "purna_takeover";

export type JenisPengajuan =
  | "baru"
  | "top_up"
  | "top_up_sisa_gaji"
  | "tht"
  | "takeover"
  | "fleksi_aktif";

export type Segmentasi = "taspen" | "asabri";

export interface Debitur {
  id: string;
  namaPemohon: string;
  noKtp: string;
  kategori: Kategori;
  jenisPengajuan: JenisPengajuan;
  segmentasi: Segmentasi;
  dataLengkap: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  userId?: string;
}

export interface DebiturFormData {
  // Tab A - Identitas
  nama_pemohon: string;
  no_ktp_pemohon: string;
  tgl_lahir_pemohon: string;
  tgl_terbit_ktp?: string;
  usia_pemohon?: number;
  pensiunan?: string; // Only for Purna
  alamat_ktp: string;
  tempat_tinggal_berbeda?: boolean;
  alamat_tempat_tinggal: string;
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
  masa_kerja?: string; // [NEW] Calculated field for elapsed service
  // SK CPNS & Pangkat
  no_sk_cpns?: string;
  tgl_sk_cpns?: string;
  no_sk_kenaikan_pangkat?: string;
  tgl_sk_kenaikan_pangkat?: string;
  // End SK
  alamat_kantor?: string;
  tgl_pensiun_pemohon?: string;
  sisa_masa_kerja?: string; // [NEW] Calculated field for remaining service
  no_sk_pensiun?: string;
  tgl_sk_pensiun?: string;
  tgl_pensiun_tmt?: string;
  nopen?: string; // Nomor Pensiun for Purna

  // Data Verifikasi
  nama_bendahara?: string;
  no_hp_bendahara?: string;
  nama_rekan_kerja?: string;
  no_hp_rekan_kerja?: string;

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
  estimasi_tht?: string; // [NEW] Estimasi Tunjangan Hari Tua (THT)
  tukin?: string;        // Tunjangan Kinerja (Fleksi Aktif)
  uang_makan?: string;   // Uang Makan (Fleksi Aktif)

  // Blokiran (Prapurna) - Numeric count (kali)
  blokiran_prapurna_jml?: number;
  blokiran_pindah_gaji_jml?: number;
  blokiran_wajib_jml?: number;
  total_blokiran_jml?: number; // Auto-calculated

  pensiun_bulan_1_nama?: string;
  pensiun_bulan_1_jumlah?: string;
  pensiun_bulan_2_nama?: string;
  pensiun_bulan_2_jumlah?: string;
  pensiun_bulan_3_nama?: string;
  pensiun_bulan_3_jumlah?: string;
  pensiun_bulan_jumlah?: string;

  // Tab D - SLIK
  tgl_slik?: string; // [NEW] Tanggal SLIK Manual
  fasilitas_nihil: "ya" | "tidak";
  slik_facilities?: SlikFacility[];

  // Tab E - Usulan
  usulan_plafon_kredit: string;
  usulan_jangka_waktu_bulan: string;
  usulan_bunga_persen: string;
  usulan_angsuran?: string;
  tujuan_kredit?: string;
  kode_program?: string;
  biaya_provisi?: string;           // Biaya Provisi (percentage, default: 1)
  biaya_tatalaksana?: string;       // Biaya Tata Laksana (percentage, default: 2)
  biaya_psjt_percent?: string;      // Biaya PSJT (percentage)
  biaya_administrasi_is_bebas?: boolean; // Bebas Biaya Administrasi
  biaya_administrasi_nominal?: string;   // Nominal Biaya Administrasi
  syarat_penandatanganan_tambahan?: string; // Syarat Penandatanganan Tambahan (Manual)
  syarat_pencairan_tambahan?: string; // Syarat Pencairan Tambahan (Manual) - Legacy/Deprecated
  syarat_penandatanganan_text?: string; // [NEW] Syarat Penandatanganan (Manual Full Text)
  syarat_pencairan_text?: string;       // [NEW] Syarat Pencairan (Manual Full Text)
}

export interface SlikFacility {
  nama_bank: string;
  jenis_kredit: string;
  plafon_maks: string;
  outstanding: string;
  angsuran: string;
  kolektibilitas: string;
  alasan: string;
  is_takeover?: boolean;
  is_topup_lunas?: boolean;
  nomor_rekening_pinjaman?: string;
  nomor_pk?: string;
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
