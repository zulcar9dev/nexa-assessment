"use client";

import { useFormStore } from "@/stores/form-store";
import { useTabNavigation } from "@/hooks/useTabNavigation";
import { formatNumberForDisplay, cleanNumberInput } from "@/lib/utils";

import { Banknote, Landmark } from "lucide-react";
import React from "react";

export default React.memo(function TabCPenghasilan({ kategori }: { kategori?: string }) {
    const { formData, updateField } = useFormStore();
    const { handleTabToNext, handleTabToPrev } = useTabNavigation();

    const handleCurrencyChange = (field: string, value: string) => {
        const numericValue = cleanNumberInput(value);
        updateField(field, numericValue);
    };

    // Removed local formatCurrencyDisplay, using utils

    return (
        <div className="bg-white dark:bg-[#1a2c2a] rounded-xl shadow-sm border border-[#cdeae7] dark:border-opacity-10 p-6 md:p-8" data-tab-content="tab-c">
            <form className="space-y-8">
                {/* Section: Data Gaji */}
                <div>
                    <h3 className="text-lg font-bold text-[#0c1d1b] dark:text-white mb-4 flex items-center gap-2">
                        <Banknote className="w-6 h-6 text-[#00665e]" />
                        Data Gaji/Penghasilan (3 Bulan Terakhir)
                    </h3>

                    <div className="mb-6">
                        <label
                            htmlFor="nama_bank_pembayaran"
                            className="block text-sm font-medium text-[#0c1d1b] dark:text-gray-300 mb-1"
                        >
                            Nama Bank Pembayaran Gaji/Penghasilan
                        </label>
                        {/* First field: Shift+Tab goes to previous tab */}
                        <input
                            id="nama_bank_pembayaran"
                            name="nama_bank_pembayaran"
                            type="text"
                            value={formData.nama_bank_pembayaran || ""}
                            onChange={(e) => updateField("nama_bank_pembayaran", e.target.value)}
                            onKeyDown={handleTabToPrev}
                            placeholder="e.g. Bank Sulutgo, Bank Mandiri Taspen, Bank BSI"
                            className="block w-full rounded-lg border-[#cdeae7] shadow-sm focus:border-[#00665e] focus:ring-[#00665e] sm:text-sm py-2.5 px-3 bg-[#f5f8f8] dark:bg-[#0f2322]/50"
                        />
                    </div>

                    <div className="mb-6">
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
                            className="block w-full rounded-lg border-[#cdeae7] shadow-sm focus:border-[#00665e] focus:ring-[#00665e] sm:text-sm py-2.5 px-3 bg-[#f5f8f8] dark:bg-[#0f2322]/50 font-mono"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Gaji Bulan 1 */}
                        <div>
                            <div className="flex flex-col gap-2">
                                <label
                                    htmlFor="gaji_bulan_1_jumlah"
                                    className="block text-sm font-medium text-[#0c1d1b] dark:text-gray-300"
                                >
                                    Gaji Bulan 1
                                </label>
                                <input
                                    type="text"
                                    value={formData.gaji_bulan_1_nama || ""}
                                    onChange={(e) => updateField("gaji_bulan_1_nama", e.target.value)}
                                    placeholder="Nama Bulan"
                                    className="block w-full rounded-lg border-[#cdeae7] shadow-sm focus:border-[#00665e] focus:ring-[#00665e] sm:text-sm py-2 px-3 bg-[#f5f8f8] dark:bg-[#0f2322]/50 mb-1"
                                />
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500 text-sm">
                                        Rp
                                    </span>
                                    <input
                                        id="gaji_bulan_1_jumlah"
                                        name="gaji_bulan_1_jumlah"
                                        type="text"
                                        value={formatNumberForDisplay(formData.gaji_bulan_1_jumlah)}
                                        onChange={(e) => handleCurrencyChange("gaji_bulan_1_jumlah", e.target.value)}
                                        placeholder="0"
                                        className="block w-full rounded-lg border-[#cdeae7] shadow-sm focus:border-[#00665e] focus:ring-[#00665e] sm:text-sm py-2.5 pl-10 pr-3 bg-[#f5f8f8] dark:bg-[#0f2322]/50 text-right"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Gaji Bulan 2 */}
                        <div>
                            <div className="flex flex-col gap-2">
                                <label
                                    htmlFor="gaji_bulan_2_jumlah"
                                    className="block text-sm font-medium text-[#0c1d1b] dark:text-gray-300"
                                >
                                    Gaji Bulan 2
                                </label>
                                <input
                                    type="text"
                                    value={formData.gaji_bulan_2_nama || ""}
                                    onChange={(e) => updateField("gaji_bulan_2_nama", e.target.value)}
                                    placeholder="Nama Bulan"
                                    className="block w-full rounded-lg border-[#cdeae7] shadow-sm focus:border-[#00665e] focus:ring-[#00665e] sm:text-sm py-2 px-3 bg-[#f5f8f8] dark:bg-[#0f2322]/50 mb-1"
                                />
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500 text-sm">
                                        Rp
                                    </span>
                                    <input
                                        id="gaji_bulan_2_jumlah"
                                        name="gaji_bulan_2_jumlah"
                                        type="text"
                                        value={formatNumberForDisplay(formData.gaji_bulan_2_jumlah)}
                                        onChange={(e) => handleCurrencyChange("gaji_bulan_2_jumlah", e.target.value)}
                                        placeholder="0"
                                        className="block w-full rounded-lg border-[#cdeae7] shadow-sm focus:border-[#00665e] focus:ring-[#00665e] sm:text-sm py-2.5 pl-10 pr-3 bg-[#f5f8f8] dark:bg-[#0f2322]/50 text-right"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Gaji Bulan 3 */}
                        <div>
                            <div className="flex flex-col gap-2">
                                <label
                                    htmlFor="gaji_bulan_3_jumlah"
                                    className="block text-sm font-medium text-[#0c1d1b] dark:text-gray-300"
                                >
                                    Gaji Bulan 3
                                </label>
                                <input
                                    type="text"
                                    value={formData.gaji_bulan_3_nama || ""}
                                    onChange={(e) => updateField("gaji_bulan_3_nama", e.target.value)}
                                    placeholder="Nama Bulan"
                                    className="block w-full rounded-lg border-[#cdeae7] shadow-sm focus:border-[#00665e] focus:ring-[#00665e] sm:text-sm py-2 px-3 bg-[#f5f8f8] dark:bg-[#0f2322]/50 mb-1"
                                />
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500 text-sm">
                                        Rp
                                    </span>
                                    <input
                                        id="gaji_bulan_3_jumlah"
                                        name="gaji_bulan_3_jumlah"
                                        type="text"
                                        value={formatNumberForDisplay(formData.gaji_bulan_3_jumlah)}
                                        onChange={(e) => handleCurrencyChange("gaji_bulan_3_jumlah", e.target.value)}
                                        placeholder="0"
                                        className="block w-full rounded-lg border-[#cdeae7] shadow-sm focus:border-[#00665e] focus:ring-[#00665e] sm:text-sm py-2.5 pl-10 pr-3 bg-[#f5f8f8] dark:bg-[#0f2322]/50 text-right"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tukin & Uang Makan (Hanya untuk Fleksi Aktif) */}
                    {formData.jenis_pengajuan === "fleksi_aktif" && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-[#e0f0ef] dark:border-gray-700">
                            {/* Tukin */}
                            <div>
                                <label
                                    htmlFor="tukin"
                                    className="block text-sm font-medium text-[#0c1d1b] dark:text-gray-300 mb-1"
                                >
                                    Tunjangan Kinerja (Tukin)
                                </label>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500 text-sm">
                                        Rp
                                    </span>
                                    <input
                                        id="tukin"
                                        name="tukin"
                                        type="text"
                                        value={formatNumberForDisplay(formData.tukin)}
                                        onChange={(e) => handleCurrencyChange("tukin", e.target.value)}
                                        placeholder="0"
                                        className="block w-full rounded-lg border-[#cdeae7] shadow-sm focus:border-[#00665e] focus:ring-[#00665e] sm:text-sm py-2.5 pl-10 pr-3 bg-[#f5f8f8] dark:bg-[#0f2322]/50 text-right"
                                    />
                                </div>
                            </div>

                            {/* Uang Makan */}
                            <div>
                                <label
                                    htmlFor="uang_makan"
                                    className="block text-sm font-medium text-[#0c1d1b] dark:text-gray-300 mb-1"
                                >
                                    Uang Makan
                                </label>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500 text-sm">
                                        Rp
                                    </span>
                                    <input
                                        id="uang_makan"
                                        name="uang_makan"
                                        type="text"
                                        value={formatNumberForDisplay(formData.uang_makan)}
                                        onChange={(e) => handleCurrencyChange("uang_makan", e.target.value)}
                                        placeholder="0"
                                        className="block w-full rounded-lg border-[#cdeae7] shadow-sm focus:border-[#00665e] focus:ring-[#00665e] sm:text-sm py-2.5 pl-10 pr-3 bg-[#f5f8f8] dark:bg-[#0f2322]/50 text-right"
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <hr className="border-[#cdeae7] dark:border-opacity-10" />

                {/* Section: Estimasi Hak Pensiun */}
                {/* Section: Estimasi Hak Pensiun - Hidden for Aktif */}
                {kategori !== "aktif" && (
                    <div>
                        <h3 className="text-lg font-bold text-[#0c1d1b] dark:text-white mb-4 flex items-center gap-2">
                            <Landmark className="w-6 h-6 text-[#00665e]" />
                            Estimasi Hak Pensiun
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label
                                    htmlFor="estimasi_hak_pensiun"
                                    className="block text-sm font-medium text-[#0c1d1b] dark:text-gray-300 mb-1"
                                >
                                    Estimasi Hak Pensiun Bulanan
                                </label>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500 text-sm">
                                        Rp
                                    </span>
                                    <input
                                        id="estimasi_hak_pensiun"
                                        name="estimasi_hak_pensiun"
                                        type="text"
                                        value={formatNumberForDisplay(formData.estimasi_hak_pensiun)}
                                        onChange={(e) => handleCurrencyChange("estimasi_hak_pensiun", e.target.value)}
                                        placeholder="0"
                                        className="block w-full rounded-lg border-[#cdeae7] shadow-sm focus:border-[#00665e] focus:ring-[#00665e] sm:text-sm py-2.5 pl-10 pr-3 bg-[#f5f8f8] dark:bg-[#0f2322]/50 text-right font-bold"
                                    />
                                </div>
                                <p className="mt-1 text-xs text-[#45a199]">
                                    Estimasi ini digunakan untuk perhitungan DSR
                                </p>
                            </div>

                            <div>
                                <label
                                    htmlFor="estimasi_tht"
                                    className="block text-sm font-medium text-[#0c1d1b] dark:text-gray-300 mb-1"
                                >
                                    Estimasi Tunjangan Hari Tua (THT)
                                </label>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500 text-sm">
                                        Rp
                                    </span>
                                    <input
                                        id="estimasi_tht"
                                        name="estimasi_tht"
                                        type="text"
                                        value={formatNumberForDisplay(formData.estimasi_tht)}
                                        onChange={(e) => handleCurrencyChange("estimasi_tht", e.target.value)}
                                        onKeyDown={handleTabToNext}
                                        placeholder="0"
                                        className="block w-full rounded-lg border-[#cdeae7] shadow-sm focus:border-[#00665e] focus:ring-[#00665e] sm:text-sm py-2.5 pl-10 pr-3 bg-[#f5f8f8] dark:bg-[#0f2322]/50 text-right font-bold"
                                    />
                                </div>
                            </div>

                            <div className="bg-[#e6f4f3] dark:bg-[#00665e]/20 rounded-lg p-4">
                                <p className="text-sm text-[#45a199] mb-2">Info Penting</p>
                                <p className="text-sm text-[#0c1d1b] dark:text-gray-300">
                                    Estimasi hak pensiun diperoleh dari data TASPEN/ASABRI atau
                                    perhitungan 75% x gaji pokok terakhir.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </form>
        </div>
    );
});
