import { formatStatusKepegawaian } from "./formatters";

export class ListGenerators {
  /**
   * Generate Investigasi List (dynamic points) - Prapurna Aware
   */
  static generateInvestigasiList(
    context: Record<string, unknown>
  ): Record<string, string>[] {
    const list: string[] = [];
    const kategoriLower = String(context.kategori || "").toLowerCase();
    const isPrapurna = kategoriLower.includes("prapurna");
    const isAktif = kategoriLower.includes("aktif");

    // 1. Alamat KTP
    if (context.alamat_ktp) {
      list.push(`Alamat Pemohon sesuai KTP di ${context.alamat_ktp}.`);
    }

    // 2. Alamat Tempat Tinggal (Conditional)
    if (context.tempat_tinggal_berbeda) {
      list.push(
        `Alamat Tempat Tinggal saat ini di ${context.alamat_tempat_tinggal}.`
      );
    }

    // 3. Status Rumah
    if (context.status_rumah) {
      list.push(
        `Status Rumah saat ini adalah ${
          context.status_rumah
        } dengan lama tinggal ± ${context.lama_tinggal || "-"}.`
      );
    }

    // 4. Usia & KTP Info
    if (context.usia_pemohon) {
      list.push(
        `Usia Pemohon ± ${context.usia_pemohon} Tahun (${context.tgl_lahir}) Cfm. KTP Nomor ${context.no_ktp} tanggal ${context.tgl_terbit_ktp}.`
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
        `Golongan/Pangkat saat ini adalah ${golongan}. Cfm. SK Pangkat Terakhir No ${noSkPangkat} tanggal ${tglSkPangkat}.`
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
      const tglPensiun = context.tgl_pensiun || "-";
      list.push(
        `Pemohon akan memasuki Batas Usia Pensiun per Tanggal ${tglPensiun} Cfm. Estimasi Hak Tabungan Hari Tua dan Pensiun Pokok.`
      );
    } else if (isAktif) {
      // --- AKTIF SPECIFIC ---
      ListGenerators.generateAktifInvestigasi(list, context);
    } else {
      // --- PURNA (EXISTING) ---
      // 6. Info Pensiunan
      const pensiunan = context.pensiunan || "-";
      const instansi = context.instansi || "-";
      const tmtPensiun = context.tgl_pensiun_tmt || "-";
      const noSk = context.no_sk_pensiun || "-";
      const tglSk = context.tgl_sk_pensiun || "-";
      list.push(
        `Pemohon merupakan Pensiunan ${pensiunan} di ${instansi} TMT Pensiun ${tmtPensiun}. Cfm SK Pensiun No. ${noSk} tanggal ${tglSk}.`
      );
    }

    // 7. Maksud Pengajuan
    const jenisPengajuan = context.jenis_pengajuan || "-";
    const plafon = context.plafon || "0";
    const tenor = context.tenor || "0";
    let produkName = "BNI Fleksi Pensiun";
    if (isPrapurna) {
      produkName = "BNI Fleksi Pensiun Prapurna";
    } else if (isAktif) {
      // Default name for Aktif, can be adjusted if needed per segmentation
      produkName = "Fasilitas Kredit Fleksi";
    }

    list.push(
      `Maksud mengajukan fasilitas kredit ${produkName} ${jenisPengajuan} sebesar Rp. ${plafon} Jangka Waktu ${tenor} Bulan.`
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
    context: Record<string, unknown>
  ): Record<string, string>[] {
    const list: string[] = [];
    const pensiunan = context.pensiunan || "-";
    const instansi = context.instansi || "-";
    const statusRumah = context.status_rumah || "-";

    // 1. Pensiun Check
    list.push(
      `Memang benar Pemohon merupakan Pensiun ${pensiunan} di ${instansi}.`
    );

    // 2. Status Rumah Check
    list.push(
      `Menurut Ybs. rumah yang di tempati Pemohon saat ini adalah rumah ${statusRumah}.`
    );

    // 3. Kemampuan Bayar
    list.push(
      "Ybs. menyampaikan bahwa Pemohon memiliki kemampuan untuk menyetor angsuran atas kredit yang dimohon, dan"
    );

    // 4. Willingness to Remind
    list.push(
      "Ybs. bersedia untuk mengingatkan Pemohon untuk kewajiban angsuran perbulan."
    );

    // 5. Character
    list.push("Pemohon dikenal baik dan bertanggung jawab.");

    return list.map((text) => ({ text }));
  }

  static generateBendaharaList(
    context: Record<string, unknown>
  ): Record<string, string>[] {
    const list: string[] = [];
    const statusKepegawaian = String(context.status_kepegawaian || "");
    const instansi = String(context.instansi || "-");
    const jabatan = context.jabatan || "-";
    const masaKerja = context.masa_kerja || "-"; // Just number or partial text
    const tglMulai = context.tgl_mulai_kerja || "-";
    const tglPensiun =
      context.tgl_pensiun_pemohon || context.tgl_pensiun || "-";
    const gaji = context.gaji_bulan_3 || "0";
    const payrollBank = context.payroll_bank || "-";

    list.push(formatStatusKepegawaian(statusKepegawaian, instansi));
    list.push(`Jabatan saat ini Pemohon sebagai ${jabatan}.`);
    list.push(
      `Lama Masa Kerja Pemohon -/+ ${masaKerja} atau sejak ${tglMulai}.`
    );
    list.push(
      `Pemohon akan memasuki Batas Usia Pensiun per Tanggal ${tglPensiun}.`
    );
    list.push(
      `Gaji Aktif Pemohon saat ini berkisar Rp. ${gaji},-, dan pendapatan lainnya atau dapat dicocokkan pada Rekening Payroll ${payrollBank} (terlampir).`
    );
    list.push(`Karakter dan Integritas yang baik dan bertanggung jawab.`);

    return list.map((text) => ({ text }));
  }

  static generateRekanKerjaList(
    context: Record<string, unknown>
  ): Record<string, string>[] {
    const list: string[] = [];
    const statusKepegawaian = String(
      context.status_kepegawaian || "Calon Pensiunan"
    );
    const instansi = String(context.instansi || "-");
    const jabatan = context.jabatan || "-";
    const masaKerja = context.masa_kerja || "-";
    const tglMulai = context.tgl_mulai_kerja || "-";
    const tglPensiun =
      context.tgl_pensiun_pemohon || context.tgl_pensiun || "-";

    list.push(formatStatusKepegawaian(statusKepegawaian, instansi));
    list.push(`Jabatan saat ini Pemohon sebagai ${jabatan}.`);
    list.push(
      `Lama Masa Kerja Pemohon -/+ ${masaKerja} atau sejak ${tglMulai}.`
    );
    list.push(
      `Pemohon akan memasuki Batas Usia Pensiun per Tanggal ${tglPensiun}.`
    );
    list.push(`Karakter dan Integritas yang baik dan bertanggung jawab.`);

    return list.map((text) => ({ text }));
  }

  static generateTaspenList(
    context: Record<string, unknown>
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
    context: Record<string, unknown>
  ): Record<string, string>[] {
    const list: string[] = [];
    const statusKepegawaian = String(
      context.status_kepegawaian || "Calon Pensiunan PNS"
    );
    const instansi = String(context.instansi || "-");
    const statusRumah = context.status_rumah || "-";

    list.push(formatStatusKepegawaian(statusKepegawaian, instansi));
    list.push(
      `Menurut Ybs. rumah yang di tempati Pemohon saat ini adalah Rumah ${statusRumah}.`
    );
    list.push(
      "Ybs. menyampaikan bahwa Pemohon memiliki kemampuan untuk menyetor angsuran atas kredit yang dimohon, dan Ybs bersedia untuk mengingatkan Pemohon untuk kewajiban angsuran perbulan"
    );

    return list.map((text) => ({ text }));
  }

  /**
   * Helper: Generate specific points for Aktif (BUMN/BUMD, Swasta, Pemerintahan)
   */
  private static generateAktifInvestigasi(
    list: string[],
    context: Record<string, unknown>
  ): void {
    const segmentasi = String(context.segmentasi || "").toLowerCase();
    const instansi = context.instansi || "-";
    const noSk = context.no_sk_cpns || "-"; // SK Pengangkatan/CPNS
    const tglSk = context.tgl_sk_cpns || "-";
    const masaKerja = context.masa_kerja || "-";
    const tglMulaiKerja = context.tgl_mulai_kerja || "-";
    
    // BUMN/BUMD Specific
    if (segmentasi.includes("bumd") || segmentasi.includes("bumn")) {
      // 5. Status kepegawaian PKWT
      list.push(
        `Pemohon adalah Pegawai PKWT pada ${instansi} Cfm. Surat Keputusan (SK) Pengangkatan No ${noSk} tanggal ${tglSk}.`
      );

      // 6. Lama bekerja
      list.push(
        `Lama bekerja Pemohon ± ${masaKerja} sejak ${tglMulaiKerja} Cfm. Surat Keputusan (SK) Pengangkatan No ${noSk} tanggal ${tglSk}.`
      );

      // 7. Info Perusahaan Induk (if available)
      const parentCompany = context.parent_company || "";
      if (parentCompany) {
        list.push(
          `${instansi} adalah anak Perusahaan dari ${parentCompany} yang termasuk Daftar Kelolaan SLN.`
        );
      }

      // 8. Alamat Kantor
      if (context.alamat_kantor) {
        list.push(`Alamat ${instansi} di ${context.alamat_kantor}.`);
      }

      // 9. Jabatan dan penempatan
      const jabatan = context.jabatan || "-";
      const unitKerja = context.unit_kerja || "";
      let jabatanText = `Jabatan Pemohon saat ini adalah ${jabatan}`;
      if (unitKerja) {
        jabatanText += ` yang ditempatkan di ${unitKerja}`;
      }
      list.push(jabatanText + ".");
    } else {
      // Default fallback for Swasta / Pemerintahan (use basic format)
      // Similar to Prapurna logic simplified
      const statusText = segmentasi === "pemerintahan" ? "PNS" : "Karyawan";
      list.push(
        `Pemohon adalah ${statusText} pada ${instansi} Cfm. SK Pengangkatan No ${noSk} tanggal ${tglSk}.`
      );
      list.push(
        `Lama bekerja Pemohon ± ${masaKerja} sejak ${tglMulaiKerja}.`
      );
      if (context.alamat_kantor) {
        list.push(`Alamat Kantor Pemohon di ${context.alamat_kantor}.`);
      }
      if (context.jabatan) {
        list.push(`Jabatan Pemohon saat ini adalah ${context.jabatan}.`);
      }
    }
  }
}
