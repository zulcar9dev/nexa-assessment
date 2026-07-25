import { clientAktifSchema, clientTypeASchema, clientPurnaSchema } from "../validations";

const validBaseIdentitas = {
    nama_pemohon: "Client Tes",
    no_ktp_pemohon: "1234567890123456",
    tgl_lahir_pemohon: "1990-01-01",
    alamat_ktp: "Jl. Sudirman No. 1",
    no_telepon: "081234567890",
};

const validBaseSlikUsulan = {
    fasilitas_nihil: "ya" as const,
    usulan_plafon_kredit: "100000000",
    usulan_jangka_waktu_bulan: "60",
    usulan_bunga_persen: "10.5",
    biaya_administrasi_is_bebas: true,
};

describe("validations.ts - Nexa Fleksi validation schemas", () => {
    describe("clientAktifSchema", () => {
        it("should fail if status_kepegawaian_manual is missing", () => {
            const data = {
                ...validBaseIdentitas,
                ...validBaseSlikUsulan,
                segmentasi: "bumd_bumn" as const,
                jenis_pengajuan: "baru" as const,
                instansi: "PT BUMN Jaya",
                // status_kepegawaian_manual missing
            };

            const result = clientAktifSchema.safeParse(data);
            expect(result.success).toBe(false);
            if (!result.success) {
                const issues = result.error.issues;
                expect(issues.some(i => i.path.includes("status_kepegawaian_manual"))).toBe(true);
            }
        });

        it("should pass even if estimasi_hak_pensiun is missing", () => {
            const data = {
                ...validBaseIdentitas,
                ...validBaseSlikUsulan,
                segmentasi: "bumd_bumn" as const,
                jenis_pengajuan: "baru" as const,
                instansi: "PT BUMN Jaya",
                status_kepegawaian_manual: "Karyawan Tetap",
                // estimasi_hak_pensiun is omitted/optional
            };

            const result = clientAktifSchema.safeParse(data);
            expect(result.success).toBe(true);
        });

        it("should fail if segmentasi is 'taspen'", () => {
            const data = {
                ...validBaseIdentitas,
                ...validBaseSlikUsulan,
                segmentasi: "taspen" as any, // invalid for Aktif
                jenis_pengajuan: "baru" as const,
                instansi: "PT BUMN Jaya",
                status_kepegawaian_manual: "Karyawan Tetap",
            };

            const result = clientAktifSchema.safeParse(data);
            expect(result.success).toBe(false);
        });
    });

    describe("clientTypeASchema", () => {
        it("should fail if estimasi_hak_pensiun is missing", () => {
            const data = {
                ...validBaseIdentitas,
                ...validBaseSlikUsulan,
                segmentasi: "taspen" as const,
                jenis_pengajuan: "baru" as const,
                instansi: "Dinas Pendidikan",
                golongan: "III/a",
                tgl_pensiun_pemohon: "2030-01-01",
                // estimasi_hak_pensiun missing
            };

            const result = clientTypeASchema.safeParse(data);
            expect(result.success).toBe(false);
            if (!result.success) {
                const issues = result.error.issues;
                expect(issues.some(i => i.path.includes("estimasi_hak_pensiun"))).toBe(true);
            }
        });

        it("should pass if jenis_pengajuan is 'tht'", () => {
            const data = {
                ...validBaseIdentitas,
                ...validBaseSlikUsulan,
                segmentasi: "taspen" as const,
                jenis_pengajuan: "tht" as const, // THT now valid
                instansi: "Dinas Pendidikan",
                golongan: "III/a",
                tgl_pensiun_pemohon: "2030-01-01",
                estimasi_hak_pensiun: "5000000",
            };

            const result = clientTypeASchema.safeParse(data);
            expect(result.success).toBe(true);
        });
    });

    describe("clientPurnaSchema - Pensiunan Janda & Duda", () => {
        const validBasePurna = {
            ...validBaseIdentitas,
            ...validBaseSlikUsulan,
            segmentasi: "taspen" as const,
            no_sk_pensiun: "SK-12345",
            tgl_sk_pensiun: "2024-01-01",
            tgl_pensiun_tmt: "2024-02-01",
            pensiun_bulan_jumlah: "5000000",
            // Kerabat fields (needed for Janda/Duda)
            nama_kerabat: "Kerabat Tes",
            hubungan_kerabat: "anak_kandung",
            no_telepon_kerabat: "81234567890",
            // Deceased partner
            nama_almarhum_pasangan: "Alm. Pasangan",
        };

        it("should pass for valid Pensiunan Janda (age 56, tenor 10 years)", () => {
            const data = {
                ...validBasePurna,
                tgl_lahir_pemohon: "1970-01-01", // age 56 in 2026
                jenis_pengajuan: "pensiunan_janda_baru" as const,
                usulan_jangka_waktu_bulan: "120", // 10 years (56 + 10 = 66, < 75)
            };
            const result = clientPurnaSchema.safeParse(data);
            expect(result.success).toBe(true);
        });

        it("should fail for Janda under 50 years old", () => {
            const data = {
                ...validBasePurna,
                tgl_lahir_pemohon: "1980-01-01", // age 46 in 2026
                jenis_pengajuan: "pensiunan_janda_baru" as const,
                usulan_jangka_waktu_bulan: "120",
            };
            const result = clientPurnaSchema.safeParse(data);
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues.some(i => i.message.includes("minimal 50 tahun"))).toBe(true);
            }
        });

        it("should fail for Janda with tenor > 10 years", () => {
            const data = {
                ...validBasePurna,
                tgl_lahir_pemohon: "1970-01-01", // age 56
                jenis_pengajuan: "pensiunan_janda_baru" as const,
                usulan_jangka_waktu_bulan: "132", // 11 years
            };
            const result = clientPurnaSchema.safeParse(data);
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues.some(i => i.message.includes("maksimal 10 tahun"))).toBe(true);
            }
        });

        it("should fail for Duda with tenor > 5 years", () => {
            const data = {
                ...validBasePurna,
                tgl_lahir_pemohon: "1975-01-01", // age 51 in 2026
                jenis_pengajuan: "pensiunan_duda_baru" as const,
                usulan_jangka_waktu_bulan: "72", // 6 years
            };
            const result = clientPurnaSchema.safeParse(data);
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues.some(i => i.message.includes("maksimal 5 tahun"))).toBe(true);
            }
        });

        it("should fail for Janda if kerabat fields are missing", () => {
            const data = {
                ...validBasePurna,
                tgl_lahir_pemohon: "1970-01-01",
                jenis_pengajuan: "pensiunan_janda_baru" as const,
                usulan_jangka_waktu_bulan: "120",
                nama_kerabat: "", // missing
            };
            const result = clientPurnaSchema.safeParse(data);
            expect(result.success).toBe(false);
        });
    });
});
