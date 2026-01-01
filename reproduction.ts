
import { DocumentTemplateService } from "./frontend/src/backend/services/document-template.service";

const mockSlikFacilities = [
    {
        nama_bank: "Bank Test",
        jenis_kredit: "Konsumtif",
        plafon_maks: "10000000",
        outstanding: "5000000",
        angsuran: "500000",
        kolektibilitas: "1",
        alasan: "Test Alasan",
        nomor_rekening_pinjaman: "1234567890",
        nomor_pk: "PK001"
    }
];

// Mock method context
const result = DocumentTemplateService.mapSlikToIndexedFields(mockSlikFacilities as any);

console.log("Mapped Result:", JSON.stringify(result, null, 2));

if (result['slik_bank_1_norek_existing'] === "1234567890") {
    console.log("SUCCESS: slik_bank_1_norek_existing is correctly mapped.");
} else {
    console.error("FAILURE: slik_bank_1_norek_existing is MISSING or INCORRECT.");
    console.error("Actual value:", result['slik_bank_1_norek_existing']);
}

if (result['slik_bank_1_nopk_existing'] === "PK001") {
    console.log("SUCCESS: slik_bank_1_nopk_existing is correctly mapped.");
} else {
    console.error("FAILURE: slik_bank_1_nopk_existing is MISSING or INCORRECT.");
}
