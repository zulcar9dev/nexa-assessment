import {
  computeBlokiran,
  normalizeBlokiran,
  isPindahGajiApplicable,
  calculateBlokiranPrapurna,
  BLOKIRAN_MAX_MONTHS,
} from "../blokiran";

// Hari ini dianggap: 19 Agustus 2026 (jam terkunci)
beforeAll(() => {
  jest.useFakeTimers();
  jest.setSystemTime(new Date("2026-08-19T12:00:00"));
});

afterAll(() => {
  jest.useRealTimers();
});

describe("blokiran.ts - Perhitungan Blokiran", () => {
  describe("isPindahGajiApplicable", () => {
    it("TypeA: selalu berlaku", () => {
      expect(isPindahGajiApplicable("type_a", "baru")).toBe(true);
      expect(isPindahGajiApplicable("type_a", "top_up")).toBe(true);
      expect(isPindahGajiApplicable("type_a", "")).toBe(true);
    });

    it("Aktif: tidak pernah berlaku", () => {
      expect(isPindahGajiApplicable("type_c", "baru")).toBe(false);
      expect(isPindahGajiApplicable("type_c", "takeover")).toBe(false);
    });

    it("Purna: berlaku hanya untuk Baru & Take Over", () => {
      expect(isPindahGajiApplicable("type_b", "baru")).toBe(true);
      expect(isPindahGajiApplicable("type_b", "takeover")).toBe(true);
      expect(isPindahGajiApplicable("type_b", "top_up")).toBe(false);
      expect(isPindahGajiApplicable("type_b", "top_up_sisa_gaji")).toBe(false);
      expect(isPindahGajiApplicable("type_b", "pensiunan_janda_baru")).toBe(true);
      expect(isPindahGajiApplicable("type_b", "pensiunan_janda_takeover")).toBe(true);
      expect(isPindahGajiApplicable("type_b", "pensiunan_janda_top_up")).toBe(false);
      expect(isPindahGajiApplicable("type_b", "pensiunan_duda_baru")).toBe(true);
      expect(isPindahGajiApplicable("type_b", "")).toBe(false);
    });
  });

  describe("calculateBlokiranPrapurna", () => {
    it("pensiun 30-08-2026, hari ini 19-08-2026 -> 1 (sisa hari dibulatkan)", () => {
      expect(calculateBlokiranPrapurna("2026-08-30")).toBe(1);
    });

    it("pensiun 2044-01-09 -> 208 bulan penuh + 21 hari -> 209", () => {
      // 19-08-2026 + 208 bln = 19-12-2043; sisa 21 hari -> dibulatkan 209
      expect(calculateBlokiranPrapurna("2044-01-09")).toBe(209);
    });

    it("pensiun 2045-01-15 -> 220 bulan penuh + sisa hari -> 221", () => {
      // 19-08-2026 -> 15-01-2045: bulan penuh 220, sisa 0 hari? (15 < 19 -> 219 + 1)
      // 19-08-2026 + 220 bln = 19-12-2044 < 15-01-2045 -> sisa hari -> 221
      expect(calculateBlokiranPrapurna("2045-01-15")).toBe(221);
    });

    it("tanggal kosong -> 0", () => {
      expect(calculateBlokiranPrapurna("")).toBe(0);
      expect(calculateBlokiranPrapurna(undefined)).toBe(0);
    });

    it("pensiun sudah lewat -> 0", () => {
      expect(calculateBlokiranPrapurna("2026-01-01")).toBe(0);
    });
  });

  describe("computeBlokiran", () => {
    it("TypeA: prapurna + pindah gaji + wajib", () => {
      const result = computeBlokiran(
        {
          tgl_pensiun_pemohon: "2030-01-01",
          jenis_pengajuan: "baru",
          blokiran_pindah_gaji_jml: 3,
          blokiran_wajib_jml: 2,
        },
        "type_a",
      );
      // 19-08-2026 -> 01-01-2030: 40 bulan penuh + sisa hari -> 41
      expect(result.blokiran_prapurna_jml).toBe(41);
      expect(result.total_blokiran_jml).toBe(41 + 3 + 2);
    });

    it("TypeA: pindah gaji tidak berlaku tetap dihitung (selalu)", () => {
      const result = computeBlokiran(
        {
          tgl_pensiun_pemohon: "2030-01-01",
          jenis_pengajuan: "top_up",
          blokiran_pindah_gaji_jml: 5,
          blokiran_wajib_jml: 0,
        },
        "type_a",
      );
      expect(result.total_blokiran_jml).toBe(41 + 5);
    });

    it("Purna baru: total = pindah gaji + wajib (tanpa prapurna)", () => {
      const result = computeBlokiran(
        {
          jenis_pengajuan: "baru",
          blokiran_pindah_gaji_jml: 4,
          blokiran_wajib_jml: 2,
        },
        "type_b",
      );
      expect(result.blokiran_prapurna_jml).toBe(0);
      expect(result.total_blokiran_jml).toBe(6);
    });

    it("Purna top_up: total = wajib saja", () => {
      const result = computeBlokiran(
        {
          jenis_pengajuan: "top_up",
          blokiran_pindah_gaji_jml: 4,
          blokiran_wajib_jml: 2,
        },
        "type_b",
      );
      expect(result.total_blokiran_jml).toBe(2);
    });

    it("Aktif: total = wajib saja", () => {
      const result = computeBlokiran(
        {
          jenis_pengajuan: "baru",
          blokiran_pindah_gaji_jml: 4,
          blokiran_wajib_jml: 3,
        },
        "type_c",
      );
      expect(result.blokiran_prapurna_jml).toBe(0);
      expect(result.total_blokiran_jml).toBe(3);
    });

    it("nilai negatif/NaN dibersihkan menjadi 0", () => {
      const result = computeBlokiran(
        {
          tgl_pensiun_pemohon: "2030-01-01",
          blokiran_pindah_gaji_jml: -5,
          blokiran_wajib_jml: Number.NaN,
        },
        "type_a",
      );
      expect(result.total_blokiran_jml).toBe(41);
    });
  });

  describe("normalizeBlokiran", () => {
    it("migrasi blokiran_type_a_jml legacy -> blokiran_prapurna_jml & hapus field lama", () => {
      const result = normalizeBlokiran(
        {
          tgl_pensiun_pemohon: "2030-01-01",
          blokiran_type_a_jml: 12,
          blokiran_wajib_jml: 1,
        },
        "type_a",
      );
      expect(result.blokiran_prapurna_jml).toBe(41);
      expect(result.blokiran_type_a_jml).toBeUndefined();
      expect(result.total_blokiran_jml).toBe(42);
    });

    it("nilai manual disanitasi", () => {
      const result = normalizeBlokiran(
        {
          tgl_pensiun_pemohon: "2030-01-01",
          blokiran_pindah_gaji_jml: -3,
          blokiran_wajib_jml: 2.7,
        },
        "type_a",
      );
      expect(result.blokiran_pindah_gaji_jml).toBe(0);
      expect(result.blokiran_wajib_jml).toBe(2);
    });

    it("Purna: prapurna di-set 0", () => {
      const result = normalizeBlokiran(
        {
          jenis_pengajuan: "baru",
          blokiran_prapurna_jml: 10,
          blokiran_pindah_gaji_jml: 2,
        },
        "type_b",
      );
      expect(result.blokiran_prapurna_jml).toBe(0);
      expect(result.total_blokiran_jml).toBe(2);
    });

    it("data tidak berubah referensinya (immutable)", () => {
      const data: Record<string, unknown> = { tgl_pensiun_pemohon: "2030-01-01" };
      const result = normalizeBlokiran(data, "type_a");
      expect(result).not.toBe(data);
      expect(data.total_blokiran_jml).toBeUndefined();
    });
  });

  describe("BLOKIRAN_MAX_MONTHS", () => {
    it("batas wajar bernilai 600", () => {
      expect(BLOKIRAN_MAX_MONTHS).toBe(600);
    });
  });
});