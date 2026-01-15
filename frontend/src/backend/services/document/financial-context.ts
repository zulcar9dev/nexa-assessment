import { DebiturData, SlikFacility } from './types';
import { formatRupiah } from '@/lib/utils';

export class FinancialContextBuilder {
  static build(debitur: DebiturData, slikFacilities: SlikFacility[]): Record<string, unknown> {
    const data = debitur.dataLengkap;
    const kategoriLower = String(debitur.kategori || "").toLowerCase();
    const isAktif = kategoriLower.includes("aktif");
    const isPurna = kategoriLower.includes("purna") && !kategoriLower.includes("prapurna");

    // 1. Calculate Penghasilan
    let penghasilan = 0;
    let aktifPenghasilan = 0;
    let aktifGajiBulan = "";
    let aktifJumlahGaji = 0;
    
    // Logic Selection: Aktif -> Purna -> Prapurna (Default)
    if (isAktif) {
      // Untuk Aktif: hitung variance dan tentukan penghasilan
      const gaji1 = parseInt(String(data.gaji_bulan_1_jumlah || 0).replace(/[^0-9]/g, ""), 10) || 0;
      const gaji2 = parseInt(String(data.gaji_bulan_2_jumlah || 0).replace(/[^0-9]/g, ""), 10) || 0;
      const gaji3 = parseInt(String(data.gaji_bulan_3_jumlah || 0).replace(/[^0-9]/g, ""), 10) || 0;
      const gajiList = [gaji1, gaji2, gaji3].filter(g => g > 0);
      
      if (gajiList.length > 0) {
        const maxGaji = Math.max(...gajiList);
        const minGaji = Math.min(...gajiList);
        const variance = maxGaji > 0 ? ((maxGaji - minGaji) / maxGaji) * 100 : 0;
        
        // Variance ≤ 20%: gunakan rata-rata, selain itu gunakan terkecil
        aktifPenghasilan = variance <= 20 
          ? Math.round(gajiList.reduce((a, b) => a + b, 0) / gajiList.length)
          : minGaji;
        penghasilan = aktifPenghasilan;
        
        // Track bulan gaji terkecil untuk placeholder
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
      const pensiun1 = parseInt(String(data.pensiun_bulan_1_jumlah || 0).replace(/[^0-9]/g, ""), 10) || 0;
      const pensiun2 = parseInt(String(data.pensiun_bulan_2_jumlah || 0).replace(/[^0-9]/g, ""), 10) || 0;
      const pensiun3 = parseInt(String(data.pensiun_bulan_3_jumlah || 0).replace(/[^0-9]/g, ""), 10) || 0;
      penghasilan = pensiun3 || pensiun2 || pensiun1;
    } else {
      // Prapurna / Default
      const estimasiHakPensiun = parseInt(String(data.estimasi_hak_pensiun || 0).replace(/[^0-9]/g, ""), 10) || 0;
      penghasilan = estimasiHakPensiun;
    }

    const dsc90 = Math.round(penghasilan * 0.9);
    const dsc60 = Math.round(penghasilan * 0.6);

    // 2. Calculate SLIK Angsuran
    const totalAngsuranSlik = slikFacilities
      .filter((f) => !f.is_takeover && !f.is_topup_lunas)
      .reduce((sum, f) => sum + (parseInt(String(f.angsuran).replace(/[^0-9]/g, ""), 10) || 0), 0);

    const maksimalAngsuran = dsc90 - totalAngsuranSlik;
    const aktifMaksimalAngsuran = dsc60 - totalAngsuranSlik;

    // 3. Parse Usulan
    const plafon = parseInt(String(data.usulan_plafon_kredit || 0).replace(/[^0-9]/g, ""), 10);
    const tenor = parseInt(String(data.usulan_jangka_waktu_bulan || 0), 10);
    const bunga = parseFloat(String(data.usulan_bunga_persen || 0));

    // 4. Calculate Angsuran Kredit (Annuity)
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

    // 5. Calculate DSR
    const totalAngsuranBaru = totalAngsuranSlik + angsuranKredit;
    const dsr = penghasilan > 0
        ? Math.round((totalAngsuranBaru / penghasilan) * 10000) / 100
        : 0;

    // 6. Calculate Biaya
    const pctProvisi = data.biaya_provisi ? parseFloat(String(data.biaya_provisi)) : 1;
    const biayaProvisi = Math.round(plafon * (pctProvisi / 100));

    const pctTatalaksana = data.biaya_tatalaksana ? parseFloat(String(data.biaya_tatalaksana)) : 2;
    const biayaTatalaksana = Math.round(plafon * (pctTatalaksana / 100));

    const pctPsjt = parseFloat(String(data.biaya_psjt_percent || 0)) || 0;
    const biayaPsjt = Math.round(plafon * (pctPsjt / 100));

    const biayaAdminNominal = String(data.biaya_administrasi_nominal || '0');

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

      // RPC Fleksi Aktif Fields (DSC 60%)
      aktif_gaji_pemohon: formatRupiah(aktifPenghasilan),
      aktif_nomor_rekening_gaji: data.payroll_no_rek || "",
      aktif_bulan_gaji: aktifGajiBulan,
      aktif_jumlah_gaji_bulan: formatRupiah(aktifJumlahGaji),
      aktif_penghasilan_calon_debitur: formatRupiah(aktifPenghasilan),
      aktif_dsc_60: formatRupiah(dsc60),
      aktif_total_angsuran_calon_debitur: formatRupiah(totalAngsuranSlik),
      aktif_maksimal_angsuran: formatRupiah(aktifMaksimalAngsuran),
      aktif_angsuran_diusulkan: formatRupiah(angsuranKredit),
      aktif_total_angsuran_all: formatRupiah(totalAngsuranBaru),
      aktif_dsr: `${dsr}`,
      aktif_dsr_keterangan: penghasilan <= 20000000 
        ? "Penghasilan per bulan ≤ Rp. 20 Juta, maksimal DSR = 60%"
        : "Penghasilan per bulan > Rp. 20 Juta, maksimal DSR = 70%",

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
