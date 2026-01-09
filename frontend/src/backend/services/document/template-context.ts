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

export class TemplateContextBuilder {
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

    // Calculate biaya
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
      tgl_call_memo: formatDateIndonesian(today.toISOString()),
      tgl_slik: formatDateIndonesian((data.tgl_slik as string) || today.toISOString()),

      // Identitas
      nama_pemohon: debitur.namaPemohon || data.nama_pemohon || "",
      no_ktp: debitur.noKtp || data.no_ktp_pemohon || "",
      no_telepon: data.no_telepon || "",
      tgl_lahir: formatDateIndonesian(data.tgl_lahir_pemohon as string),
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
      status_rumah: toTitleCase(data.status_rumah as string),
      lama_tinggal: data.lama_tinggal || "",
      status_perkawinan: toTitleCase(data.status_perkawinan as string),
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
      cfm_status_perkawinan: getCfmStatusPerkawinan(
        data.status_perkawinan as string
      ),
      tgl_terbit_ktp: formatDateIndonesian(data.tgl_terbit_ktp as string),
      usia_pemohon:
        data.usia_pemohon ||
        calculateAge(data.tgl_lahir_pemohon as string),

      pensiunan: data.pensiunan || "",

      // Status Kepegawaian (New Placeholder)
      status_kepegawaian: getStatusKepegawaian(debitur),

      // Pekerjaan/Pensiun
      segmentasi: (debitur.segmentasi || data.segmentasi || "")
        .toString()
        .toUpperCase(),
      jenis_pengajuan: toTitleCase(
        (debitur.jenisPengajuan || data.jenis_pengajuan || "").toString()
      ),
      kategori: debitur.kategori.replace(/_/g, " "),
      instansi: data.instansi || "",
      jabatan: data.jabatan || "",
      golongan: data.golongan || "",
      nip: data.nip || "",
      nopen: data.nopen || "",
      tgl_pensiun: formatDateIndonesian(
        (data.tgl_pensiun_tmt as string) || (data.tgl_pensiun_pemohon as string)
      ),
      tgl_pensiun_tmt: formatDateIndonesian(
        data.tgl_pensiun_tmt as string
      ),
      no_sk_pensiun: data.no_sk_pensiun || "",
      tgl_sk_pensiun: formatDateIndonesian(data.tgl_sk_pensiun as string),

      // Bank Pembayaran / Payroll
      nama_bank_pembayaran: data.nama_bank_pembayaran || "",
      payroll_bank: data.nama_bank_pembayaran || "",
      payroll_no_rek: data.payroll_no_rek || "",

      // Penghasilan - Gaji (Prapurna)
      gaji_bulan_1_nama: data.gaji_bulan_1_nama || "",
      gaji_bulan_1: formatRupiah(data.gaji_bulan_1_jumlah as string),
      gaji_bulan_2_nama: data.gaji_bulan_2_nama || "",
      gaji_bulan_2: formatRupiah(data.gaji_bulan_2_jumlah as string),
      gaji_bulan_3_nama: data.gaji_bulan_3_nama || "",
      gaji_bulan_3: formatRupiah(data.gaji_bulan_3_jumlah as string),
      estimasi_hak_pensiun: formatRupiah(
        data.estimasi_hak_pensiun as string
      ),
      estimasi_tht: formatRupiah(
        data.estimasi_tht as string
      ),

      // Penghasilan - Pensiun (Purna)
      pensiun_bulan_1_nama: data.pensiun_bulan_1_nama || "Januari",
      pensiun_bulan_1: formatRupiah(data.pensiun_bulan_1_jumlah as string),
      pensiun_bulan_2_nama: data.pensiun_bulan_2_nama || "Februari",
      pensiun_bulan_2: formatRupiah(data.pensiun_bulan_2_jumlah as string),
      pensiun_bulan_3_nama: data.pensiun_bulan_3_nama || "Maret",
      pensiun_bulan_3: formatRupiah(data.pensiun_bulan_3_jumlah as string),

      // SLIK - Conditional rendering
      slik_nihil: slikFacilities.length === 0,
      slik_ada_fasilitas: slikFacilities.length > 0,
      slik_jumlah_fasilitas: slikFacilities.length,
      fasilitas_nihil: slikFacilities.length === 0 ? "NIHIL" : "Tidak",
      fasilitas_nihil_text:
        slikFacilities.length === 0 ? "Nihil - Tidak ada fasilitas kredit" : "",

      // OPTIMIZED SLIK LIST
      list_fasilitas_kredit: SlikMapper.mapSlikToList(slikFacilities),

      // We will populate list_investigasi later using the full context
      list_investigasi: [],

