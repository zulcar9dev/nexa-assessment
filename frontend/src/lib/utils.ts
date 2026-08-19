import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind CSS classes with clsx
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * Format number as Indonesian Rupiah
 */
/**
 * Format number as Indonesian Rupiah
 */
export function formatRupiah(value: number | string | undefined | null): string {
    if (value === undefined || value === null || value === "") return "0";
    if (typeof value === "number") return value.toLocaleString("id-ID");
    const cleaned = cleanNumberInput(value);
    if (!cleaned) return "0";
    const number = parseInt(cleaned, 10);
    if (isNaN(number)) return "0";
    return number.toLocaleString("id-ID");
}

/**
 * Clean non-numeric characters from string
 */
export function cleanNumberInput(value: string): string {
    return value.replace(/[^0-9]/g, "");
}

/**
 * Format number for input display (returns empty string if invalid/empty)
 * Useful for controlled inputs where "0" might be undesirable when empty.
 */
export function formatNumberForDisplay(value: string | number | undefined | null): string {
    if (value === undefined || value === null || value === "") return "";
    const num = typeof value === "string" ? parseInt(cleanNumberInput(value), 10) : value;
    if (isNaN(num)) return String(value);
    return num.toLocaleString("id-ID");
}

/**
 * Parse Rupiah formatted string to number
 */
export function parseRupiah(value: string | number | null | undefined): number {
    if (value === null || value === undefined) return 0;
    if (typeof value === "number") return value;
    if (typeof value !== "string") return 0;
    return parseInt(cleanNumberInput(value), 10) || 0;
}

/**
 * Format date to Indonesian format (DD NamaBulan YYYY)
 */
