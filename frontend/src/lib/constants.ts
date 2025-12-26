// Product Categories
export const PRODUCT_CATEGORIES = {
    prapurna_reguler: {
        key: "prapurna_reguler",
        nama: "BNI Fleksi Pensiun Prapurna",
        description: "Kredit untuk PNS yang akan memasuki masa pensiun",
        templateDocx: "template_prapurna_reguler.docx",
        showOnDashboard: true,
    },
    prapurna_takeover: {
        key: "prapurna_takeover",
        nama: "BNI Fleksi Pensiun Prapurna Take Over",
        description: "Kredit take over untuk PNS prapurna",
        templateDocx: "template_prapurna_takeover.docx",
        showOnDashboard: false,
    },
    purna_reguler: {
        key: "purna_reguler",
        nama: "BNI Fleksi Pensiun Purna",
        description: "Kredit untuk pensiunan PNS/TNI/POLRI",
        templateDocx: "template_purna_reguler.docx",
        showOnDashboard: true,
    },
    purna_takeover: {
        key: "purna_takeover",
        nama: "BNI Fleksi Pensiun Purna Take Over",
        description: "Kredit take over untuk pensiunan",
        templateDocx: "template_purna_reguler.docx",
        showOnDashboard: false,
    },
} as const;

// Jenis Pengajuan
export const JENIS_PENGAJUAN = {
    baru: { label: "Baru", color: "badge-primary" },
    top_up: { label: "Top Up", color: "badge-warning" },
    top_up_sisa_gaji: { label: "Top Up Sisa Gaji", color: "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300" },
    takeover: { label: "Take Over", color: "badge-danger" },
} as const;

// Segmentasi
export const SEGMENTASI = {
    taspen: { label: "TASPEN", description: "PNS", color: "badge-info" },
    asabri: { label: "ASABRI", description: "TNI/POLRI", color: "badge-success" },
} as const;

// DSR Limits
export const DSR_LIMIT = 90;

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
