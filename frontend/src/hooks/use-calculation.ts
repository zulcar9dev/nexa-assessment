"use client";

import { useState, useCallback } from "react";
import { calculatePMT, calculateDSR, validateDSR, calculateMaxCapacity, parseRupiah } from "@/lib/utils";
import { useFormStore } from "@/stores/form-store";
import type { DSRResult } from "@/types/debitur";

interface PMTApiResponse {
    success: boolean;
    data?: {
        angsuran: number;
        totalBayar: number;
        totalBunga: number;
    };
    error?: {
        code: string;
        message: string;
    };
}

interface DSRApiResponse {
    success: boolean;
    data?: {
        dsr: number;
        dsc90: number;
        totalAngsuran: number;
        maksimalAngsuran: number;
        isValid: boolean;
        message?: string;
    };
    error?: {
        code: string;
        message: string;
    };
}

export function useCalculation() {
    const { formData, setDsrResult } = useFormStore();
    const [isCalculating, setIsCalculating] = useState(false);
    const [apiError, setApiError] = useState<string | null>(null);

    /**
     * Calculate monthly installment (PMT) - Local calculation
     */
    const calculateInstallment = useCallback(
        (plafon?: string, bunga?: string, tenor?: string) => {
            const principal = parseRupiah(plafon || formData.usulan_plafon_kredit || "0");
            const rate = parseFloat(bunga || formData.usulan_bunga_persen || "0");
            const months = parseInt(tenor || formData.usulan_jangka_waktu_bulan || "0", 10);

            return calculatePMT(principal, rate, months);
        },
        [formData]
    );

    /**
     * Calculate PMT via API - For validation/logging purposes
     */
    const calculateInstallmentApi = useCallback(
        async (plafon: number, bunga: number, tenor: number): Promise<PMTApiResponse["data"] | null> => {
            setIsCalculating(true);
            setApiError(null);

            try {
                const response = await fetch("/api/calculate/pmt", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        principal: plafon,
                        annualRate: bunga,
                        months: tenor,
                    }),
                });

                const data: PMTApiResponse = await response.json();

                if (!data.success) {
                    setApiError(data.error?.message || "Gagal menghitung angsuran");
                    return null;
                }

                return data.data || null;
            } catch (error) {
                setApiError("Gagal menghubungi server");
                console.error("PMT API error:", error);
                return null;
            } finally {
                setIsCalculating(false);
            }
        },
        []
    );

    /**
     * Calculate DSR via API - For validation with server
     */
    const calculateDSRApi = useCallback(
        async (
            penghasilan: number,
            angsuranBaru: number,
            angsuranEksisting: number[]
        ): Promise<DSRApiResponse["data"] | null> => {
            setIsCalculating(true);
            setApiError(null);

            try {
                const response = await fetch("/api/calculate/dsr", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        penghasilan,
                        angsuranBaru,
                        angsuranEksisting,
                    }),
                });

                const data: DSRApiResponse = await response.json();

                // Even if DSR exceeds limit, we still return the data
                if (data.data) {
                    return data.data;
                }

                if (!data.success) {
                    setApiError(data.error?.message || "Gagal menghitung DSR");
                    return null;
                }

                return null;
            } catch (error) {
                setApiError("Gagal menghubungi server");
                console.error("DSR API error:", error);
                return null;
            } finally {
                setIsCalculating(false);
            }
        },
        []
    );

    /**
     * Calculate DSR and update store - Local calculation (fast)
     */
    const calculateAndUpdateDSR = useCallback(
        (kategori: "prapurna" | "purna") => {
            // Get penghasilan based on kategori
            let penghasilan = 0;

            if (kategori === "prapurna") {
                // Use estimasi_hak_pensiun for prapurna
                penghasilan = parseRupiah(formData.estimasi_hak_pensiun || "0");
            } else {
                // For purna, use minimum of 3 months
                const gaji1 = parseRupiah(formData.pensiun_bulan_1_jumlah || "0");
                const gaji2 = parseRupiah(formData.pensiun_bulan_2_jumlah || "0");
                const gaji3 = parseRupiah(formData.pensiun_bulan_jumlah || "0");

                const gajiList = [gaji1, gaji2, gaji3].filter((g) => g > 0);
                penghasilan = gajiList.length > 0 ? Math.min(...gajiList) : 0;
            }

            // Calculate angsuran baru
            const angsuranBaru = calculateInstallment();

            // Calculate total angsuran eksisting from SLIK
            let totalAngsuranEksisting = 0;
            if (formData.fasilitas_nihil !== "ya" && formData.slik_facilities) {
                totalAngsuranEksisting = formData.slik_facilities.reduce(
                    (sum, facility) => sum + parseRupiah(facility.angsuran),
                    0
                );
            }

            // Calculate DSR
            const totalAngsuran = totalAngsuranEksisting + angsuranBaru;
            const dsr = calculateDSR(penghasilan, totalAngsuran);
            const dsc90 = penghasilan * 0.9;
            const maksimalAngsuran = calculateMaxCapacity(penghasilan, totalAngsuranEksisting);
            const isValid = validateDSR(dsr);

            const result: DSRResult = {
                dsr,
                dsc90,
                penghasilan,
                totalAngsuranEksisting,
                totalAngsuranBaru: totalAngsuran,
                maksimalAngsuran,
                isValid,
            };

            setDsrResult(result);
            return result;
        },
        [formData, calculateInstallment, setDsrResult]
    );

    /**
     * Calculate DSR via API and update store - For server validation
     */
    const calculateAndUpdateDSRApi = useCallback(
        async (kategori: "prapurna" | "purna") => {
            // Get penghasilan based on kategori
            let penghasilan = 0;

            if (kategori === "prapurna") {
                penghasilan = parseRupiah(formData.estimasi_hak_pensiun || "0");
            } else {
                const gaji1 = parseRupiah(formData.pensiun_bulan_1_jumlah || "0");
                const gaji2 = parseRupiah(formData.pensiun_bulan_2_jumlah || "0");
                const gaji3 = parseRupiah(formData.pensiun_bulan_jumlah || "0");

                const gajiList = [gaji1, gaji2, gaji3].filter((g) => g > 0);
                penghasilan = gajiList.length > 0 ? Math.min(...gajiList) : 0;
            }

            // Calculate angsuran baru
            const angsuranBaru = calculateInstallment();

            // Get angsuran eksisting from SLIK
            const angsuranEksisting: number[] = [];
            if (formData.fasilitas_nihil !== "ya" && formData.slik_facilities) {
                formData.slik_facilities.forEach((facility) => {
                    angsuranEksisting.push(parseRupiah(facility.angsuran));
                });
            }

            // Call API
            const apiResult = await calculateDSRApi(penghasilan, angsuranBaru, angsuranEksisting);

            if (apiResult) {
                const totalAngsuranEksisting = angsuranEksisting.reduce((sum, a) => sum + a, 0);

                const result: DSRResult = {
                    dsr: apiResult.dsr,
                    dsc90: apiResult.dsc90,
                    penghasilan,
                    totalAngsuranEksisting,
                    totalAngsuranBaru: apiResult.totalAngsuran,
                    maksimalAngsuran: apiResult.maksimalAngsuran,
                    isValid: apiResult.isValid,
                };

                setDsrResult(result);
                return result;
            }

            return null;
        },
        [formData, calculateInstallment, calculateDSRApi, setDsrResult]
    );

    return {
        // Local calculations (fast, no API)
        calculateInstallment,
        calculateAndUpdateDSR,

        // API calculations (with server validation)
        calculateInstallmentApi,
        calculateDSRApi,
        calculateAndUpdateDSRApi,

        // State
        isCalculating,
        apiError,
    };
}
