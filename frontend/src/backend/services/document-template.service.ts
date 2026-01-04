/**
 * Document Template Service
 * Handles DOCX document generation using docxtemplater
 * Configured for Jinja2-style delimiters ({{ variable }})
 */

import Docxtemplater from "docxtemplater";
import PizZip from "pizzip";
import { promises as fs } from "fs";
import path from "path";
import { ConfigService } from "./config.service";
import { terbilang } from "../../lib/utils";

// Indonesian month names
const BULAN_INDONESIA = [
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

// Kategori type - simplified for document generation
export type KategoriDoc = "prapurna" | "purna";

interface SlikFacility {
  nama_bank: string;
  jenis_kredit?: string;
  plafon_maks: string;
  outstanding: string;
  angsuran: string;
  kolektibilitas: string;
  alasan?: string;
  is_takeover?: boolean;
  is_topup_lunas?: boolean;
  nomor_rekening_pinjaman?: string;
  nomor_pk?: string;
}

interface DebiturData {
  namaPemohon: string;
  noKtp: string;
  kategori: string;
  jenisPengajuan: string;
  segmentasi: string;
  dataLengkap: Record<string, unknown>;
}

export class DocumentTemplateService {
  private static TEMPLATE_DIR = path.join(process.cwd(), "templates");

  /**
   * Format date to Indonesian format: "28 Desember 2025"
   */
  static formatDateIndonesian(dateStr: string | undefined): string {
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
   * Get human-readable label for credit purpose
   */
  static getTujuanKreditLabel(value: string | undefined): string {
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

    return map[value] || this.toTitleCase(value);
  }

  /**
   * Calculate age from birth date string
   */
  static calculateAge(dateStr: string | undefined): number | null {
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
   * Format number to Indonesian currency: 1000000 -> "1.000.000"
   */
  static formatCurrency(value: string | number | undefined): string {
    if (value === null || value === undefined) return "0";

    const num =
      typeof value === "string"
        ? parseInt(value.replace(/[^0-9]/g, ""), 10)
        : value;

    if (isNaN(num)) return "0";
    return Math.round(num).toLocaleString("id-ID");
  }

  /**
   * Format number with Rp prefix: 1000000 -> "Rp. 1.000.000"
   */
  static formatRupiah(value: string | number | undefined): string {
    const formatted = this.formatCurrency(value);
    return formatted === "0" ? "0" : formatted;
  }

  /**
   * Get template file path based on kategori
   */
  static getTemplatePath(kategori: KategoriDoc): string {
    const templateMap: Record<KategoriDoc, string> = {
      prapurna: "template_prapurna.docx",
      purna: "template_purna.docx",
    };

    const filename = templateMap[kategori] || "template_prapurna.docx";
    return path.join(this.TEMPLATE_DIR, filename);
  }

  /**
   * Check if template file exists
   */
  static async templateExists(kategori: KategoriDoc): Promise<boolean> {
    try {
      const templatePath = this.getTemplatePath(kategori);
      await fs.access(templatePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Generate Investigasi List (dynamic points) - Prapurna Aware
   */
  static generateInvestigasiList(context: Record<string, unknown>): Record<string, string>[] {
    const list: string[] = [];
    const isPrapurna = String(context.kategori || "").toLowerCase() === "prapurna";

    // 1. Alamat KTP
    if (context.alamat_ktp) {
      list.push(`Alamat Pemohon sesuai KTP di ${context.alamat_ktp}.`);
    }

    // 2. Alamat Tempat Tinggal (Conditional)
    if (context.tempat_tinggal_berbeda) {
      list.push(`Alamat Tempat Tinggal saat ini di ${context.alamat_tempat_tinggal}.`);
    }

    // 3. Status Rumah
    if (context.status_rumah) {
      list.push(`Status Rumah saat ini adalah ${context.status_rumah} dengan lama tinggal ± ${context.lama_tinggal || "-"}.`);
    }

    // 4. Usia & KTP Info
    if (context.usia_pemohon) {
      list.push(`Usia Pemohon ± ${context.usia_pemohon} Tahun (${context.tgl_lahir}) Cfm. KTP Nomor ${context.no_ktp} tanggal ${context.tgl_terbit_ktp}.`);
    }

    // 5. Status Perkawinan
    const cfmStatus = context.cfm_status_perkawinan as string;
    if (cfmStatus) {
      list.push(cfmStatus);
    }

    if (isPrapurna) {
      // --- PRAPURNA SPECIFIC ---
      // 6a. Status Kepegawaian & Masa Kerja
      if (context.status_kepegawaian) {
        list.push(String(context.status_kepegawaian));
      }
      if (context.masa_kerja_text) {
        list.push(String(context.masa_kerja_text));
      }

      // 6b. Golongan & Pangkat
      const golongan = context.golongan || "-";
      const noSkPangkat = context.no_sk_kenaikan_pangkat || "-";
      const tglSkPangkat = context.tgl_sk_kenaikan_pangkat || "-";
      list.push(`Golongan/Pangkat saat ini adalah ${golongan}. Cfm. SK Pangkat Terakhir No ${noSkPangkat} tanggal ${tglSkPangkat}.`);

      // 6c. Jabatan
      if (context.jabatan) {
        list.push(`Jabatan Pemohon saat ini adalah ${context.jabatan}.`);
      }

      // 6d. Alamat Kantor
      if (context.alamat_kantor) {
        list.push(`Alamat Kantor Pemohon di ${context.alamat_kantor}.`);
      }

      // 6e. Batas Usia Pensiun
      const tglPensiun = context.tgl_pensiun || "-";
      list.push(`Pemohon akan memasuki Batas Usia Pensiun per Tanggal ${tglPensiun} Cfm. Estimasi Hak Tabungan Hari Tua dan Pensiun Pokok.`);

    } else {
      // --- PURNA (EXISTING) ---
      // 6. Info Pensiunan
      const pensiunan = context.pensiunan || "-";
      const instansi = context.instansi || "-";
      const noSk = context.no_sk_pensiun || "-";
      const tglSk = context.tgl_sk_pensiun || "-";
      list.push(`Pemohon merupakan Pensiunan ${pensiunan} di ${instansi}. Cfm ${noSk} tanggal ${tglSk}.`);
    }

    // 7. Maksud Pengajuan
    const jenisPengajuan = context.jenis_pengajuan || "-";
    const plafon = context.plafon || "0";
    const tenor = context.tenor || "0";
    const produkName = isPrapurna ? "BNI Fleksi Pensiun Prapurna" : "BNI Fleksi Pensiun";

    list.push(`Maksud mengajukan fasilitas kredit ${produkName} ${jenisPengajuan} sebesar Rp. ${plafon} Jangka Waktu ${tenor} Bulan.`);

    // 8. Tujuan Kredit
    if (context.tujuan_kredit) {
      list.push(`Tujuan kredit untuk ${context.tujuan_kredit}.`);
    }

    return list.map(text => ({ text }));
  }

  /**
   * Generate Investigasi List (dynamic points)
   */


  /**
   * Generate Call Memo List (dynamic points)
   */
  static generateCallMemoList(context: Record<string, unknown>): Record<string, string>[] {
    const list: string[] = [];
    const pensiunan = context.pensiunan || "-";
    const instansi = context.instansi || "-";
    const statusRumah = context.status_rumah || "-";

    // 1. Pensiun Check
    list.push(`Memang benar Pemohon merupakan Pensiun ${pensiunan} di ${instansi}.`);

    // 2. Status Rumah Check
    list.push(`Menurut Ybs. rumah yang di tempati Pemohon saat ini adalah rumah ${statusRumah}.`);

    // 3. Kemampuan Bayar
    list.push("Ybs. menyampaikan bahwa Pemohon memiliki kemampuan untuk menyetor angsuran atas kredit yang dimohon, dan");

    // 4. Willingness to Remind
    list.push("Ybs. bersedia untuk mengingatkan Pemohon untuk kewajiban angsuran perbulan.");

    // 5. Character
    list.push("Pemohon dikenal baik dan bertanggung jawab.");

    return list.map(text => ({ text }));
  }

  // --- PRAPURNA CALL MEMO GENERATORS ---

  private static formatStatusKepegawaian(status: string, instansi: string): string {
    let text = (status || "Calon Pensiunan").trim();
    // Remove trailing dot if exists
    if (text.endsWith('.')) text = text.slice(0, -1);

    // HEURISTIC: If text starts with "Pemohon", assume it's a full sentence provided by user/system
    // Example input: "Pemohon merupakan pensiunan POLRI di POLDA Gorontalo"
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

  static generateBendaharaList(context: Record<string, unknown>): Record<string, string>[] {
    const list: string[] = [];
    const statusKepegawaian = String(context.status_kepegawaian || "");
    const instansi = String(context.instansi || "-");
    const jabatan = context.jabatan || "-";
    const masaKerja = context.masa_kerja || "-"; // Just number or partial text
    const tglMulai = context.tgl_mulai_kerja || "-";
    const tglPensiun = context.tgl_pensiun_pemohon || context.tgl_pensiun || "-";
    const gaji = context.gaji_bulan_3 || "0";
    const payrollBank = context.payroll_bank || "-";

    list.push(this.formatStatusKepegawaian(statusKepegawaian, instansi));
    list.push(`Jabatan saat ini Pemohon sebagai ${jabatan}.`);
    list.push(`Lama Masa Kerja Pemohon -/+ ${masaKerja} atau sejak ${tglMulai}.`);
    list.push(`Pemohon akan memasuki Batas Usia Pensiun per Tanggal ${tglPensiun}.`);
    list.push(`Gaji Aktif Pemohon saat ini berkisar Rp. ${gaji},-, dan pendapatan lainnya atau dapat dicocokkan pada Rekening Payroll ${payrollBank} (terlampir).`);
    list.push(`Karakter dan Integritas yang baik dan bertanggung jawab.`);

    return list.map(text => ({ text }));
  }

  static generateRekanKerjaList(context: Record<string, unknown>): Record<string, string>[] {
    const list: string[] = [];
    const statusKepegawaian = String(context.status_kepegawaian || "Calon Pensiunan");
    const instansi = String(context.instansi || "-");
    const jabatan = context.jabatan || "-";
    const masaKerja = context.masa_kerja || "-";
    const tglMulai = context.tgl_mulai_kerja || "-";
    const tglPensiun = context.tgl_pensiun_pemohon || context.tgl_pensiun || "-";

    list.push(this.formatStatusKepegawaian(statusKepegawaian, instansi));
    list.push(`Jabatan saat ini Pemohon sebagai ${jabatan}.`);
    list.push(`Lama Masa Kerja Pemohon -/+ ${masaKerja} atau sejak ${tglMulai}.`);
    list.push(`Pemohon akan memasuki Batas Usia Pensiun per Tanggal ${tglPensiun}.`);
    list.push(`Karakter dan Integritas yang baik dan bertanggung jawab.`);

    return list.map(text => ({ text }));
  }

  static generateTaspenList(context: Record<string, unknown>): Record<string, string>[] {
    const list: string[] = [];
    const tglPensiun = context.tgl_pensiun_pemohon || context.tgl_pensiun || "-";
    const tht = context.estimasi_tht || "0";
    const hakPensiun = context.estimasi_hak_pensiun || "0";

    list.push(`Tanggal Pensiun ${tglPensiun}.`);
    list.push(`THT +/- Rp. ${tht},-.`);
    list.push(`Hak Pensiun +/- Rp. ${hakPensiun},-.`);

    return list.map(text => ({ text }));
  }

  static generateKerabatPrapurnaList(context: Record<string, unknown>): Record<string, string>[] {
    const list: string[] = [];
    const statusKepegawaian = String(context.status_kepegawaian || "Calon Pensiunan PNS"); // User requested wording Pensiunan PNS but said use dynamic.
    const instansi = String(context.instansi || "-");
    const statusRumah = context.status_rumah || "-";

    list.push(this.formatStatusKepegawaian(statusKepegawaian, instansi));
    list.push(`Menurut Ybs. rumah yang di tempati Pemohon saat ini adalah Rumah ${statusRumah}.`);
    list.push("Ybs. menyampaikan bahwa Pemohon memiliki kemampuan untuk menyetor angsuran atas kredit yang dimohon, dan Ybs bersedia untuk mengingatkan Pemohon untuk kewajiban angsuran perbulan"); // As per user request wording

    return list.map(text => ({ text }));
  }

  /**
   * Map SLIK facilities to List for Loop (optimized)
   */
  static mapSlikToList(
    slikFacilities: SlikFacility[]
  ): Record<string, unknown>[] {
    return slikFacilities.map((facility) => {
      const alasanRaw = facility.alasan || "";
      const localContext = {
        nomor_rekening_pinjaman: facility.nomor_rekening_pinjaman || "",
        nomor_pk: facility.nomor_pk || "",
        nama_bank: facility.nama_bank || "",
        plafon_maks: this.formatRupiah(facility.plafon_maks),
        outstanding: this.formatRupiah(facility.outstanding),
        jenis_kredit: facility.jenis_kredit || "Konsumtif",
        kolektibilitas: facility.kolektibilitas || "1",
      };

      const alasanParsed = alasanRaw.replace(/{{([\w_]+)}}/g, (match, key) => {
        return (localContext as any)[key] || match;
      });

      return {
        nama_bank: facility.nama_bank || "",
        jenis_kredit: facility.jenis_kredit || "Konsumtif",
        plafon_maks: this.formatRupiah(facility.plafon_maks),
        outstanding: this.formatRupiah(facility.outstanding),
        angsuran: this.formatRupiah(facility.angsuran),
        kolektibilitas: facility.kolektibilitas || "1",
        alasan: alasanParsed,
        norek_existing: facility.nomor_rekening_pinjaman || "",
        nopk_existing: facility.nomor_pk || "",
        is_takeover: facility.is_takeover, // Optional, might be useful
        is_topup: facility.is_topup_lunas // Optional
      };
    });
  }

  /**
   * Map SLIK facilities to indexed fields (slik_bank_1, slik_bank_2, etc.)
   * Template uses indexed fields for each bank, up to 15 banks
   */
  static mapSlikToIndexedFields(
    slikFacilities: SlikFacility[]
  ): Record<string, unknown> {
    const result: Record<string, unknown> = {};

    // Map up to 15 SLIK facilities
    for (let i = 1; i <= 15; i++) {
      const facility = slikFacilities[i - 1];
      if (facility && facility.nama_bank) {
        // Boolean flag for conditional rendering
        result[`slik_bank_${i}_ada`] = true;
        result[`slik_bank_${i}_nama`] = facility.nama_bank || "";
        result[`slik_bank_${i}_jenis`] = facility.jenis_kredit || "Konsumtif";
        result[`slik_bank_${i}_maks`] = this.formatRupiah(facility.plafon_maks);
        result[`slik_bank_${i}_outs`] = this.formatRupiah(facility.outstanding);
        result[`slik_bank_${i}_coll`] = facility.kolektibilitas || "1";
        result[`slik_bank_${i}_angsuran`] = this.formatRupiah(
          facility.angsuran
        );
        result[`slik_bank_${i}_takeover`] = facility.is_takeover
          ? "ya"
          : "tidak";
        result[`slik_bank_${i}_topup`] = facility.is_topup_lunas
          ? "ya"
          : "tidak";
        // Use manual alasan input with local placeholder parsing
        const alasanRaw = facility.alasan || "";
        const localContext = {
          nomor_rekening_pinjaman: facility.nomor_rekening_pinjaman || "",
          nomor_pk: facility.nomor_pk || "",
          nama_bank: facility.nama_bank || "",
          plafon_maks: this.formatRupiah(facility.plafon_maks),
          outstanding: this.formatRupiah(facility.outstanding),
          jenis_kredit: facility.jenis_kredit || "Konsumtif",
          kolektibilitas: facility.kolektibilitas || "1",
        };
        // Simple replace for local context
        const alasanParsed = alasanRaw.replace(/{{([\w_]+)}}/g, (match, key) => {
          return (localContext as any)[key] || match;
        });

        result[`slik_bank_${i}_alasan`] = alasanParsed;
        result[`slik_bank_${i}_norek_existing`] = facility.nomor_rekening_pinjaman || "";
        result[`slik_bank_${i}_nopk_existing`] = facility.nomor_pk || "";
      } else {
        // Empty placeholders for unused slots - boolean is false
        result[`slik_bank_${i}_ada`] = false;
        result[`slik_bank_${i}_nama`] = "";
        result[`slik_bank_${i}_jenis`] = "";
        result[`slik_bank_${i}_maks`] = "";
        result[`slik_bank_${i}_outs`] = "";
        result[`slik_bank_${i}_coll`] = "";
        result[`slik_bank_${i}_angsuran`] = "";
        result[`slik_bank_${i}_takeover`] = "";
        result[`slik_bank_${i}_topup`] = "";
        result[`slik_bank_${i}_alasan`] = "";
        result[`slik_bank_${i}_norek_existing`] = "";
        result[`slik_bank_${i}_nopk_existing`] = "";
      }
    }

    return result;
  }

  /**
   * Helper to convert snake_case to Title Case
   * e.g. "milik_sendiri" -> "Milik Sendiri"
   */
  static toTitleCase(str: string | undefined): string {
    if (!str) return "";
    return str
      .replace(/_/g, " ")
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  /**
   * Get confirmation text based on marriage status
   */
  static getCfmStatusPerkawinan(status: string | undefined): string {
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
   * Get status kepegawaian text based on segmentation and instance
   */
  static getStatusKepegawaian(debitur: DebiturData): string {
    const data = debitur.dataLengkap;
    const segmentasi = (debitur.segmentasi || data.segmentasi || "").toString().toLowerCase();
    const instansi = (data.instansi as string || "").trim();
    const instansiLower = instansi.toLowerCase();

    // Kategori: purna or prapurna
    // Note: debitur.kategori might be 'purna_reguler', etc. Check for 'prapurna'
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

      // Logic: Prompt requested "pensiunan POLRI/TNI". 
      // Keeping it as "pensiunan" for both Purna and Prapurna based on strict prompt interpretation for Asabri, 
      // unlike PNS where user specifically asked for "Calon" distinction on Prapurna.
      return `Pemohon merupakan pensiunan ${type} di ${instansi}.`;
    }

    return "";
  }

  /**
   * Get masa kerja text based on segmentation
   */
  static getMasaKerjaText(debitur: DebiturData): string {
    const data = debitur.dataLengkap;
    const segmentasi = (debitur.segmentasi || data.segmentasi || "").toString().toLowerCase();

    const masaKerja = data.masa_kerja || "-";
    const tglMulai = this.formatDateIndonesian(data.tgl_mulai_kerja as string);
    // Use underlying data source (same for both, but label differs)
    const noSk = data.no_sk_cpns || "-";
    const tglSk = this.formatDateIndonesian(data.tgl_sk_cpns as string);

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

  /**
   * Prepare template context from debitur data
   * Maps DebiturFormData fields to template placeholders
   */
  static async prepareTemplateContext(debitur: DebiturData): Promise<Record<string, unknown>> {
    const data = debitur.dataLengkap;
    const today = new Date();
    const slikFacilities = (data.slik_facilities as SlikFacility[]) || [];

    // Get penghasilan based on category (gaji for prapurna, pensiun for purna)
    let penghasilan = 0;
    // Kategori has been normalized to 'purna' or 'prapurna'
    const isPurna = debitur.kategori === "purna";

    if (isPurna) {
      // For Purna: use pensiun amount
      const pensiun1 =
        parseInt(
          String(data.pensiun_bulan_1_jumlah || 0).replace(/[^0-9]/g, ""),
          10
        ) || 0;
      const pensiun2 =
        parseInt(
          String(data.pensiun_bulan_2_jumlah || 0).replace(/[^0-9]/g, ""),
          10
        ) || 0;
      const pensiun3 =
        parseInt(
          String(data.pensiun_bulan_3_jumlah || 0).replace(/[^0-9]/g, ""),
          10
        ) || 0;
      penghasilan = pensiun3 || pensiun2 || pensiun1;
    } else {
      // For Prapurna: use estimasi hak pensiun to match UI Calculation
      const estimasiHakPensiun =
        parseInt(
          String(data.estimasi_hak_pensiun || 0).replace(/[^0-9]/g, ""),
          10
        ) || 0;
      penghasilan = estimasiHakPensiun;
    }

    const dsc90 = Math.round(penghasilan * 0.9);

    // Calculate total SLIK angsuran (excluding takeover/topup lunas)
    const totalAngsuranSlik = slikFacilities
      .filter((f) => !f.is_takeover && !f.is_topup_lunas)
      .reduce(
        (sum, f) =>
          sum + (parseInt(String(f.angsuran).replace(/[^0-9]/g, ""), 10) || 0),
        0
      );

    // Calculate maksimal angsuran
    const maksimalAngsuran = dsc90 - totalAngsuranSlik;

    // Parse usulan values
    const plafon = parseInt(
      String(data.usulan_plafon_kredit || 0).replace(/[^0-9]/g, ""),
      10
    );
    const tenor = parseInt(String(data.usulan_jangka_waktu_bulan || 0), 10);
    const bunga = parseFloat(String(data.usulan_bunga_persen || 0));

    // Calculate angsuran using annuity formula
    const monthlyRate = bunga / 12 / 100;
    let angsuranKredit = 0;
    if (tenor > 0 && monthlyRate > 0) {
      angsuranKredit = Math.round(
        (plafon * (monthlyRate * Math.pow(1 + monthlyRate, tenor))) /
        (Math.pow(1 + monthlyRate, tenor) - 1)
      );
    } else if (tenor > 0) {
      angsuranKredit = Math.round(plafon / tenor);
    }

    // Calculate DSR
    const totalAngsuranBaru = totalAngsuranSlik + angsuranKredit;
    const dsr =
      penghasilan > 0
        ? Math.round((totalAngsuranBaru / penghasilan) * 10000) / 100
        : 0;

    // Calculate biaya - use manual percentage input if provided, else auto-calculate (1% and 2%)
    const pctProvisi = data.biaya_provisi
      ? parseFloat(String(data.biaya_provisi))
      : 1;
    const biayaProvisi = Math.round(plafon * (pctProvisi / 100));

    const pctTatalaksana = data.biaya_tatalaksana
      ? parseFloat(String(data.biaya_tatalaksana))
      : 2;
    const biayaTatalaksana = Math.round(plafon * (pctTatalaksana / 100));

    // Base context with original keys
    const context: Record<string, unknown> = {
      // Date fields
      tgl_call_memo: this.formatDateIndonesian(today.toISOString()),
      tgl_slik: this.formatDateIndonesian((data.tgl_slik as string) || today.toISOString()),

      // Identitas
      nama_pemohon: debitur.namaPemohon || data.nama_pemohon || "",
      no_ktp: debitur.noKtp || data.no_ktp_pemohon || "",
      no_telepon: data.no_telepon || "",
      tgl_lahir: this.formatDateIndonesian(data.tgl_lahir_pemohon as string),
      alamat: data.alamat_ktp || data.alamat_tempat_tinggal || "",
      alamat_ktp: data.alamat_ktp || "",
      // Map both new and old keys for compatibility
      alamat_tempat_tinggal: data.alamat_tempat_tinggal || "",
      alamat_domisili: data.alamat_tempat_tinggal || "", // Backward compat

      // Kondisional: tampilkan alamat tempat tinggal hanya jika checkbox dicentang
      tempat_tinggal_berbeda:
        data.tempat_tinggal_berbeda === true || data.tempat_tinggal_berbeda === "true",
      // Backward compat for templates:
      domisili_berbeda:
        data.tempat_tinggal_berbeda === true || data.tempat_tinggal_berbeda === "true",
      status_rumah: this.toTitleCase(data.status_rumah as string),
      lama_tinggal: data.lama_tinggal || "",
      status_perkawinan: this.toTitleCase(data.status_perkawinan as string),
      // Kondisional: status perkawinan untuk dokumen konfirmasi
      is_menikah:
        String(data.status_perkawinan || "").toLowerCase() === "menikah",
      is_belum_menikah:
        String(data.status_perkawinan || "").toLowerCase() ===
        "belum_menikah" ||
        String(data.status_perkawinan || "").toLowerCase() === "belum menikah",
      is_cerai_hidup:
        String(data.status_perkawinan || "").toLowerCase() === "cerai_hidup" ||
        String(data.status_perkawinan || "").toLowerCase() === "cerai hidup",
      is_cerai_mati:
        String(data.status_perkawinan || "").toLowerCase() === "cerai_mati" ||
        String(data.status_perkawinan || "").toLowerCase() === "cerai mati",
      cfm_status_perkawinan: this.getCfmStatusPerkawinan(
        data.status_perkawinan as string
      ),
      tgl_terbit_ktp: this.formatDateIndonesian(data.tgl_terbit_ktp as string),
      usia_pemohon:
        data.usia_pemohon ||
        this.calculateAge(data.tgl_lahir_pemohon as string),

      pensiunan: data.pensiunan || "",

      // Status Kepegawaian (New Placeholder)
      status_kepegawaian: this.getStatusKepegawaian(debitur),

      // Pekerjaan/Pensiun
      segmentasi: (debitur.segmentasi || data.segmentasi || "")
        .toString()
        .toUpperCase(),
      jenis_pengajuan: this.toTitleCase(
        (debitur.jenisPengajuan || data.jenis_pengajuan || "").toString()
      ),
      kategori: debitur.kategori.replace(/_/g, " "),
      instansi: data.instansi || "",
      jabatan: data.jabatan || "",
      golongan: data.golongan || "",
      nip: data.nip || "",
      nopen: data.nopen || "",
      tgl_pensiun: this.formatDateIndonesian(
        (data.tgl_pensiun_tmt as string) || (data.tgl_pensiun_pemohon as string)
      ),
      tgl_pensiun_tmt: this.formatDateIndonesian(
        data.tgl_pensiun_tmt as string
      ),
      no_sk_pensiun: data.no_sk_pensiun || "",
      tgl_sk_pensiun: this.formatDateIndonesian(data.tgl_sk_pensiun as string),

      // Bank Pembayaran / Payroll
      nama_bank_pembayaran: data.nama_bank_pembayaran || "",
      payroll_bank: data.nama_bank_pembayaran || "",
      payroll_no_rek: data.payroll_no_rek || "",

      // Penghasilan - Gaji (Prapurna)
      gaji_bulan_1_nama: data.gaji_bulan_1_nama || "",
      gaji_bulan_1: this.formatRupiah(data.gaji_bulan_1_jumlah as string),
      gaji_bulan_2_nama: data.gaji_bulan_2_nama || "",
      gaji_bulan_2: this.formatRupiah(data.gaji_bulan_2_jumlah as string),
      gaji_bulan_3_nama: data.gaji_bulan_3_nama || "",
      gaji_bulan_3: this.formatRupiah(data.gaji_bulan_3_jumlah as string),
      estimasi_hak_pensiun: this.formatRupiah(
        data.estimasi_hak_pensiun as string
      ),
      estimasi_tht: this.formatRupiah(
        data.estimasi_tht as string
      ),

      // Penghasilan - Pensiun (Purna)
      pensiun_bulan_1_nama: data.pensiun_bulan_1_nama || "Januari",
      pensiun_bulan_1: this.formatRupiah(data.pensiun_bulan_1_jumlah as string),
      pensiun_bulan_2_nama: data.pensiun_bulan_2_nama || "Februari",
      pensiun_bulan_2: this.formatRupiah(data.pensiun_bulan_2_jumlah as string),
      pensiun_bulan_3_nama: data.pensiun_bulan_3_nama || "Maret",
      pensiun_bulan_3: this.formatRupiah(data.pensiun_bulan_3_jumlah as string),

      // SLIK - Conditional rendering based on data availability
      // slik_nihil: true = tidak ada fasilitas kredit (tampilkan "Nihil - Tidak ada fasilitas kredit")
      // slik_ada_fasilitas: true = ada fasilitas kredit (tampilkan tabel data)
      slik_nihil: slikFacilities.length === 0,
      slik_ada_fasilitas: slikFacilities.length > 0,
      slik_jumlah_fasilitas: slikFacilities.length,
      fasilitas_nihil: slikFacilities.length === 0 ? "NIHIL" : "Tidak",
      fasilitas_nihil_text:
        slikFacilities.length === 0 ? "Nihil - Tidak ada fasilitas kredit" : "",

      // OPTIMIZED SLIK LIST
      list_fasilitas_kredit: this.mapSlikToList(slikFacilities),

      // We will populate list_investigasi later using the full context
      list_investigasi: [],

      // RPC (Repayment Capacity) Calculations
      rpc_penghasilan: this.formatRupiah(penghasilan),
      rpc_dsc_90: this.formatRupiah(dsc90),
      rpc_total_angsuran_eksisting: this.formatRupiah(totalAngsuranSlik),
      rpc_maksimal_angsuran: this.formatRupiah(maksimalAngsuran),
      rpc_angsuran_diusulkan: this.formatRupiah(angsuranKredit),
      rpc_total_angsuran_baru: this.formatRupiah(totalAngsuranBaru),
      rpc_dsr: `${dsr}`,

      // Usulan Kredit
      plafon: this.formatRupiah(plafon),
      usulan_plafon: this.formatRupiah(plafon),
      tenor: tenor,
      tenor_bulan: `${tenor} Bulan`,
      usulan_jangka_waktu: `${tenor} Bulan`,
      bunga: `${bunga}`,
      bunga_persen: `${bunga}% p.a Efektif Anuitas`,

      // Biaya
      biaya_provisi: this.formatRupiah(biayaProvisi),
      biaya_provisi_percent: `${pctProvisi}%`,
      biaya_tatalaksana: this.formatRupiah(biayaTatalaksana),
      biaya_tatalaksana_percent: `${pctTatalaksana}%`,

      // Biaya PSJT
      biaya_psjt: this.formatRupiah(Math.round(plafon * ((parseFloat(String(data.biaya_psjt_percent || 0)) || 0) / 100))),
      biaya_psjt_percent: `${parseFloat(String(data.biaya_psjt_percent || 0))}%`,

      // Biaya Administrasi
      biaya_administrasi_is_bebas: data.biaya_administrasi_is_bebas,
      biaya_administrasi_nominal: this.formatRupiah(data.biaya_administrasi_nominal as string),
      // Specific Text Requirement
      biaya_administrasi_text: data.biaya_administrasi_is_bebas
        ? "Bebas Biaya Administrasi"
        : `Biaya Administrasi sebesar Rp. ${this.formatRupiah(data.biaya_administrasi_nominal as string)},-`,

      // Tujuan
      tujuan_kredit: this.getTujuanKreditLabel(data.tujuan_kredit as string),

      // Kode Program
      kode_program: data.kode_program || "",

      // Catatan Program Pricing - will be set from settings later
      catatan_program_pricing: "",

      // Kerabat (Call Memo)
      nama_kerabat: data.nama_kerabat || "",
      hubungan_kerabat: this.toTitleCase(data.hubungan_kerabat as string),
      no_telepon_kerabat: data.no_telepon_kerabat || "",

      // Pekerjaan (Prapurna)
      tgl_mulai_kerja: this.formatDateIndonesian(
        data.tgl_mulai_kerja as string
      ),
      masa_kerja: data.masa_kerja || "",
      alamat_kantor: data.alamat_kantor || "",
      // SK CPNS & Pangkat
      no_sk_cpns: data.no_sk_cpns || "",
      tgl_sk_cpns: this.formatDateIndonesian(data.tgl_sk_cpns as string),
      no_sk_kenaikan_pangkat: data.no_sk_kenaikan_pangkat || "",
      tgl_sk_kenaikan_pangkat: this.formatDateIndonesian(data.tgl_sk_kenaikan_pangkat as string),
      // End SK
      tgl_pensiun_pemohon: this.formatDateIndonesian(
        data.tgl_pensiun_pemohon as string
      ),
      sisa_masa_kerja: data.sisa_masa_kerja || "",

      // Blokiran
      blokiran_prapurna: Number(data.blokiran_prapurna_jml || 0),
      blokiran_prapurna_terbilang: terbilang(Number(data.blokiran_prapurna_jml || 0)),
      blokiran_pindah_gaji: Number(data.blokiran_pindah_gaji_jml || 0),
      blokiran_pindah_gaji_terbilang: terbilang(Number(data.blokiran_pindah_gaji_jml || 0)),
      blokiran_wajib: Number(data.blokiran_wajib_jml || 0),
      blokiran_wajib_terbilang: terbilang(Number(data.blokiran_wajib_jml || 0)),
      total_blokiran: Number(data.total_blokiran_jml || 0),
      total_blokiran_terbilang: terbilang(Number(data.total_blokiran_jml || 0)),

      // Data Verifikasi
      nama_bendahara: data.nama_bendahara || "",
      no_hp_bendahara: data.no_hp_bendahara || "",
      nama_rekan_kerja: data.nama_rekan_kerja || "",
      no_hp_rekan_kerja: data.no_hp_rekan_kerja || "",

      // Hak Pensiun Bulanan (Purna)
      pensiun_bulan_jumlah: this.formatRupiah(
        data.pensiun_bulan_jumlah as string
      ),
      hak_pensiun: this.formatRupiah(data.pensiun_bulan_jumlah as string),
    };

    // --- EXTENSIVE ALIASES FOR COMPATIBILITY ---
    // Maps Capitalized, SNAKE_CASE, and other variations to their values
    const aliases: Record<string, unknown> = {
      // Identitas
      Nama_Pemohon: context.nama_pemohon,
      Nama_Lengkap: context.nama_pemohon,
      No_Ktp: context.no_ktp,
      NIK: context.no_ktp,
      No_Telepon: context.no_telepon,
      Tgl_Lahir: context.tgl_lahir,
      Alamat: context.alamat,
      Alamat_Ktp: context.alamat_ktp,
      Alamat_Domisili: context.alamat_domisili,
      Domisili_Berbeda: context.domisili_berbeda,
      Status_Rumah: context.status_rumah,
      Lama_Tinggal: context.lama_tinggal,
      Status_Perkawinan: context.status_perkawinan,
      Tgl_Terbit_Ktp: context.tgl_terbit_ktp,
      Usia_Pemohon: context.usia_pemohon,
      Pensiunan: context.pensiunan,
      // Status Perkawinan Conditional
      Is_Menikah: context.is_menikah,
      Is_Belum_Menikah: context.is_belum_menikah,
      Is_Cerai_Hidup: context.is_cerai_hidup,
      Is_Cerai_Mati: context.is_cerai_mati,
      Cfm_Status_Perkawinan: context.cfm_status_perkawinan,
      Status_Kepegawaian: context.status_kepegawaian,

      // Pekerjaan & Pensiun
      Segmentasi: context.segmentasi,
      Jenis_Pengajuan: context.jenis_pengajuan,
      Kategori: context.kategori,
      Instansi: context.instansi,
      Jabatan: context.jabatan,
      Golongan: context.golongan,
      NIP: context.nip,
      NOPEN: context.nopen,
      Tgl_Pensiun: context.tgl_pensiun,
      Tgl_Pensiun_Tmt: context.tgl_pensiun_tmt,
      No_Sk_Pensiun: context.no_sk_pensiun,
      Tgl_Sk_Pensiun: context.tgl_sk_pensiun,

      // Additional Prapurna Fields
      Tgl_Mulai_Kerja: context.tgl_mulai_kerja,
      Masa_Kerja: context.masa_kerja,
      // Calculate once or call method
      masa_kerja_text: this.getMasaKerjaText(debitur),
      Masa_Kerja_Text: this.getMasaKerjaText(debitur),
      Alamat_Kantor: context.alamat_kantor,

      // SK Aliases
      No_Sk_Cpns: context.no_sk_cpns,
      Tgl_Sk_Cpns: context.tgl_sk_cpns,
      No_Sk_Kenaikan_Pangkat: context.no_sk_kenaikan_pangkat,
      Tgl_Sk_Kenaikan_Pangkat: context.tgl_sk_kenaikan_pangkat,

      Sisa_Masa_Kerja: context.sisa_masa_kerja,
      // Alias SK Pengangkatan (ASABRI)
      No_Sk_Pengangkatan: context.no_sk_cpns,
      Tgl_Sk_Pengangkatan: context.tgl_sk_cpns,

      // Blokiran Aliases
      Blokiran_Prapurna: context.blokiran_prapurna,
      Blokiran_Prapurna_Terbilang: context.blokiran_prapurna_terbilang,
      Blokiran_Pindah_Gaji: context.blokiran_pindah_gaji,
      Blokiran_Pindah_Gaji_Terbilang: context.blokiran_pindah_gaji_terbilang,
      Blokiran_Wajib: context.blokiran_wajib,
      Blokiran_Wajib_Terbilang: context.blokiran_wajib_terbilang,
      Total_Blokiran: context.total_blokiran,
      Total_Blokiran_Terbilang: context.total_blokiran_terbilang,

      // Data Verifikasi Aliases
      Nama_Bendahara: context.nama_bendahara,
      No_Hp_Bendahara: context.no_hp_bendahara,
      Nama_Rekan_Kerja: context.nama_rekan_kerja,
      No_Hp_Rekan_Kerja: context.no_hp_rekan_kerja,

      // Bank & Payroll
      Nama_Bank: context.nama_bank_pembayaran,
      Nama_Bank_Pembayaran: context.nama_bank_pembayaran,
      Payroll_Bank: context.payroll_bank,
      Payroll_No_Rek: context.payroll_no_rek,
      No_Rek: context.payroll_no_rek,

      // Gaji (Prapurna)
      Gaji_Bulan_1_Nama: context.gaji_bulan_1_nama,
      Gaji_Bulan_1: context.gaji_bulan_1,
      Gaji_Bulan_2_Nama: context.gaji_bulan_2_nama,
      Gaji_Bulan_2: context.gaji_bulan_2,
      Gaji_Bulan_3_Nama: context.gaji_bulan_3_nama,
      Gaji_Bulan_3: context.gaji_bulan_3,
      Gaji_Bulan_3_Jumlah: context.gaji_bulan_3,
      Estimasi_Hak_Pensiun: context.estimasi_hak_pensiun,
      Estimasi_Tht: context.estimasi_tht,

      // Pensiun (Purna)
      Pensiun_Bulan_1_Nama: context.pensiun_bulan_1_nama,
      Pensiun_Bulan_1: context.pensiun_bulan_1,
      Pensiun_Bulan_2_Nama: context.pensiun_bulan_2_nama,
      Pensiun_Bulan_2: context.pensiun_bulan_2,
      Pensiun_Bulan_3_Nama: context.pensiun_bulan_3_nama,
      Pensiun_Bulan_3: context.pensiun_bulan_3,
      Pensiun_Bulan_1_Jumlah: context.pensiun_bulan_1,
      Pensiun_Bulan_2_Jumlah: context.pensiun_bulan_2,
      Pensiun_Bulan_3_Jumlah: context.pensiun_bulan_3,
      Pensiun_Bulan_Jumlah: context.pensiun_bulan_jumlah,
      Hak_Pensiun: context.hak_pensiun,

      // SLIK
      Slik_Nihil: context.slik_nihil,
      Slik_Ada_Fasilitas: context.slik_ada_fasilitas,
      Slik_Jumlah_Fasilitas: context.slik_jumlah_fasilitas,
      Fasilitas_Nihil: context.fasilitas_nihil,
      Fasilitas_Nihil_Text: context.fasilitas_nihil_text,
      Tgl_Slik: context.tgl_slik,

      // RPC
      Rpc_Penghasilan: context.rpc_penghasilan,
      Rpc_Dsc_90: context.rpc_dsc_90,
      Rpc_Total_Angsuran_Eksisting: context.rpc_total_angsuran_eksisting,
      Rpc_Maksimal_Angsuran: context.rpc_maksimal_angsuran,
      Rpc_Angsuran_Diusulkan: context.rpc_angsuran_diusulkan,
      Rpc_Total_Angsuran_Baru: context.rpc_total_angsuran_baru,
      Rpc_Dsr: context.rpc_dsr,

      // Usulan Kredit
      Plafon: context.plafon,
      Usulan_Plafon: context.usulan_plafon,
      Tenor: context.tenor,
      Tenor_Bulan: context.tenor_bulan,
      Usulan_Jangka_Waktu: context.usulan_jangka_waktu,
      Bunga: context.bunga,
      Bunga_Persen: context.bunga_persen,
      Biaya_Provisi: context.biaya_provisi,
      Biaya_Provisi_Percent: context.biaya_provisi_percent,
      Biaya_Tatalaksana: context.biaya_tatalaksana,
      Biaya_Tatalaksana_Percent: context.biaya_tatalaksana_percent,
      Biaya_Psjt: context.biaya_psjt,
      Biaya_Psjt_Percent: context.biaya_psjt_percent,
      Biaya_Administrasi_Text: context.biaya_administrasi_text,
      Biaya_Administrasi_Nominal: context.biaya_administrasi_nominal,
      Is_Bebas_Administrasi: context.biaya_administrasi_is_bebas,
      Tujuan_Kredit: context.tujuan_kredit,
      Kode_Program: context.kode_program,
      Catatan_Program_Pricing: context.catatan_program_pricing,

      // Call Memo / Kerabat
      Nama_Kerabat: context.nama_kerabat,
      Hubungan_Kerabat: context.hubungan_kerabat,
      No_Telepon_Kerabat: context.no_telepon_kerabat,
      Tgl_Call_Memo: context.tgl_call_memo,
      Tanggal_Call_Memo: context.tgl_call_memo,
    };

    Object.assign(context, aliases);

    // --- HELPER: Parse Placeholders in String ---
    const parsePlaceholders = (text: string, ctx: Record<string, unknown>): string => {
      if (!text) return "";
      return text.replace(/{{([\w_]+)}}/g, (match, key) => {
        const value = ctx[key];
        // If value exists and is not null/undefined
        if (value !== undefined && value !== null) {
          // If it's a number, format it? Or just return string
          return String(value);
        }
        // If key not found, return empty string or keep original?
        // Let's keep original if not found primarily, or empty. 
        // Based on docxtemplater behavior, it usually empties it. 
        // Let's return the value if we find it, otherwise keep empty string to be safe (or original for debugging).
        // For this requirement, let's substitute empty string if missing.
        return "";
      });
    };

    // Add indexed SLIK fields with Alias support
    const slikFields = this.mapSlikToIndexedFields(slikFacilities);

    // Create aliases for SLIK fields (e.g. Slik_Bank_1_Nama)
    const slikAliases: Record<string, unknown> = {};
    Object.keys(slikFields).forEach((key) => {
      const capitalizedKey = key
        .split("_")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join("_");
      slikAliases[capitalizedKey] = slikFields[key];
    });

    // Merge all SLIK fields
    Object.assign(context, slikFields, slikAliases);

    // --- MITIGASI RISIKO SLIK ---
    // Jika terdapat hasil slik yang selain kolektibilitas 1 - lancar
    // --- MITIGASI RISIKO SLIK ---
    // Jika terdapat hasil slik yang selain kolektibilitas 1 - lancar
    const hasRiskyCol = slikFacilities.some((f) => {
      // Ensure specific string conversion and trim
      const val = f.kolektibilitas;
      // Handle number 0 or similar falsy values correctly if valid
      const kolStr = (val !== null && val !== undefined && val !== "") ? String(val).trim() : "1";

      // Check if it is NOT "1"
      const isRisky = kolStr !== "1";
      if (isRisky) {
        console.log(`[RISK CHECK] Found risky facility: ${f.nama_bank} with Coll ${kolStr}`);
      }
      return isRisky;
    });

    // console.log(`[RISK CHECK] hasRiskyCol: ${hasRiskyCol}`);

    // Fetch settings dynamically
    const settings = await ConfigService.getSettings();
    const teksMitigasi = settings.slikMitigasiRiskText;
    const catatanPricing = settings.catatanProgramPricing;

    // Fallback if settings empty
    const finalMitigasiText = teksMitigasi || "Mitigasi Risiko: Debitur memiliki riwayat kredit dengan kolektibilitas tidak lancar.";

    if (hasRiskyCol && !teksMitigasi) {
      console.warn("[RISK CHECK] Risk detected but logic text is empty in settings! Using fallback.");
    }

    context.slik_mitigasi_risiko = hasRiskyCol ? finalMitigasiText : "";
    context.Slik_Mitigasi_Risiko = context.slik_mitigasi_risiko;

    // Set Catatan Program Pricing from Settings
    context.catatan_program_pricing = catatanPricing || "";
    context.Catatan_Program_Pricing = catatanPricing || "";

    // --- SYARAT PENANDATANGANAN KONDISIONAL ---
    // Logika berdasarkan Jenis Pengajuan
    const syaratList: string[] = [];
    const jenisPengajuanLower = (debitur.jenisPengajuan || data.jenis_pengajuan || "").toString().toLowerCase();

    // Create Nama Pemohon Title Case for usage in string
    const namaPemohonTitle = this.toTitleCase(debitur.namaPemohon || data.nama_pemohon as string || "");

    if (jenisPengajuanLower === "baru") {
      syaratList.push("Menyerahkan Asli SK Pensiun atas nama Pemohon sebagai Jaminan Kredit BNI.");
    } else if (jenisPengajuanLower.includes("top_up") || jenisPengajuanLower === "top up") {
      // Logic for Top Up and Top Up Sisa Gaji (starts with check for base text)
      syaratList.push("Jaminan yang telah ada sebelumnya berupa Asli SK Pensiun atas nama Pemohon tetap dipertahankan sebagai Jaminan Kredit di BNI.");

      // Additional text for Top Up and Top Up Sisa Gaji
      if (jenisPengajuanLower === "top_up_sisa_gaji" || jenisPengajuanLower === "top up sisa gaji" || jenisPengajuanLower === "top_up" || jenisPengajuanLower === "top up") {
        // Find Slik facilities that have nomor_rekening_pinjaman (and optional nomor_pk)
        const existingFacilities = slikFacilities.filter(f => f.nomor_rekening_pinjaman);

        // [UPDATE] Add global context for manual parsing usage (e.g. {{nomor_rekening_pinjaman}} in textarea)
        // Join multiple accounts with comma if exists, or just take the first one.
        const globalNoRek = existingFacilities.map(f => f.nomor_rekening_pinjaman).join(", ");
        const globalNoPk = existingFacilities.map(f => f.nomor_pk).join(", ");

        // Inject into context so manual parser can see it
        context.nomor_rekening_pinjaman = globalNoRek;
        context.nomor_pk = globalNoPk;

        if (existingFacilities.length > 0) {
          existingFacilities.forEach(f => {
            const noRek = f.nomor_rekening_pinjaman || "-";
            // Nomor PK might be empty for standard Top Up
            const noPk = f.nomor_pk || "-";
            syaratList.push(`Fasilitas kredit ini saling mengkait dengan fasilitas kredit sebelumnya nomor rekening pinjaman ${noRek} atas nama ${namaPemohonTitle}, No. PK ${noPk}`);
          });
        } else if (jenisPengajuanLower.includes("sisa_gaji") || jenisPengajuanLower.includes("sisa gaji")) {
          // Fallback for Sisa Gaji if not found (keep existing behavior for sisa gaji strictness)
          // For standard Top Up we might not force this line if no account number is input, 
          // but the requirement implies we should have it. 
          // Let's keep the fallback generic if we want to force the text placeholder style:
          syaratList.push(`Fasilitas kredit ini saling mengkait dengan fasilitas kredit sebelumnya nomor rekening pinjaman (................) atas nama ${namaPemohonTitle}, No. PK (................)`);
        }
      }
    } else if (jenisPengajuanLower === "takeover") {
      syaratList.push("Fasilitas Takeover (Syarat penandatanganan menyesuaikan)");
    }

    const syaratPenandatanganan = syaratList.join("\n");
    context.syarat_penandatanganan = syaratPenandatanganan;
    context.Syarat_Penandatanganan = syaratPenandatanganan;


    // --- SYARAT PENCAIRAN KREDIT ---
    // Logika berdasarkan Jenis Pengajuan dan Payroll BNI
    const namaBankPayroll = (data.nama_bank_pembayaran || "").toString().toLowerCase();
    const isPayrollBni = namaBankPayroll.includes("bni");
    let syaratPencairanText = "";

    const isBaru = jenisPengajuanLower === "baru";
    const isTopUpOrSisaGaji = jenisPengajuanLower.includes("top_up") || jenisPengajuanLower === "top up" || jenisPengajuanLower === "top_up_sisa_gaji" || jenisPengajuanLower === "top up sisa gaji";

    if ((isBaru || isTopUpOrSisaGaji) && isPayrollBni) {
      syaratPencairanText = "Rekening Payroll Gaji Pensiun akan dijadikan sebagai Rekening Afiliasi Kredit dan diblokir sebesar 2 (dua) kali angsuran (Pokok+ Bunga serta ditambah saldo minimum, dapat dibuka blokir saat kredit lunas). Dana ini dapat dipotong dari Pencairan Kredit.";
    } else if (isBaru && !isPayrollBni) {
      syaratPencairanText = "Rekening BNI Taplus atas nama Pemohon yang menjadi Rekening Payroll Gaji Pensiun akan dijadikan sebagai Rekening Afiliasi Kredit dan diblokir sebesar 4 (empat) kali angsuran, 2 (dua) kali angsuran Pindah Gaji (dapat dibuka setelah Gaji Pensiun telah tercermin di Rekening Afiliasi Kredit BNI) dan 2 (dua) kali angsuran (Pokok+ Bunga serta ditambah saldo minimum, dapat dibuka blokir saat kredit lunas). Dana ini dapat dipotong dari Pencairan Kredit.";
    }

    context.syarat_pencairan_kredit = syaratPencairanText;
    context.Syarat_Pencairan_Kredit = syaratPencairanText;
    context.Syarat_Pencairan = syaratPencairanText;

    // --- MANUAL OVERRIDE (MENTION FEATURE) ---
    // Check for manual inputs: syarat_penandatanganan_text & syarat_pencairan_text
    // If present, parse them and OVERRIDE the auto-generated text

    const manualSyaratPenandatanganan = (data.syarat_penandatanganan_text as string) || "";
    if (manualSyaratPenandatanganan.trim().length > 0) {
      // Filter out comments (lines starting with /*)
      const cleanText = manualSyaratPenandatanganan
        .split("\n")
        .filter(line => !line.trim().startsWith("/*"))
        .join("\n");

      // Parse placeholders using the fully built context (including aliases)
      const parsedText = parsePlaceholders(cleanText, context);

      // Override the context for Syarat Penandatanganan
      context.syarat_penandatanganan = parsedText;
      context.Syarat_Penandatanganan = parsedText;

      // Also update the List version for template compatibility
      const parsedList = parsedText
        .split("\n")
        .map(item => item.trim())
        .filter(item => item.length > 0)
        .map(item => ({ text: item }));

      context.list_syarat_penandatanganan = parsedList;
    }

    const manualSyaratPencairan = (data.syarat_pencairan_text as string) || "";
    if (manualSyaratPencairan.trim().length > 0) {
      // Filter out comments
      const cleanText = manualSyaratPencairan
        .split("\n")
        .filter(line => !line.trim().startsWith("/*"))
        .join("\n");

      // Parse placeholders
      const parsedText = parsePlaceholders(cleanText, context);

      // Override the context for Syarat Pencairan
      context.syarat_pencairan_kredit = parsedText;
      context.Syarat_Pencairan_Kredit = parsedText;
      context.Syarat_Pencairan = parsedText;

      // Create List Version for Syarat Pencairan (Manual)
      const parsedListPencairan = parsedText
        .split("\n")
        .map(item => item.trim())
        .filter(item => item.length > 0)
        .map(item => ({ text: item }));

      context.list_syarat_pencairan = parsedListPencairan;
      context.list_syarat_pencairan_kredit = parsedListPencairan;

      // Remove obsolete list_syarat_pencairan_tambahan if it was set anywhere else
      delete context.list_syarat_pencairan_tambahan;
    }

    // --- CLEANUP & DEFAULT HANDLING ---
    // Ensure lists are always arrays for template safety
    if (!context.list_syarat_penandatanganan) {
      context.list_syarat_penandatanganan = syaratList.map(item => ({ text: item }));
    }
    // Also support manual 'tambahan' fields if they exist but weren't caught above (fallback)
    const syaratTambahan = (data.syarat_penandatanganan_tambahan || "") as string;
    if (syaratTambahan) {
      context.syarat_penandatanganan_tambahan = syaratTambahan;
      context.list_syarat_tambahan = syaratTambahan.split("\n").map(t => ({ text: t.trim() })).filter(t => t.text);
    }
    const syaratPencairanTambahan = (data.syarat_pencairan_tambahan || "") as string;
    if (syaratPencairanTambahan) {
      context.syarat_pencairan_tambahan = syaratPencairanTambahan;
      // Clean up legacy list naming if needed or keep for backward compat
      context.list_syarat_pencairan_tambahan = []; // Explicitly empty it as requested by user to remove function
    }

    // --- GENERATE INVESTIGASI LIST ---
    // Generate the dynamic list for investigation section
    context.list_investigasi = this.generateInvestigasiList(context);

    // --- GENERATE CALL MEMO LIST ---
    const isPrapurna = String(debitur.kategori || "").toLowerCase() === "prapurna";

    // Explicitly add kategori to context for list generators
    context.kategori = debitur.kategori;

    // Use default call memo for Purna, or specific for Prapurna if needed
    context.list_call_memo = this.generateCallMemoList(context);

    // --- PRAPURNA SPECIFIC CALL MEMO LISTS ---
    context.list_verifikasi_bendahara = this.generateBendaharaList(context);
    context.list_verifikasi_rekan_kerja = this.generateRekanKerjaList(context);
    context.list_verifikasi_internet = this.generateTaspenList(context);
    context.list_verifikasi_kerabat = this.generateKerabatPrapurnaList(context);

    return context;
  }

  /**
   * Generate document from template using docxtemplater
   * Configured with Jinja2-style delimiters {{ }}
   */
  static async generateFromTemplate(
    kategori: KategoriDoc,
    debitur: DebiturData
  ): Promise<Buffer> {
    const templatePath = this.getTemplatePath(kategori);
    // console.log(`[TEMPLATE] Using template path: ${templatePath}`);

    // Read template file
    const templateBuffer = await fs.readFile(templatePath);

    // Load template with PizZip
    const zip = new PizZip(templateBuffer);

    // Create docxtemplater instance with Jinja2-style delimiters
    // NOTE: Conditional sections use same delimiters: {{#var}}...{{/var}}
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
      // Use Jinja2-style delimiters for variables {{ }}
      // Conditional sections: {{#var}}...{{/var}} and {{^var}}...{{/var}}
      delimiters: {
        start: "{{",
        end: "}}",
      },
      // Handle undefined values - return empty string
      nullGetter: () => {
        return "";
      },
    });

    // Prepare data context
    const context = await this.prepareTemplateContext(debitur);

    // Debug: log conditional field values
    // console.log("[TEMPLATE] domisili_berbeda:", context.domisili_berbeda);
    // console.log("[TEMPLATE] alamat_domisili:", context.alamat_domisili);

    // Debug: log SLIK fields
    // console.log("[TEMPLATE] slik_ada_fasilitas:", context.slik_ada_fasilitas);
    // console.log("[TEMPLATE] slik_bank_1_ada:", context.slik_bank_1_ada);
    // console.log("[TEMPLATE] slik_bank_1_nama:", context.slik_bank_1_nama);
    // console.log("[TEMPLATE] slik_bank_2_ada:", context.slik_bank_2_ada);

    // Render template with data
    doc.render(context);

    // Generate output buffer
    const outputBuffer = doc.getZip().generate({
      type: "nodebuffer",
      compression: "DEFLATE",
    });

    return outputBuffer as Buffer;
  }
}