      // RPC (Repayment Capacity) Calculations
      rpc_penghasilan: formatRupiah(penghasilan),
      rpc_dsc_90: formatRupiah(dsc90),
      rpc_total_angsuran_eksisting: formatRupiah(totalAngsuranSlik),
      rpc_maksimal_angsuran: formatRupiah(maksimalAngsuran),
      rpc_angsuran_diusulkan: formatRupiah(angsuranKredit),
      rpc_total_angsuran_baru: formatRupiah(totalAngsuranBaru),
      rpc_dsr: `${dsr}`,

      // Usulan Kredit
      plafon: formatRupiah(plafon),
      usulan_plafon: formatRupiah(plafon),
      tenor: tenor,
      tenor_bulan: `${tenor} Bulan`,
      usulan_jangka_waktu: `${tenor} Bulan`,
      bunga: `${bunga}`,
      bunga_persen: `${bunga}% p.a Efektif Anuitas`,

      // Biaya
      biaya_provisi: formatRupiah(biayaProvisi),
      biaya_provisi_percent: `${pctProvisi}%`,
      biaya_tatalaksana: formatRupiah(biayaTatalaksana),
      biaya_tatalaksana_percent: `${pctTatalaksana}%`,

      // Biaya PSJT
      biaya_psjt: formatRupiah(Math.round(plafon * ((parseFloat(String(data.biaya_psjt_percent || 0)) || 0) / 100))),
      biaya_psjt_percent: `${parseFloat(String(data.biaya_psjt_percent || 0))}%`,

      // Biaya Administrasi
      biaya_administrasi_is_bebas: data.biaya_administrasi_is_bebas,
      biaya_administrasi_nominal: formatRupiah(data.biaya_administrasi_nominal as string),
      // Specific Text Requirement
      biaya_administrasi_text: data.biaya_administrasi_is_bebas
        ? "Bebas Biaya Administrasi"
        : `Biaya Administrasi sebesar Rp. ${formatRupiah(data.biaya_administrasi_nominal as string)},-`,

      // Tujuan
      tujuan_kredit: getTujuanKreditLabel(data.tujuan_kredit as string),

      // Kode Program
      kode_program: data.kode_program || "",

      // Catatan Program Pricing
      catatan_program_pricing: "",

      // Kerabat (Call Memo)
      nama_kerabat: data.nama_kerabat || "",
      hubungan_kerabat: toTitleCase(data.hubungan_kerabat as string),
      no_telepon_kerabat: data.no_telepon_kerabat || "",

      // Pekerjaan (Prapurna)
      tgl_mulai_kerja: formatDateIndonesian(
        data.tgl_mulai_kerja as string
      ),
      masa_kerja: data.masa_kerja || "",
      alamat_kantor: data.alamat_kantor || "",
      // SK CPNS & Pangkat
      no_sk_cpns: data.no_sk_cpns || "",
      tgl_sk_cpns: formatDateIndonesian(data.tgl_sk_cpns as string),
      no_sk_kenaikan_pangkat: data.no_sk_kenaikan_pangkat || "",
      tgl_sk_kenaikan_pangkat: formatDateIndonesian(data.tgl_sk_kenaikan_pangkat as string),
      // End SK
      tgl_pensiun_pemohon: formatDateIndonesian(
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
      pensiun_bulan_jumlah: formatRupiah(
        data.pensiun_bulan_jumlah as string
      ),
      hak_pensiun: formatRupiah(data.pensiun_bulan_jumlah as string),
    };

