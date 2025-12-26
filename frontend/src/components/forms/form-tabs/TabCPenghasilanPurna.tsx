"use client";

import { useFormStore } from "@/stores/form-store";

import { Banknote } from "lucide-react";

export default function TabCPenghasilanPurna() {
    const { formData, updateField } = useFormStore();

    const handleCurrencyChange = (field: string, value: string) => {
        // Remove non-numeric characters except comma
        const numericValue = value.replace(/[^0-9]/g, "");
        updateField(field, numericValue);
    };

    const formatCurrencyDisplay = (value: string | undefined) => {
        if (!value) return "";
        const numericValue = value.replace(/[^0-9]/g, "");
        if (!numericValue) return "";
        return parseInt(numericValue, 10).toLocaleString("id-ID");
    };

    return (
        <div className="bg-white dark:bg-[#1a2c2a] rounded-xl shadow-sm border border-[#cdeae7] dark:border-opacity-10 p-6 md:p-8">
            <form className="space-y-8">
                {/* Section: Data Gaji Pensiun */}
                <div>
                    <h3 className="text-lg font-bold text-[#0c1d1b] dark:text-white mb-4 flex items-center gap-2">
                        <Banknote className="w-6 h-6 text-[#00665e]" />
                        Data Penghasilan Pensiun
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Pensiun Bulan 1 */}
                        <div>
                            <label
                                htmlFor="pensiun_bulan_1_jumlah"
                                className="block text-sm font-medium text-[#0c1d1b] dark:text-gray-300 mb-1"
                            >
                                Pensiun Bulan 1
                            </label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500 text-sm">
                                    Rp
                                </span>
                                <input
                                    id="pensiun_bulan_1_jumlah"
                                    name="pensiun_bulan_1_jumlah"
                                    type="text"
                                    value={formatCurrencyDisplay(formData.pensiun_bulan_1_jumlah)}
                                    onChange={(e) => handleCurrencyChange("pensiun_bulan_1_jumlah", e.target.value)}
                                    placeholder="0"
                                    className="block w-full rounded-lg border-[#cdeae7] shadow-sm focus:border-[#00665e] focus:ring-[#00665e] sm:text-sm py-2.5 pl-10 pr-3 bg-[#f5f8f8] dark:bg-[#0f2322]/50 text-right"
                                />
                            </div>
                        </div>

                        {/* Pensiun Bulan 2 */}
                        <div>
                            <label
                                htmlFor="pensiun_bulan_2_jumlah"
                                className="block text-sm font-medium text-[#0c1d1b] dark:text-gray-300 mb-1"
                            >
                                Pensiun Bulan 2
                            </label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500 text-sm">
                                    Rp
                                </span>
                                <input
                                    id="pensiun_bulan_2_jumlah"
                                    name="pensiun_bulan_2_jumlah"
                                    type="text"
                                    value={formatCurrencyDisplay(formData.pensiun_bulan_2_jumlah)}
                                    onChange={(e) => handleCurrencyChange("pensiun_bulan_2_jumlah", e.target.value)}
                                    placeholder="0"
                                    className="block w-full rounded-lg border-[#cdeae7] shadow-sm focus:border-[#00665e] focus:ring-[#00665e] sm:text-sm py-2.5 pl-10 pr-3 bg-[#f5f8f8] dark:bg-[#0f2322]/50 text-right"
                                />
                            </div>
                        </div>

                        {/* Pensiun Bulan 3 */}
                        <div>
                            <label
                                htmlFor="pensiun_bulan_3_jumlah"
                                className="block text-sm font-medium text-[#0c1d1b] dark:text-gray-300 mb-1"
                            >
                                Pensiun Bulan 3
                            </label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500 text-sm">
                                    Rp
                                </span>
                                <input
                                    id="pensiun_bulan_3_jumlah"
                                    name="pensiun_bulan_3_jumlah"
                                    type="text"
                                    value={formatCurrencyDisplay(formData.pensiun_bulan_3_jumlah)}
                                    onChange={(e) => handleCurrencyChange("pensiun_bulan_3_jumlah", e.target.value)}
                                    placeholder="0"
                                    className="block w-full rounded-lg border-[#cdeae7] shadow-sm focus:border-[#00665e] focus:ring-[#00665e] sm:text-sm py-2.5 pl-10 pr-3 bg-[#f5f8f8] dark:bg-[#0f2322]/50 text-right"
                                />
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
                                <input
                                    id="pensiun_bulan_jumlah"
                                    name="pensiun_bulan_jumlah"
                                    type="text"
                                    value={formatCurrencyDisplay(formData.pensiun_bulan_jumlah)}
                                    onChange={(e) => handleCurrencyChange("pensiun_bulan_jumlah", e.target.value)}
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
}
