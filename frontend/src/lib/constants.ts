// Product Categories
export const PRODUCT_CATEGORIES = {
    type_a: {
        key: "type_a",
        nama: "Assessment Type A (Pre-Period)",
        description: "Assessment pra-periode untuk transisi pekerja yang akan memasuki masa pensiun",
        templateDocx: "template_type_a.docx",
        showOnDashboard: true,
    },
    type_b: {
        key: "type_b",
        nama: "Assessment Type B (Full-Period)",
        description: "Assessment purna-periode untuk pensiunan PNS/TNI/POLRI",
        templateDocx: "template_type_b.docx",
        showOnDashboard: true,
    },
    type_c: {
        key: "type_c",
        nama: "Assessment Type C (Active)",
        description: "Kredit untuk karyawan type_c BUMD/BUMN/Swasta/Pemerintahan",
        templateDocx: "template_type_c.docx",
        showOnDashboard: true,
    },
} as const;

// Jenis Pengajuan
export const JENIS_PENGAJUAN = {
    baru: { label: "Baru", color: "badge-primary" },
    top_up: { label: "Top Up", color: "badge-warning" },
    top_up_sisa_gaji: { label: "Top Up Sisa Gaji", color: "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300" },
    tht: { label: "Tunjangan Hari Tua (THT)", color: "bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300" },
    takeover: { label: "Take Over", color: "badge-danger" },
    fleksi_type_c: { label: "Active Assessment", color: "badge-success" },
    pensiunan_janda_baru: { label: "Pensiunan Janda - Baru", color: "badge-primary" },
    pensiunan_janda_top_up: { label: "Pensiunan Janda - Top Up", color: "badge-warning" },
    pensiunan_janda_takeover: { label: "Pensiunan Janda - Take Over", color: "badge-danger" },
    pensiunan_duda_baru: { label: "Pensiunan Duda - Baru", color: "badge-primary" },
    pensiunan_duda_top_up: { label: "Pensiunan Duda - Top Up", color: "badge-warning" },
    pensiunan_duda_takeover: { label: "Pensiunan Duda - Take Over", color: "badge-danger" },
} as const;

// Segmentasi
export const SEGMENTASI = {
    taspen: { label: "TASPEN", description: "PNS", color: "badge-info" },
    asabri: { label: "ASABRI", description: "TNI/POLRI", color: "badge-success" },
    bumd_bumn: { label: "BUMD/BUMN", description: "Perusahaan BUMD/BUMN", color: "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300" },
    swasta: { label: "Swasta", description: "Perusahaan Swasta", color: "bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300" },
    pemerintahan: { label: "Pemerintahan", description: "Instansi Pemerintah", color: "bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300" },
} as const;

// DSR Limits
export const DSR_LIMIT = 90;

// Batas usia pemohon saat kredit lunas (per kategori)
export const AGE_LIMITS = {
    purnaTypeA: { years: 74, months: 10 }, // Type A (Pre-Period) & Purna standar
    purnaStandard: { years: 74, months: 10 },
    aktif: { years: 75, months: 0 }, // Type C (Active)
    janda: { years: 75, months: 0 },
    duda: { years: 75, months: 0 },
} as const;

// Batas tenor maksimal (bulan) per kategori
export const TENOR_CAPS = {
    typeA_taspen: 240, // 20 tahun
    typeA_asabri: 180, // 15 tahun
    purnaStandard: 180, // 15 tahun
    janda: 120, // 10 tahun
    duda: 60, // 5 tahun
    aktif: 180, // 15 tahun
} as const;

// Date keys for formatting
export const DATE_KEYS = [
    "tgl_lahir_pemohon",
    "tgl_terbit_ktp",
    "tgl_mulai_kerja",
    "tgl_sk_cpns",
    "tgl_sk_golongan",
    "tgl_pensiun_pemohon",
    "tgl_slik",
    "mitigasi_slik_tgl_surat",
    "tgl_call_memo",
    "tgl_pensiun_tmt",
    "tgl_sk_pensiun",
];

// Nominal keys for formatting
export const NOMINAL_KEYS = [
    "plafon_kredit_dimohon",
    "usulan_plafon_kredit",
    "usulan_angsuran",
    "biaya_provisi_nominal",
    "biaya_tata_laksana_nominal",
    "biaya_administrasi",
    "gaji_bulan_1_jumlah",
    "gaji_bulan_2_jumlah",
    "gaji_bulan_3_jumlah",
    "estimasi_hak_pensiun",
    "taspen_tht",
    "taspen_hak_pensiun",
    "info_gaji_bendahara",
    "pensiun_bulan_1_jumlah",
    "pensiun_bulan_2_jumlah",
    "pensiun_bulan_3_jumlah",
    "pensiun_bulan_jumlah",
];

// Indonesian months
export const INDONESIAN_MONTHS = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
];
