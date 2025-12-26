"use client";

import { useCallback } from "react";
import { calculatePMT, calculateDSR, validateDSR, calculateMaxCapacity, parseRupiah } from "@/lib/utils";
import { useFormStore } from "@/stores/form-store";
import type { DSRResult } from "@/types/debitur";

export function useCalculation() {
    const { formData, setDsrResult } = useFormStore();

    /**
     * Calculate monthly installment (PMT)
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
     * Calculate DSR and update store
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

    return {
        calculateInstallment,
        calculateAndUpdateDSR,
    };
}
