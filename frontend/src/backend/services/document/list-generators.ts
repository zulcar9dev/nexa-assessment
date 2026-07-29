import { formatStatusKepegawaian, formatDateIndonesian } from "./formatters";
import { formatRupiah, calculateMonthsDifference, calculateContractPeriod } from "@/lib/utils";
import { getInstansiConfig } from "./instansi-config";

export class ListGenerators {
  /**
   * Helper: Get status kepegawaian for Aktif category
   * Priority: manual input > segmentation-based fallback
   */
  private static getAktifStatusKepegawaian(
    context: Record<string, unknown>,
  ): string {
    const manualStatus = String(context.status_kepegawaian_manual || "").trim();
    return manualStatus || "[Status Kepegawaian Belum Diisi]";
  }



  /**
   * Generate Investigasi List (dynamic points) - Prapurna Aware
   */
  static generateInvestigasiList(
    context: Record<string, unknown>,
  ): Record<string, string>[] {
    const list: string[] = [];
    const kategoriLower = String(context.kategori || "").toLowerCase();
    const isPrapurna = kategoriLower.includes("prapurna") || kategoriLower.includes("type_a");
    const isPurna = (kategoriLower.includes("purna") && !kategoriLower.includes("prapurna")) || kategoriLower.includes("type_b");
    const isAktif = kategoriLower.includes("aktif") || kategoriLower.includes("type_c");

    // Unified Logic for Aktif Category with Config Lookup
    if (isAktif) {
      // Check for specific instansi config
      const instansiName = String(context.instansi || "");
      const segmentasi = String(context.segmentasi || "");
      const config = getInstansiConfig(instansiName, segmentasi);

      // If we have a matching config OR it's just a standard Aktif list
      return ListGenerators.generateAktifInvestigasiList(context, config);
    }

    // 1. Alamat KTP
    if (context.alamat_ktp) {
      list.push(`Alamat Pemohon sesuai KTP di ${context.alamat_ktp}.`);
    }

    // 2. Alamat Tempat Tinggal (Conditional)
    if (context.tempat_tinggal_berbeda) {
      list.push(
        `Alamat Tempat Tinggal saat ini di ${context.alamat_tempat_tinggal}.`,
      );
    }

    // 3. Status Rumah
    if (context.status_rumah) {
      list.push(
        `Status Rumah saat ini adalah ${
          context.status_rumah
        } dengan lama tinggal ± ${context.lama_tinggal || "-"}.`,
      );
    }

    // 4. Usia & KTP Info
    if (context.usia_pemohon) {
      list.push(
        `Usia Pemohon ± ${context.usia_pemohon} Tahun (${context.tgl_lahir}) Cfm. KTP Nomor ${context.no_ktp} tanggal ${context.tgl_terbit_ktp}.`,
      );
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
      list.push(
        `Golongan/Pangkat saat ini adalah ${golongan}. Cfm. SK Pangkat Terakhir No ${noSkPangkat} tanggal ${tglSkPangkat}.`,
      );

      // 6c. Jabatan
      if (context.jabatan) {
        list.push(`Jabatan Pemohon saat ini adalah ${context.jabatan}.`);
      }

      // 6d. Alamat Kantor
      if (context.alamat_kantor) {
        list.push(`Alamat Kantor Pemohon di ${context.alamat_kantor}.`);
      }

      // 6e. Batas Usia Pensiun
      const tglPensiun = (context.tgl_pensiun as string || "").trim();
      if (tglPensiun && tglPensiun !== "-") {
        list.push(
          `Pemohon akan memasuki Batas Usia Pensiun per Tanggal ${tglPensiun} Cfm. Estimasi Hak Tabungan Hari Tua dan Pensiun Pokok.`,
        );
      }
    } else if (isAktif) {
      // --- AKTIF SPECIFIC ---
      // --- AKTIF SPECIFIC (Handled above) ---
      // This block is now unreachable due to earlier check, but kept for structure safety or fallback if refactoring changes structure
      const instansiName = String(context.instansi || "");
      const segmentasi = String(context.segmentasi || "");
      const config = getInstansiConfig(instansiName, segmentasi);
      return ListGenerators.generateAktifInvestigasiList(context, config);
    } else {
      // --- PURNA (EXISTING) ---
      const segmentasi = String(context.segmentasi || "").toLowerCase();
      const jpLower = String(context.jenis_pengajuan || "").toLowerCase();
      const isJanda = jpLower.includes("janda");
      const isDuda = jpLower.includes("duda");

      if (isJanda || isDuda) {
        const pensiunan = context.pensiunan || "-";
        const instansi = context.instansi || "-";
        const tmtPensiun = context.tgl_pensiun_tmt || "-";
        const noSk = context.no_sk_pensiun || "-";
        const tglSk = context.tgl_sk_pensiun || "-";
        const nopen = context.nopen || "-";
        const golongan = context.golongan || "-";
        const namaAlmarhum = context.nama_almarhum_pasangan || "-";
        
        const labelJandaDuda = isJanda ? "Janda" : "Duda";
        const labelAlmarhum = isJanda ? "Almarhum Bpk." : "Almarhumah Ibu";

        if (segmentasi.includes("bumd") || segmentasi.includes("bumn")) {
          // PURNA BUMN/BUMD: Pensiunan Janda/Duda BUMN/BUMD
          list.push(
            `Pemohon merupakan Pensiunan ${pensiunan} ${labelJandaDuda} dari ${labelAlmarhum} ${namaAlmarhum} di ${instansi} dengan Nomor Pensiun ${nopen} TMT Pensiun ${tmtPensiun}. Cfm SK Pensiun No. ${noSk} tanggal ${tglSk}.`,
          );
        } else {
          // PURNA TASPEN/ASABRI Janda/Duda
          list.push(
            `Pemohon merupakan Pensiunan ${pensiunan} Janda/Duda dari ${labelAlmarhum} ${namaAlmarhum} di ${instansi} dengan NIP/Nopen ${nopen} Gol/Pangkat Terakhir ${golongan} TMT Pensiun ${tmtPensiun}. Cfm SK Pensiun No. ${noSk} tanggal ${tglSk}.`,
          );
        }
      } else {
        if (segmentasi.includes("bumd") || segmentasi.includes("bumn")) {
          // PURNA BUMN/BUMD: Pensiunan dari perusahaan BUMN/BUMD (No Golongan)
          const pensiunan = context.pensiunan || "-";
          const instansi = context.instansi || "-";
          const noSk = context.no_sk_pensiun || "-";
          const tglSk = context.tgl_sk_pensiun || "-";
          const nopen = context.nopen || "-";
          const tmtPensiun = context.tgl_pensiun_tmt || "-";

          list.push(
            `Pemohon merupakan Pensiunan ${pensiunan} di ${instansi} dengan Nomor Pensiun ${nopen} TMT Pensiun ${tmtPensiun}. Cfm SK Pensiun No. ${noSk} tanggal ${tglSk}.`,
          );
        } else {
          // PURNA TASPEN/ASABRI (Standard)
          // 6. Info Pensiunan
          const pensiunan = context.pensiunan || "-";
          const instansi = context.instansi || "-";
          const tmtPensiun = context.tgl_pensiun_tmt || "-";
          const noSk = context.no_sk_pensiun || "-";
          const tglSk = context.tgl_sk_pensiun || "-";
          const nopen = context.nopen || "-";
          const golongan = context.golongan || "-";
          list.push(
            `Pemohon merupakan Pensiunan ${pensiunan} di ${instansi} dengan NIP/Nopen ${nopen} Gol/Pangkat Terakhir ${golongan} TMT Pensiun ${tmtPensiun}. Cfm SK Pensiun No. ${noSk} tanggal ${tglSk}.`,
          );
        }
      }
    }

    // 7. Maksud Pengajuan
    const jenisPengajuan = context.jenis_pengajuan || "-";
    const plafon = context.plafon || "0";
    const tenor = context.tenor || "0";
    let produkName = "Type A Assessment";
    if (isPurna) {
      produkName = "Type B Assessment";
    } else if (isPrapurna) {
      produkName = "Type A Assessment";
    } else if (isAktif) {
      // Default name for Aktif, can be adjusted if needed per segmentation
      produkName = "Assessment Facility Fleksi";
    }

    list.push(
      `Maksud mengajukan fasilitas assessment ${produkName} ${jenisPengajuan} sebesar Rp. ${plafon} Jangka Waktu ${tenor} Bulan.`,
    );

    // 8. Tujuan Kredit
    if (context.tujuan_kredit) {
      list.push(`Tujuan kredit untuk ${context.tujuan_kredit}.`);
    }

    return list.map((text) => ({ text }));
  }

