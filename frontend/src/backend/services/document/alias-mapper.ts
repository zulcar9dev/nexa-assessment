import { formatRupiah, terbilang } from '@/lib/utils';
import { getMasaKerjaText } from './formatters';
import { DebiturData } from './types';

export class AliasMapper {
  static map(context: Record<string, any>, debitur: DebiturData): Record<string, unknown> {
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
      Nama_SDM: context.nama_sdm,
      Nama_Kepegawaian: context.nama_sdm,
      No_Hp_SDM: context.no_hp_sdm,
      No_Hp_Kepegawaian: context.no_hp_sdm,
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
      // Purna Dynamic Month
      Purna_Bulan_Penghasilan_Nama: context.purna_bulan_penghasilan_nama,
      Purna_Bulan_Penghasilan: context.purna_bulan_penghasilan,

      // SLIK
      Slik_Nihil: context.slik_nihil,
      Slik_Ada_Fasilitas: context.slik_ada_fasilitas,
      Slik_Jumlah_Fasilitas: context.slik_jumlah_fasilitas,
      Fasilitas_Nihil: context.fasilitas_nihil,
      Fasilitas_Nihil_Text: context.fasilitas_nihil_text,
      Tgl_Slik: context.tgl_slik,
      Slik_Mitigasi_Risiko: context.slik_mitigasi_risiko,

      // RPC
      Rpc_Penghasilan: context.rpc_penghasilan,
      Rpc_Dsc_90: context.rpc_dsc_90,
      Rpc_Total_Angsuran_Eksisting: context.rpc_total_angsuran_eksisting,
      Rpc_Maksimal_Angsuran: context.rpc_maksimal_angsuran,
      Rpc_Angsuran_Diusulkan: context.rpc_angsuran_diusulkan,
      Rpc_Total_Angsuran_Baru: context.rpc_total_angsuran_baru,
      Rpc_Dsr: context.rpc_dsr,

      // RPC Fleksi Aktif (DSC 60%)
      Aktif_Gaji_Pemohon: context.aktif_gaji_pemohon,
      Aktif_Nomor_Rekening_Gaji: context.aktif_nomor_rekening_gaji,
      Aktif_Bulan_Gaji: context.aktif_bulan_gaji,
      Aktif_Jumlah_Gaji_Bulan: context.aktif_jumlah_gaji_bulan,
      Aktif_Penghasilan_Calon_Debitur: context.aktif_penghasilan_calon_debitur,
      Aktif_Dsc: context.aktif_dsc,
      Aktif_Dsc_60: context.aktif_dsc_60,
      Aktif_Dsc_Percent: context.aktif_dsc_percent,
      Aktif_Total_Angsuran_Calon_Debitur: context.aktif_total_angsuran_calon_debitur,
      Aktif_Maksimal_Angsuran: context.aktif_maksimal_angsuran,
      Aktif_Angsuran_Diusulkan: context.aktif_angsuran_diusulkan,
      Aktif_Total_Angsuran_All: context.aktif_total_angsuran_all,
      Aktif_Dsr: context.aktif_dsr,
      Aktif_Dsr_Keterangan: context.aktif_dsr_keterangan,

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
      
      // Syarat
      Syarat_Penandatanganan: context.syarat_penandatanganan,
      Syarat_Pencairan_Kredit: context.syarat_pencairan_kredit,
      Syarat_Pencairan: context.syarat_pencairan_kredit,
    };

    return aliases;
  }
}