    // --- EXTENSIVE ALIASES FOR COMPATIBILITY ---
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
      masa_kerja_text: getMasaKerjaText(debitur),
      Masa_Kerja_Text: getMasaKerjaText(debitur),
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
        if (value !== undefined && value !== null) {
          return String(value);
        }
        return "";
      });
    };

    // Add indexed SLIK fields with Alias support
    const slikFields = SlikMapper.mapSlikToIndexedFields(slikFacilities);

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
    const hasRiskyCol = slikFacilities.some((f) => {
      const val = f.kolektibilitas;
      const kolStr = (val !== null && val !== undefined && val !== "") ? String(val).trim() : "1";
      return kolStr !== "1";
    });

    // Fetch settings dynamically
    const settings = await ConfigService.getSettings();
    const teksMitigasi = settings.slikMitigasiRiskText;
    const catatanPricing = settings.catatanProgramPricing;

    // Fallback if settings empty
    const finalMitigasiText = teksMitigasi || "Mitigasi Risiko: Debitur memiliki riwayat kredit dengan kolektibilitas tidak lancar.";

    context.slik_mitigasi_risiko = hasRiskyCol ? finalMitigasiText : "";
    context.Slik_Mitigasi_Risiko = context.slik_mitigasi_risiko;

    // Set Catatan Program Pricing from Settings
    context.catatan_program_pricing = catatanPricing || "";
    context.Catatan_Program_Pricing = catatanPricing || "";

    // --- SYARAT PENANDATANGANAN KONDISIONAL ---
    const syaratList: string[] = [];
    const jenisPengajuanLower = (debitur.jenisPengajuan || data.jenis_pengajuan || "").toString().toLowerCase();

    // Create Nama Pemohon Title Case for usage in string
    const namaPemohonTitle = toTitleCase(debitur.namaPemohon || data.nama_pemohon as string || "");

    if (jenisPengajuanLower === "baru") {
      syaratList.push("Menyerahkan Asli SK Pensiun atas nama Pemohon sebagai Jaminan Kredit BNI.");
    } else if (jenisPengajuanLower.includes("top_up") || jenisPengajuanLower === "top up") {
      syaratList.push("Jaminan yang telah ada sebelumnya berupa Asli SK Pensiun atas nama Pemohon tetap dipertahankan sebagai Jaminan Kredit di BNI.");

      if (jenisPengajuanLower.includes("top_up_sisa_gaji") || jenisPengajuanLower.includes("top up sisa gaji") || jenisPengajuanLower === "top_up" || jenisPengajuanLower === "top up" ) {
        const existingFacilities = slikFacilities.filter(f => f.nomor_rekening_pinjaman);
        const globalNoRek = existingFacilities.map(f => f.nomor_rekening_pinjaman).join(", ");
        const globalNoPk = existingFacilities.map(f => f.nomor_pk).join(", ");

        context.nomor_rekening_pinjaman = globalNoRek;
        context.nomor_pk = globalNoPk;

        if (existingFacilities.length > 0) {
          existingFacilities.forEach(f => {
            const noRek = f.nomor_rekening_pinjaman || "-";
            const noPk = f.nomor_pk || "-";
            syaratList.push(`Fasilitas kredit ini saling mengkait dengan fasilitas kredit sebelumnya nomor rekening pinjaman ${noRek} atas nama ${namaPemohonTitle}, No. PK ${noPk}`);
          });
        } else if (jenisPengajuanLower.includes("sisa_gaji") || jenisPengajuanLower.includes("sisa gaji")) {
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

    // --- MANUAL OVERRIDE ---
    const manualSyaratPenandatanganan = (data.syarat_penandatanganan_text as string) || "";
    if (manualSyaratPenandatanganan.trim().length > 0) {
      const cleanText = manualSyaratPenandatanganan
        .split("\n")
        .filter(line => !line.trim().startsWith("/*"))
        .join("\n");

      const parsedText = parsePlaceholders(cleanText, context);

      context.syarat_penandatanganan = parsedText;
      context.Syarat_Penandatanganan = parsedText;

      const parsedList = parsedText
        .split("\n")
        .map(item => item.trim())
        .filter(item => item.length > 0)
        .map(item => ({ text: item }));

      context.list_syarat_penandatanganan = parsedList;
    }

    const manualSyaratPencairan = (data.syarat_pencairan_text as string) || "";
    if (manualSyaratPencairan.trim().length > 0) {
      const cleanText = manualSyaratPencairan
        .split("\n")
        .filter(line => !line.trim().startsWith("/*"))
        .join("\n");

      const parsedText = parsePlaceholders(cleanText, context);

      context.syarat_pencairan_kredit = parsedText;
      context.Syarat_Pencairan_Kredit = parsedText;
      context.Syarat_Pencairan = parsedText;

      const parsedListPencairan = parsedText
        .split("\n")
        .map(item => item.trim())
        .filter(item => item.length > 0)
        .map(item => ({ text: item }));

      context.list_syarat_pencairan = parsedListPencairan;
      context.list_syarat_pencairan_kredit = parsedListPencairan;
      
      delete context.list_syarat_pencairan_tambahan;
    }

    // --- CLEANUP & DEFAULT HANDLING ---
    if (!context.list_syarat_penandatanganan) {
      context.list_syarat_penandatanganan = syaratList.map(item => ({ text: item }));
    }
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

    // --- GENERATE LISTS ---
    context.list_investigasi = ListGenerators.generateInvestigasiList(context);

    // Explicitly add kategori to context for list generators
    context.kategori = debitur.kategori;

    context.list_call_memo = ListGenerators.generateCallMemoList(context);
    context.list_verifikasi_bendahara = ListGenerators.generateBendaharaList(context);
    context.list_verifikasi_rekan_kerja = ListGenerators.generateRekanKerjaList(context);
    context.list_verifikasi_internet = ListGenerators.generateTaspenList(context);
    context.list_verifikasi_kerabat = ListGenerators.generateKerabatPrapurnaList(context);

    return context;
  }
}