  /**
   * Generate Call Memo List (dynamic points)
   */
  static generateCallMemoList(
    context: Record<string, unknown>,
  ): Record<string, string>[] {
    const list: string[] = [];
    const pensiunan = context.pensiunan || "-";
    const instansi = context.instansi || "-";
    const statusRumah = context.status_rumah || "-";

    // 1. Pensiun Check
    list.push(
      `Memang benar Pemohon merupakan Pensiun ${pensiunan} di ${instansi}.`,
    );

    // 2. Status Rumah Check
    list.push(
      `Menurut Ybs. rumah yang di tempati Pemohon saat ini adalah rumah ${statusRumah}.`,
    );

    // 3. Kemampuan Bayar
    list.push(
      "Ybs. menyampaikan bahwa Pemohon memiliki kemampuan untuk menyetor angsuran atas kredit yang dimohon, dan",
    );

    // 4. Willingness to Remind
    list.push(
      "Ybs. bersedia untuk mengingatkan Pemohon untuk kewajiban angsuran perbulan.",
    );

    // 5. Character
    list.push("Pemohon dikenal baik dan bertanggung jawab.");

    return list.map((text) => ({ text }));
  }

  static generateBendaharaList(
    context: Record<string, unknown>,
  ): Record<string, string>[] {
    const list: string[] = [];
    const kategoriLower = String(context.kategori || "").toLowerCase();
    const isAktif = kategoriLower.includes("aktif");

    // Get status kepegawaian based on category
    let statusKepegawaian: string;
    if (isAktif) {
      statusKepegawaian = ListGenerators.getAktifStatusKepegawaian(context);
    } else {
      statusKepegawaian = String(
        context.status_kepegawaian || "Calon Pensiunan",
      );
    }
    const instansi = String(context.instansi || "-");
    const jabatan = context.jabatan || "-";
    const masaKerja = context.masa_kerja || "-"; // Just number or partial text
    const tglMulai = context.tgl_mulai_kerja || "-";

    const gaji = context.gaji_bulan_3 || "0";
    const payrollBank = context.payroll_bank || "-";

    list.push(formatStatusKepegawaian(statusKepegawaian, instansi));
    list.push(`Jabatan saat ini Pemohon sebagai ${jabatan}.`);
    list.push(
      `Lama Masa Kerja Pemohon -/+ ${masaKerja} atau sejak ${tglMulai}.`,
    );

    const incomeText = (context.income_investigasi_text as string) || `Gaji Aktif Pemohon saat ini berkisar Rp. ${gaji},-, dan pendapatan lainnya`;
    list.push(
      `${incomeText} yang dapat dicocokkan pada Rekening Payroll ${payrollBank} (terlampir).`,
    );
    list.push(`Karakter dan Integritas yang baik dan bertanggung jawab.`);

    // Info Verifikator (Direct Context Access)
    const namaBendahara = String(context.nama_bendahara || "-").trim();
    const hpBendahara = String(context.no_hp_bendahara || "-").trim();

    if (
      namaBendahara &&
      namaBendahara !== "-" &&
      namaBendahara !== "undefined"
    ) {
      list.push(
        `Informasi diperoleh dari Bendahara Gaji Bpk/Ibu ${namaBendahara} No. HP ${hpBendahara}.`,
      );
    } else {
      // Fallback if empty but show placeholder to confirm logic works
      list.push(`Informasi diperoleh dari Bendahara Gaji.`);
    }

    return list.map((text) => ({ text }));
  }

  /**
   * Generate Kepegawaian/SDM Verification List (BUMN/BUMD only)
   * Identical structure to Bendahara list - includes salary information
   */
  static generateKepegawaianList(
    context: Record<string, unknown>,
  ): Record<string, string>[] {
    const list: string[] = [];
    const kategoriLower = String(context.kategori || "").toLowerCase();
    const isAktif = kategoriLower.includes("aktif");

    // Get status kepegawaian based on category
    let statusKepegawaian: string;
    if (isAktif) {
      statusKepegawaian = ListGenerators.getAktifStatusKepegawaian(context);
    } else {
      statusKepegawaian = String(
        context.status_kepegawaian || "Calon Pensiunan",
      );
    }
    const instansi = String(context.instansi || "-");
    const jabatan = context.jabatan || "-";
    const masaKerja = context.masa_kerja || "-";
    const tglMulai = context.tgl_mulai_kerja || "-";

    const gaji = context.gaji_bulan_3 || "0";
    const payrollBank = context.payroll_bank || "-";

    list.push(formatStatusKepegawaian(statusKepegawaian, instansi));
    list.push(`Jabatan saat ini Pemohon sebagai ${jabatan}.`);
    list.push(
      `Lama Masa Kerja Pemohon -/+ ${masaKerja} atau sejak ${tglMulai}.`,
    );

    const incomeText = (context.income_investigasi_text as string) || `Gaji Aktif Pemohon saat ini berkisar Rp. ${gaji},-, dan pendapatan lainnya`;
    list.push(
      `${incomeText} yang dapat dicocokkan pada Rekening Payroll ${payrollBank} (terlampir).`,
    );
    list.push(`Karakter dan Integritas yang baik dan bertanggung jawab.`);

    // Info Verifikator (Direct Context Access)
    const namaSdm = String(context.nama_sdm || "-").trim();
    const hpSdm = String(context.no_hp_sdm || "-").trim();

    if (namaSdm && namaSdm !== "-" && namaSdm !== "undefined") {
      list.push(
        `Informasi diperoleh dari Bagian SDM/Kepegawaian Bpk/Ibu ${namaSdm} No. HP ${hpSdm}.`,
      );
    } else {
      list.push(`Informasi diperoleh dari Bagian SDM/Kepegawaian.`);
    }

    return list.map((text) => ({ text }));
  }

  static generateRekanKerjaList(
    context: Record<string, unknown>,
  ): Record<string, string>[] {
    const list: string[] = [];

    const kategoriLower = String(context.kategori || "").toLowerCase();
    const isAktif = kategoriLower.includes("aktif");

    // Get status kepegawaian based on category
    let statusKepegawaian: string;
    if (isAktif) {
      statusKepegawaian = ListGenerators.getAktifStatusKepegawaian(context);
    } else {
      statusKepegawaian = String(
        context.status_kepegawaian || "Calon Pensiunan",
      );
    }
    const instansi = String(context.instansi || "-");
    const jabatan = context.jabatan || "-";
    const masaKerja = context.masa_kerja || "-";
    const tglMulai = context.tgl_mulai_kerja || "-";

    list.push(formatStatusKepegawaian(statusKepegawaian, instansi));
    list.push(`Jabatan saat ini Pemohon sebagai ${jabatan}.`);
    list.push(
      `Lama Masa Kerja Pemohon -/+ ${masaKerja} atau sejak ${tglMulai}.`,
    );

    list.push(`Karakter dan Integritas yang baik dan bertanggung jawab.`);

    return list.map((text) => ({ text }));
  }

  static generateTaspenList(
    context: Record<string, unknown>,
  ): Record<string, string>[] {
    const list: string[] = [];
    const tglPensiun =
      context.tgl_pensiun_pemohon || context.tgl_pensiun || "-";
    const tht = context.estimasi_tht || "0";
    const hakPensiun = context.estimasi_hak_pensiun || "0";

    list.push(`Tanggal Pensiun ${tglPensiun}.`);
    list.push(`THT +/- Rp. ${tht},-.`);
    list.push(`Hak Pensiun +/- Rp. ${hakPensiun},-.`);

    return list.map((text) => ({ text }));
  }

  static generateKerabatPrapurnaList(
    context: Record<string, unknown>,
  ): Record<string, string>[] {
    const list: string[] = [];
    const statusKepegawaian = String(
      context.status_kepegawaian || "Calon Pensiunan PNS",
    );
    const instansi = String(context.instansi || "-");
    const statusRumah = context.status_rumah || "-";

    list.push(formatStatusKepegawaian(statusKepegawaian, instansi));
    list.push(
      `Menurut Ybs. rumah yang di tempati Pemohon saat ini adalah Rumah ${statusRumah}.`,
    );
    list.push(
      "Ybs. menyampaikan bahwa Pemohon memiliki kemampuan untuk menyetor angsuran atas kredit yang dimohon, dan Ybs bersedia untuk mengingatkan Pemohon untuk kewajiban angsuran perbulan",
    );

    return list.map((text) => ({ text }));
  }

  // ... (previous methods)

