
import { DocumentTemplateService } from "../src/backend/services/document-template.service";
import { ConfigService } from "../src/backend/services/config.service";

async function debugMitigasi() {
    console.log("Debugging Mitigasi Risiko Logic...");

    // Mock settings
    const originalGetSettings = ConfigService.getSettings;
    ConfigService.getSettings = async () => ({
        slikMitigasiRiskText: "MITIGASI: Debitur kooperatif melunasi kewajiban.",
        catatanProgramPricing: "Promo Bunga Spesial",
        // Add other required properties if any, or cast as any
    } as any);

    // Mock Data with Risky Collection
    const mockSlik = [
        {
            nama_bank: "Bank ABC",
            kolektibilitas: "2", // RISKY
            plafon_maks: "100",
            outstanding: "100",
            angsuran: "10",
        },
        {
            nama_bank: "Bank XYZ",
            kolektibilitas: "1", // LANCAR
            plafon_maks: "100",
            outstanding: "100",
            angsuran: "10",
        }
    ];

    const mockDebitur = {
        namaPemohon: "Test User",
        kategori: "purna",
        dataLengkap: {
            slik_facilities: mockSlik
        }
    };

    try {
        const context = await DocumentTemplateService.prepareTemplateContext(mockDebitur as any);
        console.log("Context Result:");
        console.log("slik_mitigasi_risiko:", context.slik_mitigasi_risiko);
        console.log("Slik_Mitigasi_Risiko:", context.Slik_Mitigasi_Risiko);

        if (context.slik_mitigasi_risiko === "MITIGASI: Debitur kooperatif melunasi kewajiban.") {
            console.log("SUCCESS: Logic detected risky kol 2.");
        } else {
            console.error("FAILURE: Logic did NOT detect risky kol 2.");
        }

    } catch (error) {
        console.error("Error during context prep:", error);
    }
}

debugMitigasi();
