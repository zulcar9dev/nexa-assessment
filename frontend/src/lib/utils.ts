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