  /**
   * Generate Kerabat List for Aktif category
   * Uses manual input or falls back to segmentation-based defaults
   */
  static generateKerabatAktifList(
    context: Record<string, unknown>,
  ): Record<string, string>[] {
    const list: string[] = [];
    const instansi = String(context.instansi || "-");
    const statusRumah = context.status_rumah || "-";

    // Get status using helper
    const statusText = ListGenerators.getAktifStatusKepegawaian(context);

    // Point 1: Status Kepegawaian
    list.push(`Memang benar Pemohon adalah ${statusText} di ${instansi}.`);

    // Point 2: Status Rumah
    list.push(
      `Menurut Ybs. rumah yang di tempati Pemohon saat ini adalah Rumah ${statusRumah}.`,
    );

    // Point 3: Kemampuan Bayar & Willingness
    list.push(
      "Ybs. menyampaikan bahwa Pemohon memiliki kemampuan untuk menyetor angsuran atas kredit yang dimohon, dan Ybs bersedia untuk mengingatkan Pemohon untuk kewajiban angsuran perbulan.",
    );

    // Point 4: Karakter
    list.push("Pemohon dikenal baik dan bertanggung jawab.");

    return list.map((text) => ({ text }));
  }

  /**
   * Unified Generator for Aktif Category (Standardized)
   */
  static generateAktifInvestigasiList(
    context: Record<string, unknown>,
    config?: import("./instansi-config").InstansiConfig,
  ): Record<string, string>[] {
    const list: string[] = [];
    const instansi = String(context.instansi || "-");
    const alamatKtp = String(context.alamat_ktp || "-");

    const instansiLower = instansi.toLowerCase();
    const isPelabuhanKwandang =
      instansiLower.includes("pelabuhan perikanan nusantara kwandang") ||
      instansiLower.includes("pelabuhan perikanan kwandang");

    if (isPelabuhanKwandang) {
      // 1. Alamat KTP
      list.push(`Alamat Pemohon sesuai KTP di ${alamatKtp}.`);

      // 1b. Alamat Tempat Tinggal (Conditional)
      if (context.tempat_tinggal_berbeda && context.alamat_tempat_tinggal) {
        list.push(
          `Alamat tempat tinggal saat ini di ${context.alamat_tempat_tinggal}.`,
        );
      }

      // 2. Status Rumah
      const statusRumah = context.status_rumah || "-";
      const lamaTinggal = context.lama_tinggal || "-";
      list.push(
        `Status Rumah Pemohon saat ini adalah ${statusRumah} dengan lama tinggal ± ${lamaTinggal}.`
      );

      // 3. Status Perkawinan
      const cfmStatus = context.cfm_status_perkawinan as string;
      let statusPerkawinanText = "";
      if (cfmStatus) {
        statusPerkawinanText = cfmStatus;
      } else {
        const statusW = context.status_perkawinan || "-";
        statusPerkawinanText = `Pemohon berstatus ${statusW}`;
      }
      list.push(statusPerkawinanText);

      // 4. Usia & KTP Info
      list.push(
        `Pemohon berumur ± ${context.usia_pemohon || "-"} Tahun (${context.tgl_lahir || "-"}) Cfm. KTP Nomor ${context.no_ktp || "-"} tanggal ${context.tgl_terbit_ktp || "-"}.`
      );

      // 5. Status Kepegawaian (P3K)
      const manualStatus = String(
        context.status_kepegawaian_manual || "Pegawai P3K",
      ).trim();
      const noSk = context.no_sk_cpns || "-";
      const tglSk = context.tgl_sk_cpns || "-";
      const tglMulai = context.tgl_mulai_kerja || "-";
      list.push(
        `Pemohon adalah ${manualStatus} di ${instansi} sejak ${tglMulai} Cfm. SK Nomor ${noSk} tanggal ${tglSk}`
      );

      // 6. Alamat Kantor
      const textAlamat = context.alamat_kantor || "-";
      list.push(`Alamat Kantor yang terletak di ${textAlamat}.`);

      // 7. Info Kelolaan
      if (config?.infoKelolaan) {
        if (Array.isArray(config.infoKelolaan)) {
          list.push(...config.infoKelolaan);
        } else {
          list.push(config.infoKelolaan);
        }
      }

      // 8. Lama Dinas
      const masaKerja = context.masa_kerja || "-";
      const isP3K = /pppk|p3k|p3-k|p3\s*k|perjanjian\s*kerja/i.test(manualStatus);
      if (isP3K) {
        const tglBerakhir = context.tgl_berakhir_pengangkatan || "-";
        const rawStart = String(context.raw_tgl_mulai_kerja || "");
        const rawEnd = String(context.raw_tgl_berakhir_pengangkatan || "");
        const periodeKontrak = calculateContractPeriod(rawStart, rawEnd);
        list.push(
          `Lama Pemohon berdinas ± ${masaKerja} sejak ${tglMulai} s.d tanggal ${tglBerakhir} (${periodeKontrak}). Cfm. SK Nomor ${noSk} tanggal ${tglSk}.`
        );
      } else {
        list.push(
          `Lama Pemohon berdinas ± ${masaKerja} sejak ${tglMulai}. Cfm. SK Nomor ${noSk} tanggal ${tglSk}.`
        );
      }

      // 9. Golongan / Pangkat
      const golongan = context.golongan || "-";
      list.push(
        `Status/ Pangkat Golongan Pemohon saat ini adalah ${golongan} Cfm. SK Nomor ${noSk} tanggal ${tglSk}.`
      );

      // 10. Jabatan
      const jabatan = context.jabatan || "-";
      list.push(`Jabatan Pemohon saat ini adalah ${jabatan}`);

      // 11. Maksud Pengajuan
      const plafon = context.plafon || context.usulan_plafon_kredit || "0";
      const tenor = context.tenor || context.usulan_jangka_waktu_bulan || "0";
      list.push(
        `Maksud mengajukan Assessment Facility Fleksi sebesar Rp. ${plafon} Jangka Waktu ${tenor} Bulan.`
      );

      // 12. Tujuan
      const tujuan = context.tujuan_kredit || "-";
      list.push(`Tujuan pengunaan assessment untuk ${tujuan}.`);

      return list.map((text) => ({ text }));
    } 

    // 1. Alamat KTP
    list.push(`Alamat Pemohon sesuai KTP di ${alamatKtp}`);

    // 2. Alamat Tempat Tinggal (Conditional)
    if (context.tempat_tinggal_berbeda && context.alamat_tempat_tinggal) {
      list.push(
        `Alamat tempat tinggal saat ini di ${context.alamat_tempat_tinggal}`,
      );
    }

    // 3. Status Rumah
    const statusRumah = context.status_rumah || "-";
    const lamaTinggal = context.lama_tinggal || "-";
    list.push(
      `Status Rumah Pemohon saat ini adalah ${statusRumah} dengan lama tinggal ± ${lamaTinggal}.`,
    );

    // 4. Status Perkawinan
    const cfmStatus = context.cfm_status_perkawinan as string;
    if (cfmStatus) {
      list.push(cfmStatus);
    } else {
      // Fallback
      const statusW = context.status_perkawinan || "-";
      list.push(`Pemohon berstatus ${statusW}`);
    }

    // 5. Usia & KTP Info
    list.push(
      `Pemohon berumur ± ${context.usia_pemohon || "-"} Tahun (${context.tgl_lahir || "-"}) Cfm. KTP Nomor ${context.no_ktp || "-"} tanggal ${context.tgl_terbit_ktp || "-"}`,
    );

    // 6. Status Kepegawaian
    const manualStatus = String(
      context.status_kepegawaian_manual || "Pegawai Tetap",
    ).trim();

    // P3K Logic Detection
    const isP3K = /pppk|p3k|p3-k|p3\s*k|perjanjian\s*kerja/i.test(manualStatus);
    // Komisioner Bawaslu Logic Detection
    const isKomisioner = /komisioner|anggota bawaslu/i.test(manualStatus);
    const skLabel = isP3K
      ? "Surat Keputusan (SK) Pengangkatan PPPK"
      : "Surat Keputusan (SK) Pengangkatan Pegawai";
    const skLabelSwasta = isP3K ? "SK Pengangkatan PPPK" : "Surat Perjanjian Kerja";
    const skLabelPemerintahan = isP3K ? "SK Pengangkatan PPPK" : "Surat Keputusan (SK)";
    // Default format: "Pemohon adalah [Status] di [Instansi]."
    // For BUMN with extra SK info in same point? No, separation is usually better, but let's follow standard template.

    // Determine Segmentasi (Override if config exists)
    const rawSegmentasi = String(context.segmentasi || "SWASTA").toUpperCase();
    const isClaraGobel = instansiLower.includes("rsud drg clara gobel");

    // Determine Segmentasi (Override if config exists, unless it's Clara Gobel in Swasta)
    let segmentasi = config?.segmentasi || rawSegmentasi;
    if (isClaraGobel && rawSegmentasi === "SWASTA") {
      segmentasi = "SWASTA";
    }
    const isPemerintahan = segmentasi === "PEMERINTAHAN";
    const isBumn = segmentasi === "BUMN_BUMD";

    const isPaguntaka =
      instansiLower.includes("paguntaka") ||
      instansiLower.includes("cahaya nusantara") ||
      instansiLower.includes("nusa daya");

    const isPBT =
      instansiLower.includes("pani bersama") ||
      instansiLower.includes("pbt");

    // *** Point 6 Implementation ***
    if (isPBT && context.prev_instansi) {
      const noSk = context.no_sk_cpns || "-";
      const tglSk = context.tgl_sk_cpns || "-";
      const masaKerja = context.masa_kerja || "-";
      const tglMulai = context.tgl_mulai_kerja || "-";

      const prevStatus = String(context.prev_status_kepegawaian || "Karyawan Tetap").trim();
      const prevInstansi = String(context.prev_instansi || "PT Puncak Emas Tani Sejahtera").trim();
      const prevMasaKerja = String(context.prev_masa_kerja || "2 Tahun").trim();
      const prevTglMulai = String(context.prev_tgl_mulai_kerja || "01 Februari 2024").trim();

      const prevNoSk = String(context.prev_no_sk || "-").trim();
      const prevTglSk = String(context.prev_tgl_sk || "-").trim();
      const noSuratPengalihan = String(context.no_surat_pengalihan || "-").trim();
      const tglSuratPengalihan = String(context.tgl_surat_pengalihan || "-").trim();

      list.push(
        `Pemohon sebelumnya adalah ${prevStatus} pada ${prevInstansi} dengan lama bekerja ${prevMasaKerja} sejak ${prevTglMulai} Cfm. Surat Perjanjian Kerja No. ${prevNoSk} tanggal ${prevTglSk}, kemudian dialihkan hubungan kerja Cfm Surat Pengalihan Pekerja No. ${noSuratPengalihan} tanggal ${tglSuratPengalihan} menjadi ${manualStatus} pada ${instansi} dengan lama bekerja ± ${masaKerja} sejak ${tglMulai} Cfm. Surat Perjanjian Kerja No ${noSk} tanggal ${tglSk}.`
      );
    } else if (isPaguntaka) {
      const noSk = context.no_sk_cpns || "-";
      const tglSk = context.tgl_sk_cpns || "-";
      const masaKerja = context.masa_kerja || "-";
      const tglMulai = context.tgl_mulai_kerja || "-";

      const prevStatus = String(context.prev_status_kepegawaian || "Karyawan Kontrak").trim();
      const prevInstansi = String(context.prev_instansi || "PT Jaya Mahe (Vendor Outsourcing)").trim();
      const prevMasaKerja = String(context.prev_masa_kerja || "6 Tahun").trim();
      const prevTglMulai = String(context.prev_tgl_mulai_kerja || "1 Januari 2019").trim();

      list.push(
        `Pemohon sebelumnya adalah ${prevStatus} pada Perusahaan ${prevInstansi} dengan lama bekerja ± ${prevMasaKerja} sejak ${prevTglMulai} dan saat ini sudah alih status menjadi ${manualStatus} pada ${instansi} dengan lama bekerja ± ${masaKerja} sejak ${tglMulai} Cfm. Surat Keputusan (SK) Pengangkatan Pegawai Nomor ${noSk} tanggal ${tglSk}`
      );
    } else if (isBumn) {
      // BUMN Format: Status... pada Instansi ... Cfm SK ...
      const noSk = context.no_sk_cpns || "-";
      const tglSk = context.tgl_sk_cpns || "-";
      const masaKerja = context.masa_kerja || "-";
      const tglMulai = context.tgl_mulai_kerja || "-";

      list.push(
        `Pemohon adalah ${manualStatus} pada ${instansi} dengan lama bekerja ± ${masaKerja} sejak ${tglMulai} Cfm. ${skLabel} Nomor ${noSk} tanggal ${tglSk}`,
      );
    } else if (isPemerintahan) {
      // Pemerintahan Format: Pemohon adalah [Status] di [Instansi]
      list.push(`Pemohon adalah ${manualStatus} di ${instansi}`);
    } else {
      // Swasta/Default
      const noSk = context.no_sk_cpns || "-";
      const tglSk = context.tgl_sk_cpns || "-";
      const masaKerja = context.masa_kerja || "-";
      const tglMulai = context.tgl_mulai_kerja || "-";
      list.push(
        `Pemohon adalah ${manualStatus} pada ${instansi} dengan lama bekerja ± ${masaKerja} sejak ${tglMulai} Cfm. ${skLabelSwasta} No ${noSk} tanggal ${tglSk}.`,
      );
    }

    // 7. Alamat Kantor
    // Special Case: MKP / Paguntaka (Prefix logic)
    if (config?.alamatKantorPusat) {
      // Hardcoded address (e.g. MKP)
      list.push(config.alamatKantorPusat);
    } else {
      // Standard Address
      // Check Paguntaka special case (prefix with instansi name)
      // We can handle this generically: if context.instansi is Paguntaka, logic is typically specific.
      // But let's stick to standard: "Alamat Kantor [Instansi] di [Alamat]" or just "Alamat Kantor di ..."
      // Investigasi text usually just says: "Alamat Kantor yang terletak di ..." or "Alamat [Instansi] di ..."

      const textAlamat = context.alamat_kantor || "-";
      if (
        instansi.toLowerCase().includes("paguntaka") ||
        instansi.toLowerCase().includes("cahaya nusantara") ||
        instansi.toLowerCase().includes("nusa daya")
      ) {
        list.push(`Alamat ${instansi} di ${textAlamat}`);
      } else if (isPemerintahan) {
        list.push(`Alamat Kantor yang terletak di ${textAlamat}`);
      } else if (isBumn && instansi.toLowerCase().includes("pln")) {
        list.push(`Alamat Kantor ${instansi} berada di ${textAlamat}`);
      } else {
        // Default
        list.push(`Alamat Kantor yang terletak di ${textAlamat}`);
      }
    }

    // 7b. Info Bisnis (Hardcoded - e.g. bidang usaha perusahaan)
    if (config?.infoBisnis) {
      list.push(config.infoBisnis);
    }

    // 8. Info Kelolaan (Hardcoded)
    if (config?.infoKelolaan) {
      const infoList = Array.isArray(config.infoKelolaan)
        ? config.infoKelolaan
        : [config.infoKelolaan];

      infoList.forEach((infoStr) => {
        let info = infoStr;
        if (info.includes("{instansi}")) {
          info = info.replace("{instansi}", instansi);
        } else if (info.startsWith("adalah anak Perusahaan")) {
          // Paguntaka fallback
          info = `${instansi} ${info}`;
        }
        list.push(info);
      });
    }

    // 9. Masa Kerja (Pemerintahan Only as separate point, BUMN merged in point 6)
    if (isPemerintahan) {
      const masaKerja = context.masa_kerja || "-";
      const tglMulai = context.tgl_mulai_kerja || "-";
      const noSk = context.no_sk_cpns || "-";
      const tglSk = context.tgl_sk_cpns || "-";
      // KSOP Anggrek format: Masa Dinas Pemohon ...
      // BKKBN : Masa Kerja Pemohon ...
      if (isP3K || isKomisioner) {
        const tglBerakhir = context.tgl_berakhir_pengangkatan || "-";
        const rawStart = String(context.raw_tgl_mulai_kerja || "");
        const rawEnd = String(context.raw_tgl_berakhir_pengangkatan || "");
        const periodeKontrak = calculateContractPeriod(rawStart, rawEnd);
        list.push(
          `Lama Masa Kerja Pemohon -/+ ${masaKerja} atau sejak tanggal ${tglMulai} s.d tanggal ${tglBerakhir} (${periodeKontrak}). Cfm. ${skLabelPemerintahan} No. ${noSk} tanggal ${tglSk}.`,
        );
      } else {
        list.push(
          `Lama Masa Kerja Pemohon -/+ ${masaKerja} atau sejak tanggal ${tglMulai} Cfm. ${skLabelPemerintahan} No. ${noSk} tanggal ${tglSk}`,
        );
      }
    }

    // 10. Golongan / Pangkat
    // Configurable per instansi or segmentasi
    // User Decision: BUMN -> NO Golongan, PNS -> YES Golongan
    const isPNS = /pegawai negeri sipil|pns/i.test(manualStatus);
    let useGolongan = false;
    if (segmentasi === "PEMERINTAHAN") {
      useGolongan = config?.useGolongan ?? true;
    } else if (segmentasi === "BUMN_BUMD") {
      useGolongan = config?.useGolongan ?? false;
    } else if (segmentasi === "SWASTA") {
      useGolongan = isClaraGobel && isPNS;
    }
    useGolongan = useGolongan && !isKomisioner && !isP3K;

    if (useGolongan) {
      const golongan = context.golongan || "-";
      const noSkPangkat = context.no_sk_kenaikan_pangkat || "-";
      const tglSkPangkat = context.tgl_sk_kenaikan_pangkat || "-";

      // UNG text sample: Status/ Pangkat Golongan Pemohon saat ini adalah ...
      list.push(
        `Status/ Pangkat Golongan Pemohon saat ini adalah ${golongan} Cfm. Surat Keputusan Nomor (SK) Nomor ${noSkPangkat} tanggal ${tglSkPangkat}`,
      );
    }

    // 11. Jabatan
    const jabatan = context.jabatan || "-";
    // Check for SK Mutasi requirement (PLN UP3)
    if (config?.useSKMutasi) {
      const unit = context.penempatan_unit || instansi;
      const noSkMutasi = context.no_sk_mutasi || "-";
      const tglSkMutasi = context.tgl_sk_mutasi || "-";
      list.push(
        `Pemohon ditempatkan di ${unit} dengan jabatan sebagai ${jabatan} Cfm. Surat Keputusan (SK) Mutasi Jabatan ${noSkMutasi} tanggal ${tglSkMutasi}`,
      );
    } else {
      // Standard Jabatan
      // MKP: Jabatan ... Cfm Surat Keterangan Rekomendasi
      // UNG: Jabatan ... Cfm SK Pangkat (reused)
      // Generic: Jabatan Pemohon saat ini adalah ...

      // Use generic for standardization unless there is a strong reason.
      // If Penempatan Unit exists, mention it?
      if (context.penempatan_unit) {
        list.push(
          `Jabatan Pemohon saat ini adalah ${jabatan} yang ditempatkan di ${context.penempatan_unit}`,
        );
      } else {
        list.push(`Jabatan Pemohon saat ini adalah ${jabatan}`);
      }
    }

    // 12. Info Pensiun (BUP)
    // Default: Only BUMN_BUMD shows BUP, PEMERINTAHAN does NOT show unless explicitly enabled
    // P3K employees do NOT show BUP (they have a 5-year contract period instead)
    // Check if config explicitly sets useBatasUsiaPensiun
    const useBup =
      !isP3K && (config?.useBatasUsiaPensiun !== undefined
        ? config.useBatasUsiaPensiun
        : config?.infoPensiun || isBumn); // Only BUMN shows by default, not PEMERINTAHAN
    if (useBup) {
      if (config?.infoPensiun) {
        list.push(config.infoPensiun); // e.g. "Pemohon Pensiun sampai dengan usia 56 tahun"
      } else {
        const tglPensiun = (context.tgl_pensiun as string || "").trim();
        if (tglPensiun && tglPensiun !== "-") {
          const usiaPensiun = context.usia_pensiun;
          const usiaPensiunStr = usiaPensiun ? ` (Usia Pensiun ${usiaPensiun} Tahun)` : "";
          list.push(
            `Pemohon akan memasuki Batas Usia Pensiun pada tanggal ${tglPensiun}${usiaPensiunStr}.`,
          );
        }
      }
    }

    if (context.is_ung_non_dosen) {
      list.push(
        `Pemohon adalah PNS Non-Dosen / Tenaga Kependidikan pada Universitas Negeri Gorontalo (UNG) yang menerima fasilitas Tunjangan/Remunerasi dengan ketentuan pembayaran 30% dibayarkan setiap bulan dan 70% dibayarkan setiap 6 bulan berjalan (semesteran), yang keseluruhannya disalurkan dan terverifikasi melalui Payroll Account terlampir.`
      );
    }

    // 13. Maksud Pengajuan
    const plafon = context.plafon || context.usulan_plafon_kredit || "0";
    const tenor = context.tenor || context.usulan_jangka_waktu_bulan || "0";
    const jenis = context.jenis_pengajuan || "";
    list.push(
      `Maksud mengajukan Assessment Facility Fleksi ${jenis} sebesar Rp. ${plafon} Jangka Waktu ${tenor} Bulan.`,
    );

    // 14. Tujuan
    const tujuan = context.tujuan_kredit || "-";
    list.push(`Tujuan penggunaan Assessment untuk ${tujuan}`);

    return list.map((text) => ({ text }));
  }

