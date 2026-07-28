import { ConfigService } from "../config.service";
import { terbilang, formatRupiah } from "@/lib/utils";
import { ClientData, SlikFacility } from "./types";
import {
  formatDateIndonesian,
  toTitleCase,
  getCfmStatusPerkawinan,
  getStatusKepegawaian,
  getTujuanKreditLabel,
  calculateAge,
} from "./formatters";
import { SlikMapper } from "./slik-mapper";
import { ListGenerators } from "./list-generators";
import { FinancialContextBuilder } from "./financial-context";
import { RequirementsContextBuilder } from "./requirements-context";
import { AliasMapper } from "./alias-mapper";

/**
 * Module-level helper to parse placeholders like {{placeholder_key}}
 */
function parsePlaceholders(
  text: string,
  ctx: Record<string, unknown>,
): string {
  if (!text) return "";
  return text.replace(/{{([\w_]+)}}/g, (match, key) => {
    const value = ctx[key];
    if (value !== undefined && value !== null) return String(value);
    return "";
  });
}

/**
 * Parse manual syarat text into clean list items.
 * Handles:
 * - Literal \n strings (from DB) AND real newline characters
 * - Filtering /* comment lines
 * - Stripping leading dash/bullet prefix
 * - Resolving {{placeholder}} variables
 */
function parseManualSyaratText(
  rawText: string,
  context: Record<string, unknown>,
): { text: string }[] {
  // Normalize: convert literal \n strings to real newlines
  const normalized = rawText.replace(/\\n/g, "\n");

  return normalized
    .split("\n")
    .filter((line) => !line.trim().startsWith("/*"))
    // Filter header lines (already hardcoded in Word template)
    .filter((line) => !/^syarat\s+(penandatanganan|pencairan)\s*:/i.test(line.trim()))
    .filter((line) => !/^pencairan\s+kredit\s+akan\s+dilakukan/i.test(line.trim()))
    .map((line) => line.trim().replace(/^[-•]\s*/, ""))
    .filter((line) => line.length > 0)
    .map((line) => parsePlaceholders(line, context))
    .map((text) => ({ text }));
}

