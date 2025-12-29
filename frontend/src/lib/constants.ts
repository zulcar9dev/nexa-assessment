// Product Categories
export const PRODUCT_CATEGORIES = {
    prapurna: {
        key: "prapurna",
        nama: "BNI Fleksi Pensiun Prapurna",
        description: "Kredit untuk PNS yang akan memasuki masa pensiun",
        templateDocx: "template_prapurna.docx",
        showOnDashboard: true,
    },
    purna: {
        key: "purna",
        nama: "BNI Fleksi Pensiun Purna",
        description: "Kredit untuk pensiunan PNS/TNI/POLRI",
        templateDocx: "template_purna.docx",
        showOnDashboard: true,
    },
} as const;

// Jenis Pengajuan
export const JENIS_PENGAJUAN = {
    baru: { label: "Baru", color: "badge-primary" },
    top_up: { label: "Top Up", color: "badge-warning" },
    top_up_sisa_gaji: { label: "Tunjangan Hari Tua (THT)", color: "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300" },
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