  /**
   * Generate RPC Purna List
   */
  static generateRpcPurnaList(
    context: Record<string, unknown>,
    slikFacilities: Record<string, unknown>[],
  ): Record<string, string>[] {
    const list: string[] = [];

    const incomeTypeLabel = (context.income_type_label as string) || "Gaji";
    const rekLabel =
      incomeTypeLabel === "Tunjangan"
        ? "Tunjangan"
        : incomeTypeLabel === "Uang Makan"
        ? "Uang Makan"
        : incomeTypeLabel === "Gabungan" || incomeTypeLabel === "Penghasilan"
        ? "Penghasilan"
        : "Gaji";
    const itemLabel =
      incomeTypeLabel === "Tunjangan"
        ? "Tunjangan Pensiun"
        : incomeTypeLabel === "Uang Makan"
        ? "Uang Makan Pensiun"
        : incomeTypeLabel === "Gabungan" || incomeTypeLabel === "Penghasilan"
        ? "Penghasilan Pensiun"
        : "Gaji Pensiun";

    const payrollBankStr = String(context.payroll_bank || "Nexa").trim();
    const bankName = payrollBankStr.toLowerCase().startsWith("bank ")
      ? payrollBankStr
      : `Bank ${payrollBankStr}`;

    // Header
    list.push(
      `Penghasilan Pemohon Cfm. Rekening Koran ${rekLabel} di ${bankName} nomor ${context.payroll_no_rek || "-"} atas nama ${context.nama_pemohon || "-"} dengan data sebagai berikut :`,
    );

    // Penghasilan with mode keterangan
    const penghasilanMode = String(context.purna_penghasilan_mode || "minimum");
    const modeKeterangan =
      penghasilanMode === "langsung" ? "" : "(nilai minimum dari 3 bulan)";

    const gajiLabel =
      penghasilanMode === "langsung"
        ? `${itemLabel} Yang Di Akui`
        : `${itemLabel} ${context.purna_bulan_penghasilan_nama || ""} ${modeKeterangan}`;

    list.push(`${gajiLabel.trim()}\t\t:  Rp. ${context.purna_bulan_penghasilan || "0"},-.`);
    list.push(`Penghasilan Pemohon\t\t\t:  Rp. ${context.rpc_penghasilan || "0"},-.`);
    list.push(`DSC 90 %\t\t\t\t:  Rp. ${context.rpc_dsc_90 || "0"},-.`);

    // Regulasi
    list.push(
      `Cfm. E-PP Kredit CR, Buku IV, Nama Bab Nexa Assessment, Nama Sub Bab Ketentuan Umum, Bab I Sub Sub 01, Halaman 18, Tanggal 18-05-2018 pada poin 3. Untuk Pensiunan dan Calon Pensiunan Maksimal DSR = 90% dari total Pendapatan Tetap (yang akan diterima) per bulan Tanpa Memperhitungkan Kewajiban Ybs. di Bank/Lembaga Keuangan Non Bank Lainnya.`,
    );

    // SLIK
    list.push(
      `Cfm. Info SLIK Ideb posisi terakhir Tanggal ${context.tgl_slik || "-"} Pemohon memiliki Assessment Facility sebagai berikut :`,
    );

    // Assessment Facility Loop
    if (slikFacilities && slikFacilities.length > 0) {
      slikFacilities.forEach((f: Record<string, unknown>) => {
        list.push(
          `-Assessment Facility ${f.jenis_kredit} di ${f.nama_bank} maks Rp. ${f.plafon_maks} outs Rp. ${f.outstanding} angsuran Rp. ${f.angsuran} Coll ${f.kolektibilitas}. ${f.alasan || ""}`,
        );
      });
    } else {
      list.push(`-Nihil - Tidak ada fasilitas assessment`);
    }

    // Mitigasi Risiko
    if (context.slik_mitigasi_risiko) {
      list.push(String(context.slik_mitigasi_risiko));
    }

    // Kalkulasi
    list.push(
      `Total Angsuran Pemohon\t\t\t: \tRp. ${context.rpc_total_angsuran_eksisting || "0"},-`,
    );
    list.push(
      `Maksimal Angsuran Assessment yang dapat diberikan sampai dengan : \tRp. ${context.rpc_maksimal_angsuran || "0"},-`,
    );
    list.push(
      `Angsuran Assessment yang dapat diusulkan       \t\t\t: \tRp. ${context.rpc_angsuran_diusulkan || "0"},-`,
    );
    list.push(
      `Total Angsuran Assessment Eksisting & Angsuran yang diusul   \t: \tRp. ${context.rpc_total_angsuran_baru || "0"},-`,
    );
    list.push(``);
    list.push(`DSR  : \t${context.rpc_dsr || "0"}%`);
    list.push(
      `Penghasilan per bulan < atau sama dengan Rp. 20 juta, maksimal DSR = 90% (Cfm. Memo PDM/9.3/5176 Tanggal 01-10-2019)`,
    );

    return list.map((text) => ({ text }));
  }

