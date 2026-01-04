
import { DocumentTemplateService } from "../src/backend/services/document-template.service";

async function verifyInvestigasi() {
    console.log("Testing generateInvestigasiList...");

    // Mock Context
    const mockContext = {
        alamat_ktp: "Jl. Merdeka No. 1",
        domisili_berbeda: true,
        alamat_domisili: "Jl. Sudirman No. 10",
        status_rumah: "Milik Sendiri",
        lama_tinggal: "10 Tahun",
        usia_pemohon: 55,
        tgl_lahir: "01 Januari 1970",
        no_ktp: "1234567890",
        tgl_terbit_ktp: "10 Januari 2020",
        cfm_status_perkawinan: "Status pemohon Menikah.",
        pensiunan: "PNS",
        instansi: "Kementerian Keuangan",
        no_sk_pensiun: "SK-123",
        tgl_sk_pensiun: "01 Februari 2025",
        jenis_pengajuan: "Baru",
        plafon: "100.000.000",
        tenor: "60",
        tujuan_kredit: "Renovasi Rumah"
    };

    const list = DocumentTemplateService.generateInvestigasiList(mockContext as any);
    console.log(JSON.stringify(list, null, 2));

    // Checks
    if (list.length !== 8) throw new Error(`Expected 8 items, got ${list.length}`);
    if (!list[1].text.includes("Jl. Sudirman")) throw new Error("Domisili logic failed");

    console.log("Investigasi List Logic OK!");

    // Test without domisili berbeda
    mockContext.domisili_berbeda = false;
    const list2 = DocumentTemplateService.generateInvestigasiList(mockContext as any);
    if (list2.length !== 7) throw new Error("Conditional logic for domisili failed");
    console.log("Conditional Domisili Logic OK!");
}

verifyInvestigasi().catch(console.error);
