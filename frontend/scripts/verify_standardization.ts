
import { ListGenerators } from "../src/backend/services/document/list-generators";
import { getInstansiConfig } from "../src/backend/services/document/instansi-config";

// Mock Data Generators
const createBaseContext = (overrides: Record<string, unknown> = {}) => ({
    nama_pemohon: 'John Doe',
    alamat_ktp: 'Jl. KTP No. 1',
    status_rumah: 'Milik Sendiri',
    lama_tinggal: '5 Tahun',
    usia_pemohon: '30',
    tgl_lahir: '01-01-1990',
    no_ktp: '1234567890',
    tgl_terbit_ktp: '01-01-2010',
    cfm_status_perkawinan: 'Menikah',
    status_kepegawaian_manual: 'Pegawai Tetap',
    instansi: 'PT. Test',
    alamat_kantor: 'Jl. Kantor No. 1',
    masa_kerja: '2 Tahun',
    tgl_mulai_kerja: '01-01-2020',
    no_sk_cpns: 'SK-001',
    tgl_sk_cpns: '01-01-2020',
    jabatan: 'Staff',
    plafon: '100.000.000',
    tenor: '60',
    tujuan_kredit: 'Renovasi Rumah',
    kategori: 'Aktif',
    ...overrides
});

function runTest(name: string, context: Record<string, unknown>, checks: string[]) {
    console.log(`\n--------------------------------------------`);
    console.log(`TEST: ${name}`);
    console.log(`Instansi: ${context.instansi} | Segmentasi: ${context.segmentasi}`);
    
    try {
        const result = ListGenerators.generateInvestigasiList(context);
        const text = result.map((r, i) => `${i + 1}. ${r.text}`).join('\n');
        
        console.log(`OUTPUT PREVIEW:`);
        console.log(text.substring(0, 300) + "..."); // Show partial
        
        const errors: string[] = [];
        checks.forEach(check => {
            if (!text.includes(check)) {
                errors.push(`MISSING: "${check}"`);
            }
        });
        
        if (errors.length > 0) {
            console.error(`FAILED!`);
            errors.forEach(e => console.error(e));
            // throw new Error(`Test failed for ${name}`); // Don't throw to allow all tests to run
        } else {
            console.log(`PASSED!`);
        }
    } catch (e) {
        console.error(`CRITICAL ERROR in ${name}:`, e);
    }
}

console.log("Starting Verification for Standardization...");

// 1. Mitra Karya Prima (MKP)
runTest("MKP (BUMN)", createBaseContext({
    instansi: 'PT. Mitra Karya Prima',
    segmentasi: 'BUMN_BUMD',
    penempatan_unit: 'Unit Surabaya',
    tgl_sk_kenaikan_pangkat: '01-01-2021',
    useBatasUsiaPensiun: true
}), [
    'Alamat Kantor Pusat MKP di JBC Blok A', // Check config usage
    'Daftar Kelolaan SLN', // Check config usage (hardcoded text)
    'Batas Usia Pensiun', // Check new requirement for BUMN
    // 'Golongan' should NOT be present
]);

// 2. Kejaksaan Negeri
runTest("Kejaksaan Negeri (Pemerintahan)", createBaseContext({
    instansi: 'Kejaksaan Negeri Jakarta',
    segmentasi: 'PEMERINTAHAN',
    golongan: 'III/a',
    no_sk_kenaikan_pangkat: 'SK-P-001',
    tgl_sk_kenaikan_pangkat: '01-01-2021',
}), [
    'Kejaksaan Negeri',
    'Daftar Kelolaan HLB',
    'III/a', // Should show Golongan
    'Status/ Pangkat Golongan', // Check wording standard
]);

// 3. Universitas Negeri Gorontalo
runTest("UNG (Pemerintahan)", createBaseContext({
    instansi: 'Universitas Negeri Gorontalo',
    segmentasi: 'PEMERINTAHAN',
    golongan: 'IV/a',
    tgl_pensiun: '01-01-2050',
}), [
    'Universitas Negeri Gorontalo',
    'Kementrian Riset Tekhnologi dan Pendidikan Tinggi', // Config text
    'IV/a',
    'Batas Usia Pensiun' // Should be present for PNS
]);

// 4. PLN UP3 Gorontalo
runTest("PLN UP3 (BUMN)", createBaseContext({
    instansi: 'PT. PLN (Persero) UP3 Gorontalo',
    segmentasi: 'BUMN_BUMD',
    jabatan: 'Manager',
    no_sk_mutasi: 'SK-MUTASI-001',
    tgl_sk_mutasi: '01-01-2024',
    tgl_pensiun: '01-01-2030'
}), [
    'PT. PLN (Persero) UP3 Gorontalo',
    'Daftar Kelolaan SLN',
    'SK Mutasi Jabatan SK-MUTASI-001', // Check SK Mutasi usage
    'Pemohon Pensiun sampai dengan usia 56 tahun' // Configured infoPensiun text
]);

// 5. Standard BUMN
runTest("Standard BUMN", createBaseContext({
    instansi: 'PT. Telkom',
    segmentasi: 'BUMN_BUMD',
    golongan: 'Grade 10', // Should be ignored
    tgl_pensiun: '01-01-2040'
}), [
    'PT. Telkom',
    'Pemohon adalah Pegawai Tetap pada PT. Telkom', // Standard format
    'Batas Usia Pensiun' // Must be present
]);

// 6. Standard Pemerintahan
runTest("Standard Pemerintahan", createBaseContext({
    instansi: 'Dinas Kesehatan',
    segmentasi: 'PEMERINTAHAN',
    golongan: 'III/d',
}), [
    'Dinas Kesehatan',
    'Pemohon adalah Pegawai Tetap di Dinas Kesehatan', // Standard format (di vs pada)
    'Lama Masa Kerja Pemohon', // Specific point for pemerintahan
    'III/d'
]);

// 7. Paguntaka (Prefix case)
runTest("Paguntaka (BUMN)", createBaseContext({
    instansi: 'PT. Paguntaka Cahaya Nusantara',
    segmentasi: 'BUMN_BUMD',
    alamat_kantor: 'Jl. Paguntaka No 1'
}), [
    'adalah anak Perusahaan dari PT. PLN Nusa Daya',
    'Alamat PT. Paguntaka Cahaya Nusantara di Jl. Paguntaka No 1' // Prefix check
]);

// 8. BPK Gorontalo (New Implementation)
runTest("BPK Gorontalo", createBaseContext({
    instansi: 'BPK Perwakilan Provinsi Gorontalo',
    segmentasi: 'PEMERINTAHAN',
    golongan: 'IV/a',
    tgl_pensiun: '01-01-2045'
}), [
    'BPK Perwakilan Provinsi Gorontalo',
    'No. PDM/9.2/1682 dan CLN/1/1626 Tanggal 2 Maret 2018 BPK', // Specific text check
    'IV/a',
    'Batas Usia Pensiun'
]);

console.log("\nVerification Complete.");