  /**
   * Generate RPC Prapurna List
   */
  static generateRpcPrapurnaList(
    context: Record<string, unknown>,
    slikFacilities: Record<string, unknown>[],
  ): Record<string, string>[] {
    const list: string[] = [];

    const incomeTypeLabel = (context.income_type_label as string) || "Gaji";
    const itemLabel =
      incomeTypeLabel === "Tunjangan"
        ? "Tunjangan"
        : incomeTypeLabel === "Uang Makan"
        ? "Uang Makan"
        : incomeTypeLabel === "Penghasilan"
        ? "Penghasilan"
        : "Gaji";

    // Header
    list.push(
      `Penghasilan Pemohon Cfm. Estimasi Hak Tabungan Hari Tua dan Pensiun Pokok NIP ${context.nip || "-"} atas nama ${context.nama_pemohon || "-"} dengan data sebagai berikut :`,
    );

    // Penghasilan
    list.push(
      `Estimasi ${itemLabel} (BUP) \t: \tRp. ${context.estimasi_hak_pensiun || "0"},-`,
    );
    list.push(`Penghasilan Pemohon \t: \tRp. ${context.rpc_penghasilan || "0"},-`);
    list.push(`DSC 90 %    \t\t: \tRp. ${context.rpc_dsc_90 || "0"},-`);

    // Regulasi
    list.push(
      `Cfm. E-PP Kredit CR, Buku IV, Nama Bab Nexa Assessment, Nama Sub Bab Ketentuan Umum, Bab I Sub Sub 01, Halaman 18, Tanggal 18-05-2018 pada poin 3. Untuk Pensiunan dan Calon Pensiunan Maksimal DSR = 90% dari total Pendapatan Tetap (yang akan diterima) per bulan Tanpa Memperhitungkan Kewajiban Ybs. di Bank/Lembaga Keuangan Non Bank Lainnya.`,
    );

    // SLIK
    list.push(
      `Cfm. Info SLIK Ideb posisi terakhir Tanggal ${context.tgl_slik} Pemohon memiliki Assessment Facility sebagai berikut :`,
    );

    // Assessment Facility Loop
    if (slikFacilities && slikFacilities.length > 0) {
      slikFacilities.forEach((f: Record<string, unknown>) => {
        list.push(
          `-Assessment Facility ${f.jenis_kredit} di ${f.nama_bank} maks Rp. ${f.plafon_maks} outs Rp. ${f.outstanding} angsuran Rp. ${f.angsuran} Coll ${f.kolektibilitas}. ${f.alasan}`,
        );
      });
    } else {
      list.push(`-Nihil - Tidak ada fasilitas assessment`);
    }

    // Mitigasi Risiko
    if (context.slik_mitigasi_risiko) {
      list.push(String(context.slik_mitigasi_risiko));
    }

    // Kalkulasi
    list.push(
      `Total Angsuran Pemohon\t\t\t\t: \tRp. ${context.rpc_total_angsuran_eksisting},-`,
    );
    list.push(
      `Maksimal Angsuran Assessment yang dapat diberikan sampai dengan : \tRp. ${context.rpc_maksimal_angsuran},-`,
    );
    list.push(
      `Angsuran Assessment yang dapat diusulkan       \t\t\t: \tRp. ${context.rpc_angsuran_diusulkan},-`,
    );
    list.push(
      `Total Angsuran Assessment Eksisting & Angsuran yang diusul   \t: \tRp. ${context.rpc_total_angsuran_baru},-`,
    );
    list.push(``);
    list.push(`DSR  : ${context.rpc_dsr}%`);
    list.push(
      `Penghasilan per bulan < atau sama dengan Rp. 20 juta, maksimal DSR = 90% (Cfm. Memo PDM/9.3/5176 Tanggal 01-10-2019)`,
    );

    return list.map((text) => ({ text }));
  }

