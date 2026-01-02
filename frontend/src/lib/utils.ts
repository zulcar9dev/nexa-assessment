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
export function formatRupiah(value: number | string): string {
    const number = typeof value === "string" ? parseFloat(value.replace(/\./g, "")) : value;
    if (isNaN(number)) return "0";
    return number.toLocaleString("id-ID");
}

/**
 * Parse Rupiah formatted string to number
 */
export function parseRupiah(value: string | number | null | undefined): number {
    if (value === null || value === undefined) return 0;
    if (typeof value === "number") return value;
    if (typeof value !== "string") return 0;
    return parseInt(value.replace(/\./g, ""), 10) || 0;
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
 * Validate DSR (max 90%)
 */
export function validateDSR(dsr: number): boolean {
    return dsr <= 90;
}

/**
 * Calculate maximum installment capacity
 * Max = (90% * Penghasilan) - Angsuran Eksisting
 */
export function calculateMaxCapacity(
    penghasilan: number,
    angsuranEksisting: number
): number {
    return (penghasilan * 0.9) - angsuranEksisting;
}

/**
 * Calculate remaining time from today to end date
 * Returns object with years, months, weeks, days
 */
export function calculateRemainingTime(endDateStr: string): {
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
    duration: { years: number; months: number; weeks: number; days: number; isPast: boolean }
): string {
    if (duration.isPast) return "Sudah Pensiun";
    
    const parts = [];
    if (duration.years > 0) parts.push(`${duration.years} Tahun`);
    if (duration.months > 0) parts.push(`${duration.months} Bulan`);
    if (duration.weeks > 0) parts.push(`${duration.weeks} Minggu`);
    if (duration.days > 0) parts.push(`${duration.days} Hari`);

    if (parts.length === 0) return "Hari Ini";
    return parts.join(" ");
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
