import { DebiturData, SlikFacility } from "./types";
import { formatRupiah } from "@/lib/utils";

export class FinancialContextBuilder {
  static build(
    debitur: DebiturData,
    slikFacilities: SlikFacility[],
  ): Record<string, unknown> {
    const data = debitur.dataLengkap;
    const kategoriLower = String(debitur.kategori || "").toLowerCase();
    const isAktif = kategoriLower.includes("aktif");
    const isPurna =
      kategoriLower.includes("purna") && !kategoriLower.includes("prapurna");

    // 1. Calculate Penghasilan
    let penghasilan = 0;
    let aktifPenghasilan = 0;
    let aktifGajiBulan = "";
    let aktifJumlahGaji = 0;
    
    // Purna Variables
    let purnaBulanNama = "";
    let purnaBulanJumlah = 0;

    // Aktif-specific calculation variables
    let gajiValue = 0, additionalValue = 0;
    let gaji1 = 0, gaji2 = 0, gaji3 = 0;

    // Logic Selection: Aktif -> Purna -> Prapurna (Default)
    if (isAktif) {
      // === HELPER FUNCTION: Calculate variance-based value ===
      // RULE: Hitung berdasarkan data yang tersedia (valid > 0)
      const calculateVarianceValue = (val1: number, val2: number, val3: number): number => {
        // Filter nilai yang valid (>0)
        const validValues = [val1, val2, val3].filter(v => v > 0);
        
        // Jika tidak ada nilai valid, return 0
        if (validValues.length === 0) return 0;
        
        const values = validValues;
        const maxVal = Math.max(...values);
        const minVal = Math.min(...values);

        // Jika hanya 1 data valid, langsung return nilai tersebut
        if (values.length === 1) return values[0];

        const variance = maxVal > 0 ? ((maxVal - minVal) / maxVal) * 100 : 0;
        
        // Variance ≤ 20%: gunakan rata-rata, selain itu gunakan terkecil
        return variance <= 20
          ? Math.round(values.reduce((a, b) => a + b, 0) / values.length)
          : minVal;
      };

      // === 1. Parse Gaji ===
      gaji1 =
        data.gaji_bulan_1_checked !== false
          ? parseInt(
              String(data.gaji_bulan_1_jumlah || 0).replace(/[^0-9]/g, ""),
              10,
            ) || 0
          : 0;
      gaji2 =
        data.gaji_bulan_2_checked !== false
          ? parseInt(
              String(data.gaji_bulan_2_jumlah || 0).replace(/[^0-9]/g, ""),
              10,
            ) || 0
          : 0;
      gaji3 =
        data.gaji_bulan_3_checked !== false
          ? parseInt(
              String(data.gaji_bulan_3_jumlah || 0).replace(/[^0-9]/g, ""),
              10,
            ) || 0
          : 0;
      gajiValue = calculateVarianceValue(gaji1, gaji2, gaji3);

      // === 2. Parse Additional Incomes (Tukin, Uang Makan, dll via Penghasilan Tambahan) ===
      const additionalIncomes = (data.additional_incomes || []) as Array<{
        label?: string;
        bulan_1?: string;
        bulan_1_checked?: boolean;
        bulan_2?: string;
        bulan_2_checked?: boolean;
        bulan_3?: string;
        bulan_3_checked?: boolean;
      }>;
      
      additionalIncomes.forEach((income) => {
        const add1 =
          income.bulan_1_checked !== false
            ? parseInt(String(income.bulan_1 || 0).replace(/[^0-9]/g, ""), 10) ||
              0
            : 0;
        const add2 =
          income.bulan_2_checked !== false
            ? parseInt(String(income.bulan_2 || 0).replace(/[^0-9]/g, ""), 10) ||
              0
            : 0;
        const add3 =
          income.bulan_3_checked !== false
            ? parseInt(String(income.bulan_3 || 0).replace(/[^0-9]/g, ""), 10) ||
              0
            : 0;
        // Hanya tambahkan jika ada data valid yang dicentang
        additionalValue += calculateVarianceValue(add1, add2, add3);
      });

      // === 3. Total Penghasilan (Sum of all variance-based values) ===
      aktifPenghasilan = gajiValue + additionalValue;
      penghasilan = aktifPenghasilan;

      // Track bulan gaji terkecil untuk placeholder (legacy compatibility)
      const gajiList = [gaji1, gaji2, gaji3].filter((g) => g > 0);
      if (gajiList.length > 0) {
        const minGaji = Math.min(...gajiList);
        if (gaji3 === minGaji) {
          aktifGajiBulan = String(data.gaji_bulan_3_nama || "Bulan 3");
          aktifJumlahGaji = gaji3;
        } else if (gaji2 === minGaji) {
          aktifGajiBulan = String(data.gaji_bulan_2_nama || "Bulan 2");
          aktifJumlahGaji = gaji2;
        } else {
          aktifGajiBulan = String(data.gaji_bulan_1_nama || "Bulan 1");
          aktifJumlahGaji = gaji1;
        }
      }
    } else if (isPurna) {
      // Check selection mode
      const penghasilanMode = String(data.purna_penghasilan_mode || "minimum");
      
      const pensiun1 =
        parseInt(
          String(data.pensiun_bulan_1_jumlah || 0).replace(/[^0-9]/g, ""),
          10,
        ) || 0;
      const pensiun2 =
        parseInt(
          String(data.pensiun_bulan_2_jumlah || 0).replace(/[^0-9]/g, ""),
          10,
        ) || 0;
      const pensiun3 =
        parseInt(
          String(data.pensiun_bulan_3_jumlah || 0).replace(/[^0-9]/g, ""),
          10,
        ) || 0;

      if (penghasilanMode === "langsung") {
        // Mode Langsung: gunakan nilai dari pensiun_bulan_jumlah
        penghasilan =
          parseInt(
            String(data.pensiun_bulan_jumlah || 0).replace(/[^0-9]/g, ""),
            10,
          ) || 0;
        purnaBulanNama = "Input Langsung";
        purnaBulanJumlah = penghasilan;
      } else {
        // Mode Minimum (default): ambil nilai terkecil dari 3 bulan
        const pensiunList = [pensiun1, pensiun2, pensiun3].filter((p) => p > 0);

        if (pensiunList.length > 0) {
          penghasilan = Math.min(...pensiunList);

          // Track which month has minimum value for display
          if (penghasilan === pensiun1) {
            purnaBulanNama = String(data.pensiun_bulan_1_nama || "Bulan 1");
            purnaBulanJumlah = pensiun1;
          } else if (penghasilan === pensiun2) {
            purnaBulanNama = String(data.pensiun_bulan_2_nama || "Bulan 2");
            purnaBulanJumlah = pensiun2;
          } else {
            purnaBulanNama = String(data.pensiun_bulan_3_nama || "Bulan 3");
            purnaBulanJumlah = pensiun3;
          }
        }
      }
    } else {
      // Prapurna / Default
      const estimasiHakPensiun =
        parseInt(
          String(data.estimasi_hak_pensiun || 0).replace(/[^0-9]/g, ""),
          10,
        ) || 0;
      penghasilan = estimasiHakPensiun;
    }

    const dsc90 = Math.round(penghasilan * 0.9);

    // Determine DSC percentage for Fleksi Aktif based on kode_program
    const kodeProgram = String(data.kode_program || "");
    const aktifDscPercent = kodeProgram.includes("90%") ? 0.9 : 0.6;
    const aktifDsc = Math.round(penghasilan * aktifDscPercent);

    // 2. Calculate SLIK Angsuran
    const totalAngsuranSlik = slikFacilities
      .filter((f) => !f.is_takeover && !f.is_topup_lunas)
      .reduce(
        (sum, f) =>
          sum + (parseInt(String(f.angsuran).replace(/[^0-9]/g, ""), 10) || 0),
        0,
      );

    const maksimalAngsuran = dsc90 - totalAngsuranSlik;
    const aktifMaksimalAngsuran = aktifDsc - totalAngsuranSlik;

    // 3. Parse Usulan
    const plafon = parseInt(
      String(data.usulan_plafon_kredit || 0).replace(/[^0-9]/g, ""),
      10,
    );
    const tenor = parseInt(String(data.usulan_jangka_waktu_bulan || 0), 10);
    const bunga = parseFloat(String(data.usulan_bunga_persen || 0));

    // 4. Calculate Angsuran Kredit (Annuity)
    const monthlyRate = bunga / 12 / 100;
    let angsuranKredit = 0;
    if (tenor > 0 && monthlyRate > 0) {
      angsuranKredit = Math.round(
        (plafon * (monthlyRate * Math.pow(1 + monthlyRate, tenor))) /
          (Math.pow(1 + monthlyRate, tenor) - 1),
      );
    } else if (tenor > 0) {
      angsuranKredit = Math.round(plafon / tenor);
    }

    // 5. Calculate DSR
    const totalAngsuranBaru = totalAngsuranSlik + angsuranKredit;
    const dsr =
      penghasilan > 0
        ? Math.round((totalAngsuranBaru / penghasilan) * 10000) / 100
        : 0;

    // 6. Calculate Biaya
    const pctProvisi = data.biaya_provisi
      ? parseFloat(String(data.biaya_provisi))
      : 1;
    const biayaProvisi = Math.round(plafon * (pctProvisi / 100));

    const pctTatalaksana = data.biaya_tatalaksana
      ? parseFloat(String(data.biaya_tatalaksana))
      : 2;
    const biayaTatalaksana = Math.round(plafon * (pctTatalaksana / 100));

    const pctPsjt = parseFloat(String(data.biaya_psjt_percent || 0)) || 0;
    const biayaPsjt = Math.round(plafon * (pctPsjt / 100));

    const biayaAdminNominal = String(data.biaya_administrasi_nominal || "0");

    return {
      // Raw values for logic if needed
      _penghasilan: penghasilan,
      _totalAngsuranSlik: totalAngsuranSlik,
      _angsuranKredit: angsuranKredit,

      // RPC Fields
      rpc_penghasilan: formatRupiah(penghasilan),
      rpc_dsc_90: formatRupiah(dsc90),
      rpc_total_angsuran_eksisting: formatRupiah(totalAngsuranSlik),
      rpc_maksimal_angsuran: formatRupiah(maksimalAngsuran),
      rpc_angsuran_diusulkan: formatRupiah(angsuranKredit),
      rpc_total_angsuran_baru: formatRupiah(totalAngsuranBaru),
      rpc_dsr: `${dsr}`,
      
      // Purna Specific (New)
      purna_bulan_penghasilan_nama: purnaBulanNama,
      purna_bulan_penghasilan: formatRupiah(purnaBulanJumlah),

      // RPC Fleksi Aktif Fields (DSC 60%)
      aktif_gaji_pemohon: formatRupiah(aktifPenghasilan),
      aktif_nomor_rekening_gaji: data.payroll_no_rek || "",
      aktif_bulan_gaji: aktifGajiBulan,
      aktif_jumlah_gaji_bulan: formatRupiah(aktifJumlahGaji),
      aktif_penghasilan_calon_debitur: formatRupiah(aktifPenghasilan),
      aktif_dsc: formatRupiah(aktifDsc),
      aktif_dsc_60: formatRupiah(aktifDsc), // Backward compatibility
      aktif_dsc_percent: `${Math.round(aktifDscPercent * 100)}%`,
      aktif_total_angsuran_calon_debitur: formatRupiah(totalAngsuranSlik),
      aktif_maksimal_angsuran: formatRupiah(aktifMaksimalAngsuran),
      aktif_angsuran_diusulkan: formatRupiah(angsuranKredit),
      aktif_total_angsuran_all: formatRupiah(totalAngsuranBaru),
      aktif_dsr: `${dsr}`,
      aktif_dsr_keterangan:
        aktifDscPercent === 0.9
          ? "Penghasilan per bulan < atau sama dengan Rp. 20 juta, maksimal DSR = 90% (Cfm. Memo PDM/9.3/5176 Tanggal 01-10-2019)"
          : penghasilan <= 20000000
            ? "Penghasilan per bulan ≤ Rp. 20 Juta, maksimal DSR = 60%"
            : "Penghasilan per bulan > Rp. 20 Juta, maksimal DSR = 70%",

      // RPC Aktif Component Details (Variance Results)
      aktif_gaji_variance: formatRupiah(gajiValue),
      aktif_additional_variance: formatRupiah(additionalValue),
      // Month names for output
      aktif_gaji_bulan_nama: aktifGajiBulan,

      // Usulan Fields
      plafon: formatRupiah(plafon),
      usulan_plafon: formatRupiah(plafon),
      tenor: tenor,
      tenor_bulan: `${tenor} Bulan`,
      usulan_jangka_waktu: `${tenor} Bulan`,
      bunga: `${bunga}`,
      bunga_persen: `${bunga}% p.a Efektif Anuitas`,

      // Biaya Fields
      biaya_provisi: formatRupiah(biayaProvisi),
      biaya_provisi_percent: `${pctProvisi}%`,
      biaya_tatalaksana: formatRupiah(biayaTatalaksana),
      biaya_tatalaksana_percent: `${pctTatalaksana}%`,
      biaya_psjt: formatRupiah(biayaPsjt),
      biaya_psjt_percent: `${pctPsjt}%`,

      biaya_administrasi_is_bebas: data.biaya_administrasi_is_bebas,
      biaya_administrasi_nominal: formatRupiah(biayaAdminNominal),
      biaya_administrasi_text: data.biaya_administrasi_is_bebas
        ? "Bebas Biaya Administrasi"
        : `Biaya Administrasi sebesar Rp. ${formatRupiah(biayaAdminNominal)},-`,
    };
  }
}