  /**
   * Generate RPC Aktif List (String Block)
   * Returns a single string with newlines instead of a list object
   * to avoid "Unclosed loop" errors in docx template.
   *
   * Output format shows only variance results per income source (tidak detail per bulan)
   */
  static generateRpcAktifList(
    context: Record<string, unknown>,
    slikFacilities: Record<string, unknown>[],
  ): string {
    const list: string[] = [];

    const incomeTypeLabel = (context.income_type_label as string) || "Gaji";
    const rekLabel =
      incomeTypeLabel === "Tunjangan"
        ? "Tunjangan"
        : incomeTypeLabel === "Uang Makan"
        ? "Uang Makan"
        : incomeTypeLabel === "Gabungan" || incomeTypeLabel === "Penghasilan"
        ? "Penghasilan"
        : "Gaji";
    const itemLabel =
      incomeTypeLabel === "Tunjangan"
        ? "Tunjangan"
        : incomeTypeLabel === "Uang Makan"
        ? "Uang Makan"
        : incomeTypeLabel === "Penghasilan"
        ? "Penghasilan"
        : "Gaji";

    const gajiItemLabel =
      incomeTypeLabel === "Tunjangan"
        ? "Tunjangan"
        : incomeTypeLabel === "Uang Makan"
        ? "Uang Makan"
        : "Gaji"; // For Gabungan (Penghasilan), the main salary component should still be labelled "Gaji"

    const payrollBankStr = String(context.payroll_bank || "Nexa").trim();
    const bankName = payrollBankStr.toLowerCase().startsWith("bank ")
      ? payrollBankStr
      : `Bank ${payrollBankStr}`;

    // Header
    list.push(`PERHITUNGAN REPAYMENT CAPACITY :`);
    list.push(
      `Penghasilan Pemohon Cfm. Slip ${rekLabel} dan Rekening Koran ${rekLabel} Pemohon di ${bankName} Nomor Rekening ${context.aktif_nomor_rekening_gaji || context.payroll_no_rek || "-"} atas nama ${context.nama_pemohon || "-"} dengan data sebagai berikut :`,
    );
    list.push(``);

    // === INCOME COMPONENTS (Only Variance Results with Method Text) ===

    // Gaji (only if all 3 months > 0)
    // Gaji (relaxed check: display if any month > 0 AND checked)
    const g1Checked = context.gaji_bulan_1_checked !== false;
    const g2Checked = context.gaji_bulan_2_checked !== false;
    const g3Checked = context.gaji_bulan_3_checked !== false;

    // Recalculate local values based on check status
    // Note: We shadow the previous const gaji1 variables if they were declared above, 
    // but looking at previous code, they were declared at lines ~814.
    // To avoid "const" redeclaration error if they are in same scope, I should check scope.
    // They are in function scope. Use NEW variables or update logic where they are defined.
    // The previous code block (lines 813-818) defined:
    /*
    const gaji1 = parseFloat(...) || 0;
    const gaji2 = ...
    */
    // I can't redeclare them.
    // I should probably edit the DEFINITION of gaji1, gaji2, gaji3 earlier in the file!
    // But replace_file_content targets a block.
    // Let's replace the whole Gaji block including definitions if they are close.
    // Lines 814-838 cover definitions and usage.
    
    // Let's assume lines 814 are start of definitions.
    // I'll replace from the start of definitions. 
    
    const rawGaji1 = parseFloat(String(context.gaji_bulan_1 || "0").replace(/[^\d]/g, "")) || 0;
    const rawGaji2 = parseFloat(String(context.gaji_bulan_2 || "0").replace(/[^\d]/g, "")) || 0;
    const rawGaji3 = parseFloat(String(context.gaji_bulan_3 || "0").replace(/[^\d]/g, "")) || 0;
    
    const gaji1 = g1Checked ? rawGaji1 : 0;
    const gaji2 = g2Checked ? rawGaji2 : 0;
    const gaji3 = g3Checked ? rawGaji3 : 0;

    if (gaji1 > 0 || gaji2 > 0 || gaji3 > 0) {
      const gajiValues = [gaji1, gaji2, gaji3].filter(g => g > 0);
      const maxVal = Math.max(...gajiValues);
      const minVal = Math.min(...gajiValues);
      
      const gajiVariance = maxVal > 0 ? ((maxVal - minVal) / maxVal) * 100 : 0;
      
      let gajiMethodText = "dihitung nominal terkecil"; // default
      // If 1 month or variance <= 20
      if (gajiValues.length === 1 || gajiVariance <= 20) {
        gajiMethodText = "dihitung rata-rata";
      }

      const gajiBulanNama =
        context.aktif_gaji_bulan_nama || context.aktif_bulan_gaji || "-";
      const gajiVarianceStr = String(context.aktif_gaji_variance || "0");
      list.push(
        `${gajiItemLabel} Bulan ${gajiBulanNama} (${gajiMethodText})\t\t: Rp. ${gajiVarianceStr},-`,
      );
    }

    // Additional Incomes (Tukin, Uang Makan, dll diinput via Penghasilan Tambahan)
    const additionalIncomes =
      (context.additional_incomes as Array<{
        label?: string;
        bulan_1_nama?: string;
        bulan_1?: string;
        bulan_1_checked?: boolean;
        bulan_2_nama?: string;
        bulan_2?: string;
        bulan_2_checked?: boolean;
        bulan_3_nama?: string;
        bulan_3?: string;
        bulan_3_checked?: boolean;
      }>) || [];

    for (const income of additionalIncomes) {
      if (income.label) {
        const rawB1 =
          parseFloat(String(income.bulan_1 || "0").replace(/[^\d]/g, "")) || 0;
        const rawB2 =
          parseFloat(String(income.bulan_2 || "0").replace(/[^\d]/g, "")) || 0;
        const rawB3 =
          parseFloat(String(income.bulan_3 || "0").replace(/[^\d]/g, "")) || 0;

        const b1Checked = income.bulan_1_checked !== false;
        const b2Checked = income.bulan_2_checked !== false;
        const b3Checked = income.bulan_3_checked !== false;

        const b1 = b1Checked ? rawB1 : 0;
        const b2 = b2Checked ? rawB2 : 0;
        const b3 = b3Checked ? rawB3 : 0;

        // RULE: Tampilkan jika ada data valid (> 0)
        if (b1 > 0 || b2 > 0 || b3 > 0) {
          const values = [b1, b2, b3].filter(v => v > 0);
          const maxVal = Math.max(...values);
          const minVal = Math.min(...values);
          
          const variance = maxVal > 0 ? ((maxVal - minVal) / maxVal) * 100 : 0;
          
          let useAverage = false;
          if (values.length === 1 || variance <= 20) {
            useAverage = true;
          }
          
          const finalValue = useAverage
            ? Math.round(values.reduce((a, b) => a + b, 0) / values.length)
            : minVal;
            
          const methodText = useAverage
            ? "dihitung rata-rata"
            : "dihitung nominal terkecil";
          
          let bulanNama = "-";
          if (b1 > 0) {
             bulanNama = income.bulan_1_nama || "Bulan 1";
          } else if (b2 > 0) {
             bulanNama = income.bulan_2_nama || "Bulan 2";
          } else if (b3 > 0) {
             bulanNama = income.bulan_3_nama || "Bulan 3";
          }

          list.push(
            `${income.label} Bulan ${bulanNama} (${methodText})\t: Rp. ${finalValue.toLocaleString("id-ID")},-`,
          );
        }
      }
    }

    // Khusus PNS Non-Dosen UNG: Cetak Rincian Remunerasi
    if (context.is_ung_non_dosen) {
      const remun30 = String(context.ung_remun_30 || "0");
      const remun70 = String(context.ung_remun_70 || "0");
      const remunDiakui = String(context.ung_remun_diakui_bulanan || "0");
      const payrollNoRek = String(context.payroll_no_rek || "-");

      list.push(`Tunjangan/Remunerasi (30% Bulanan)\t: Rp. ${remun30},- (terverifikasi pada Payroll Account)`);
      list.push(`Tunjangan/Remunerasi (70% Semesteran)\t: Rp. ${remun70},- (terverifikasi pada Payroll Account)`);
      list.push(`Total Remunerasi Diakui per Bulan\t: Rp. ${remunDiakui},- (Remunerasi 30% ditambah Remunerasi 70% dibagi 6 bulan)`);
      list.push(`Keterangan\t\t\t\t: Tunjangan/Remunerasi Universitas Negeri Gorontalo (UNG) untuk PNS Non-Dosen/Non-Pengajar dibayarkan 30% setiap bulan dan 70% setiap 6 bulan berjalan pada Payroll Account Nomor ${payrollNoRek}.`);
    }

    list.push(``);

    // === TOTAL & DSC ===
    list.push(
      `Penghasilan Calon Client\t\t: Rp. ${context.aktif_penghasilan_calon_debitur},-`,
    );
    list.push(
      `DSC ${context.aktif_dsc_percent}\t\t\t\t\t: Rp. ${context.aktif_dsc},-`,
    );

    // Relaksasi CP - DSR 90% text (only when DSR = 90%)
    if (context.aktif_dsc_percent === "90%") {
      list.push(``);
      list.push(
        `Relaksasi CP - DSR 90% : Hanya Memperhitungkan Kewajiban yang berjalan di Bank Nexa dengan tetap Mempertimbangkan Kualitas SLIK Pemohon secara Keseluruhan baik di Bank Nexa maupun Bank lain. Cfm Lampiran Memo Divisi CRP No. CRP/4.1/0231 tanggal 13 Januari 2026 Perihal Juklak Program Relaksasi Nexa Assessment Corporate Client.`,
      );
    }

    list.push(``);

    // SLIK Header
    list.push(
      `Cfm. Info SLIK Ideb posisi terakhir Tanggal ${context.tgl_slik} Pemohon memiliki Assessment Facility sebagai berikut :`,
    );

    // Assessment Facility Loop
    if (slikFacilities && slikFacilities.length > 0) {
      slikFacilities.forEach((f: Record<string, unknown>) => {
        list.push(
          `-Assessment Facility ${f.jenis_kredit} di ${f.nama_bank} maks Rp. ${f.plafon_maks} outs Rp. ${f.outstanding} angsuran Rp. ${f.angsuran} Coll ${f.kolektibilitas}. ${f.alasan || ""}`,
        );
      });
    } else {
      list.push(`-Nihil - Tidak ada fasilitas assessment`);
    }
    list.push(``);

    // Kalkulasi
    list.push(
      `Total Angsuran Calon Client\t\t\t: Rp. ${context.aktif_total_angsuran_calon_debitur},-`,
    );
    list.push(
      `Maksimal Angsuran Assessment yang dapat diberikan s.d\t: Rp. ${context.aktif_maksimal_angsuran},-`,
    );
    list.push(
      `Angsuran Assessment yang dapat diusulkan\t\t\t: Rp. ${context.aktif_angsuran_diusulkan},-`,
    );
    list.push(
      `Total Angsuran Assessment Eksisting & Angsuran yg diusul\t: Rp. ${context.aktif_total_angsuran_all},-`,
    );
    list.push(``);
    list.push(`DSR : ${context.aktif_dsr}%`);
    list.push(String(context.aktif_dsr_keterangan || ""));

    return list.join("\n");
  }

