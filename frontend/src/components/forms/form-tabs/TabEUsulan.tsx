"use client";

import { useFormStore } from "@/stores/form-store";
import { useTabNavigation } from "@/hooks/useTabNavigation";
import { CreditCard, Calculator } from "lucide-react";
import { MentionTextArea } from "@/components/ui/MentionTextArea";
import { DOCUMENT_PLACEHOLDERS } from "@/constants/placeholders";
import {
  calculateMonthsDifference,
  terbilang,
  calculateAge,
  formatNumberForDisplay,
  cleanNumberInput,
} from "@/lib/utils";
import React, { useEffect, useMemo } from "react";

interface TabEUsulanProps {
  kategori?: "purna" | "prapurna" | "aktif";
}

export default React.memo(function TabEUsulan({
  kategori = "purna",
}: TabEUsulanProps) {
  const { formData, updateField } = useFormStore();
  const { handleTabToPrev } = useTabNavigation();

  // Removed local formatCurrencyDisplay, using utils

  // Calculate Max Duration based on Age, Category, and Segmentation
  const segmentasi = formData.segmentasi;
  const { maxDuration, currentAge, limitYears, ageLimitLabel } = useMemo(() => {
    const birthDateStr = formData.tgl_lahir_pemohon;
    const age = birthDateStr ? calculateAge(birthDateStr) : 0;

    // Determine limit based on category and segmentation
    // Prapurna default 20 tahun, KECUALI ASABRI → 15 tahun
    const isPrapurna = kategori === "prapurna";
    const isPrapurnaAsabri = isPrapurna && segmentasi === "asabri";
    const limitYears = isPrapurna && !isPrapurnaAsabri ? 20 : 15;
    const limitMonths = limitYears * 12;

    let maxMonthsByAge = 0;

    // Batas usia: 74 tahun 10 bulan untuk Purna/Prapurna, 75 tahun untuk Aktif
    const isAktif = kategori === "aktif";
    const ageLimitLabel = isAktif ? "75 tahun" : "74 tahun 10 bulan";

    if (birthDateStr) {
      const birthDate = new Date(birthDateStr);

      let ageLimit: Date;
      if (isAktif) {
        // Aktif: batas usia 75 tahun
        ageLimit = new Date(birthDate);
        ageLimit.setFullYear(birthDate.getFullYear() + 75);
      } else {
        // Purna/Prapurna: batas usia 74 tahun 10 bulan
        ageLimit = new Date(birthDate);
        ageLimit.setFullYear(birthDate.getFullYear() + 74);
        ageLimit.setMonth(birthDate.getMonth() + 10);
      }

      const today = new Date();
      const todayStr = today.toISOString().split("T")[0];
      const maxAgeStatStr = ageLimit.toISOString().split("T")[0];

      // Use months difference
      maxMonthsByAge = calculateMonthsDifference(todayStr, maxAgeStatStr);

      // Jika hari ini > hari batas usia, bulan terakhir belum penuh → kurangi 1
      if (today.getDate() > ageLimit.getDate()) {
        maxMonthsByAge--;
      }
    } else {
      // Fallback if no birthdate (though it should be there)
      maxMonthsByAge = isAktif ? (75 - age) * 12 : (74 - age) * 12 + 10;
    }

    // Calculate max allowed
    let maxAllowed = Math.min(limitMonths, maxMonthsByAge);

    // Ensure not negative
    maxAllowed = Math.max(0, maxAllowed);

    return {
      maxDuration: maxAllowed, // in months
      currentAge: age,
      limitYears: limitYears,
      ageLimitLabel: ageLimitLabel,
    };
  }, [formData.tgl_lahir_pemohon, kategori, segmentasi]);

  // Validate duration on change
  const handleDurationChange = (value: string) => {
    let months = parseInt(value) || 0;

    // Don't allow negative
    if (months < 0) months = 0;

    // Check against max duration
    if (months > maxDuration) {
      // Logic for handling exceeding max duration handled in render
    }

    updateField("usulan_jangka_waktu_bulan", months.toString());
  };

  // Auto-calculate Blokiran Fields
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    const tglPensiun = formData.tgl_pensiun_pemohon; // from Tab B

    // 1. Calculate Blokiran Prapurna (Months to Pension) - ONLY for Prapurna
    let prapurnaMonths = 0;
    if (kategori === "prapurna" && tglPensiun) {
      prapurnaMonths = calculateMonthsDifference(today, tglPensiun);
    }

    // 2. Get Manual Inputs
    // Blokiran Pindah Gaji should not be counted for aktif (and hidden in UI)
    let pindahGaji = formData.blokiran_pindah_gaji_jml || 0;
    if (kategori === "aktif") {
      pindahGaji = 0;
    }

    const wajib = formData.blokiran_wajib_jml || 0;

    // 3. Calculate Total
    const total = prapurnaMonths + pindahGaji + wajib;

    // Update if different to avoid loops
    if (formData.blokiran_prapurna_jml !== prapurnaMonths) {
      updateField("blokiran_prapurna_jml", prapurnaMonths);
    }

    if (formData.total_blokiran_jml !== total) {
      updateField("total_blokiran_jml", total);
    }
  }, [
    formData.tgl_pensiun_pemohon,
    formData.blokiran_pindah_gaji_jml,
    formData.blokiran_wajib_jml,
    // Removed output dependencies to prevent cycles:
    // formData.blokiran_prapurna_jml,
    // formData.total_blokiran_jml,
    updateField,
    kategori,
  ]);

  // Auto-calculate Total Blokiran, Max Plafond, and Take Home Pay
  const calculationResult = useMemo(() => {
    // Blokiran
    let pindahGaji = formData.blokiran_pindah_gaji_jml || 0;
    // Logic for aktif already handled above for defaults, but here for safety
    if (kategori === "aktif") pindahGaji = 0;

    const blokirWajib = formData.blokiran_wajib_jml || 0;

    // We need to read directly from formData
    const totalBlokiran =
      (formData.blokiran_prapurna_jml || 0) + pindahGaji + blokirWajib;

    return {
      totalBlokiran,
    };
  }, [
    formData.blokiran_prapurna_jml,
    formData.blokiran_pindah_gaji_jml,
    formData.blokiran_wajib_jml,
    kategori,
  ]);

  const handleCurrencyChange = (field: string, value: string) => {
    const numericValue = cleanNumberInput(value);
    updateField(field, numericValue);
  };
  // The `kategori` dependency was duplicated here, removed it.
  // The `calculationResult` useMemo already has `kategori` as a dependency.

  return (
    <div
      className="bg-white dark:bg-[#1a2c2a] rounded-xl shadow-sm border border-[#cdeae7] p-6 md:p-8"
      data-tab-content="tab-e"
    >
      <h3 className="text-lg font-bold text-[#0c1d1b] dark:text-white mb-4 flex items-center gap-2">
        <CreditCard className="w-6 h-6 text-[#00665e]" />
        Usulan Kredit
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Plafon Kredit */}
        <div>
          <label className="block text-sm font-medium text-[#0c1d1b] dark:text-gray-300 mb-1">
            Plafon Kredit
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500 text-sm">
              Rp
            </span>
            {/* First field: Shift+Tab goes to previous tab */}
            <input
              type="text"
              value={formatNumberForDisplay(formData.usulan_plafon_kredit)}
              onChange={(e) =>
                handleCurrencyChange("usulan_plafon_kredit", e.target.value)
              }
              onKeyDown={handleTabToPrev}
              placeholder="0"
              className="block w-full rounded-lg border-[#cdeae7] shadow-sm focus:border-[#00665e] focus:ring-[#00665e] sm:text-sm py-2.5 pl-10 pr-3 bg-[#f5f8f8] dark:bg-[#0f2322]/50 dark:text-white text-right"
            />
          </div>
        </div>

        {/* Jangka Waktu */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="block text-sm font-medium text-[#0c1d1b] dark:text-gray-300">
              Jangka Waktu (Bulan)
            </label>
            <span className="text-xs text-orange-600 dark:text-orange-400 font-medium">
              Max: {maxDuration} Bulan ({maxDuration / 12} Tahun)
            </span>
          </div>
          <input
            type="number"
            value={formData.usulan_jangka_waktu_bulan || ""}
            onChange={(e) => handleDurationChange(e.target.value)}
            placeholder="120"
            min="12"
            max={maxDuration}
            className={`block w-full rounded-lg shadow-sm sm:text-sm py-2.5 px-3 bg-[#f5f8f8] dark:bg-[#0f2322]/50 dark:text-white text-right [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
              parseInt(formData.usulan_jangka_waktu_bulan || "0") > maxDuration
                ? "border-red-500 ring-red-500 focus:border-red-500 focus:ring-red-500"
                : "border-[#cdeae7] focus:border-[#00665e] focus:ring-[#00665e]"
            }`}
          />
          {parseInt(formData.usulan_jangka_waktu_bulan || "0") >
            maxDuration && (
            <p className="text-xs text-red-500 mt-1">
              Melebihi batas maksimal {limitYears} tahun atau usia{" "}
              {ageLimitLabel}
              (Usia saat ini: {currentAge} th)
            </p>
          )}
        </div>

        {/* Suku Bunga */}
        <div>
          <label className="block text-sm font-medium text-[#0c1d1b] dark:text-gray-300 mb-1">
            Suku Bunga (% p.a.)
          </label>
          <input
            type="text"
            value={formData.usulan_bunga_persen || ""}
            onChange={(e) => updateField("usulan_bunga_persen", e.target.value)}
            placeholder="11"
            className="block w-full rounded-lg border-[#cdeae7] shadow-sm focus:border-[#00665e] focus:ring-[#00665e] sm:text-sm py-2.5 px-3 bg-[#f5f8f8] dark:bg-[#0f2322]/50 dark:text-white text-right"
          />
        </div>

        {/* Tujuan Kredit */}
        <div>
          <label className="block text-sm font-medium text-[#0c1d1b] dark:text-gray-300 mb-1">
            Tujuan Penggunaan Kredit
          </label>
          <select
            value={formData.tujuan_kredit || ""}
            onChange={(e) => updateField("tujuan_kredit", e.target.value)}
            className="block w-full rounded-lg border-[#cdeae7] shadow-sm focus:border-[#00665e] focus:ring-[#00665e] sm:text-sm py-2.5 px-3 bg-[#f5f8f8] dark:bg-[#0f2322]/50 dark:text-white"
          >
            <option value="">Pilih Tujuan</option>
            <option value="modal_usaha">Modal Usaha</option>
            <option value="renovasi_rumah">Renovasi Rumah</option>
            <option value="biaya_pendidikan">Biaya Pendidikan</option>
            <option value="biaya_kesehatan">Biaya Kesehatan</option>
            <option value="pembelian_kendaraan">Pembelian Kendaraan</option>
            <option value="kebutuhan_konsumtif">Kebutuhan Konsumtif</option>
            <option value="lainnya">Lainnya</option>
          </select>
        </div>

        {/* Kode Program */}
        <div>
          <label className="block text-sm font-medium text-[#0c1d1b] dark:text-gray-300 mb-1">
            Kode Program
          </label>
          <input
            type="text"
            value={formData.kode_program || ""}
            onChange={(e) => updateField("kode_program", e.target.value)}
            placeholder="Contoh: KK001"
            className="block w-full rounded-lg border-[#cdeae7] shadow-sm focus:border-[#00665e] focus:ring-[#00665e] sm:text-sm py-2.5 px-3 bg-[#f5f8f8] dark:bg-[#0f2322]/50 dark:text-white"
          />
        </div>

        {/* Biaya Provisi */}
        <div>
          <label className="block text-sm font-medium text-[#0c1d1b] dark:text-gray-300 mb-1">
            Biaya Provisi (%)
          </label>
          <div className="relative">
            <input
              type="number"
              value={formData.biaya_provisi || ""}
              onChange={(e) => updateField("biaya_provisi", e.target.value)}
              placeholder="1"
              className="block w-full rounded-lg border-[#cdeae7] shadow-sm focus:border-[#00665e] focus:ring-[#00665e] sm:text-sm py-2.5 pl-3 pr-8 bg-[#f5f8f8] dark:bg-[#0f2322]/50 dark:text-white text-right"
            />
            <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 text-sm pointer-events-none">
              %
            </span>
          </div>
        </div>

        {/* Biaya Tata Laksana - Hidden for Aktif */}
        {kategori !== "aktif" && (
          <div>
            <label className="block text-sm font-medium text-[#0c1d1b] dark:text-gray-300 mb-1">
              Biaya Tata Laksana (%)
            </label>
            <div className="relative">
              <input
                type="number"
                value={formData.biaya_tatalaksana || ""}
                onChange={(e) =>
                  updateField("biaya_tatalaksana", e.target.value)
                }
                placeholder="2"
                className="block w-full rounded-lg border-[#cdeae7] shadow-sm focus:border-[#00665e] focus:ring-[#00665e] sm:text-sm py-2.5 pl-3 pr-8 bg-[#f5f8f8] dark:bg-[#0f2322]/50 dark:text-white text-right"
              />
              <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 text-sm pointer-events-none">
                %
              </span>
            </div>
          </div>
        )}

        {/* Biaya PSJT */}
        <div>
          <label className="block text-sm font-medium text-[#0c1d1b] dark:text-gray-300 mb-1">
            Biaya PSJT (%)
          </label>
          <div className="relative">
            <input
              type="number"
              value={formData.biaya_psjt_percent || ""}
              onChange={(e) =>
                updateField("biaya_psjt_percent", e.target.value)
              }
              placeholder="0"
              className="block w-full rounded-lg border-[#cdeae7] shadow-sm focus:border-[#00665e] focus:ring-[#00665e] sm:text-sm py-2.5 pl-3 pr-8 bg-[#f5f8f8] dark:bg-[#0f2322]/50 dark:text-white text-right"
            />
            <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 text-sm pointer-events-none">
              %
            </span>
          </div>
        </div>

        {/* Biaya Administrasi */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="block text-sm font-medium text-[#0c1d1b] dark:text-gray-300">
              Biaya Administrasi
            </label>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="bebas_biaya_admin"
                checked={formData.biaya_administrasi_is_bebas || false}
                onChange={(e) => {
                  updateField("biaya_administrasi_is_bebas", e.target.checked);
                  if (e.target.checked) {
                    updateField("biaya_administrasi_nominal", "0");
                  } else {
                    updateField("biaya_administrasi_nominal", "");
                  }
                }}
                className="w-3.5 h-3.5 text-[#00665e] bg-gray-100 border-gray-300 rounded focus:ring-[#00665e] dark:focus:ring-[#00665e] dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <label
                htmlFor="bebas_biaya_admin"
                className="text-xs text-gray-500 dark:text-gray-400 select-none cursor-pointer"
              >
                Bebas Biaya
              </label>
            </div>
          </div>

          <div className="relative">
            <span
              className={`absolute inset-y-0 left-0 pl-3 flex items-center text-sm ${
                formData.biaya_administrasi_is_bebas
                  ? "text-gray-400"
                  : "text-gray-500"
              }`}
            >
              Rp
            </span>
            <input
              type="text"
              value={formatNumberForDisplay(
                formData.biaya_administrasi_nominal,
              )}
              onChange={(e) =>
                handleCurrencyChange(
                  "biaya_administrasi_nominal",
                  e.target.value,
                )
              }
              disabled={formData.biaya_administrasi_is_bebas}
              placeholder="0"
              className={`block w-full rounded-lg border-[#cdeae7] shadow-sm focus:border-[#00665e] focus:ring-[#00665e] sm:text-sm py-2.5 pl-10 pr-3 text-right ${
                formData.biaya_administrasi_is_bebas
                  ? "bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500"
                  : "bg-[#f5f8f8] dark:bg-[#0f2322]/50 dark:text-white"
              }`}
            />
          </div>
        </div>

        {/* --- DATA BLOKIRAN --- */}

        {/* 1. Header & Section Container */}
        <div className="md:col-span-2 lg:col-span-3">
          <hr className="my-2 border-[#cdeae7] dark:border-opacity-10" />
          <h3 className="text-lg font-bold text-[#0c1d1b] dark:text-white mb-4 flex items-center gap-2 mt-4">
            <Calculator className="w-6 h-6 text-[#00665e]" />
            Data Blokiran{" "}
            {kategori === "prapurna"
              ? "(Khusus Prapurna)"
              : kategori === "aktif"
                ? "(Khusus Aktif)"
                : ""}
          </h3>
        </div>

        {/* 2. Blokiran Prapurna (Hanya untuk Prapurna & Purna) */}
        {kategori !== "aktif" && (
          <div>
            <label className="block text-sm font-medium text-[#0c1d1b] dark:text-gray-300 mb-1">
              Blokiran Prapurna
            </label>
            <p className="text-xs text-gray-500 mb-2">
              Otomatis: Selisih bulan (Tgl Pensiun - Hari Ini)
            </p>
            <div className="relative">
              <input
                type="number"
                value={formData.blokiran_prapurna_jml || ""}
                readOnly
                className="block w-full rounded-lg border-[#cdeae7] shadow-sm bg-gray-100 text-gray-500 sm:text-sm py-2.5 pr-12 pl-3 text-right"
              />
              <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 text-sm pointer-events-none">
                Kali
              </span>
            </div>
          </div>
        )}

        {/* 3. Blokiran Pindah Gaji (Hanya untuk Prapurna & Purna) */}
        {kategori !== "aktif" && (
          <div>
            <label className="block text-sm font-medium text-[#0c1d1b] dark:text-gray-300 mb-1">
              Blokiran Pindah Gaji
            </label>
            <p className="text-xs text-gray-500 mb-2">
              Input manual jumlah kali angsuran
            </p>
            <div className="relative">
              <input
                type="number"
                value={formData.blokiran_pindah_gaji_jml || ""}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 0;
                  updateField("blokiran_pindah_gaji_jml", val);
                }}
                placeholder="0"
                className="block w-full rounded-lg border-[#cdeae7] shadow-sm focus:border-[#00665e] focus:ring-[#00665e] sm:text-sm py-2.5 pr-12 pl-3 bg-[#f5f8f8] dark:bg-[#0f2322]/50 dark:text-white text-right"
              />
              <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 text-sm pointer-events-none">
                Kali
              </span>
            </div>
          </div>
        )}

        {/* 4. Blokiran Wajib (Tampil untuk SEMUA kategori termasuk AKTIF) */}
        <div>
          <label className="block text-sm font-medium text-[#0c1d1b] dark:text-gray-300 mb-1">
            Blokiran Wajib
          </label>
          <p className="text-xs text-gray-500 mb-2">
            Input manual jumlah kali angsuran
          </p>
          <div className="relative">
            <input
              type="number"
              value={formData.blokiran_wajib_jml || ""}
              onChange={(e) => {
                const val = parseInt(e.target.value) || 0;
                updateField("blokiran_wajib_jml", val);
              }}
              placeholder="0"
              className="block w-full rounded-lg border-[#cdeae7] shadow-sm focus:border-[#00665e] focus:ring-[#00665e] sm:text-sm py-2.5 pr-12 pl-3 bg-[#f5f8f8] dark:bg-[#0f2322]/50 dark:text-white text-right"
            />
            <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 text-sm pointer-events-none">
              Kali
            </span>
          </div>
        </div>

        {/* 5. Total Blokiran (Tampil untuk SEMUA kategori) */}
        <div className="md:col-span-2 lg:col-span-3 bg-[#e6f4f3] dark:bg-[#00665e]/20 rounded-lg p-4 mt-2">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <label className="block text-sm font-bold text-[#0c1d1b] dark:text-gray-200">
                Total Blokiran
              </label>
              <p className="text-sm text-[#00665e] italic">
                Terbilang:{" "}
                {formData.total_blokiran_jml
                  ? terbilang(formData.total_blokiran_jml)
                  : "Nol"}
              </p>
            </div>
            <div className="relative w-full md:w-1/3">
              <input
                type="number"
                value={formData.total_blokiran_jml || 0}
                readOnly
                className="block w-full rounded-lg border-[#cdeae7] shadow-sm bg-white font-bold text-[#00665e] sm:text-lg py-2.5 pr-12 pl-3 text-right"
              />
              <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 text-sm pointer-events-none">
                Kali
              </span>
            </div>
          </div>
        </div>

        {/* Syarat Penandatanganan */}
        <div className="md:col-span-2 lg:col-span-3">
          <label className="block text-sm font-medium text-[#0c1d1b] dark:text-gray-300 mb-1">
            Syarat Penandatanganan (Manual)
          </label>
          <p className="text-xs text-gray-500 mb-2">
            Ketik <strong>@</strong> untuk menyebutkan field data (contoh:
            @Biaya Provisi).
            <br />
            Jika diisi, teks ini akan <strong>menggantikan</strong> syarat
            penandatanganan otomatis.
          </p>
          <MentionTextArea
            value={formData.syarat_penandatanganan_text || ""}
            onChange={(val) => updateField("syarat_penandatanganan_text", val)}
            options={DOCUMENT_PLACEHOLDERS}
            placeholder="Ketik syarat penandatanganan di sini... (Gunakan @ untuk insert data)"
            className="block w-full rounded-lg border-[#cdeae7] shadow-sm focus:border-[#00665e] focus:ring-[#00665e] sm:text-sm py-2.5 px-3 bg-[#f5f8f8] dark:bg-[#0f2322]/50 dark:text-white font-mono text-sm"
          />
        </div>

        {/* Syarat Pencairan */}
        <div className="md:col-span-2 lg:col-span-3">
          <label className="block text-sm font-medium text-[#0c1d1b] dark:text-gray-300 mb-1">
            Syarat Pencairan (Manual)
          </label>
          <p className="text-xs text-gray-500 mb-2">
            Ketik <strong>@</strong> untuk menyebutkan field data.
            <br />
            Jika diisi, teks ini akan <strong>menggantikan</strong> syarat
            pencairan otomatis.
          </p>
          <MentionTextArea
            value={formData.syarat_pencairan_text || ""}
            onChange={(val) => updateField("syarat_pencairan_text", val)}
            options={DOCUMENT_PLACEHOLDERS}
            placeholder="Ketik syarat pencairan di sini... (Gunakan @ untuk insert data)"
            className="block w-full rounded-lg border-[#cdeae7] shadow-sm focus:border-[#00665e] focus:ring-[#00665e] sm:text-sm py-2.5 px-3 bg-[#f5f8f8] dark:bg-[#0f2322]/50 dark:text-white font-mono text-sm"
          />
        </div>
      </div>
    </div>
  );
});
