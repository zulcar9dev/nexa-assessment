"use client";

import { useFormStore } from "@/stores/form-store";

interface DSRCalculatorProps {
    dsrValue: number;
    limit?: number;
    penghasilan?: number;
    totalAngsuran?: number;
}

export default function DSRCalculator({
    dsrValue,
    limit = 90,
    penghasilan = 0,
    totalAngsuran = 0
}: DSRCalculatorProps) {
    const isValid = dsrValue <= limit;
    const percentage = Math.min(dsrValue, 100);

    const formatRupiah = (value: number) => {
        if (value >= 1000000) {
            return `Rp ${(value / 1000000).toFixed(1)}jt`;
        }
        return `Rp ${value.toLocaleString("id-ID")}`;
    };

    return (
        <div className="bg-white dark:bg-[#1a2c2a] rounded-xl shadow-sm border border-[#cdeae7] p-6 flex flex-col md:flex-row items-center gap-6">
            <div className="flex items-center justify-center p-3 bg-blue-50 rounded-full text-blue-600">
                <span className="material-symbols-outlined text-3xl">calculate</span>
            </div>

            <div className="flex-1 w-full">
                <div className="flex justify-between items-end mb-2">
                    <div>
                        <h4 className="font-bold text-[#0c1d1b] dark:text-white">DSR Calculator</h4>
                        <p className="text-xs text-[#45a199]">Ratio of monthly debt payments to income.</p>
                    </div>
                    <div className="text-right">
                        <span className={`text-2xl font-black ${isValid ? "text-[#00665e]" : "text-red-500"}`}>
                            {dsrValue.toFixed(1)}%
                        </span>
                        <span className="text-sm font-medium text-[#45a199]"> / {limit}% Limit</span>
                    </div>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                        className={`h-3 rounded-full transition-all duration-500 relative ${isValid ? "bg-[#00665e]" : "bg-red-500"
                            }`}
                        style={{ width: `${percentage}%` }}
                    >
                        <div className="absolute -right-1 top-1/2 -translate-y-1/2 size-4 bg-white border-2 border-current rounded-full shadow" />
                    </div>
                </div>

                <div className="flex justify-between mt-1">
                    <span className="text-xs font-bold text-[#00665e]">Safe (Aman)</span>
                    <span className="text-xs text-red-500">High Risk</span>
                </div>
            </div>

            <div className="w-px h-12 bg-[#cdeae7] hidden md:block" />

            <div className="flex flex-col gap-1 min-w-[140px]">
                <div className="flex justify-between text-sm">
                    <span className="text-[#45a199]">Income:</span>
                    <span className="font-bold">{formatRupiah(penghasilan)}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-[#45a199]">Debt:</span>
                    <span className="font-bold">{formatRupiah(totalAngsuran)}</span>
                </div>
            </div>
        </div>
    );
}