  /**
   * Generate Verifikasi Penghasilan Aktif List (Hybrid Option)
   * Includes fixed Gaji Bulan 1-3 and dynamic Additional Incomes
   */
  static generateVerifikasiPenghasilanAktifList(
    context: Record<string, unknown>,
  ): Record<string, string>[] {
    const list: string[] = [];

    // Header & Sub-header (Dynamic based on active income components - Revisi 3)
    const incomeTypeLabel = (context.income_type_label as string) || "Gaji";
    const title = `VERIFIKASI ${incomeTypeLabel.toUpperCase()} PEMOHON`;
    const descType = incomeTypeLabel;

    const rekLabel =
      incomeTypeLabel === "Tunjangan"
        ? "Tunjangan"
        : incomeTypeLabel === "Uang Makan"
        ? "Uang Makan"
        : incomeTypeLabel === "Gabungan" || incomeTypeLabel === "Penghasilan"
        ? "Penghasilan"
        : "Gaji";

    const itemLabel =
      incomeTypeLabel === "Tunjangan"
        ? "Tunjangan"
        : incomeTypeLabel === "Uang Makan"
        ? "Uang Makan"
        : incomeTypeLabel === "Penghasilan"
        ? "Penghasilan"
        : "Gaji";

    const gajiItemLabel =
      incomeTypeLabel === "Tunjangan"
        ? "Tunjangan"
        : incomeTypeLabel === "Uang Makan"
        ? "Uang Makan"
        : "Gaji"; // For Gabungan (Penghasilan), the main salary component should still be labelled "Gaji"

    const payrollBankStr = String(context.payroll_bank || "Nexa").trim();
    const bankName = payrollBankStr.toLowerCase().startsWith("bank ")
      ? payrollBankStr
      : `Bank ${payrollBankStr}`;

    list.push(title);
    list.push(
      `${descType} Pemohon Cfm. Rekening Koran ${rekLabel} ${bankName} nomor ${context.payroll_no_rek || "-"} atas nama ${context.nama_pemohon || "-"} dengan data sebagai berikut :`,
    );

    // Gaji Utama / Income Utama (3 Bulan)
    if (context.has_gaji !== false) {
      list.push(
        `-${gajiItemLabel} Bulan ${context.gaji_bulan_1_nama || "-"}\t:\tRp. ${context.gaji_bulan_1 || "0"},-`,
      );
      list.push(
        `-${gajiItemLabel} Bulan ${context.gaji_bulan_2_nama || "-"}\t:\tRp. ${context.gaji_bulan_2 || "0"},-`,
      );
      list.push(
        `-${gajiItemLabel} Bulan ${context.gaji_bulan_3_nama || "-"}\t:\tRp. ${context.gaji_bulan_3 || "0"},-`,
      );
    }

    // Tukin & Uang Makan (Legacy/Specific Fields)
    if (context.tukin && context.tukin !== "0") {
      list.push(`-Tunjangan Kinerja\t:\tRp. ${context.tukin},-`);
    }
    if (context.uang_makan && context.uang_makan !== "0") {
      list.push(`-Uang Makan\t:\tRp. ${context.uang_makan},-`);
    }

    // Additional Incomes (Dynamic)
    const additionalIncomes =
      (context.additional_incomes as Array<Record<string, unknown>>) || [];
    if (Array.isArray(additionalIncomes)) {
      for (const income of additionalIncomes) {
        if (income.label) {
          const rawB1 = parseFloat(String(income.bulan_1 || "0").replace(/[^\d]/g, "")) || 0;
          const rawB2 = parseFloat(String(income.bulan_2 || "0").replace(/[^\d]/g, "")) || 0;
          const rawB3 = parseFloat(String(income.bulan_3 || "0").replace(/[^\d]/g, "")) || 0;

          const b1Checked = income.bulan_1_checked !== false;
          const b2Checked = income.bulan_2_checked !== false;
          const b3Checked = income.bulan_3_checked !== false;

          const b1 = b1Checked ? rawB1 : 0;
          const b2 = b2Checked ? rawB2 : 0;
          const b3 = b3Checked ? rawB3 : 0;

          if (b1 > 0 || b2 > 0 || b3 > 0) {
            if (b1 > 0) {
              list.push(
                `-${income.label} ${income.bulan_1_nama || "Bulan 1"}\t:\tRp. ${formatRupiah(b1.toString())},-`,
              );
            }
            if (b2 > 0) {
              list.push(
                `-${income.label} ${income.bulan_2_nama || "Bulan 2"}\t:\tRp. ${formatRupiah(b2.toString())},-`,
              );
            }
            if (b3 > 0) {
              list.push(
                `-${income.label} ${income.bulan_3_nama || "Bulan 3"}\t:\tRp. ${formatRupiah(b3.toString())},-`,
              );
            }
          }
        }
      }
    }

    if (context.is_ung_non_dosen) {
      const remun30 = String(context.ung_remun_30 || "0");
      const remun70 = String(context.ung_remun_70 || "0");
      const remunDiakui = String(context.ung_remun_diakui_bulanan || "0");
      const payrollNoRek = String(context.payroll_no_rek || "-");

      list.push(`-Tunjangan/Remunerasi (30% Bulanan)\t:\tRp. ${remun30},- (terverifikasi pada Payroll Account)`);
      list.push(`-Tunjangan/Remunerasi (70% Semesteran)\t:\tRp. ${remun70},- (terverifikasi pada Payroll Account)`);
      list.push(`-Total Remunerasi Diakui per Bulan\t:\tRp. ${remunDiakui},- (Remunerasi 30% ditambah Remunerasi 70% dibagi 6 bulan)`);
      list.push(`-Keterangan\t:\tTunjangan/Remunerasi Universitas Negeri Gorontalo (UNG) untuk PNS Non-Dosen/Non-Pengajar dibayarkan 30% setiap bulan dan 70% setiap 6 bulan berjalan pada Payroll Account Nomor ${payrollNoRek}.`);
    }

    return list.map((text) => ({ text }));
  }

