import { ConfigService } from '../config.service';
import { terbilang, formatRupiah } from '@/lib/utils';
import { DebiturData, SlikFacility } from './types';
import { 
  formatDateIndonesian, 
  toTitleCase, 
  getCfmStatusPerkawinan, 
  getStatusKepegawaian, 
  getMasaKerjaText, 
  getTujuanKreditLabel, 
  calculateAge 
} from './formatters';
import { SlikMapper } from './slik-mapper';
import { ListGenerators } from './list-generators';
import { FinancialContextBuilder } from './financial-context';
import { RequirementsContextBuilder } from './requirements-context';
import { AliasMapper } from './alias-mapper';

export class TemplateContextBuilder {
  /**
   * Prepare template context from debitur data
   * Maps DebiturFormData fields to template placeholders
   */
  static async prepareTemplateContext(debitur: DebiturData): Promise<Record<string, unknown>> {
    const data = debitur.dataLengkap;
    const today = new Date();
    const slikFacilities = (data.slik_facilities as SlikFacility[]) || [];

    // --- 1. BASE CONTEXT (Identity, Job, etc.) ---
    const context: Record<string, unknown> = {
      // Date fields
      tgl_call_memo: formatDateIndonesian(today.toISOString()),
      tgl_slik: formatDateIndonesian((data.tgl_slik as string) || today.toISOString()),

      // Identitas
      nama_pemohon: debitur.namaPemohon || data.nama_pemohon || "",
      no_ktp: debitur.noKtp || data.no_ktp_pemohon || "",
      no_telepon: data.no_telepon || "",
      tgl_lahir: formatDateIndonesian(data.tgl_lahir_pemohon as string),
      alamat: data.alamat_ktp || data.alamat_tempat_tinggal || "",
      alamat_ktp: data.alamat_ktp || "",
      alamat_tempat_tinggal: data.alamat_tempat_tinggal || "",
      alamat_domisili: data.alamat_tempat_tinggal || "", // Backward compat
      tgl_terbit_ktp: formatDateIndonesian(data.tgl_terbit_ktp as string),
      usia_pemohon: data.usia_pemohon || calculateAge(data.tgl_lahir_pemohon as string),
      pensiunan: data.pensiunan || "",
      
      // Status
      status_rumah: toTitleCase(data.status_rumah as string),
      lama_tinggal: data.lama_tinggal || "",
      status_perkawinan: toTitleCase(data.status_perkawinan as string),
      cfm_status_perkawinan: getCfmStatusPerkawinan(data.status_perkawinan as string),
      status_kepegawaian: getStatusKepegawaian(debitur),

      // Booleans
      tempat_tinggal_berbeda: data.tempat_tinggal_berbeda === true || data.tempat_tinggal_berbeda === "true",
      domisili_berbeda: data.tempat_tinggal_berbeda === true || data.tempat_tinggal_berbeda === "true",
      is_menikah: String(data.status_perkawinan || "").toLowerCase() === "menikah",
      is_belum_menikah: String(data.status_perkawinan || "").toLowerCase().includes("belum"),
      is_cerai_hidup: String(data.status_perkawinan || "").toLowerCase().includes("cerai_hidup") || String(data.status_perkawinan || "").toLowerCase().includes("cerai hidup"),
      is_cerai_mati: String(data.status_perkawinan || "").toLowerCase().includes("cerai_mati") || String(data.status_perkawinan || "").toLowerCase().includes("cerai mati"),

      // Pekerjaan/Pensiun Key Fields
      segmentasi: (debitur.segmentasi || data.segmentasi || "").toString().toUpperCase(),
      jenis_pengajuan: toTitleCase((debitur.jenisPengajuan || data.jenis_pengajuan || "").toString()),
      kategori: debitur.kategori.replace(/_/g, " "),
      instansi: data.instansi || "",
      jabatan: data.jabatan || "",
      golongan: data.golongan || "",
      nip: data.nip || "",
      nopen: data.nopen || "",
      tgl_pensiun: formatDateIndonesian((data.tgl_pensiun_tmt as string) || (data.tgl_pensiun_pemohon as string)),
      tgl_pensiun_tmt: formatDateIndonesian(data.tgl_pensiun_tmt as string),
      no_sk_pensiun: data.no_sk_pensiun || "",
      tgl_sk_pensiun: formatDateIndonesian(data.tgl_sk_pensiun as string),

      // Prapurna Specific
      tgl_mulai_kerja: formatDateIndonesian(data.tgl_mulai_kerja as string),
      masa_kerja: data.masa_kerja || "",
      alamat_kantor: data.alamat_kantor || "",
      no_sk_cpns: data.no_sk_cpns || "",
      tgl_sk_cpns: formatDateIndonesian(data.tgl_sk_cpns as string),
      no_sk_kenaikan_pangkat: data.no_sk_kenaikan_pangkat || "",
      tgl_sk_kenaikan_pangkat: formatDateIndonesian(data.tgl_sk_kenaikan_pangkat as string),
      tgl_pensiun_pemohon: formatDateIndonesian(data.tgl_pensiun_pemohon as string),
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

      // Bank & Payroll
      nama_bank_pembayaran: data.nama_bank_pembayaran || "",
      payroll_bank: data.nama_bank_pembayaran || "",
      payroll_no_rek: data.payroll_no_rek || "",

      // Gaji & Pensiun Details (Raw Fields)
      gaji_bulan_1_nama: data.gaji_bulan_1_nama || "",
      gaji_bulan_1: formatRupiah(data.gaji_bulan_1_jumlah as string),
      gaji_bulan_2_nama: data.gaji_bulan_2_nama || "",
      gaji_bulan_2: formatRupiah(data.gaji_bulan_2_jumlah as string),
      gaji_bulan_3_nama: data.gaji_bulan_3_nama || "",
      gaji_bulan_3: formatRupiah(data.gaji_bulan_3_jumlah as string),
      estimasi_hak_pensiun: formatRupiah(data.estimasi_hak_pensiun as string),
      estimasi_tht: formatRupiah(data.estimasi_tht as string),

      pensiun_bulan_1_nama: data.pensiun_bulan_1_nama || "Januari",
      pensiun_bulan_1: formatRupiah(data.pensiun_bulan_1_jumlah as string),
      pensiun_bulan_2_nama: data.pensiun_bulan_2_nama || "Februari",
      pensiun_bulan_2: formatRupiah(data.pensiun_bulan_2_jumlah as string),
      pensiun_bulan_3_nama: data.pensiun_bulan_3_nama || "Maret",
      pensiun_bulan_3: formatRupiah(data.pensiun_bulan_3_jumlah as string),
      pensiun_bulan_jumlah: formatRupiah(data.pensiun_bulan_jumlah as string), // For Purna

      // SLIK Base
      slik_nihil: slikFacilities.length === 0,
      slik_ada_fasilitas: slikFacilities.length > 0,
      slik_jumlah_fasilitas: slikFacilities.length,
      fasilitas_nihil: slikFacilities.length === 0 ? "NIHIL" : "Tidak",
      fasilitas_nihil_text: slikFacilities.length === 0 ? "Nihil - Tidak ada fasilitas kredit" : "",

      // Kerabat
      nama_kerabat: data.nama_kerabat || "",
      hubungan_kerabat: toTitleCase(data.hubungan_kerabat as string),
      no_telepon_kerabat: data.no_telepon_kerabat || "",

      // Purpose & Program
      tujuan_kredit: getTujuanKreditLabel(data.tujuan_kredit as string),
      kode_program: data.kode_program || "",
    };

    // --- 2. FINANCIAL CONTEXT (RPC, Angsuran) ---
    const financialContext = FinancialContextBuilder.build(debitur, slikFacilities);
    Object.assign(context, financialContext);

    // --- 3. REQUIREMENTS (Syarat Penandatanganan & Pencairan) ---
    const requirementsContext = RequirementsContextBuilder.build(debitur, slikFacilities);
    Object.assign(context, requirementsContext);

    // --- 4. SLIK MITIGASI RISIKO ---
    const hasRiskyCol = slikFacilities.some((f) => {
      const val = f.kolektibilitas;
      const kolStr = (val !== null && val !== undefined && val !== "") ? String(val).trim() : "1";
      return kolStr !== "1";
    });

    const settings = await ConfigService.getSettings();
    const teksMitigasi = settings.slikMitigasiRiskText || "Mitigasi Risiko: Debitur memiliki riwayat kredit dengan kolektibilitas tidak lancar.";
    const catatanPricing = settings.catatanProgramPricing || "";

    context.slik_mitigasi_risiko = hasRiskyCol ? teksMitigasi : "";
    context.catatan_program_pricing = catatanPricing;

    // --- 5. ALIASES (Merge) ---
    const aliases = AliasMapper.map(context, debitur);
    Object.assign(context, aliases);

    // --- 6. INDEXED SLIK FIELDS & LIST ---
    const slikFields = SlikMapper.mapSlikToIndexedFields(slikFacilities);
    const slikAliases: Record<string, unknown> = {};
    Object.keys(slikFields).forEach((key) => {
      const capitalizedKey = key.split("_").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join("_");
      slikAliases[capitalizedKey] = slikFields[key];
    });
    Object.assign(context, slikFields, slikAliases);

    // Optimized SLIK List (Simple Array)
    context.list_fasilitas_kredit = SlikMapper.mapSlikToList(slikFacilities);

    // --- 7. MANUAL OVERRIDES (Using Helper) ---
    const parsePlaceholders = (text: string, ctx: Record<string, unknown>): string => {
      if (!text) return "";
      return text.replace(/{{([\w_]+)}}/g, (match, key) => {
        const value = ctx[key];
        if (value !== undefined && value !== null) return String(value);
        return "";
      });
    };

    // Syarat Penandatanganan Override
    const manualSyaratPenandatanganan = (data.syarat_penandatanganan_text as string) || "";
    if (manualSyaratPenandatanganan.trim().length > 0) {
      const cleanText = manualSyaratPenandatanganan.split("\n").filter(line => !line.trim().startsWith("/*")).join("\n");
      const parsedText = parsePlaceholders(cleanText, context);
      context.syarat_penandatanganan = parsedText;
      context.Syarat_Penandatanganan = parsedText;
      context.list_syarat_penandatanganan = parsedText.split("\n").map(item => item.trim()).filter(Boolean).map(text => ({ text }));
    }

    // Syarat Pencairan Override
    const manualSyaratPencairan = (data.syarat_pencairan_text as string) || "";
    if (manualSyaratPencairan.trim().length > 0) {
      const cleanText = manualSyaratPencairan.split("\n").filter(line => !line.trim().startsWith("/*")).join("\n");
      const parsedText = parsePlaceholders(cleanText, context);
      context.syarat_pencairan_kredit = parsedText;
      context.Syarat_Pencairan_Kredit = parsedText;
      context.Syarat_Pencairan = parsedText;
      context.list_syarat_pencairan = parsedText.split("\n").map(item => item.trim()).filter(Boolean).map(text => ({ text }));
      context.list_syarat_pencairan_kredit = context.list_syarat_pencairan;
      delete context.list_syarat_pencairan_tambahan; // Override additional requirements if manual text present? Matches original logic
    }

    // Syarat Tambahan
    const syaratTambahan = (data.syarat_penandatanganan_tambahan || "") as string;
    if (syaratTambahan) {
      context.syarat_penandatanganan_tambahan = syaratTambahan;
      context.list_syarat_tambahan = syaratTambahan.split("\n").map(t => ({ text: t.trim() })).filter(t => t.text);
    }
    const syaratPencairanTambahan = (data.syarat_pencairan_tambahan || "") as string;
    if (syaratPencairanTambahan) {
      context.syarat_pencairan_tambahan = syaratPencairanTambahan;
      context.list_syarat_pencairan_tambahan = []; 
    }

    // --- 8. LIST GENERATORS ---
    context.kategori = debitur.kategori; // Ensure kategori is set for generators
    
    // Explicitly set lists to context
    context.list_investigasi = ListGenerators.generateInvestigasiList(context);
    context.list_call_memo = ListGenerators.generateCallMemoList(context);
    context.list_verifikasi_bendahara = ListGenerators.generateBendaharaList(context);
    context.list_verifikasi_rekan_kerja = ListGenerators.generateRekanKerjaList(context);
    context.list_verifikasi_internet = ListGenerators.generateTaspenList(context);
    context.list_verifikasi_kerabat = ListGenerators.generateKerabatPrapurnaList(context);

    return context;
  }
}
