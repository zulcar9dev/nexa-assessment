
import { DocumentTemplateService } from "../src/backend/services/document-template.service";

async function verifyPrapurna() {
    console.log("Testing Prapurna Logic...");

    // Mock Context Prapurna
    const mockPrapurna = {
        kategori: "Prapurna",
        status_kepegawaian: "Calon Pensiunan PNS",
        instansi: "Kemenkes",
        golongan: "IV/a",
        no_sk_kenaikan_pangkat: "SK-GOL-1",
        tgl_sk_kenaikan_pangkat: "10-10-2023",
        jabatan: "Kepala Bagian",
        alamat_kantor: "Jl. HR Rasuna Said",
        tgl_pensiun: "01-01-2030", // For Investigasi
        tgl_pensiun_pemohon: "01-01-2030", // For Call Memo
        status_rumah: "Rumah Dinas",
        gaji_bulan_3: "10.000.000",
        payroll_bank: "BNI",
        estimasi_tht: "50.000.000",
        estimasi_hak_pensiun: "4.500.000",
        masa_kerja: "25 Tahun",
        tgl_mulai_kerja: "1999"
    };

    // 1. Verify Investigasi List
    console.log("\n--- Investigasi List Prapurna ---");
    const invList = DocumentTemplateService.generateInvestigasiList(mockPrapurna as any);
    invList.forEach(i => console.log(i.text));

    if (!invList.some(i => i.text.includes("Golongan/Pangkat saat ini adalah IV/a"))) {
        throw new Error("Investigasi: Golongan logic missing");
    }
    if (!invList.some(i => i.text.includes("Batas Usia Pensiun"))) {
        throw new Error("Investigasi: Pensiun logic missing");
    }

    // 2. Verify Bendahara List
    console.log("\n--- Bendahara List ---");
    const bendList = DocumentTemplateService.generateBendaharaList(mockPrapurna as any);
    bendList.forEach(i => console.log(i.text));
    if (!bendList[0].text.includes("Calon Pensiunan PNS")) throw new Error("Bendahara: Status Kepegawaian failed");
    if (!bendList[4].text.includes("10.000.000")) throw new Error("Bendahara: Gaji failed");

    // 3. Verify Taspen List
    console.log("\n--- Taspen List ---");
    const taspenList = DocumentTemplateService.generateTaspenList(mockPrapurna as any);
    taspenList.forEach(i => console.log(i.text));
    if (!taspenList[1].text.includes("50.000.000")) throw new Error("Taspen: THT failed");

    console.log("\nALL TESTS PASSED");
}

verifyPrapurna().catch(console.error);
