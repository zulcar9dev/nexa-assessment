import { DebiturData, SlikFacility } from './types';
import { toTitleCase } from './formatters';

export class RequirementsContextBuilder {
  static build(debitur: DebiturData, slikFacilities: SlikFacility[]): Record<string, unknown> {
    const data = debitur.dataLengkap;
    const context: Record<string, unknown> = {}; // Helper context for return

    // --- SYARAT PENANDATANGANAN KONDISIONAL ---
    const syaratList: string[] = [];
    const jenisPengajuanLower = (debitur.jenisPengajuan || data.jenis_pengajuan || "").toString().toLowerCase();
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

    // --- CLEANUP & DEFAULT LISTS ---
    // Note: Manual overrides with placeholders are handled in the main builder 
    // because they require the FULL context to resolve placeholders {{...}}
    
    // Default lists (before overrides)
    context.list_syarat_penandatanganan = syaratList.map(item => ({ text: item }));

    return context;
  }
}
