"use client";

import { useState, useCallback } from "react";
import {
  calculatePMT,
  calculateDSR,
  validateDSR,
  calculateMaxCapacity,
  parseRupiah,
} from "@/lib/utils";
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
      const principal = parseRupiah(
        plafon || formData.usulan_plafon_kredit || "0",
      );
      const rate = parseFloat(bunga || formData.usulan_bunga_persen || "0");
      const months = parseInt(
        tenor || formData.usulan_jangka_waktu_bulan || "0",
        10,
      );

      return calculatePMT(principal, rate, months);
    },
    [formData],
  );

  /**
   * Calculate PMT via API - For validation/logging purposes
   */
  const calculateInstallmentApi = useCallback(
    async (
      plafon: number,
      bunga: number,
      tenor: number,
    ): Promise<PMTApiResponse["data"] | null> => {
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
    [],
  );

  /**
   * Calculate DSR via API - For validation with server
   */
  const calculateDSRApi = useCallback(
    async (
      penghasilan: number,
      angsuranBaru: number,
      angsuranEksisting: number[],
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
    [],
  );

  /**
   * Helper to calculate Penghasilan based on Kategori
   */
  const getPenghasilan = useCallback(
    (kategori: "prapurna" | "purna" | "aktif") => {
      if (kategori === "prapurna") {
        return parseRupiah(formData.estimasi_hak_pensiun || "0");
      } else if (kategori === "aktif") {
        // === HELPER FUNCTION: Calculate variance-based value ===
        // RULE: Hitung berdasarkan data yang tersedia (valid > 0)
        const calculateVarianceValue = (
          val1: number,
          val2: number,
          val3: number,
        ): number => {
          // Filter nilai yang valid (>0)
          const validValues = [val1, val2, val3].filter((v) => v > 0);

          // Jika tidak ada nilai valid, return 0
          if (validValues.length === 0) return 0;

          const values = validValues;
          const maxVal = Math.max(...values);
          const minVal = Math.min(...values);

          // Jika hanya 1 data valid, langsung return nilai tersebut
          if (values.length === 1) return values[0];

          const variance = maxVal > 0 ? ((maxVal - minVal) / maxVal) * 100 : 0;

          // Variance ≤ 20%: gunakan rata-rata, selain itu gunakan terkecil
          return variance <= 20
            ? Math.round(values.reduce((a, b) => a + b, 0) / values.length)
            : minVal;
        };

        // === 1. Calculate Gaji with variance ===
        const gaji1 = formData.gaji_bulan_1_checked !== false ? parseRupiah(formData.gaji_bulan_1_jumlah || "0") : 0;
        const gaji2 = formData.gaji_bulan_2_checked !== false ? parseRupiah(formData.gaji_bulan_2_jumlah || "0") : 0;
        const gaji3 = formData.gaji_bulan_3_checked !== false ? parseRupiah(formData.gaji_bulan_3_jumlah || "0") : 0;
        const gajiValue = calculateVarianceValue(gaji1, gaji2, gaji3);

        // === 2. Calculate Additional Incomes (Tukin, Uang Makan, dll) with variance ===
        let additionalValue = 0;
        const additionalIncomes = formData.additional_incomes || [];
        additionalIncomes.forEach((income) => {
          const add1 = income.bulan_1_checked !== false ? parseRupiah(income.bulan_1 || "0") : 0;
          const add2 = income.bulan_2_checked !== false ? parseRupiah(income.bulan_2 || "0") : 0;
          const add3 = income.bulan_3_checked !== false ? parseRupiah(income.bulan_3 || "0") : 0;
          
          // Hanya tambahkan jika ada data valid yang dicentang
          additionalValue += calculateVarianceValue(add1, add2, add3);
        });

        // === 3. Total Penghasilan = Gaji + Additional Incomes ===
        return gajiValue + additionalValue;
      } else {
        // PURNA
        const penghasilanMode = formData.purna_penghasilan_mode || "minimum";

        if (penghasilanMode === "langsung") {
          // Mode Langsung: use pensiun_bulan_jumlah directly
          return parseRupiah(formData.pensiun_bulan_jumlah || "0");
        } else {
          // Mode Minimum: find smallest from 3 months
          const gaji1 = parseRupiah(formData.pensiun_bulan_1_jumlah || "0");
          const gaji2 = parseRupiah(formData.pensiun_bulan_2_jumlah || "0");
          const gaji3 = parseRupiah(formData.pensiun_bulan_3_jumlah || "0");

          const gajiList = [gaji1, gaji2, gaji3].filter((g) => g > 0);
          return gajiList.length > 0 ? Math.min(...gajiList) : 0;
        }
      }
    },
    [formData],
  );

  /**
   * Helper to get Existing Installments (SLIK)
   */
  const getExistingInstallments = useCallback(() => {
    const angsuranExisting: number[] = [];
    if (formData.fasilitas_nihil !== "ya" && formData.slik_facilities) {
      formData.slik_facilities.forEach((facility) => {
        angsuranExisting.push(parseRupiah(facility.angsuran));
      });
    }
    return angsuranExisting;
  }, [formData]);

  /**
   * Calculate DSR and update store - Local calculation (fast)
   */
  const calculateAndUpdateDSR = useCallback(
    (kategori: "prapurna" | "purna" | "aktif") => {
      // Get penghasilan
      const penghasilan = getPenghasilan(kategori);

      // Calculate angsuran baru
      const angsuranBaru = calculateInstallment();

      // Calculate total angsuran eksisting from SLIK
      const existingInstallments = getExistingInstallments();
      const totalAngsuranEksisting = existingInstallments.reduce(
        (sum, a) => sum + a,
        0,
      );

      // Calculate DSR
      const totalAngsuran = totalAngsuranEksisting + angsuranBaru;
      const dsr = calculateDSR(penghasilan, totalAngsuran);

      // Determine limit based on category
      const limitPercentage = kategori === "aktif" ? 60 : 90;
      const limitMultiplier = kategori === "aktif" ? 0.6 : 0.9;

      const dsc90 = penghasilan * 0.9; // Keep as 90 for compatibility / reference
      const maksimalAngsuran = calculateMaxCapacity(
        penghasilan,
        totalAngsuranEksisting,
        limitMultiplier,
      );
      const isValid = validateDSR(dsr, limitPercentage);

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
    [
      getPenghasilan,
      calculateInstallment,
      getExistingInstallments,
      setDsrResult,
    ],
  );

  /**
   * Calculate DSR via API and update store - For server validation
   */
  const calculateAndUpdateDSRApi = useCallback(
    async (kategori: "prapurna" | "purna" | "aktif") => {
      // Get penghasilan
      const penghasilan = getPenghasilan(kategori);

      // Calculate angsuran baru
      const angsuranBaru = calculateInstallment();

      // Get angsuran eksisting from SLIK
      const angsuranEksisting = getExistingInstallments();

      // Call API
      const apiResult = await calculateDSRApi(
        penghasilan,
        angsuranBaru,
        angsuranEksisting,
      );

      if (apiResult) {
        const totalAngsuranEksisting = angsuranEksisting.reduce(
          (sum, a) => sum + a,
          0,
        );

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
    [
      getPenghasilan,
      calculateInstallment,
      getExistingInstallments,
      calculateDSRApi,
      setDsrResult,
    ],
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
