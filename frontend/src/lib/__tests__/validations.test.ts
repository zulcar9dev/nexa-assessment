import { clientAktifSchema, clientTypeASchema, clientPurnaSchema } from "../validations";

// Kunci "hari ini" agar tes deterministik (contoh: 19 Agustus 2026)
beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-08-19T12:00:00"));
});

afterAll(() => {
    jest.useRealTimers();
});

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
                segmentasi: "taspen" as "bumd_bumn" | "swasta" | "pemerintahan", // invalid for Aktif
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

    describe("Usia & Tenor Rules (Semua Kategori)", () => {
        // Contoh dari user: lahir 1969-03-09, hari ini 2026-08-19
        // usia presisi 57 th 5 bln 1 mgg 3 hr -> pembulatan 57 th 6 bln (690 bulan)
        // Type A taspen (batas 74 th 10 bln = 898 bulan): 898 - 690 = 208 bulan (17 th 4 bln)
        const baseTypeA = {
            ...validBaseIdentitas,
            ...validBaseSlikUsulan,
            segmentasi: "taspen" as const,
            jenis_pengajuan: "baru" as const,
            instansi: "Dinas Pendidikan",
            golongan: "III/a",
            tgl_pensiun_pemohon: "2030-01-01",
            estimasi_hak_pensiun: "5000000",
            tgl_lahir_pemohon: "1969-03-09",
        };

        it("Type A: tenor 208 bulan (17 th 4 bln) lulus untuk pemohon 1969-03-09", () => {
            const result = clientTypeASchema.safeParse({
                ...baseTypeA,
                usulan_jangka_waktu_bulan: "208",
            });
            expect(result.success).toBe(true);
        });

        it("Type A: tenor 209 bulan ditolak (melebihi batas usia lunas 74 th 10 bln)", () => {
            const result = clientTypeASchema.safeParse({
                ...baseTypeA,
                usulan_jangka_waktu_bulan: "209",
            });
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues.some(i => i.message.includes("maksimal 17 tahun 4 bulan"))).toBe(true);
            }
        });

        it("Type A ASABRI: cap tenor 180 bulan (15 tahun)", () => {
            const data = {
                ...baseTypeA,
                segmentasi: "asabri" as const,
                usulan_jangka_waktu_bulan: "180",
            };
            expect(clientTypeASchema.safeParse(data).success).toBe(true);

            const over = { ...data, usulan_jangka_waktu_bulan: "181" };
            const result = clientTypeASchema.safeParse(over);
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues.some(i => i.message.includes("maksimal 15 tahun"))).toBe(true);
            }
        });

        it("Aktif: tenor dibatasi batas usia 75 tahun (tenor 12 lulus, 13 ditolak)", () => {
            const baseAktif = {
                ...validBaseIdentitas,
                ...validBaseSlikUsulan,
                segmentasi: "bumd_bumn" as const,
                jenis_pengajuan: "baru" as const,
                instansi: "PT BUMN Jaya",
                status_kepegawaian_manual: "Karyawan Tetap",
                // lahir 1952-08-20 -> 2026-08-19: 73 th 11 bln 30 hr -> pembulatan 74 tahun
                // batas 75 th (900 bln) - 888 bln = 12 bln tersisa
                tgl_lahir_pemohon: "1952-08-20",
                usulan_jangka_waktu_bulan: "12",
            };
            expect(clientAktifSchema.safeParse(baseAktif).success).toBe(true);

            const over = { ...baseAktif, usulan_jangka_waktu_bulan: "13" };
            const result = clientAktifSchema.safeParse(over);
            expect(result.success).toBe(false);
        });

        it("Tenor minimal 12 bulan", () => {
            const data = {
                ...baseTypeA,
                usulan_jangka_waktu_bulan: "6",
            };
            const result = clientTypeASchema.safeParse(data);
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues.some(i => i.message.includes("minimal 12 bulan"))).toBe(true);
            }
        });

        it("Aktif PPPK: tenor dibatasi sisa masa kontrak", () => {
            const baseAktif = {
                ...validBaseIdentitas,
                ...validBaseSlikUsulan,
                segmentasi: "pemerintahan" as const,
                jenis_pengajuan: "baru" as const,
                instansi: "Pemkab Contoh",
                status_kepegawaian_manual: "PPPK",
                tgl_lahir_pemohon: "1990-01-01",
                // kontrak berakhir 2030-02-10 -> sisa bulan penuh dari 2026-08-19 = 41 bulan
                tgl_berakhir_pengangkatan: "2030-02-10",
                usulan_jangka_waktu_bulan: "41",
            };
            expect(clientAktifSchema.safeParse(baseAktif).success).toBe(true);

            const over = { ...baseAktif, usulan_jangka_waktu_bulan: "42" };
            const result = clientAktifSchema.safeParse(over);
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues.some(i => i.message.includes("maksimal 3 tahun 5 bulan"))).toBe(true);
            }
        });
    });
});
