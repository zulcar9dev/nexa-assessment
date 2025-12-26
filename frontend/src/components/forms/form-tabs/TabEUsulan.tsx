"use client";

import { useFormStore } from "@/stores/form-store";
import { CreditCard } from "lucide-react";

export default function TabEUsulan() {
    const { formData, updateField } = useFormStore();

    const formatCurrencyDisplay = (value: string | undefined) => {
        if (!value) return "";
        const numericValue = value.replace(/[^0-9]/g, "");
        if (!numericValue) return "";
        return parseInt(numericValue, 10).toLocaleString("id-ID");
    };

    return (
        <div className="bg-white dark:bg-[#1a2c2a] rounded-xl shadow-sm border border-[#cdeae7] p-6 md:p-8">
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
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500 text-sm">Rp</span>
                        <input
                            type="text"
                            value={formatCurrencyDisplay(formData.usulan_plafon_kredit)}
                            onChange={(e) => updateField("usulan_plafon_kredit", e.target.value.replace(/[^0-9]/g, ""))}
                            placeholder="0"
                            className="block w-full rounded-lg border-[#cdeae7] shadow-sm focus:border-[#00665e] focus:ring-[#00665e] sm:text-sm py-2.5 pl-10 pr-3 bg-[#f5f8f8] dark:bg-[#0f2322]/50 dark:text-white text-right font-bold"
                        />
                    </div>
                </div>

                {/* Jangka Waktu */}
                <div>
                    <label className="block text-sm font-medium text-[#0c1d1b] dark:text-gray-300 mb-1">
                        Jangka Waktu (Bulan)
                    </label>
                    <input
                        type="number"
                        value={formData.usulan_jangka_waktu_bulan || ""}
                        onChange={(e) => updateField("usulan_jangka_waktu_bulan", e.target.value)}
                        placeholder="120"
                        min="12"
                        max="180"
                        className="block w-full rounded-lg border-[#cdeae7] shadow-sm focus:border-[#00665e] focus:ring-[#00665e] sm:text-sm py-2.5 px-3 bg-[#f5f8f8] dark:bg-[#0f2322]/50 dark:text-white text-right [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
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
            </div>
        </div>
    );
}