export function formatDateIndonesian(dateStr: string): string {
    const months = [
        "Januari", "Februari", "Maret", "April", "Mei", "Juni",
        "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];

    try {
        const date = new Date(dateStr);
        const day = date.getDate().toString().padStart(2, "0");
        const month = months[date.getMonth()];
        const year = date.getFullYear();
        return `${day} ${month} ${year}`;
    } catch {
        return dateStr;
    }
}

/**
 * Calculate PMT (monthly payment)
 * Formula: P * (r(1+r)^n) / ((1+r)^n - 1)
 */
export function calculatePMT(
    principal: number,
    annualRatePercent: number,
    months: number
): number {
    if (months === 0) return 0;
    if (annualRatePercent === 0) return principal / months;

    const monthlyRate = (annualRatePercent / 100) / 12;
    const pmt = principal * (monthlyRate * Math.pow(1 + monthlyRate, months)) /
        (Math.pow(1 + monthlyRate, months) - 1);

    return Math.ceil(pmt);
}

/**
 * Calculate DSR (Debt Service Ratio)
 * DSR = (Total Angsuran / Penghasilan) * 100
 */
export function calculateDSR(
    penghasilan: number,
    totalAngsuran: number
): number {
    if (penghasilan === 0) return 0;
    return (totalAngsuran / penghasilan) * 100;
}

/**
 * Validate DSR (max limit%)
 */
export function validateDSR(dsr: number, limit: number = 90): boolean {
    return dsr <= limit;
}

/**
 * Calculate maximum installment capacity
 * Max = (limit% * Penghasilan) - Angsuran Eksisting
 */
export function calculateMaxCapacity(
    penghasilan: number,
    angsuranEksisting: number,
    limitMultiplier: number = 0.9
): number {
    return (penghasilan * limitMultiplier) - angsuranEksisting;
}

/**
 * Calculate remaining time from today to end date
 * Returns object with years, months, weeks, days
 */
export function calculateRemainingTime(
    endDateStr: string,
    roundUpDays: boolean = false
): {
    years: number;
    months: number;
    weeks: number;
    days: number;
    isPast: boolean;
} {
    if (!endDateStr) {
        return { years: 0, months: 0, weeks: 0, days: 0, isPast: false };
    }

    const start = new Date();
    const end = new Date(endDateStr);

    // Reset hours to ensure calculation is based on dates only
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    if (end < start) {
        return { years: 0, months: 0, weeks: 0, days: 0, isPast: true };
    }

    let years = end.getFullYear() - start.getFullYear();
    let months = end.getMonth() - start.getMonth();
    let days = end.getDate() - start.getDate();

    // Adjust negative days
    if (days < 0) {
        months--;
        // Get days in previous month
        const prevMonthDate = new Date(end.getFullYear(), end.getMonth(), 0);
        days += prevMonthDate.getDate();
    }

    // Adjust negative months
    if (months < 0) {
        years--;
        months += 12;
    }

    // Round up remaining days to 1 full month if requested (e.g. for Pra Purna)
    if (roundUpDays && days > 0) {
        months++;
        days = 0;
        if (months >= 12) {
            years++;
            months -= 12;
        }
    }

    // Convert remaining days to weeks
    const weeks = Math.floor(days / 7);
    const remainingDays = days % 7;

    return {
        years,
        months,
        weeks,
        days: remainingDays,
        isPast: false
    };
}

/**
 * Format remaining time object to string
 */
export function formatRemainingTime(
    duration: { years: number; months: number; weeks: number; days: number; isPast: boolean },
    showWeeksAndDays: boolean = false
): string {
    if (duration.isPast) return "Sudah Pensiun";

    const parts = [];
    if (duration.years > 0) parts.push(`${duration.years} Tahun`);
    if (duration.months > 0) parts.push(`${duration.months} Bulan`);
    
    if (showWeeksAndDays) {
        if (duration.weeks > 0) parts.push(`${duration.weeks} Minggu`);
        if (duration.days > 0) parts.push(`${duration.days} Hari`);
    }

    if (parts.length === 0) return "Hari Ini";
    return parts.join(" ");
}

/**
 * Calculate contract duration between start and end date (inclusive)
 * Returns formatted string representing the period.
 */
export function calculateContractPeriod(
    startDateStr: string | undefined,
    endDateStr: string | undefined,
    prefix: string = "Periode "
): string {
    if (!startDateStr || !endDateStr) return `${prefix}- Tahun`;
    try {
        const start = new Date(startDateStr);
        const end = new Date(endDateStr);
        if (isNaN(start.getTime()) || isNaN(end.getTime())) return `${prefix}- Tahun`;

        // Add 1 day to end date to handle inclusive contract boundaries
        const adjustedEnd = new Date(end);
        adjustedEnd.setDate(adjustedEnd.getDate() + 1);

        let years = adjustedEnd.getFullYear() - start.getFullYear();
        let months = adjustedEnd.getMonth() - start.getMonth();
        let days = adjustedEnd.getDate() - start.getDate();

        if (days < 0) {
            months--;
            const prevMonthDate = new Date(adjustedEnd.getFullYear(), adjustedEnd.getMonth(), 0);
            days += prevMonthDate.getDate();
        }
        if (months < 0) {
            years--;
            months += 12;
        }

        const parts = [];
        if (years > 0) parts.push(`${years} Tahun`);
        if (months > 0) parts.push(`${months} Bulan`);

        if (parts.length === 0) {
            return prefix ? `${prefix}< 1 Bulan` : "Kurang dari 1 Bulan";
        }
        return prefix ? `${prefix}${parts.join(" ")}` : parts.join(" ");
    } catch {
        return `${prefix}- Tahun`;
    }
}


/**
 * Calculate elapsed time from start date to today
 * Returns object with years, months, weeks, days
 */
export function calculateElapsedTime(startDateStr: string): {
    years: number;
    months: number;
    weeks: number;
    days: number;
    isFuture: boolean;
} {
    if (!startDateStr) {
        return { years: 0, months: 0, weeks: 0, days: 0, isFuture: false };
    }

    const start = new Date(startDateStr);
    const end = new Date();

    // Reset hours
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    if (start > end) {
        return { years: 0, months: 0, weeks: 0, days: 0, isFuture: true };
    }

    let years = end.getFullYear() - start.getFullYear();
    let months = end.getMonth() - start.getMonth();
    let days = end.getDate() - start.getDate();

    // Adjust negative days
    if (days < 0) {
        months--;
        const prevMonthDate = new Date(end.getFullYear(), end.getMonth(), 0);
        days += prevMonthDate.getDate();
    }

    // Adjust negative months
    if (months < 0) {
        years--;
        months += 12;
    }

    const weeks = Math.floor(days / 7);
    const remainingDays = days % 7;

    return {
        years,
        months,
        weeks,
        days: remainingDays,
        isFuture: false
    };
}

/**
 * Calculate elapsed time between start date and end date
 * Returns object with years, months, weeks, days
 */
export function calculateElapsedTimeBetween(
    startDateStr: string,
    endDateStr: string
): {
    years: number;
    months: number;
    weeks: number;
    days: number;
    isFuture: boolean;
} {
    if (!startDateStr || !endDateStr) {
        return { years: 0, months: 0, weeks: 0, days: 0, isFuture: false };
    }

    const start = new Date(startDateStr);
    const end = new Date(endDateStr);

    // Reset hours
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    if (start > end) {
        return { years: 0, months: 0, weeks: 0, days: 0, isFuture: true };
    }

    let years = end.getFullYear() - start.getFullYear();
    let months = end.getMonth() - start.getMonth();
    let days = end.getDate() - start.getDate();

    // Adjust negative days
    if (days < 0) {
        months--;
        const prevMonthDate = new Date(end.getFullYear(), end.getMonth(), 0);
        days += prevMonthDate.getDate();
    }

    // Adjust negative months
    if (months < 0) {
        years--;
        months += 12;
    }

    const weeks = Math.floor(days / 7);
    const remainingDays = days % 7;

    return {
        years,
        months,
        weeks,
        days: remainingDays,
        isFuture: false
    };
}

/**
 * Convert number to Indonesian text (Terbilang)
 * Handles numbers up to Trillions
 */
export function terbilang(nilai: number): string {
    const angka = Math.abs(nilai);
    const baca = ["", "Satu", "Dua", "Tiga", "Empat", "Lima", "Enam", "Tujuh", "Delapan", "Sembilan", "Sepuluh", "Sebelas"];
    let terbilang = "";

    if (angka < 12) {
        terbilang = " " + baca[angka];
    } else if (angka < 20) {
        terbilang = terbilangCalc(angka - 10) + " Belas";
    } else if (angka < 100) {
        terbilang = terbilangCalc(Math.floor(angka / 10)) + " Puluh" + terbilangCalc(angka % 10);
    } else if (angka < 200) {
        terbilang = " Seratus" + terbilangCalc(angka - 100);
    } else if (angka < 1000) {
        terbilang = terbilangCalc(Math.floor(angka / 100)) + " Ratus" + terbilangCalc(angka % 100);
    } else if (angka < 2000) {
        terbilang = " Seribu" + terbilangCalc(angka - 1000);
    } else if (angka < 1000000) {
        terbilang = terbilangCalc(Math.floor(angka / 1000)) + " Ribu" + terbilangCalc(angka % 1000);
    } else if (angka < 1000000000) {
        terbilang = terbilangCalc(Math.floor(angka / 1000000)) + " Juta" + terbilangCalc(angka % 1000000);
    } else if (angka < 1000000000000) {
        terbilang = terbilangCalc(Math.floor(angka / 1000000000)) + " Milyar" + terbilangCalc(angka % 1000000000);
    } else if (angka < 1000000000000000) {
        terbilang = terbilangCalc(Math.floor(angka / 1000000000000)) + " Trilyun" + terbilangCalc(angka % 1000000000000);
    }

    return terbilang.trim();
}

function terbilangCalc(nilai: number): string {
    return " " + terbilang(nilai);
}

/**
 * Parse date string (YYYY-MM-DD) into a LOCAL date (hour 00:00).
 * Avoids timezone shifts caused by new Date("YYYY-MM-DD") parsing as UTC.
 */
export function parseDateLocal(dateStr: string): Date | null {
    if (!dateStr) return null;
    const match = /^(\d{4})-(\d{1,2})-(\d{1,2})/.exec(String(dateStr).trim());
    if (!match) return null;
    const year = parseInt(match[1], 10);
    const month = parseInt(match[2], 10) - 1;
    const day = parseInt(match[3], 10);
    if (isNaN(year) || isNaN(month) || isNaN(day)) return null;
    const date = new Date(year, month, day);
    if (isNaN(date.getTime())) return null;
    return date;
}

/**
 * Format a Date into local "YYYY-MM-DD" string.
 */
export function toLocalDateStr(date: Date = new Date()): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
}

