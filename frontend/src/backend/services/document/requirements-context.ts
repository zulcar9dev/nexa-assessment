import { ClientData, SlikFacility } from './types';
import { toTitleCase } from './formatters';

export class RequirementsContextBuilder {
  static build(
    client: ClientData,
    slikFacilities: SlikFacility[],
    incomeTypeLabel: string = "Gaji",
  ): Record<string, unknown> {
    const data = client.dataLengkap;
    const context: Record<string, unknown> = {}; // Helper context for return

    // --- SYARAT PENANDATANGANAN KONDISIONAL ---
    const syaratList: string[] = [];
    const jenisPengajuanLower = (client.jenisPengajuan || data.jenis_pengajuan || "").toString().toLowerCase();
    const applicantNameTitle = toTitleCase(client.applicantName || data.nama_pemohon as string || "");

    const kategoriLower = (client.kategori || "").toLowerCase();
    const isAktif = kategoriLower.includes("aktif");
    const isP3K = isAktif && /pppk|p3k|p3-k|p3\s*k|perjanjian\s*kerja/i.test(String(data.status_kepegawaian_manual || ""));

    const pensiunSuffix = isAktif ? "" : " Pensiun";
    const labelReq =
      incomeTypeLabel === "Tunjangan"
        ? "Tunjangan"
        : incomeTypeLabel === "Uang Makan"
        ? "Uang Makan"
        : incomeTypeLabel === "Penghasilan" || incomeTypeLabel === "Gabungan"
        ? "Penghasilan"
        : "Gaji";

    const isBaru = jenisPengajuanLower === "baru" || jenisPengajuanLower.includes("baru");
    const isTopUpOrSisaGaji = jenisPengajuanLower.includes("top_up") || jenisPengajuanLower === "top up" || jenisPengajuanLower === "top_up_sisa_gaji" || jenisPengajuanLower === "top up sisa gaji";
    const isTakeOver = jenisPengajuanLower === "takeover" || jenisPengajuanLower.includes("takeover");

    if (isBaru) {
      if (isP3K) {
        syaratList.push("Menyerahkan Asli Surat Keputusan (SK) Pengangkatan PPPK atas nama Pemohon sebagai Jaminan Assessment.");
      } else if (isAktif) {
        syaratList.push("Menyerahkan Asli Surat Keputusan (SK) Pengangkatan Pertama dan Terakhir atas nama Pemohon sebagai Jaminan Assessment.");
      } else {
        syaratList.push("Menyerahkan Asli SK Pensiun atas nama Pemohon sebagai Jaminan Assessment.");
      }
    } else if (isTopUpOrSisaGaji) {
      if (isAktif) {
        syaratList.push("Menyerahkan Asli Surat Keputusan (SK) Pengangkatan Terakhir atas nama Pemohon sebagai Jaminan Assessment.");
      } else {
        syaratList.push("Menyerahkan Asli SK Pensiun Terakhir atas nama Pemohon (Apabila terdapat perubahan SK Pensiun).");
      }
    }

    if (isBaru || isTopUpOrSisaGaji) {
      if (isTakeOver) {
        syaratList.push(`Surat pernyataan pengambilalihan kredit dari bank/instansi lain yang ditandatangani oleh ${applicantNameTitle} di atas materai Rp. 10.000,-.`);
      }

      if (isBaru || isTakeOver) {
        if (isAktif && !isP3K) {
          syaratList.push("Surat Kuasa Memotong Gaji/Kuasai Rekening yang ditandatangani di atas materai Rp 10.000,- diketahui oleh Pejabat Berwenang.");
          syaratList.push("Surat Pernyataan Pemohon bersedia menyalurkan gajinya melalui Nexa dan tidak memindahkan payroll gajinya ke Bank lain sampai dengan fasilitas kredit lunas, ditandatangani di atas materai Rp. 10.000,-.");
          syaratList.push("Surat Pernyataan & Kuasa dari Pemohon kepada Pejabat Berwenang untuk memotong gaji dan atau hak-hak lainnya apabila kelak Pemohon pensiun/pensiun dini/mengundurkan diri/PHK sebelum fasilitas kredit lunas untuk dibayarkan ke Nexa, ditandatangani di atas materai Rp.10.000,- dan diketahui Pejabat Berwenang.");
        } else if (isP3K) {
          syaratList.push("Surat Kuasa Memotong Gaji/Kuasai Rekening yang ditandatangani di atas materai Rp 10.000,- diketahui oleh Pejabat Berwenang.");
          syaratList.push("Surat Pernyataan Pemohon bersedia menyalurkan gajinya melalui Nexa dan tidak memindahkan payroll gajinya ke Bank lain sampai dengan fasilitas kredit lunas, ditandatangani di atas materai Rp. 10.000,-.");
          syaratList.push("Surat Pernyataan & Kuasa dari Pemohon kepada Pejabat Berwenang untuk memotong gaji dan atau hak-hak lainnya apabila kelak Pemohon tidak diperpanjang kontrak kerja/mengundurkan diri/PHK sebelum fasilitas kredit lunas untuk dibayarkan ke Nexa, ditandatangani di atas materai Rp.10.000,- dan diketahui Pejabat Berwenang.");
        } else {
          syaratList.push("Surat Kuasa Memotong Gaji Pensiun/Kuasai Rekening yang ditandatangani di atas materai Rp. 10.000,- diketahui oleh Pejabat Berwenang.");
          syaratList.push("Surat Pernyataan Pemohon bersedia menyalurkan gaji pensiunnya melalui Nexa dan tidak memindahkan payroll gaji pensiunnya ke Bank lain sampai dengan fasilitas kredit lunas, ditandatangani di atas materai Rp. 10.000,-.");
        }
      }

      const primarySlik = slikFacilities.find(f => f.nomor_rekening_pinjaman) || slikFacilities[0] || {};
      const noRek = primarySlik.nomor_rekening_pinjaman || "................";
      const noPk = primarySlik.nomor_pk || "................";

      if (jenisPengajuanLower.includes("top_up") || jenisPengajuanLower === "top up") {
        syaratList.push(`Fasilitas kredit ini saling mengkait dengan fasilitas kredit sebelumnya nomor rekening pinjaman ${noRek} atas nama ${applicantNameTitle}, No. PK ${noPk}`);
      } else if (jenisPengajuanLower.includes("sisa_gaji") || jenisPengajuanLower.includes("sisa gaji")) {
        syaratList.push(`Fasilitas kredit ini saling mengkait dengan fasilitas kredit sebelumnya nomor rekening pinjaman (................) atas nama ${applicantNameTitle}, No. PK (................)`);
      }
    } else if (isTakeOver) {
      syaratList.push("Fasilitas Takeover (Syarat penandatanganan menyesuaikan)");
    }

    const syaratPenandatanganan = syaratList.join("\n");
    context.syarat_penandatanganan = syaratPenandatanganan;
    context.Syarat_Penandatanganan = syaratPenandatanganan;

    // --- SYARAT PENCAIRAN KREDIT ---
    const namaBankPayroll = (data.nama_bank_pembayaran || "").toString().toLowerCase();
    const isPayrollBni = namaBankPayroll.includes("bni");
    let syaratPencairanText = "";

    if ((isBaru || isTopUpOrSisaGaji) && isPayrollBni) {
      syaratPencairanText = `Rekening Payroll ${labelReq}${pensiunSuffix} akan dijadikan sebagai Rekening Afiliasi Kredit dan diblokir sebesar 2 (dua) kali angsuran (Pokok+ Bunga serta ditambah saldo minimum, dapat dibuka blokir saat kredit lunas). Dana ini dapat dipotong dari Pencairan Kredit.`;
    } else if (isBaru && !isPayrollBni) {
      syaratPencairanText = `Rekening Taplus atas nama Pemohon yang menjadi Rekening Payroll ${labelReq}${pensiunSuffix} akan dijadikan sebagai Rekening Afiliasi Kredit dan diblokir sebesar 4 (empat) kali angsuran, 2 (dua) kali angsuran Pindah ${labelReq} (dapat dibuka setelah ${labelReq}${pensiunSuffix} telah tercermin di Rekening Afiliasi Assessment) dan 2 (dua) kali angsuran (Pokok+ Bunga serta ditambah saldo minimum, dapat dibuka blokir saat kredit lunas). Dana ini dapat dipotong dari Pencairan Kredit.`;
    }

    context.syarat_pencairan_kredit = syaratPencairanText;
    context.Syarat_Pencairan_Kredit = syaratPencairanText;
    context.Syarat_Pencairan = syaratPencairanText;

    // --- CLEANUP & DEFAULT LISTS ---
    // Note: Manual overrides with placeholders are handled in the main builder 
    // because they require the FULL context to resolve placeholders {{...}}
    
    // Default lists (before overrides)
    context.list_syarat_penandatanganan = syaratList.map(item => ({ text: item }));

    if (syaratPencairanText.trim()) {
      context.list_syarat_pencairan = [{ text: syaratPencairanText }];
      context.list_syarat_pencairan_kredit = context.list_syarat_pencairan;
    } else {
      context.list_syarat_pencairan = [];
      context.list_syarat_pencairan_kredit = [];
    }

    return context;
  }
}

