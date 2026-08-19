import {
  calculateAgeBreakdown,
  calculateRoundedAgeMonths,
  calculateMaxTenorByAgeMonths,
  calculateMonthsDifference,
  calculateMonthsDifferenceRoundedUp,
  formatAgeMonths,
  formatAgeBreakdown,
  toLocalDateStr,
} from "../utils";

describe("utils.ts - Perhitungan Usia & Jangka Waktu", () => {
    // Hari ini dianggap: 19 Agustus 2026
    const TODAY = new Date(2026, 7, 19); // 2026-08-19 (lokal, jam 00:00)

    describe("calculateAgeBreakdown", () => {
        it("contoh user: lahir 1969-03-09 -> 57 th 5 bln 10 hr", () => {
            expect(calculateAgeBreakdown("1969-03-09", TODAY)).toEqual({
                years: 57,
                months: 5,
                days: 10,
            });
        });

        it("tepat hari ulang tahun -> days = 0", () => {
            expect(calculateAgeBreakdown("1969-03-09", new Date(2026, 2, 9))).toEqual({
                years: 57,
                months: 0,
                days: 0,
            });
        });

        it("sehari sebelum ulang tahun -> belum bertambah umur", () => {
            expect(calculateAgeBreakdown("1969-03-09", new Date(2026, 2, 8))).toEqual({
                years: 56,
                months: 11,
                days: 27,
            });
        });

        it("tanggal tidak valid -> null", () => {
            expect(calculateAgeBreakdown("", TODAY)).toBeNull();
            expect(calculateAgeBreakdown("abc", TODAY)).toBeNull();
        });
    });

    describe("calculateRoundedAgeMonths", () => {
        it("57 th 5 bln 10 hr dibulatkan -> 57 th 6 bln (690 bulan)", () => {
            expect(calculateRoundedAgeMonths("1969-03-09", TODAY)).toBe(690);
        });

        it("sisa hari 0 tidak dibulatkan (tepat ulang tahun)", () => {
            expect(calculateRoundedAgeMonths("1969-03-09", new Date(2026, 2, 9))).toBe(684);
        });

        it("sisa 1 hari pun dibulatkan ke atas", () => {
            expect(calculateRoundedAgeMonths("1969-03-09", new Date(2026, 2, 10))).toBe(685);
        });
    });

    describe("calculateMaxTenorByAgeMonths", () => {
        it("74 th 10 bln - 57 th 6 bln = 17 th 4 bln (208 bulan)", () => {
            expect(calculateMaxTenorByAgeMonths("1969-03-09", 74, 10)).toBe(208);
        });

        it("75 tahun - 57 th 6 bln = 17 th 6 bln (210 bulan)", () => {
            expect(calculateMaxTenorByAgeMonths("1969-03-09", 75, 0)).toBe(210);
        });

        it("tidak pernah negatif (usia sudah melewati batas)", () => {
            expect(calculateMaxTenorByAgeMonths("1950-01-01", 75, 0)).toBe(0);
        });
    });

    describe("calculateMonthsDifference", () => {
        it("selisih bulan penuh dengan koreksi hari (2044-01-09 -> 208)", () => {
            expect(calculateMonthsDifference("2026-08-19", "2044-01-09")).toBe(208);
        });

        it("selisih bulan penuh biasa", () => {
            expect(calculateMonthsDifference("2026-08-19", "2045-01-15")).toBe(220);
        });

        it("kasus akhir bulan: 31 Jan -> 28 Feb = 1 bulan penuh", () => {
            expect(calculateMonthsDifference("2026-01-31", "2026-02-28")).toBe(1);
        });

        it("start > end -> 0", () => {
            expect(calculateMonthsDifference("2027-02-28", "2026-08-19")).toBe(0);
        });
    });

    describe("calculateMonthsDifferenceRoundedUp", () => {
        it("sisa hari > 0 dihitung 1 bulan (19 Aug -> 30 Aug = 1)", () => {
            expect(calculateMonthsDifferenceRoundedUp("2026-08-19", "2026-08-30")).toBe(1);
        });

        it("bulan penuh tanpa sisa hari (19 Aug -> 19 Oct = 2)", () => {
            expect(calculateMonthsDifferenceRoundedUp("2026-08-19", "2026-10-19")).toBe(2);
        });

        it("sama dengan kasus floor jika tanggal genap (19 Aug 2026 -> 19 Aug 2027 = 12)", () => {
            expect(calculateMonthsDifferenceRoundedUp("2026-08-19", "2027-08-19")).toBe(12);
        });

        it("tanggal sama -> 0", () => {
            expect(calculateMonthsDifferenceRoundedUp("2026-08-19", "2026-08-19")).toBe(0);
        });

        it("pensiun sudah lewat -> 0", () => {
            expect(calculateMonthsDifferenceRoundedUp("2026-08-19", "2026-01-01")).toBe(0);
        });

        it("kasus akhir bulan: 31 Jan -> 28 Feb = 1 bulan penuh (sisa hari 0)", () => {
            expect(calculateMonthsDifferenceRoundedUp("2026-01-31", "2026-02-28")).toBe(1);
        });

        it("tanggal tidak valid -> 0", () => {
            expect(calculateMonthsDifferenceRoundedUp("", "2044-01-09")).toBe(0);
            expect(calculateMonthsDifferenceRoundedUp("2026-08-19", "")).toBe(0);
        });
    });

    describe("format helpers", () => {
        it("formatAgeMonths(208) -> 17 Tahun 4 Bulan", () => {
            expect(formatAgeMonths(208)).toBe("17 Tahun 4 Bulan");
        });

        it("formatAgeMonths(120) -> 10 Tahun", () => {
            expect(formatAgeMonths(120)).toBe("10 Tahun");
        });

        it("formatAgeBreakdown -> 57 Tahun 5 Bulan 1 Minggu 3 Hari", () => {
            expect(formatAgeBreakdown("1969-03-09", TODAY)).toBe(
                "57 Tahun 5 Bulan 1 Minggu 3 Hari",
            );
        });

        it("toLocalDateStr -> YYYY-MM-DD lokal", () => {
            expect(toLocalDateStr(TODAY)).toBe("2026-08-19");
        });
    });
});