/**
 * Add months to a date with end-of-month clamping.
 * e.g. 31 Jan + 1 month = 28 Feb (not 3 Mar).
 */
export function addMonthsToDate(date: Date, months: number): Date {
    const totalMonth = date.getMonth() + months;
    const year = date.getFullYear() + Math.floor(totalMonth / 12);
    const month = ((totalMonth % 12) + 12) % 12;
    const lastDay = new Date(year, month + 1, 0).getDate();
    return new Date(year, month, Math.min(date.getDate(), lastDay));
}

/**
 * Calculate full months between two dates (YYYY-MM-DD).
 * Returns the number of complete months from start until end.
 * Returns 0 if start date > end date or dates are invalid.
 */
export function calculateMonthsDifference(startDateStr: string, endDateStr: string): number {
    if (!startDateStr || !endDateStr) return 0;

    const start = parseDateLocal(startDateStr);
    const end = parseDateLocal(endDateStr);

    if (!start || !end) return 0;

    if (start > end) return 0;

    let totalMonths = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());

    // Kurangi 1 jika bulan terakhir belum genap (dengan penyesuaian akhir bulan)
    while (addMonthsToDate(start, totalMonths) > end) {
        totalMonths--;
    }

    return Math.max(0, totalMonths);
}

/**
 * Calculate full months between two dates, rounded UP if there are leftover days.
 * e.g. 19 Aug 2026 -> 30 Aug 2026 = 0 full months + 11 days = 1 month
 * e.g. 19 Aug 2026 -> 19 Oct 2026 = 2 full months = 2
 * Returns 0 if start date > end date or dates are invalid.
 */