export class TemplateContextBuilder {
  /**
   * Prepare template context from client data
   * Maps DebiturFormData fields to template placeholders
   */
  static async prepareTemplateContext(
    client: ClientData,
  ): Promise<Record<string, unknown>> {
    const data = client.dataLengkap;
    const today = new Date();
    const slikFacilities = (data.slik_facilities as SlikFacility[]) || [];

    // --- 1. BASE CONTEXT (Identity, Job, etc.) ---
    const context: Record<string, unknown> = {
      // Date fields
      tgl_call_memo: formatDateIndonesian(
        client.createdAt
          ? typeof client.createdAt === "string"
            ? client.createdAt
            : client.createdAt.toISOString()
          : today.toISOString(),
      ),
      tgl_slik: formatDateIndonesian(
        (data.tgl_slik as string) || today.toISOString(),
      ),

      // Identitas
      nama_pemohon: client.applicantName || data.nama_pemohon || "",
      no_ktp: client.idNumber || data.no_ktp_pemohon || "",
      no_telepon: data.no_telepon || "",
      tgl_lahir: formatDateIndonesian(data.tgl_lahir_pemohon as string),
      alamat: data.alamat_ktp || data.alamat_tempat_tinggal || "",
      alamat_ktp: data.alamat_ktp || "",
      alamat_tempat_tinggal: data.alamat_tempat_tinggal || data.alamat_ktp || "",
      alamat_domisili: data.alamat_tempat_tinggal || data.alamat_ktp || "", // Backward compat
      tgl_terbit_ktp: formatDateIndonesian(data.tgl_terbit_ktp as string),
      usia_pemohon:
        data.usia_pemohon || calculateAge(data.tgl_lahir_pemohon as string),
      pensiunan: data.pensiunan || "",

      // Status
      status_rumah: toTitleCase(data.status_rumah as string),
      lama_tinggal: data.lama_tinggal || "",
      status_perkawinan: toTitleCase(data.status_perkawinan as string),
      cfm_status_perkawinan: getCfmStatusPerkawinan(
        data.status_perkawinan as string,
        data.no_dokumen_status_perkawinan as string,
        data.tgl_dokumen_status_perkawinan as string,
      ),
      status_kepegawaian: getStatusKepegawaian(client),

      // Booleans
      tempat_tinggal_berbeda:
        data.tempat_tinggal_berbeda === true ||
        data.tempat_tinggal_berbeda === "true",
      domisili_berbeda:
        data.tempat_tinggal_berbeda === true ||
        data.tempat_tinggal_berbeda === "true",
      is_menikah:
        String(data.status_perkawinan || "").toLowerCase() === "menikah",
      is_belum_menikah: String(data.status_perkawinan || "")
        .toLowerCase()
        .includes("belum"),
      is_cerai_hidup:
        String(data.status_perkawinan || "")
          .toLowerCase()
          .includes("cerai_hidup") ||
        String(data.status_perkawinan || "")
          .toLowerCase()
          .includes("cerai hidup"),
      is_cerai_mati:
        String(data.status_perkawinan || "")
          .toLowerCase()
          .includes("cerai_mati") ||
        String(data.status_perkawinan || "")
          .toLowerCase()
          .includes("cerai mati"),

      // Pekerjaan/Pensiun Key Fields
      segmentasi: (client.segmentasi || data.segmentasi || "")
        .toString()
        .toUpperCase(),
      jenis_pengajuan: toTitleCase(
        (client.jenisPengajuan || data.jenis_pengajuan || "").toString(),
      ),
      kategori: client.kategori.replace(/_/g, " "),
      instansi: data.instansi || "",
      status_kepegawaian_manual: data.status_kepegawaian_manual || "",
      jabatan: data.jabatan || "",
      golongan: data.golongan || "",
      nip: data.nip || "",
      nopen: data.nopen || "",
      nama_almarhum_pasangan: toTitleCase(data.nama_almarhum_pasangan as string),
      tgl_pensiun: formatDateIndonesian(
        (data.tgl_pensiun_tmt as string) ||
          (data.tgl_pensiun_pemohon as string),
      ),
      raw_tgl_pensiun: (data.tgl_pensiun_tmt as string) || (data.tgl_pensiun_pemohon as string) || "",
      usia_pensiun: (() => {
        const birth = data.tgl_lahir_pemohon as string;
        const pensiun = (data.tgl_pensiun_tmt || data.tgl_pensiun_pemohon) as string;
        if (!birth || !pensiun) return null;
        try {
          const birthDate = new Date(birth);
          const pensiunDate = new Date(pensiun);
          if (isNaN(birthDate.getTime()) || isNaN(pensiunDate.getTime())) return null;
          let age = pensiunDate.getFullYear() - birthDate.getFullYear();
          const monthDiff = pensiunDate.getMonth() - birthDate.getMonth();
          if (monthDiff < 0 || (monthDiff === 0 && pensiunDate.getDate() < birthDate.getDate())) {
            age--;
          }
          return age;
        } catch {
          return null;
        }
      })(),
      tgl_pensiun_tmt: formatDateIndonesian(data.tgl_pensiun_tmt as string),
      no_sk_pensiun: data.no_sk_pensiun || "",
      tgl_sk_pensiun: formatDateIndonesian(data.tgl_sk_pensiun as string),

      // Prapurna Specific
      tgl_mulai_kerja: formatDateIndonesian(data.tgl_mulai_kerja as string),
      raw_tgl_mulai_kerja: data.tgl_mulai_kerja || "",
      masa_kerja: data.masa_kerja || "",
      alamat_kantor: data.alamat_kantor || "",
      penempatan_unit: data.penempatan_unit || "",
      prev_instansi: data.prev_instansi || "",
      prev_status_kepegawaian: data.prev_status_kepegawaian || "",
      prev_masa_kerja: data.prev_masa_kerja || "",
      prev_tgl_mulai_kerja: formatDateIndonesian(data.prev_tgl_mulai_kerja as string) || "",
      prev_no_sk: data.prev_no_sk || "",
      prev_tgl_sk: formatDateIndonesian(data.prev_tgl_sk as string) || "",
      no_surat_pengalihan: data.no_surat_pengalihan || "",
      tgl_surat_pengalihan: formatDateIndonesian(data.tgl_surat_pengalihan as string) || "",
      no_sk_cpns: data.no_sk_cpns || "",
      tgl_sk_cpns: formatDateIndonesian(data.tgl_sk_cpns as string),
      tgl_berakhir_pengangkatan: formatDateIndonesian(data.tgl_berakhir_pengangkatan as string),
      raw_tgl_berakhir_pengangkatan: data.tgl_berakhir_pengangkatan || "",
      no_sk_kenaikan_pangkat: data.no_sk_kenaikan_pangkat || "",
      tgl_sk_kenaikan_pangkat: formatDateIndonesian(
        data.tgl_sk_kenaikan_pangkat as string,
      ),
      no_sk_mutasi: data.no_sk_mutasi || "",
      tgl_sk_mutasi: formatDateIndonesian(data.tgl_sk_mutasi as string),
      tgl_pensiun_pemohon: formatDateIndonesian(
        data.tgl_pensiun_pemohon as string,
      ),
      sisa_masa_kerja: data.sisa_masa_kerja || "",

      // Blokiran
      blokiran_prapurna: Number(data.blokiran_prapurna_jml || 0),
      blokiran_prapurna_terbilang: terbilang(
        Number(data.blokiran_prapurna_jml || 0),
      ),
      blokiran_pindah_gaji: Number(data.blokiran_pindah_gaji_jml || 0),
      blokiran_pindah_gaji_terbilang: terbilang(
        Number(data.blokiran_pindah_gaji_jml || 0),
      ),
      blokiran_wajib: Number(data.blokiran_wajib_jml || 0),
      blokiran_wajib_terbilang: terbilang(Number(data.blokiran_wajib_jml || 0)),
      total_blokiran: Number(data.total_blokiran_jml || 0),
      total_blokiran_terbilang: terbilang(Number(data.total_blokiran_jml || 0)),

      // Data Verifikasi
      nama_bendahara: data.nama_bendahara || "",
      no_hp_bendahara: data.no_hp_bendahara || "",
      nama_sdm: data.nama_sdm || "",
      no_hp_sdm: data.no_hp_sdm || "",
      nama_rekan_kerja: data.nama_rekan_kerja || "",
      no_hp_rekan_kerja: data.no_hp_rekan_kerja || "",

      // Bank & Payroll
      nama_bank_pembayaran: data.nama_bank_pembayaran || "",
      payroll_bank: data.nama_bank_pembayaran || "",
      payroll_no_rek: data.payroll_no_rek || "",

      // Gaji & Pensiun Details (Raw Fields)
      // Gaji 1-3 (Robust Handling)
      gaji_bulan_1_nama: String(data.gaji_bulan_1_nama || "").trim() || "-",
      gaji_bulan_1:
        data.gaji_bulan_1_jumlah !== null &&
        data.gaji_bulan_1_jumlah !== undefined &&
        data.gaji_bulan_1_jumlah !== ""
          ? formatRupiah(data.gaji_bulan_1_jumlah as string)
          : "0",
      gaji_bulan_2_nama: String(data.gaji_bulan_2_nama || "").trim() || "-",
      gaji_bulan_2:
        data.gaji_bulan_2_jumlah !== null &&
        data.gaji_bulan_2_jumlah !== undefined &&
        data.gaji_bulan_2_jumlah !== ""
          ? formatRupiah(data.gaji_bulan_2_jumlah as string)
          : "0",
      gaji_bulan_3_nama: String(data.gaji_bulan_3_nama || "").trim() || "-",
      gaji_bulan_3:
        data.gaji_bulan_3_jumlah !== null &&
        data.gaji_bulan_3_jumlah !== undefined &&
        data.gaji_bulan_3_jumlah !== ""
          ? formatRupiah(data.gaji_bulan_3_jumlah as string)
          : "0",

      // Tukin 3 Bulan (Fleksi Aktif)
      tukin_bulan_1_nama:
        data.tukin_bulan_1_nama || data.gaji_bulan_1_nama || "-",
      tukin_bulan_1: formatRupiah(data.tukin_bulan_1_jumlah as string),
      tukin_bulan_2_nama:
        data.tukin_bulan_2_nama || data.gaji_bulan_2_nama || "-",
      tukin_bulan_2: formatRupiah(data.tukin_bulan_2_jumlah as string),
      tukin_bulan_3_nama:
        data.tukin_bulan_3_nama || data.gaji_bulan_3_nama || "-",
      tukin_bulan_3: formatRupiah(data.tukin_bulan_3_jumlah as string),
      tukin: formatRupiah(data.tukin as string), // Legacy single value

      // Uang Makan 3 Bulan (Fleksi Aktif)
      uang_makan_bulan_1_nama:
        data.uang_makan_bulan_1_nama || data.gaji_bulan_1_nama || "-",
      uang_makan_bulan_1: formatRupiah(
        data.uang_makan_bulan_1_jumlah as string,
      ),
      uang_makan_bulan_2_nama:
        data.uang_makan_bulan_2_nama || data.gaji_bulan_2_nama || "-",
      uang_makan_bulan_2: formatRupiah(
        data.uang_makan_bulan_2_jumlah as string,
      ),
      uang_makan_bulan_3_nama:
        data.uang_makan_bulan_3_nama || data.gaji_bulan_3_nama || "-",
      uang_makan_bulan_3: formatRupiah(
        data.uang_makan_bulan_3_jumlah as string,
      ),
      uang_makan: formatRupiah(data.uang_makan as string), // Legacy single value

      estimasi_hak_pensiun: formatRupiah(data.estimasi_hak_pensiun as string),
      estimasi_tht: formatRupiah(data.estimasi_tht as string),

      pensiun_bulan_1_nama: data.pensiun_bulan_1_nama || "Januari",
      pensiun_bulan_1: formatRupiah(data.pensiun_bulan_1_jumlah as string),
      pensiun_bulan_2_nama: data.pensiun_bulan_2_nama || "Februari",
      pensiun_bulan_2: formatRupiah(data.pensiun_bulan_2_jumlah as string),
      pensiun_bulan_3_nama: data.pensiun_bulan_3_nama || "Maret",
      pensiun_bulan_3: formatRupiah(data.pensiun_bulan_3_jumlah as string),
      pensiun_bulan_jumlah: formatRupiah(data.pensiun_bulan_jumlah as string), // For Purna
      purna_penghasilan_mode: data.purna_penghasilan_mode || "minimum", // RPC calculation mode

      // SLIK Base
      slik_nihil: slikFacilities.length === 0,
      slik_ada_fasilitas: slikFacilities.length > 0,
      slik_jumlah_fasilitas: slikFacilities.length,
      fasilitas_nihil: slikFacilities.length === 0 ? "NIHIL" : "Tidak",
      fasilitas_nihil_text:
        slikFacilities.length === 0 ? "Nihil - Tidak ada fasilitas kredit" : "",

      // SLIK Global Variables (Primary Facility for Top Up / Global Placeholders)
      // Prioritize the facility that has `nomor_rekening_pinjaman` filled in
      ...(() => {
        const primary = slikFacilities.find(f => f.nomor_rekening_pinjaman) || slikFacilities[0] || {};
        return {
          nomor_rekening_pinjaman: primary.nomor_rekening_pinjaman || "",
          nomor_pk: primary.nomor_pk || "",
          nama_bank: primary.nama_bank || "",
          jenis_kredit: primary.jenis_kredit || "",
          plafon_maks: primary.plafon_maks ? formatRupiah(primary.plafon_maks) : "",
          outstanding: primary.outstanding ? formatRupiah(primary.outstanding) : "",
          angsuran: primary.angsuran ? formatRupiah(primary.angsuran) : "",
          kolektibilitas: primary.kolektibilitas || "",
        };
      })(),

      // Kerabat
      nama_kerabat: data.nama_kerabat || "",
      hubungan_kerabat: toTitleCase(data.hubungan_kerabat as string),
      no_telepon_kerabat: data.no_telepon_kerabat || "",

      // Purpose & Program
      tujuan_kredit: getTujuanKreditLabel(data.tujuan_kredit as string),
      kode_program: data.kode_program || "",
    };

    // DEBUG: Trace SDM data (TODO: Remove after verification)
    console.log('[TEMPLATE-CTX] data.nama_sdm =', JSON.stringify(data.nama_sdm));
    console.log('[TEMPLATE-CTX] data.no_hp_sdm =', JSON.stringify(data.no_hp_sdm));
    console.log('[TEMPLATE-CTX] context.nama_sdm =', JSON.stringify(context.nama_sdm));
    console.log('[TEMPLATE-CTX] context.no_hp_sdm =', JSON.stringify(context.no_hp_sdm));
    console.log('[TEMPLATE-CTX] segmentasi =', JSON.stringify(client.segmentasi));
    console.log('[TEMPLATE-CTX] kategori =', JSON.stringify(client.kategori));

    // --- 2. FINANCIAL CONTEXT (RPC, Angsuran) ---
    const financialContext = FinancialContextBuilder.build(
      client,
      slikFacilities,
    );
    Object.assign(context, financialContext);

    // Build dynamic income investigasi text
    const activeComponents = (context.active_income_components as Array<{ label: string; value: number }>) || [];
    let incomeInvestigasiText = "";
    if (activeComponents.length === 1) {
      const comp = activeComponents[0];
      incomeInvestigasiText = `${comp.label} Pemohon saat ini berkisar Rp. ${formatRupiah(comp.value.toString())},-`;
    } else if (activeComponents.length > 1) {
      const parts = activeComponents.map((comp, idx) => {
        const label = comp.label;
        const valStr = formatRupiah(comp.value.toString());
        const prefix = idx === activeComponents.length - 1 ? "dan " : "";
        return `${prefix}${label} berkisar Rp. ${valStr},-`;
      });
      const totalIncome = activeComponents.reduce((sum, c) => sum + c.value, 0);
      const totalStr = formatRupiah(totalIncome.toString());
      incomeInvestigasiText = `Penghasilan Pemohon saat ini berupa ${parts.join(", ")} (Total Rp. ${totalStr},-)`;
    } else {
      incomeInvestigasiText = "Penghasilan Pemohon saat ini berkisar Rp. 0,-";
    }
    context.income_investigasi_text = incomeInvestigasiText;

    // Determine dynamic income type label and tujuan call/verifikasi (Revisi 3)
    const hasGaji = context.has_gaji !== false;
    const hasTunjangan = context.has_tunjangan !== false;
    let incomeTypeLabel = "Gaji"; // Default

    if (hasGaji && !hasTunjangan) {
      incomeTypeLabel = "Gaji";
    } else if (!hasGaji && hasTunjangan) {
      const isOnlyUangMakan = activeComponents.length === 1 && String(activeComponents[0].label || "").toLowerCase().includes("uang makan");
      if (isOnlyUangMakan) {
        incomeTypeLabel = "Uang Makan";
      } else {
        incomeTypeLabel = "Tunjangan";
      }
    } else if (hasGaji && hasTunjangan) {
      incomeTypeLabel = "Penghasilan";
    }

    context.income_type_label = incomeTypeLabel;
    context.Income_Type_Label = incomeTypeLabel;

    // Tujuan Call memo (Verifikasi Pihak Ketiga)
    const tujuanCall = `Konfirmasi ${incomeTypeLabel} Pemohon`;
    const tujuanCallTypo = `Konfirmas ${incomeTypeLabel} Pemohon`; // Handle exact typo in Word templates
    
    context.tujuan_call = tujuanCall;
    context.Tujuan_Call = tujuanCall;
    context.tujuan_call_typo = tujuanCallTypo;
    context.Tujuan_Call_Typo = tujuanCallTypo;
    context.tujuan_verifikasi = tujuanCall;
    context.Tujuan_Verifikasi = tujuanCall;

    // Map Additional Incomes directly
    context.additional_incomes = data.additional_incomes || [];

    // --- 3. REQUIREMENTS (Syarat Penandatanganan & Pencairan) ---
    const requirementsContext = RequirementsContextBuilder.build(
      client,
      slikFacilities,
      incomeTypeLabel,
    );
    Object.assign(context, requirementsContext);

    // --- 4. SLIK MITIGASI RISIKO ---
    const hasRiskyCol = slikFacilities.some((f) => {
      const val = f.kolektibilitas;
      const kolStr =
        val !== null && val !== undefined && val !== ""
          ? String(val).trim()
          : "1";
      return kolStr !== "1";
    });

    const settings = await ConfigService.getSettings();
    const teksMitigasi =
      settings.slikMitigasiRiskText ||
      "Mitigasi Risiko: Client memiliki riwayat kredit dengan kolektibilitas tidak lancar.";
    const catatanPricing = settings.catatanProgramPricing || "";

    context.slik_mitigasi_risiko = hasRiskyCol ? teksMitigasi : "";
    context.catatan_program_pricing = catatanPricing;

    // --- 5. ALIASES (Merge) ---
    const aliases = AliasMapper.map(context, client);
    Object.assign(context, aliases);

    // --- 6. INDEXED SLIK FIELDS & LIST ---
    const slikFields = SlikMapper.mapSlikToIndexedFields(slikFacilities);
    const slikAliases: Record<string, unknown> = {};
    Object.keys(slikFields).forEach((key) => {
      const capitalizedKey = key
        .split("_")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join("_");
      slikAliases[capitalizedKey] = slikFields[key];
    });
    Object.assign(context, slikFields, slikAliases);

    // Optimized SLIK List (Simple Array)
    context.list_fasilitas_kredit = SlikMapper.mapSlikToList(slikFacilities);

    // --- 7. MANUAL OVERRIDES (Using Helper) ---
    // Syarat Penandatanganan Override
    const manualSyaratPenandatanganan =
      (data.syarat_penandatanganan_text as string) || "";
    if (manualSyaratPenandatanganan.trim().length > 0) {
      const items = parseManualSyaratText(manualSyaratPenandatanganan, context);
      const flatText = items.map((item) => item.text).join("\n");
      context.syarat_penandatanganan = flatText;
      context.Syarat_Penandatanganan = flatText;
      context.list_syarat_penandatanganan = items;
    }

    // Syarat Pencairan Override
    const manualSyaratPencairan = (data.syarat_pencairan_text as string) || "";
    if (manualSyaratPencairan.trim().length > 0) {
      const items = parseManualSyaratText(manualSyaratPencairan, context);
      const flatText = items.map((item) => item.text).join("\n");
      context.syarat_pencairan_kredit = flatText;
      context.Syarat_Pencairan_Kredit = flatText;
      context.Syarat_Pencairan = flatText;
      context.list_syarat_pencairan = items;
      context.list_syarat_pencairan_kredit = items;
      delete context.list_syarat_pencairan_tambahan; // Override additional requirements if manual text present? Matches original logic
    }

    // Syarat Tambahan
    const syaratTambahan = (data.syarat_penandatanganan_tambahan ||
      "") as string;
    if (syaratTambahan) {
      const normalizedTambahan = syaratTambahan.replace(/\\n/g, "\n");
      context.syarat_penandatanganan_tambahan = normalizedTambahan;
      context.list_syarat_tambahan = normalizedTambahan
        .split("\n")
        .map((t) => ({ text: t.trim() }))
        .filter((t) => t.text);
    }
    const syaratPencairanTambahan = (data.syarat_pencairan_tambahan ||
      "") as string;
    if (syaratPencairanTambahan) {
      context.syarat_pencairan_tambahan = syaratPencairanTambahan.replace(/\\n/g, "\n");
      context.list_syarat_pencairan_tambahan = [];
    }

    // --- 8. LIST GENERATORS ---
    context.kategori = client.kategori; // Ensure kategori is set for generators

    // Explicitly set lists to context
    context.list_investigasi = ListGenerators.generateInvestigasiList(context);
    context.list_call_memo = ListGenerators.generateCallMemoList(context);

    // List Verifikasi: Bendahara vs Kepegawaian (Unified Logic)
    const segmentasiLower = String(context.segmentasi || "").toLowerCase();
    const kategoriStr = String(client.kategori || "").toLowerCase();
    const isAktifBumnBumd =
      kategoriStr.includes("aktif") &&
      (segmentasiLower.includes("bumn") || segmentasiLower.includes("bumd"));

    // Label varifikator dinamis
    const labelVerifikator = isAktifBumnBumd ? "SDM/Kepegawaian" : "Bendahara";
    context.label_verifikator = labelVerifikator;
    context.label_verifikator_upper = labelVerifikator.toUpperCase();

    // Unified List Population
    // Both lists are populated into 'list_verifikasi_bendahara' to allow single template usage
    if (isAktifBumnBumd) {
      // BUMN/BUMD: Override Bendahara fields with SDM values
      // Template uses {{Nama_Bendahara}} and {{No_Hp_Bendahara}} in the header,
      // so we need to populate these with SDM values for BUMN/BUMD segmentation
      context.nama_bendahara = context.nama_sdm || context.nama_bendahara || "";
      context.no_hp_bendahara = context.no_hp_sdm || context.no_hp_bendahara || "";

      // BUMN/BUMD uses Kepegawaian logic, but mapped to 'list_verifikasi_bendahara' key for template unity
      console.log('[TEMPLATE-CTX] isAktifBumnBumd = TRUE, calling generateKepegawaianList');
      console.log('[TEMPLATE-CTX] context.nama_sdm at list gen time =', JSON.stringify(context.nama_sdm));
      console.log('[TEMPLATE-CTX] context.no_hp_sdm at list gen time =', JSON.stringify(context.no_hp_sdm));
      console.log('[TEMPLATE-CTX] context.nama_bendahara (overridden) =', JSON.stringify(context.nama_bendahara));
      console.log('[TEMPLATE-CTX] context.no_hp_bendahara (overridden) =', JSON.stringify(context.no_hp_bendahara));
      const kepegawaianList = ListGenerators.generateKepegawaianList(context);
      console.log('[TEMPLATE-CTX] kepegawaianList result =', JSON.stringify(kepegawaianList));
      context.list_verifikasi_bendahara = kepegawaianList;
      context.list_verifikasi_kepegawaian = kepegawaianList; // Keep both for backward compat
    } else {
      // Others use standard Bendahara list
      const bendaharaList = ListGenerators.generateBendaharaList(context);
      context.list_verifikasi_bendahara = bendaharaList;
      context.list_verifikasi_kepegawaian = [];
    }

    context.list_verifikasi_rekan_kerja =
      ListGenerators.generateRekanKerjaList(context);
    context.list_verifikasi_internet =
      ListGenerators.generateTaspenList(context);

    // Choose kerabat list generator based on category
    const kategoriLower = String(context.kategori || "").toLowerCase();
    if (kategoriLower.includes("aktif")) {
      context.list_verifikasi_kerabat =
        ListGenerators.generateKerabatAktifList(context);
    } else {
      context.list_verifikasi_kerabat =
        ListGenerators.generateKerabatPrapurnaList(context);
    }
    context.list_rpc_purna = ListGenerators.generateRpcPurnaList(
      context,
      context.list_fasilitas_kredit as Record<string, unknown>[],
    );
    context.list_rpc_prapurna = ListGenerators.generateRpcPrapurnaList(
      context,
      context.list_fasilitas_kredit as Record<string, unknown>[],
    );
    context.list_verifikasi_penghasilan_purna =
      ListGenerators.generateVerifikasiPenghasilanPurnaList(context);
    context.list_verifikasi_penghasilan_prapurna =
      ListGenerators.generateVerifikasiPenghasilanPrapurnaList(context);
    context.list_verifikasi_penghasilan_aktif =
      ListGenerators.generateVerifikasiPenghasilanAktifList(context);

    // RPC Aktif List
    context.list_rpc_aktif = ListGenerators.generateRpcAktifList(
      context,
      context.list_fasilitas_kredit as Record<string, unknown>[],
    );

    return context;
  }
}
