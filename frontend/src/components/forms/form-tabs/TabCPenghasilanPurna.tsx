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
        <div className="bg-white dark:bg-[#1a2c2a] rounded-xl shadow-sm border border-[#cdeae7] dark:border-opacity-10 p-6 md:p-8" data-tab-content="tab-c">
            <form className="space-y-8">
                {/* Section: Bank Pembayaran */}
                <div>
                    <h3 className="text-lg font-bold text-[#0c1d1b] dark:text-white mb-4 flex items-center gap-2">
                        <Banknote className="w-6 h-6 text-[#00665e]" />
                        Bank Pembayaran Pensiun
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Nama Bank */}
                        <div>
                            <label
                                htmlFor="nama_bank_pembayaran"
                                className="block text-sm font-medium text-[#0c1d1b] dark:text-gray-300 mb-1"
                            >
                                Nama Bank
                            </label>
                            {/* First field: Shift+Tab goes to previous tab */}
                            <input
                                id="nama_bank_pembayaran"
                                name="nama_bank_pembayaran"
                                type="text"
                                value={formData.nama_bank_pembayaran || ""}
                                onChange={(e) => updateField("nama_bank_pembayaran", e.target.value)}
                                onKeyDown={handleTabToPrev}
                                placeholder="e.g. Bank Sulutgo"
                                className="block w-full rounded-lg border-[#cdeae7] shadow-sm focus:border-[#00665e] focus:ring-[#00665e] sm:text-sm py-2.5 px-3 bg-[#f5f8f8] dark:bg-[#0f2322]/50"
                            />
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
                                className="block w-full rounded-lg border-[#cdeae7] shadow-sm focus:border-[#00665e] focus:ring-[#00665e] sm:text-sm py-2.5 px-3 bg-[#f5f8f8] dark:bg-[#0f2322]/50 font-mono"
                            />
                        </div>
                    </div>
                </div>

                <hr className="border-[#cdeae7] dark:border-opacity-10" />

                {/* Section: Data Gaji Pensiun */}
                <div>
                    <h3 className="text-lg font-bold text-[#0c1d1b] dark:text-white mb-4 flex items-center gap-2">
                        <Banknote className="w-6 h-6 text-[#00665e]" />
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
                                    onChange={(e) => updateField("pensiun_bulan_1_nama", e.target.value)}
                                    placeholder="Nama Bulan"
                                    className="block w-full rounded-lg border-[#cdeae7] shadow-sm focus:border-[#00665e] focus:ring-[#00665e] sm:text-sm py-2 px-3 bg-[#f5f8f8] dark:bg-[#0f2322]/50 mb-1"
                                />
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500 text-sm">
                                        Rp
                                    </span>
                                    <input
                                        id="pensiun_bulan_1_jumlah"
                                        name="pensiun_bulan_1_jumlah"
                                        type="text"
                                        value={formatNumberForDisplay(formData.pensiun_bulan_1_jumlah)}
                                        onChange={(e) => handleCurrencyChange("pensiun_bulan_1_jumlah", e.target.value)}
                                        placeholder="0"
                                        className="block w-full rounded-lg border-[#cdeae7] shadow-sm focus:border-[#00665e] focus:ring-[#00665e] sm:text-sm py-2.5 pl-10 pr-3 bg-[#f5f8f8] dark:bg-[#0f2322]/50 text-right"
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
                                    onChange={(e) => updateField("pensiun_bulan_2_nama", e.target.value)}
                                    placeholder="Nama Bulan"
                                    className="block w-full rounded-lg border-[#cdeae7] shadow-sm focus:border-[#00665e] focus:ring-[#00665e] sm:text-sm py-2 px-3 bg-[#f5f8f8] dark:bg-[#0f2322]/50 mb-1"
                                />
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500 text-sm">
                                        Rp
                                    </span>
                                    <input
                                        id="pensiun_bulan_2_jumlah"
                                        name="pensiun_bulan_2_jumlah"
                                        type="text"
                                        value={formatNumberForDisplay(formData.pensiun_bulan_2_jumlah)}
                                        onChange={(e) => handleCurrencyChange("pensiun_bulan_2_jumlah", e.target.value)}
                                        placeholder="0"
                                        className="block w-full rounded-lg border-[#cdeae7] shadow-sm focus:border-[#00665e] focus:ring-[#00665e] sm:text-sm py-2.5 pl-10 pr-3 bg-[#f5f8f8] dark:bg-[#0f2322]/50 text-right"
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
                                    onChange={(e) => updateField("pensiun_bulan_3_nama", e.target.value)}
                                    placeholder="Nama Bulan"
                                    className="block w-full rounded-lg border-[#cdeae7] shadow-sm focus:border-[#00665e] focus:ring-[#00665e] sm:text-sm py-2 px-3 bg-[#f5f8f8] dark:bg-[#0f2322]/50 mb-1"
                                />
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500 text-sm">
                                        Rp
                                    </span>
                                    <input
                                        id="pensiun_bulan_3_jumlah"
                                        name="pensiun_bulan_3_jumlah"
                                        type="text"
                                        value={formatNumberForDisplay(formData.pensiun_bulan_3_jumlah)}
                                        onChange={(e) => handleCurrencyChange("pensiun_bulan_3_jumlah", e.target.value)}
                                        placeholder="0"
                                        className="block w-full rounded-lg border-[#cdeae7] shadow-sm focus:border-[#00665e] focus:ring-[#00665e] sm:text-sm py-2.5 pl-10 pr-3 bg-[#f5f8f8] dark:bg-[#0f2322]/50 text-right"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Hak Pensiun Bulanan */}
                        <div>
                            <label
                                htmlFor="pensiun_bulan_jumlah"
                                className="block text-sm font-medium text-[#0c1d1b] dark:text-gray-300 mb-1"
                            >
                                Hak Pensiun Bulanan
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
                                    onChange={(e) => handleCurrencyChange("pensiun_bulan_jumlah", e.target.value)}
                                    onKeyDown={handleTabToNext}
                                    placeholder="0"
                                    className="block w-full rounded-lg border-[#cdeae7] shadow-sm focus:border-[#00665e] focus:ring-[#00665e] sm:text-sm py-2.5 pl-10 pr-3 bg-[#f5f8f8] dark:bg-[#0f2322]/50 text-right font-bold"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mt-6">
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                            <strong>Catatan:</strong> Penghasilan yang digunakan untuk perhitungan DSR adalah nilai <strong>minimum</strong> dari 3 bulan terakhir.
                        </p>
                    </div>
                </div>
            </form>
        </div>
    );
});
