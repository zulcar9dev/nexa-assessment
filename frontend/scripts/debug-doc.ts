
import { DocumentTemplateService } from '../src/backend/services/document-template.service';
import path from 'path';
import { promises as fs } from 'fs';

// Mock TemplateService to avoid importing DB dependencies
const TemplateService = {
    async fileExists(kategori: string): Promise<boolean> {
        const filename = kategori === 'PURNA' ? 'template_purna.docx' : 'template_prapurna.docx';
        const templatePath = path.join(process.cwd(), 'templates', filename);
        console.log(`Checking file at: ${templatePath}`);
        try {
            await fs.access(templatePath);
            return true;
        } catch (e) {
            console.log(`Template check failed for ${templatePath}`);
            return false;
        }
    }
};

// Mock Data matching the user's case (Purna/Pensiunan)
const mockDebitur = {
    namaPemohon: "Rukmin Jusuf",
    noKtp: "7503066501650002",
    kategori: "PURNA",
    jenisPengajuan: "BARU",
    segmentasi: "TASPEN",
    dataLengkap: {
        nama_pemohon: "Rukmin Jusuf",
        no_ktp_pemohon: "7503066501650002",
        status_perkawinan: "menikah",
        tgl_lahir_pemohon: "1965-01-25",
        alamat_ktp: "Jl. Sudirman No. 123",
        no_telepon: "085241788994",

        // Kerabat (The missing fields)
        nama_kerabat: "Fiky Paputungan",
        hubungan_kerabat: "Anak Kandung",
        no_telepon_kerabat: "085390264917",

        // Pensiun
        segmentasi: "taspen",
        jenis_pengajuan: "baru",
        pensiun_bulan_1_jumlah: "4733300",
        pensiun_bulan_2_jumlah: "4733300",
        pensiun_bulan_3_jumlah: "4733300",
        pensiun_bulan_jumlah: "4733300",

        // Usulan
        usulan_plafon_kredit: "367000000",
        usulan_jangka_waktu_bulan: "175",
        usulan_bunga_persen: "11",
    }
};

async function runDebug() {
    console.log("=== START DEBUGGING DOCUMENT GENERATION ===");

    try {
        const kategori = mockDebitur.kategori as any;

        // 1. Check Template Existence
        console.log(`Checking template for ${kategori}...`);
        const exists = await TemplateService.fileExists(kategori);
        console.log(`Template exists: ${exists}`);

        if (!exists) {
            console.error("TEMPLATE NOT FOUND! Proceeding to check context generation only...");
            // return; // Don't abort, we want to see the context mapping
        }

        // 2. Generate Context
        console.log("Preparing context...");
        const context = DocumentTemplateService.prepareTemplateContext({
            namaPemohon: mockDebitur.namaPemohon,
            noKtp: mockDebitur.noKtp,
            kategori: mockDebitur.kategori,
            jenisPengajuan: mockDebitur.jenisPengajuan,
            segmentasi: mockDebitur.segmentasi,
            dataLengkap: mockDebitur.dataLengkap
        } as any);

        console.log("--- CONTEXT DUMP ---");
        console.log("Nama_Pemohon:", context.Nama_Pemohon);
        console.log("nama_pemohon:", context.nama_pemohon);
        console.log("nama_kerabat:", context.nama_kerabat);
        console.log("Tgl_Call_Memo:", context.Tgl_Call_Memo);
        console.log("Alamat_Ktp:", context.Alamat_Ktp);
        console.log("No_Telepon:", context.No_Telepon);
        console.log("tgl_call_memo value:", context.tgl_call_memo);
        console.log("--------------------");

        // 3. Generate Document
        console.log("Generating document...");
        const buffer = await DocumentTemplateService.generateFromTemplate(kategori, {
            ...mockDebitur,
            dataLengkap: mockDebitur.dataLengkap
        } as any);

        console.log(`Document generated successfully! Size: ${buffer.length} bytes`);

    } catch (error) {
        console.error("ERROR:", error);
    }

    console.log("=== END DEBUGGING ===");
}

runDebug();
