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
        // Use manual alasan input
        result[`slik_bank_${i}_alasan`] = facility.alasan || "";
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
        return "Cfm. Kutipan Akta Menikah terlampir.";
      case "belum menikah":
      case "belum_menikah":
        return "Cfm. Surat Keterangan Belum Menikah terlampir.";
      case "cerai hidup":
      case "cerai_hidup":
        return "Cfm. Kutipan Akta Cerai terlampir.";
      case "cerai mati":
      case "cerai_mati":
        return "Cfm. Akta Kematian Pasangan terlampir.";
      default:
        return "";
    }
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
      // For Prapurna: use estimasi hak pensiun or gaji
      const gaji1 =
        parseInt(
          String(data.gaji_bulan_1_jumlah || 0).replace(/[^0-9]/g, ""),
          10
        ) || 0;
      const gaji2 =
        parseInt(
          String(data.gaji_bulan_2_jumlah || 0).replace(/[^0-9]/g, ""),
          10
        ) || 0;
      const gaji3 =
        parseInt(
          String(data.gaji_bulan_3_jumlah || 0).replace(/[^0-9]/g, ""),
          10
        ) || 0;
      penghasilan = gaji3 || gaji2 || gaji1;
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

    // Calculate biaya
    const biayaProvisi = Math.round(plafon * 0.01);
    const biayaTatalaksana = Math.round(plafon * 0.02);

    // Base context with original keys
    const context: Record<string, unknown> = {
      // Date fields
      tgl_call_memo: this.formatDateIndonesian(today.toISOString()),
      tgl_slik: this.formatDateIndonesian(today.toISOString()),

      // Identitas
      nama_pemohon: debitur.namaPemohon || data.nama_pemohon || "",
      no_ktp: debitur.noKtp || data.no_ktp_pemohon || "",
      no_telepon: data.no_telepon || "",
      tgl_lahir: this.formatDateIndonesian(data.tgl_lahir_pemohon as string),
      alamat: data.alamat_ktp || data.alamat_domisili || "",
      alamat_ktp: data.alamat_ktp || "",
      alamat_domisili: data.alamat_domisili || "",
      // Kondisional: tampilkan alamat domisili hanya jika checkbox dicentang
      domisili_berbeda:
        data.domisili_berbeda === true || data.domisili_berbeda === "true",
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
      biaya_tatalaksana: this.formatRupiah(biayaTatalaksana),

      // Tujuan
      tujuan_kredit: this.getTujuanKreditLabel(data.tujuan_kredit as string),

      // Kerabat (Call Memo)
      nama_kerabat: data.nama_kerabat || "",
      hubungan_kerabat: this.toTitleCase(data.hubungan_kerabat as string),
      no_telepon_kerabat: data.no_telepon_kerabat || "",

      // Pekerjaan (Prapurna)
      tgl_mulai_kerja: this.formatDateIndonesian(
        data.tgl_mulai_kerja as string
      ),
      alamat_kantor: data.alamat_kantor || "",
      tgl_pensiun_pemohon: this.formatDateIndonesian(
        data.tgl_pensiun_pemohon as string
      ),

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
      Alamat_Kantor: context.alamat_kantor,

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
      Estimasi_Hak_Pensiun: context.estimasi_hak_pensiun,

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
      Biaya_Tatalaksana: context.biaya_tatalaksana,
      Tujuan_Kredit: context.tujuan_kredit,

      // Call Memo / Kerabat
      Nama_Kerabat: context.nama_kerabat,
      Hubungan_Kerabat: context.hubungan_kerabat,
      No_Telepon_Kerabat: context.no_telepon_kerabat,
      Tgl_Call_Memo: context.tgl_call_memo,
      Tanggal_Call_Memo: context.tgl_call_memo,
    };

    Object.assign(context, aliases);

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
    const hasRiskyCol = slikFacilities.some((f) => {
      const kol = String(f.kolektibilitas || "1");
      return kol !== "1";
    });

    // Fetch settings dynamically
    const settings = await ConfigService.getSettings();
    const teksMitigasi = settings.slikMitigasiRiskText;

    context.slik_mitigasi_risiko = hasRiskyCol ? teksMitigasi : "";
    context.Slik_Mitigasi_Risiko = context.slik_mitigasi_risiko;

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
    console.log(`[TEMPLATE] Using template path: ${templatePath}`);

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
    console.log("[TEMPLATE] domisili_berbeda:", context.domisili_berbeda);
    console.log("[TEMPLATE] alamat_domisili:", context.alamat_domisili);

    // Debug: log SLIK fields
    console.log("[TEMPLATE] slik_ada_fasilitas:", context.slik_ada_fasilitas);
    console.log("[TEMPLATE] slik_bank_1_ada:", context.slik_bank_1_ada);
    console.log("[TEMPLATE] slik_bank_1_nama:", context.slik_bank_1_nama);
    console.log("[TEMPLATE] slik_bank_2_ada:", context.slik_bank_2_ada);

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
