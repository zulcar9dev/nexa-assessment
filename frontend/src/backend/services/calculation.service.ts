/**
 * Calculation Service
 * Handles financial calculations for credit applications
 * Migrated from utils.py
 */

export class CalculationService {
    /**
     * Calculate monthly payment (PMT - Payment)
     * Formula: P * (r(1+r)^n) / ((1+r)^n - 1)
     * 
     * @param principal - Loan principal amount (Plafon kredit)
     * @param annualRatePercent - Annual interest rate in percentage
     * @param months - Loan term in months (Tenor)
     * @returns Monthly payment amount
     */
    static calculatePMT(
        principal: number,
        annualRatePercent: number,
        months: number
    ): number {
        // Convert annual rate to monthly rate
        const monthlyRate = annualRatePercent / 100 / 12;

        // If rate is 0, simple division
        if (monthlyRate === 0) {
            return principal / months;
        }

        // PMT formula: P * (r(1+r)^n) / ((1+r)^n - 1)
        const compoundFactor = Math.pow(1 + monthlyRate, months);
        const pmt = principal * (monthlyRate * compoundFactor) / (compoundFactor - 1);

        return Math.round(pmt);
    }

    /**
     * Calculate Debt Service Ratio (DSR)
     * DSR = (Total Angsuran / Penghasilan) * 100
     * 
     * @param penghasilan - Monthly income
     * @param totalAngsuran - Total monthly installments
     * @returns DSR percentage
     */
    static calculateDSR(
        penghasilan: number,
        totalAngsuran: number
    ): number {
        if (penghasilan === 0) {
            return 0;
        }
        return (totalAngsuran / penghasilan) * 100;
    }

    /**
     * Validate if DSR is within acceptable threshold
     * DSR must not exceed 90%
     * 
     * @param dsr - DSR percentage
     * @returns true if DSR is valid (≤ 90%)
     */
    static validateDSR(dsr: number): boolean {
        return dsr <= 90;
    }

    /**
     * Calculate maximum installment capacity
     * Max = (90% * Penghasilan) - Angsuran Eksisting
     * 
     * @param penghasilan - Monthly income
     * @param angsuranEksisting - Existing monthly installments
     * @returns Maximum additional installment allowed
     */
    static calculateMaxCapacity(
        penghasilan: number,
        angsuranEksisting: number
    ): number {
        const maxAllowedInstallment = penghasilan * 0.9;
        const remainingCapacity = maxAllowedInstallment - angsuranEksisting;
        return Math.max(0, Math.round(remainingCapacity));
    }

    /**
     * Calculate complete DSR with all metrics
     * 
     * @param penghasilan - Monthly income
     * @param angsuranBaru - New proposed installment
     * @param angsuranEksisting - Array of existing installments
     * @returns Complete DSR calculation result
     */
    static calculateCompleteDSR(
        penghasilan: number,
        angsuranBaru: number,
        angsuranEksisting: number[]
    ): {
        dsr: number;
        dsc90: number;
        totalAngsuran: number;
        maksimalAngsuran: number;
        isValid: boolean;
        message?: string;
    } {
        const totalEksisting = angsuranEksisting.reduce((sum, a) => sum + a, 0);
        const totalAngsuran = angsuranBaru + totalEksisting;
        const dsr = this.calculateDSR(penghasilan, totalAngsuran);
        const dsc90 = penghasilan * 0.9;
        const maksimalAngsuran = this.calculateMaxCapacity(penghasilan, totalEksisting);
        const isValid = this.validateDSR(dsr);

        return {
            dsr: Math.round(dsr * 100) / 100,
            dsc90: Math.round(dsc90),
            totalAngsuran: Math.round(totalAngsuran),
            maksimalAngsuran,
            isValid,
            message: isValid
                ? 'DSR dalam batas yang diperbolehkan'
                : `DSR melebihi 90%. Maksimal angsuran yang dapat diajukan: Rp ${maksimalAngsuran.toLocaleString('id-ID')}`,
        };
    }
}