export function calculateMonthsDifferenceRoundedUp(
    startDateStr: string,
    endDateStr: string,
): number {
    if (!startDateStr || !endDateStr) return 0;

    const start = parseDateLocal(startDateStr);
    const end = parseDateLocal(endDateStr);

    if (!start || !end) return 0;

    if (start > end) return 0;

    let totalMonths =
        (end.getFullYear() - start.getFullYear()) * 12 +
        (end.getMonth() - start.getMonth());

    // Kurangi 1 jika bulan terakhir belum genap (dengan penyesuaian akhir bulan)
    while (addMonthsToDate(start, totalMonths) > end) {
        totalMonths--;
    }

    // Bulan berjalan: sisa hari > 0 dihitung sebagai 1 bulan penuh
    const exactEnd = addMonthsToDate(start, totalMonths);
    if (totalMonths >= 0 && exactEnd < end) {
        totalMonths++;
    }

    return Math.max(0, totalMonths);
}

/**
 * Calculate age based on birth date string (whole years)
 */
export function calculateAge(birthDateStr: string): number {
    if (!birthDateStr) return 0;

    const birthDate = parseDateLocal(birthDateStr);
    if (!birthDate) return 0;

    const today = new Date();

    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }

    return age;
}

/**
 * Calculate precise age breakdown: { years, months, days }.
 * e.g. birth 1969-03-09, today 2026-08-19 -> { years: 57, months: 5, days: 10 }
 */
export interface AgeBreakdown {
    years: number;
    months: number;
    days: number;
}

export function calculateAgeBreakdown(birthDateStr: string, today: Date = new Date()): AgeBreakdown | null {
    const birth = parseDateLocal(birthDateStr);
    if (!birth) return null;

    const now = new Date(today);
    now.setHours(0, 0, 0, 0);

    if (birth > now) return { years: 0, months: 0, days: 0 };

    let years = now.getFullYear() - birth.getFullYear();
    let months = now.getMonth() - birth.getMonth();
    let days = now.getDate() - birth.getDate();

    if (days < 0) {
        months--;
        const daysInPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0).getDate();
        days += daysInPrevMonth;
    }

    if (months < 0) {
        years--;
        months += 12;
    }

    return { years, months, days };
}

/**
 * Calculate age rounded up to the nearest full month.
 * Rule: sisa hari > 0 dibulatkan ke atas menjadi 1 bulan.
 * e.g. 57 tahun 5 bulan 10 hari -> 57 tahun 6 bulan (690 bulan)
 */
export function calculateRoundedAgeMonths(birthDateStr: string, today: Date = new Date()): number {
    const breakdown = calculateAgeBreakdown(birthDateStr, today);
    if (!breakdown) return 0;
    return breakdown.years * 12 + breakdown.months + (breakdown.days > 0 ? 1 : 0);
}

/**
 * Calculate maximum loan tenor (months) based on age.
 * Formula: (batas usia total bulan) - (usia pembulatan bulan)
 * e.g. 74 tahun 10 bulan (898 bulan) - 57 tahun 6 bulan (690 bulan) = 208 bulan (17 tahun 4 bulan)
 */
export function calculateMaxTenorByAgeMonths(
    birthDateStr: string,
    ageLimitYears: number,
    ageLimitMonths: number = 0,
): number {
    const roundedAgeMonths = calculateRoundedAgeMonths(birthDateStr);
    const limitTotalMonths = ageLimitYears * 12 + ageLimitMonths;
    return Math.max(0, limitTotalMonths - roundedAgeMonths);
}

/**
 * Format total months as "17 Tahun 4 Bulan" (capitalized for UI)
 */
export function formatAgeMonths(totalMonths: number): string {
    const years = Math.floor(totalMonths / 12);
    const months = totalMonths % 12;
    if (years > 0 && months > 0) return `${years} Tahun ${months} Bulan`;
    if (years > 0) return `${years} Tahun`;
    return `${months} Bulan`;
}

/**
 * Format precise age breakdown as "57 Tahun 5 Bulan 1 Minggu 3 Hari"
 */
export function formatAgeBreakdown(birthDateStr: string, today: Date = new Date()): string {
    const breakdown = calculateAgeBreakdown(birthDateStr, today);
    if (!breakdown) return "";
    const weeks = Math.floor(breakdown.days / 7);
    const days = breakdown.days % 7;
    const parts: string[] = [];
    if (breakdown.years > 0) parts.push(`${breakdown.years} Tahun`);
    if (breakdown.months > 0) parts.push(`${breakdown.months} Bulan`);
    if (weeks > 0) parts.push(`${weeks} Minggu`);
    if (days > 0) parts.push(`${days} Hari`);
    return parts.length > 0 ? parts.join(" ") : "0 Hari";
}
