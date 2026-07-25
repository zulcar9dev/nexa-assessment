"use client";

import { useFormStore } from "@/stores/form-store";
import { useTabNavigation } from "@/hooks/useTabNavigation";
import { formatNumberForDisplay, cleanNumberInput } from "@/lib/utils";

import { Banknote } from "lucide-react";
import React from "react";

export default React.memo(function TabCPenghasilanPurna() {
  const { formData, updateField } = useFormStore();
  const { handleTabToNext, handleTabToPrev } = useTabNavigation();

  const handleCurrencyChange = (field: string, value: string) => {
    const numericValue = cleanNumberInput(value);
    updateField(field, numericValue);
  };

  // Removed local formatCurrencyDisplay, using utils

  return (
    <div
      className="bg-white dark:bg-[#1a2c2a] rounded-xl shadow-sm border border-[#cdeae7] dark:border-opacity-10 p-6 md:p-8"
      data-tab-content="tab-c"
    >
      <form className="space-y-8">
        {/* Section: Sumber Pembayaran */}
        <div className="card p-6">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
            <Banknote className="w-6 h-6 text-primary-brand" />
            Sumber Pembayaran Pensiun
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nama Institusi */}
            <div>
              <label
                htmlFor="nama_bank_pembayaran"
                className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2"
              >
                Nama Institusi
              </label>
              <div className="relative">
                <input
                  id="nama_bank_pembayaran"
                  name="nama_bank_pembayaran"
                  type="text"
                  value={formData.nama_bank_pembayaran || ""}
                  onChange={(e) =>
                    updateField("nama_bank_pembayaran", e.target.value)
                  }
                  onKeyDown={handleTabToPrev}
                  placeholder="e.g. Institusi A"
                  className="block w-full rounded-lg border-[#cdeae7] shadow-sm focus:border-primary-brand focus:ring-primary-brand sm:text-sm py-2.5 px-3 bg-[#f5f8f8] dark:bg-[#0f2322]/50"
                />
              </div>
            </div>

            {/* No Rekening Payroll */}
            <div>
              <label
                htmlFor="payroll_no_rek"
                className="block text-sm font-medium text-[#0c1d1b] dark:text-gray-300 mb-1"
              >
                No. Rekening Payroll
              </label>
              <input
                id="payroll_no_rek"
                name="payroll_no_rek"
                type="text"
                value={formData.payroll_no_rek || ""}
                onChange={(e) => updateField("payroll_no_rek", e.target.value)}
                placeholder="e.g. 01502060066122"
                className="block w-full rounded-lg border-[#cdeae7] shadow-sm focus:border-primary-brand focus:ring-primary-brand sm:text-sm py-2.5 px-3 bg-[#f5f8f8] dark:bg-[#0f2322]/50 font-mono"
              />
            </div>
          </div>
        </div>

        <hr className="border-[#cdeae7] dark:border-opacity-10" />

        {/* Section: Metode Perhitungan Penghasilan */}
        <div>
          <h3 className="text-lg font-bold text-[#0c1d1b] dark:text-white mb-4 flex items-center gap-2">
            <Banknote className="w-6 h-6 text-primary-brand" />
            Metode Perhitungan Penghasilan
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <label
              className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                (formData.type_b_penghasilan_mode || "minimum") === "minimum"
                  ? "border-primary-brand bg-primary-brand/10"
                  : "border-[#cdeae7] dark:border-opacity-30 hover:border-primary-brand/50"
              }`}
            >
              <input
                type="radio"
                name="type_b_penghasilan_mode"
                value="minimum"
                checked={
                  (formData.type_b_penghasilan_mode || "minimum") === "minimum"
                }
                onChange={() =>
                  updateField("type_b_penghasilan_mode", "minimum")
                }
                className="w-4 h-4 text-primary-brand focus:ring-primary-brand"
              />
              <div>
                <span className="font-medium text-[#0c1d1b] dark:text-white">
                  Nilai Minimum
                </span>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Otomatis ambil nilai terkecil dari 3 bulan
                </p>
              </div>
            </label>
            <label
              className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                formData.type_b_penghasilan_mode === "langsung"
                  ? "border-primary-brand bg-primary-brand/10"
                  : "border-[#cdeae7] dark:border-opacity-30 hover:border-primary-brand/50"
              }`}
            >
              <input
                type="radio"
                name="type_b_penghasilan_mode"
                value="langsung"
                checked={formData.type_b_penghasilan_mode === "langsung"}
                onChange={() =>
                  updateField("type_b_penghasilan_mode", "langsung")
                }
                className="w-4 h-4 text-primary-brand focus:ring-primary-brand"
              />
              <div>
                <span className="font-medium text-[#0c1d1b] dark:text-white">
                  Input Langsung
                </span>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Gunakan nilai dari Hak Pensiun Bulanan
                </p>
              </div>
            </label>
          </div>
        </div>

        <hr className="border-[#cdeae7] dark:border-opacity-10" />

        {/* Section: Data Gaji Pensiun */}
        <div>
          <h3 className="text-lg font-bold text-[#0c1d1b] dark:text-white mb-4 flex items-center gap-2">
            <Banknote className="w-6 h-6 text-primary-brand" />
            Data Penghasilan Pensiun
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Pensiun Bulan 1 */}
            <div>
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="pensiun_bulan_1_jumlah"
                  className="block text-sm font-medium text-[#0c1d1b] dark:text-gray-300"
                >
                  Pensiun Bulan 1
                </label>
                <input
                  type="text"
                  value={formData.pensiun_bulan_1_nama || ""}
                  onChange={(e) =>
                    updateField("pensiun_bulan_1_nama", e.target.value)
                  }
                  placeholder="Nama Bulan"
                  className="block w-full rounded-lg border-[#cdeae7] shadow-sm focus:border-primary-brand focus:ring-primary-brand sm:text-sm py-2 px-3 bg-[#f5f8f8] dark:bg-[#0f2322]/50 mb-1"
                />
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500 text-sm">
                    Rp
                  </span>
                  <input
                    id="pensiun_bulan_1_jumlah"
                    name="pensiun_bulan_1_jumlah"
                    type="text"
                    value={formatNumberForDisplay(
                      formData.pensiun_bulan_1_jumlah,
                    )}
                    onChange={(e) =>
                      handleCurrencyChange(
                        "pensiun_bulan_1_jumlah",
                        e.target.value,
                      )
                    }
                    placeholder="0"
                    className="block w-full rounded-lg border-[#cdeae7] shadow-sm focus:border-primary-brand focus:ring-primary-brand sm:text-sm py-2.5 pl-10 pr-3 bg-[#f5f8f8] dark:bg-[#0f2322]/50 text-right"
                  />
                </div>
              </div>
            </div>

            {/* Pensiun Bulan 2 */}
            <div>
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="pensiun_bulan_2_jumlah"
                  className="block text-sm font-medium text-[#0c1d1b] dark:text-gray-300"
                >
                  Pensiun Bulan 2
                </label>
                <input
                  type="text"
                  value={formData.pensiun_bulan_2_nama || ""}
                  onChange={(e) =>
                    updateField("pensiun_bulan_2_nama", e.target.value)
                  }
                  placeholder="Nama Bulan"
                  className="block w-full rounded-lg border-[#cdeae7] shadow-sm focus:border-primary-brand focus:ring-primary-brand sm:text-sm py-2 px-3 bg-[#f5f8f8] dark:bg-[#0f2322]/50 mb-1"
                />
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500 text-sm">
                    Rp
                  </span>
                  <input
                    id="pensiun_bulan_2_jumlah"
                    name="pensiun_bulan_2_jumlah"
                    type="text"
                    value={formatNumberForDisplay(
                      formData.pensiun_bulan_2_jumlah,
                    )}
                    onChange={(e) =>
                      handleCurrencyChange(
                        "pensiun_bulan_2_jumlah",
                        e.target.value,
                      )
                    }
                    placeholder="0"
                    className="block w-full rounded-lg border-[#cdeae7] shadow-sm focus:border-primary-brand focus:ring-primary-brand sm:text-sm py-2.5 pl-10 pr-3 bg-[#f5f8f8] dark:bg-[#0f2322]/50 text-right"
                  />
                </div>
              </div>
            </div>

            {/* Pensiun Bulan 3 */}
            <div>
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="pensiun_bulan_3_jumlah"
                  className="block text-sm font-medium text-[#0c1d1b] dark:text-gray-300"
                >
                  Pensiun Bulan 3
                </label>
                <input
                  type="text"
                  value={formData.pensiun_bulan_3_nama || ""}
                  onChange={(e) =>
                    updateField("pensiun_bulan_3_nama", e.target.value)
                  }
                  placeholder="Nama Bulan"
                  className="block w-full rounded-lg border-[#cdeae7] shadow-sm focus:border-primary-brand focus:ring-primary-brand sm:text-sm py-2 px-3 bg-[#f5f8f8] dark:bg-[#0f2322]/50 mb-1"
                />
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500 text-sm">
                    Rp
                  </span>
                  <input
                    id="pensiun_bulan_3_jumlah"
                    name="pensiun_bulan_3_jumlah"
                    type="text"
                    value={formatNumberForDisplay(
                      formData.pensiun_bulan_3_jumlah,
                    )}
                    onChange={(e) =>
                      handleCurrencyChange(
                        "pensiun_bulan_3_jumlah",
                        e.target.value,
                      )
                    }
                    placeholder="0"
                    className="block w-full rounded-lg border-[#cdeae7] shadow-sm focus:border-primary-brand focus:ring-primary-brand sm:text-sm py-2.5 pl-10 pr-3 bg-[#f5f8f8] dark:bg-[#0f2322]/50 text-right"
                  />
                </div>
              </div>
            </div>

            {/* Hak Pensiun Bulanan */}
            <div>
              <label
                htmlFor="pensiun_bulan_jumlah"
                className={`block text-sm font-medium mb-1 ${
                  formData.type_b_penghasilan_mode === "langsung"
                    ? "text-primary-brand dark:text-[#00a89d]"
                    : "text-[#0c1d1b] dark:text-gray-300"
                }`}
              >
                Hak Pensiun Bulanan
                {formData.type_b_penghasilan_mode === "langsung" && (
                  <span className="ml-2 text-xs bg-primary-brand text-white px-2 py-0.5 rounded">
                    Digunakan
                  </span>
                )}
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500 text-sm">
                  Rp
                </span>
                {/* Last field: Tab goes to next tab */}
                <input
                  id="pensiun_bulan_jumlah"
                  name="pensiun_bulan_jumlah"
                  type="text"
                  value={formatNumberForDisplay(formData.pensiun_bulan_jumlah)}
                  onChange={(e) =>
                    handleCurrencyChange("pensiun_bulan_jumlah", e.target.value)
                  }
                  onKeyDown={handleTabToNext}
                  placeholder="0"
                  className={`block w-full rounded-lg shadow-sm focus:border-primary-brand focus:ring-primary-brand sm:text-sm py-2.5 pl-10 pr-3 text-right font-bold ${
                    formData.type_b_penghasilan_mode === "langsung"
                      ? "border-primary-brand bg-primary-brand/5 dark:bg-primary-brand/20"
                      : "border-[#cdeae7] bg-[#f5f8f8] dark:bg-[#0f2322]/50"
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Conditional Info Box */}
          {formData.type_b_penghasilan_mode === "langsung" ? (
            <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg mt-6 border border-amber-200 dark:border-amber-700">
              <p className="text-sm text-amber-700 dark:text-amber-300">
                <strong>Mode Input Langsung:</strong> Penghasilan yang digunakan
                untuk perhitungan DSR diambil dari nilai{" "}
                <strong>Hak Pensiun Bulanan</strong> yang Anda input.
              </p>
            </div>
          ) : (
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mt-6">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                <strong>Mode Nilai Minimum:</strong> Penghasilan yang digunakan
                untuk perhitungan DSR adalah nilai <strong>minimum</strong> dari
                3 bulan terakhir.
              </p>
            </div>
          )}
        </div>
      </form>
    </div>
  );
});
