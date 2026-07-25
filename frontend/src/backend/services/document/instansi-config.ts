export type SegmentasiType = "BUMN_BUMD" | "PEMERINTAHAN" | "SWASTA";

export interface InstansiConfig {
  pattern: string[]; // Pola nama instansi (lowercase)
  segmentasi: SegmentasiType;
  alamatKantorPusat?: string; // Alamat kantor pusat (jika hardcoded)
  infoBisnis?: string; // Deskripsi bidang usaha perusahaan
  infoKelolaan?: string | string[]; // Teks kelolaan HLB/SLN
  infoPensiun?: string; // Info batas usia pensiun (jika berbeda)
  useBatasUsiaPensiun?: boolean; // Tampilkan batas usia pensiun? (TRUE for BUMN/BUMD & PNS)
  useGolongan?: boolean; // Tampilkan golongan/pangkat? (Default: False for BUMN, True for PNS)
  useSKMutasi?: boolean; // Gunakan SK Mutasi untuk jabatan?
}

// Default Configuration Maps
export const INSTANSI_CONFIGS: InstansiConfig[] = [
  {
    pattern: ["mitra karya prima", "mkp"],
    segmentasi: "BUMN_BUMD",
    alamatKantorPusat:
      "Alamat Kantor Pusat MKP di JBC Blok A No 4-6 Jl. Raya Juanda No. 1 Sidoarjo Jawa Timur.",
    infoKelolaan: "PT. Mitra Karya Prima (MKP) termasuk Daftar Kelolaan SLN",
    useBatasUsiaPensiun: false,
  },
  {
    pattern: ["kejaksaan negeri"],
    segmentasi: "PEMERINTAHAN",
    infoKelolaan:
      "Cfm. Surat No. PDM/9.2/10373 Tanggal 20 Desember 2017 Kejaksaan Negeri termasuk dalam Daftar Kelolaan HLB (Kejaksaan Agung Group).",
    useGolongan: true,
    useBatasUsiaPensiun: false, // Kejaksaan tidak menampilkan Batas Usia Pensiun
  },
  {
    pattern: ["universitas negeri gorontalo"],
    segmentasi: "PEMERINTAHAN",
    infoKelolaan:
      "Cfm. Surat Divisi PDM dan CLN No. PDM/9.2/1682 dan CLN/1/1626 tanggal 2 Maret 2018 Kementrian Riset Tekhnologi dan Pendidikan Tinggi termasuk dalam Program Nexa Assessment Selected Partner Kelolaan Divisi HLB Group Kementrian Riset Tekhnologi dan Pendidikan Tinggi.",
    useGolongan: true,
    useBatasUsiaPensiun: true, // Explicitly requested in old logic
  },
  {
    pattern: ["ksop anggrek", "kementerian perhubungan kantor ksop"],
    segmentasi: "PEMERINTAHAN",
    infoKelolaan:
      "Cfm. Surat Divisi PDM dan CLN No. PDM/9.2/1682 dan CLN/1/1626 Tanggal 2 Maret, Direktorat Jenderal Perhubungan Laut Up Pelabuhan Kelas II termasuk dalam Kementerian Perhubungan Group termasuk Daftar Kelolaan HLB.",
    useGolongan: true,
  },
  {
    pattern: ["up3 gorontalo", "pln"], // Must match both logic handled in generator
    segmentasi: "BUMN_BUMD",
    infoKelolaan: "PT. PLN (Persero) termasuk Daftar Kelolaan SLN",
    infoPensiun: "Pemohon Pensiun sampai dengan usia 56 tahun", // Special text for Pensiun
    useBatasUsiaPensiun: true,
    useSKMutasi: true,
  },
  {
    pattern: ["paguntaka", "cahaya nusantara", "nusa daya"],
    segmentasi: "BUMN_BUMD",
    infoKelolaan:
      "adalah anak Perusahaan dari PT. PLN Nusa Daya yang termasuk Daftar Kelolaan SLN", // Prefix with instansi name in generator
    useBatasUsiaPensiun: false,
  },
  {
    pattern: ["pln"],
    segmentasi: "BUMN_BUMD",
    infoKelolaan: "PT. PLN (Persero) termasuk Daftar Kelolaan SLN",
    useBatasUsiaPensiun: false,
  },
  {
    pattern: ["bkkbn", "badan kependudukan dan keluarga berencana nasional"],
    segmentasi: "PEMERINTAHAN",
    infoKelolaan:
      "Cfm. Surat No. PDM/9.2/10373 Tanggal 20 Desember 2017 BKKBN termasuk dalam Daftar Kelolaan SLN .",
    useGolongan: true,
  },
  {
    pattern: ["bpk perwakilan provinsi gorontalo", "badan pemeriksa keuangan"],
    segmentasi: "PEMERINTAHAN",
    infoKelolaan:
      "Cfm. Surat Divisi PDM dan CLN, No. PDM/9.2/1682 dan CLN/1/1626 Tanggal 2 Maret 2018 BPK termasuk dalam Program Nexa Assessment selected partner Kelolaan Divisi HLB Group BPK RI Costumer name Group BPK RI.",
    useGolongan: true,
    useBatasUsiaPensiun: true,
  },
  {
    pattern: ["rsud drg clara gobel", "rsud tani dan nelayan"],
    segmentasi: "PEMERINTAHAN",
    infoKelolaan:
      "Cfm PKS No GTL/5.2/006/2025 Perihal pembayaran gaji Jasa Medis dan penyaluran fasilitas assessment untuk Karyawan RSUD Tani Dan Nelayan (sekarang berubah nama menjadi RSUD Drg Clara Gobel), Perjanjian Kerjasama ini Berlaku sampai dengan jangka waktu 3(tiga) tahun atau sampai dengan tahun 2028.",
    useGolongan: true,
    useBatasUsiaPensiun: false,
  },
  {
    pattern: ["kpu kota gorontalo"],
    segmentasi: "PEMERINTAHAN",
    infoKelolaan:
      "Cfm. PKS Penyaluran Fasilitas Nexa Assessment Untuk Pegawai di Lingkungan Sekretariat KPU Kota Gorontalo Nomor Ref : GTL/003/PKS/ 2022 Tanggal 18 Agustus 2022.",
    useGolongan: true,
  },
  {
    pattern: ["kpu kabupaten bone bolango", "kpu bone bolango"],
    segmentasi: "PEMERINTAHAN",
    infoKelolaan:
      "Cfm. PKS Penyaluran Fasilitas Nexa Assessment Untuk Pegawai di Lingkungan Kantor KPU Kabupaten Bone Bolango Nomor Ref : GTL/009/PKS/2024 Tanggal 21 Maret 2025 dan berakhir di 21 Maret 2040 (Periode 15 Tahun).",
    useGolongan: true,
  },
  {
    pattern: ["sekolah rakyat terintegrasi 71 boalemo", "srt 71 boalemo"],
    segmentasi: "PEMERINTAHAN",
    infoKelolaan: [
      "Kementerian Sosial merupakan Kelolaan INS 1",
      "Cfm. Perjanjian Kerjasama Antara PT. Assessment Nasional (Persero) Tbk. Kantor Cabang Pusat dengan Sekolah Rakyat Terintegrasi 71 Boalemo Tentang Pembayaran Gaji, serta Penyaluran Fasilitas Nexa Assessment untuk Pegawai Negeri Sipili dan Pegawai Pemerintah  dengan Perjanjian Kerja  di Lingkungan Sekolah Rakyat Terintegrasi 71 Boalemo Kabupaten Boalemo Nomor : GTL/5.2/REF.004/2026; Nomor : 421/08/SRT 71 BOALEMO/IV/2025 Tanggal 29 April 2026.",
    ],
    useGolongan: true,
  },
  {
    pattern: ["puncak emas tani sejahtera", "pets"],
    segmentasi: "SWASTA",
    infoBisnis:
      "PT. Puncak Emas Tani Sejahtera merupakan Perusahaan yang bergerak dibidang Pertambangan Emas.",
    infoKelolaan:
      "PT. Puncak Emas Tani Sejahtera merupakan Anak Perusahan dari PT. MDKA Group (Kelolaan COB 2)",
  },
  {
    pattern: ["pani bersama tambang", "pbt"],
    segmentasi: "SWASTA",
    infoBisnis:
      "PT. Pani Bersama Tambang merupakan Perusahaan yang bergerak dibidang Pertambangan Emas.",
    infoKelolaan:
      "PT. Pani Bersama Tambang merupakan Anak Perusahan dari PT. MDKA Group (Kelolaan COB 2)",
  },
  {
    pattern: ["bawaslu", "badan pengawas pemilihan umum"],
    segmentasi: "PEMERINTAHAN",
    infoKelolaan:
      "Cfm. PKS Penyaluran Fasilitas Nexa Assessment Untuk Pegawai di Badan Pengawas Pemilihan Umum Gorontalo Nomor Ref : 15884.1/KU.01.00/SJ/09/2025 tanggal 19-09-2025.",
    useGolongan: true,
  },
  {
    pattern: ["pelabuhan perikanan nusantara kwandang", "pelabuhan perikanan kwandang"],
    segmentasi: "PEMERINTAHAN",
    infoKelolaan:
      "Cfm. Surat No. PDM/9.2/10373 Tanggal 20 Desember 2017 Kementerian Kelautan Dan Perikanan termasuk dalam Daftar Kelolaan SLN.",
    useGolongan: true,
    useBatasUsiaPensiun: false,
  },
  {
    pattern: ["pdam tirta limutu", "perumda air minum tirta limutu", "tirta limutu"],
    segmentasi: "BUMN_BUMD",
    infoKelolaan:
      "Cfm. PKS Penyaluran Fasilitas Nexa Assessment Untuk Pegawai di Lingkungan Perumda Air Minum Tirta Limutu Nomor Ref : GTL/PKS/005/2026 Tanggal 29 Juni 2026 dan berakhir di 10 Februari 2041 (Periode 15 Tahun).",
    useBatasUsiaPensiun: false,
  },
  {
    pattern: ["rsud dr. hi. zainal umar sidiki", "rsud zus", "zainal umar sidiki"],
    segmentasi: "PEMERINTAHAN",
    infoKelolaan:
      "Cfm. PKS Penyediaan Layanan Pembayaran Gaji / Jasa Medis dan Penyaluran Fasilitas Nexa Assessment Untuk Karyawan Rumah Sakit di Lingkungan RSUD dr. Hi. Zainal Umar Sidiki (ZUS) Nomor Ref : GTL/5.2/004/2024 Tanggal 02 Januari 2024 dan berakhir di 02 Januari 2029 (Periode 5 Tahun).",
    useGolongan: true,
    useBatasUsiaPensiun: false,
  },
];

export const getInstansiConfig = (
  instansiName: string = "",
  _segmentasi: string = "",
): InstansiConfig | undefined => {
  const nameLower = instansiName.toLowerCase();

  // Prioritize config matching pattern
  const config = INSTANSI_CONFIGS.find((cfg) => {
    // Special check for PLN (must match 'up3 gorontalo' AND 'pln')
    if (cfg.pattern.includes("up3 gorontalo")) {
      return nameLower.includes("up3 gorontalo") && nameLower.includes("pln");
    }
    return cfg.pattern.some((p) => nameLower.includes(p));
  });

  return config;
};