  /**
   * Generate Verifikasi Penghasilan Purna List
   */
  static generateVerifikasiPenghasilanPurnaList(
    context: Record<string, unknown>,
  ): Record<string, string>[] {
    const list: string[] = [];

    // Header
    list.push(`VERIFIKASI PENGHASILAN PEMOHON`);
    list.push(
      `Penghasilan Pemohon Cfm. Rekening Koran Gaji Bank ${context.payroll_bank} nomor ${context.payroll_no_rek} atas nama ${context.nama_pemohon} dengan data sebagai berikut :`,
    );

    // Gaji Pensiun per Bulan
    list.push(
      `-Gaji Pensiun Bulan ${context.pensiun_bulan_1_nama} \t:\tRp. ${context.pensiun_bulan_1},-`,
    );
    list.push(
      `-Gaji Pensiun Bulan ${context.pensiun_bulan_2_nama} \t:\tRp. ${context.pensiun_bulan_2},-`,
    );
    list.push(
      `-Gaji Pensiun Bulan ${context.pensiun_bulan_3_nama} \t:\tRp. ${context.pensiun_bulan_3},-`,
    );

    return list.map((text) => ({ text }));
  }

  /**
   * Generate Verifikasi Penghasilan Prapurna List
   */
  static generateVerifikasiPenghasilanPrapurnaList(
    context: Record<string, unknown>,
  ): Record<string, string>[] {
    const list: string[] = [];

    const incomeTypeLabel = (context.income_type_label as string) || "Gaji";

    // Header
    const title = `Verifikasi ${incomeTypeLabel} Pemohon :`;
    list.push(title);

    // Point 1: Estimasi Hak Pensiun
    list.push(
      `-Cfm. Estimasi Hak Tabungan Hari Tua dan Pensiun Pokok NIP ${context.nip} atas nama ${context.nama_pemohon} dengan Hak Pensiun yang akan diterima +/- Rp. ${context.estimasi_hak_pensiun},-.`,
    );

    // Point 2: Payroll Gaji
    list.push(
      `-Cfm. Payrol Gaji di ${context.payroll_bank} nomor ${context.payroll_no_rek} atas nama ${context.nama_pemohon} data sebagai berikut :`,
    );

    // Gaji Bulan 1-3
    list.push(
      `-Gaji Bulan ${context.gaji_bulan_1_nama || "-"}\t\t\tRp. ${context.gaji_bulan_1 || "0"},-.`,
    );
    list.push(
      `-Gaji Bulan ${context.gaji_bulan_2_nama || "-"}\t\t\tRp. ${context.gaji_bulan_2 || "0"},-.`,
    );
    list.push(
      `-Gaji Bulan ${context.gaji_bulan_3_nama || "-"}\t\t\tRp. ${context.gaji_bulan_3 || "0"},-.`,
    );

    return list.map((text) => ({ text }));
  }
  /**
   * Generate Investigasi List for PT. Mitra Karya Prima (MKP)
   * Strictly follows user-requested format (11 points)
   */

  /**
   * Generate Investigasi List for Kejaksaan Negeri
   * Strictly follows user-requested format
   */

  /**
   * Generate Investigasi List for Universitas Negeri Gorontalo (UNG)
   * Strictly follows user-requested format (13 points)
   */

  /**
   * Generate Investigasi List for KSOP Anggrek / Kementerian Perhubungan
   * Strictly follows user-requested format (11 points)
   */

  /**
   * Generate Investigasi List for PT. PLN (Persero) UP3 Gorontalo
   * Strictly follows user-requested format with conditional generation
   */
}

