import { DebiturData } from './types';

// Indonesian month names
export const BULAN_INDONESIA = [
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

/**
 * Format date to Indonesian format: "28 Desember 2025"
 */
export function formatDateIndonesian(dateStr: string | undefined): string {
  if (!dateStr) return "";

  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;

    const day = date.getDate();
    const month = BULAN_INDONESIA[date.getMonth()];
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  } catch {
    return dateStr;
  }
}

/**
 * Calculate age from birth date string
 */
export function calculateAge(dateStr: string | undefined): number | null {
  if (!dateStr) return null;
  try {
    const birthDate = new Date(dateStr);
    if (isNaN(birthDate.getTime())) return null;
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  } catch {
    return null;
  }
}

/**
 * Helper to convert snake_case to Title Case
 * e.g. "milik_sendiri" -> "Milik Sendiri"
 */
export function toTitleCase(str: string | undefined): string {
  if (!str) return "";
  return str
    .replace(/_/g, " ")
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Get human-readable label for credit purpose
 */
export function getTujuanKreditLabel(value: string | undefined): string {
  if (!value) return "Modal Usaha";

  const map: Record<string, string> = {
    modal_usaha: "Modal Usaha",
    renovasi_rumah: "Renovasi Rumah",
    biaya_pendidikan: "Biaya Pendidikan",
    biaya_kesehatan: "Biaya Kesehatan",
    pembelian_kendaraan: "Pembelian Kendaraan",
    kebutuhan_konsumtif: "Kebutuhan Konsumtif",
    lainnya: "Lainnya",
  };

  return map[value] || toTitleCase(value);
}

/**
 * Get confirmation text based on marriage status
 */
export function getCfmStatusPerkawinan(status: string | undefined): string {
  if (!status) return "";
  const statusLower = status.toLowerCase().replace(/_/g, " ");
  switch (statusLower) {
    case "menikah":
      return "Status pemohon Menikah. Cfm Kutipan Akta Nikah terlampir.";
    case "belum menikah":
    case "belum_menikah":
      return "Status pemohon Belum Menikah. Cfm Surat Keterangan Belum Menikah terlampir.";
    case "cerai hidup":
    case "cerai_hidup":
      return "Status pemohon Cerai Hidup. Cfm Akta Cerai terlampir.";
    case "cerai mati":
    case "cerai_mati":
      return "Status pemohon Cerai Mati. Cfm Akta Kematian Pasangan terlampir.";
    default:
      return "";
  }
}

/**
 * Format status kepegawaian text (formerly private method)
 */
export function formatStatusKepegawaian(status: string, instansi: string): string {
    let text = (status || "Calon Pensiunan").trim();
    // Remove trailing dot if exists
    if (text.endsWith('.')) text = text.slice(0, -1);

    // HEURISTIC: If text starts with "Pemohon", assume it's a full sentence provided by user/system
    if (text.toLowerCase().startsWith("pemohon")) {
      return `Memang benar ${text}.`;
    }

    // Standard case: "Calon Pensiunan PNS"
    let result = `Memang benar Pemohon adalah ${text}`;

    // Append instansi if not already present in the status text
    if (instansi && instansi !== "-" && !text.toLowerCase().includes(instansi.toLowerCase())) {
      result += ` di ${instansi}`;
    }

    return result + ".";
}

/**
 * Get status kepegawaian text based on segmentation and instance
 */
export function getStatusKepegawaian(debitur: DebiturData): string {
    const data = debitur.dataLengkap;
    const segmentasi = (debitur.segmentasi || data.segmentasi || "").toString().toLowerCase();
    const instansi = (data.instansi as string || "").trim();
    const instansiLower = instansi.toLowerCase();

    // Kategori: purna or prapurna
    const kategoriSlug = debitur.kategori.toLowerCase();
    const isPrapurna = kategoriSlug.includes("prapurna");

    // TASPEN (PNS)
    if (segmentasi.includes("taspen")) {
      // Logic: "Calon Pensiunan" only for Prapurna, otherwise "Pensiunan"
      const statusText = isPrapurna ? "Calon Pensiunan" : "Pensiunan";
      return `Pemohon merupakan ${statusText} PNS di ${instansi}.`;
    }

    // ASABRI (TNI/POLRI)
    if (segmentasi.includes("asabri")) {
      const polriKeywords = ["polri", "polres", "polda", "polsek", "brimob", "bhayangkara"];
      const tniKeywords = ["tni", "ad", "al", "au", "kodam", "korem", "kodim", "koramil", "yonif", "kopassus", "marinir", "paskhas", "kostrad"];

      let type = "TNI/POLRI"; // Default fallback

      // Check keywords
      if (polriKeywords.some(k => instansiLower.includes(k))) {
        type = "POLRI";
      } else if (tniKeywords.some(k => instansiLower.includes(k))) {
        type = "TNI";
      }

      return `Pemohon merupakan pensiunan ${type} di ${instansi}.`;
    }

    return "";
}

/**
 * Get masa kerja text based on segmentation
 */
export function getMasaKerjaText(debitur: DebiturData): string {
    const data = debitur.dataLengkap;
    const segmentasi = (debitur.segmentasi || data.segmentasi || "").toString().toLowerCase();

    const masaKerja = data.masa_kerja || "-";
    const tglMulai = formatDateIndonesian(data.tgl_mulai_kerja as string);
    // Use underlying data source (same for both, but label differs)
    const noSk = data.no_sk_cpns || "-";
    const tglSk = formatDateIndonesian(data.tgl_sk_cpns as string);

    // TASPEN (PNS)
    if (segmentasi.includes("taspen")) {
      return `Lama Masa Kerja ± ${masaKerja} atau sejak ${tglMulai}. Cfm. SK CPNS No. ${noSk} tanggal ${tglSk}.`;
    }

    // ASABRI (TNI/POLRI)
    if (segmentasi.includes("asabri")) {
      return `Lama Masa Kerja ± ${masaKerja} atau sejak ${tglMulai}. Cfm. SK Pengangkatan No. ${noSk} tanggal ${tglSk}.`;
    }

    return "";
}
