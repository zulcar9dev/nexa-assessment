"use client";

import { useFormStore } from "@/stores/form-store";
import { useTabNavigation } from "@/hooks/useTabNavigation";
import { formatNumberForDisplay, cleanNumberInput } from "@/lib/utils";

import { Banknote, Landmark, Plus, Trash2 } from "lucide-react";
import React from "react";

export default React.memo(function TabCPenghasilan({ kategori }: { kategori?: string }) {
    const { formData, updateField, setFormData } = useFormStore();
    const { handleTabToNext, handleTabToPrev } = useTabNavigation();

    const handleCurrencyChange = (field: string, value: string) => {
        const numericValue = cleanNumberInput(value);
        updateField(field, numericValue);
    };

    // Helper for Additional Incomes
    const addAdditionalIncome = () => {
        const currentIncomes = formData.additional_incomes || [];
        setFormData({
            additional_incomes: [
                ...currentIncomes,
            {
                label: "",
                bulan_1_nama: formData.gaji_bulan_1_nama || "",
                bulan_1: "",
                bulan_2_nama: formData.gaji_bulan_2_nama || "",
                bulan_2: "",
                bulan_3_nama: formData.gaji_bulan_3_nama || "",
                bulan_3: ""
            },
            ],
        });
    };

    const removeAdditionalIncome = (index: number) => {
        const currentIncomes = formData.additional_incomes || [];
        const newIncomes = [...currentIncomes];
        newIncomes.splice(index, 1);
        setFormData({ additional_incomes: newIncomes });
    };

    const updateAdditionalIncome = (index: number, field: string, value: string | boolean) => {
        const currentIncomes = formData.additional_incomes || [];
        const newIncomes = [...currentIncomes];
        
        if (field === "label" || field.endsWith("_nama")) {
            newIncomes[index] = { ...newIncomes[index], [field]: value };
        } else if (field.endsWith("_checked")) {
            newIncomes[index] = { ...newIncomes[index], [field]: value };
        } else {
             newIncomes[index] = { ...newIncomes[index], [field]: cleanNumberInput(String(value)) };
        }
        
        setFormData({ additional_incomes: newIncomes });
    };


    // Removed local formatCurrencyDisplay, using utils

    return (
        <div className="bg-white dark:bg-[#1a2c2a] rounded-xl shadow-sm border border-[#cdeae7] dark:border-opacity-10 p-6 md:p-8" data-tab-content="tab-c">
            <form className="space-y-8">
                {/* Section: Data Gaji */}
                <div>
                    <h3 className="text-lg font-bold text-[#0c1d1b] dark:text-white mb-4 flex items-center gap-2">
                        <Banknote className="w-6 h-6 text-primary-brand" />
                        Data Gaji/Penghasilan (3 Bulan Terakhir)
                    </h3>

                    <div className="mb-6">
                        <label
                            htmlFor="nama_bank_pembayaran"
                            className="block text-sm font-medium text-[#0c1d1b] dark:text-gray-300 mb-1"
                        >
                            Sumber Pembayaran Gaji/Penghasilan
                        </label>
                        {/* First field: Shift+Tab goes to previous tab */}
                        <input
                            id="nama_bank_pembayaran"
                            name="nama_bank_pembayaran"
                            type="text"
                            value={formData.nama_bank_pembayaran || ""}
                            onChange={(e) => updateField("nama_bank_pembayaran", e.target.value)}
                            onKeyDown={handleTabToPrev}
                            placeholder="e.g. Institusi A, Institusi B"
                            className="block w-full rounded-lg border-[#cdeae7] shadow-sm focus:border-primary-brand focus:ring-primary-brand sm:text-sm py-2.5 px-3 bg-[#f5f8f8] dark:bg-[#0f2322]/50"
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
                            className="block w-full rounded-lg border-[#cdeae7] shadow-sm focus:border-primary-brand focus:ring-primary-brand sm:text-sm py-2.5 px-3 bg-[#f5f8f8] dark:bg-[#0f2322]/50 font-mono"
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
                                    className="block w-full rounded-lg border-[#cdeae7] shadow-sm focus:border-primary-brand focus:ring-primary-brand sm:text-sm py-2 px-3 bg-[#f5f8f8] dark:bg-[#0f2322]/50 mb-1"
                                />
                                <div className="flex gap-2 items-center">
                                    <div className="relative flex-1">
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
                                            className="block w-full rounded-lg border-[#cdeae7] shadow-sm focus:border-primary-brand focus:ring-primary-brand sm:text-sm py-2.5 pl-10 pr-3 bg-[#f5f8f8] dark:bg-[#0f2322]/50 text-right"
                                        />
                                    </div>
                                    <div className="flex items-center h-full pt-1">
                                        <input
                                            type="checkbox"
                                            checked={formData.gaji_bulan_1_checked !== false}
                                            onChange={(e) => updateField("gaji_bulan_1_checked", e.target.checked)}
                                            className="w-5 h-5 text-primary-brand border-gray-300 rounded focus:ring-primary-brand"
                                            title="Hitung dalam RPC"
                                        />
                                    </div>
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
                                    className="block w-full rounded-lg border-[#cdeae7] shadow-sm focus:border-primary-brand focus:ring-primary-brand sm:text-sm py-2 px-3 bg-[#f5f8f8] dark:bg-[#0f2322]/50 mb-1"
                                />
                                <div className="flex gap-2 items-center">
                                    <div className="relative flex-1">
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
                                            className="block w-full rounded-lg border-[#cdeae7] shadow-sm focus:border-primary-brand focus:ring-primary-brand sm:text-sm py-2.5 pl-10 pr-3 bg-[#f5f8f8] dark:bg-[#0f2322]/50 text-right"
                                        />
                                    </div>
                                    <div className="flex items-center h-full pt-1">
                                        <input
                                            type="checkbox"
                                            checked={formData.gaji_bulan_2_checked !== false}
                                            onChange={(e) => updateField("gaji_bulan_2_checked", e.target.checked)}
                                            className="w-5 h-5 text-primary-brand border-gray-300 rounded focus:ring-primary-brand"
                                            title="Hitung dalam RPC"
                                        />
                                    </div>
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
                                    className="block w-full rounded-lg border-[#cdeae7] shadow-sm focus:border-primary-brand focus:ring-primary-brand sm:text-sm py-2 px-3 bg-[#f5f8f8] dark:bg-[#0f2322]/50 mb-1"
                                />
                                <div className="flex gap-2 items-center">
                                    <div className="relative flex-1">
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
                                            className="block w-full rounded-lg border-[#cdeae7] shadow-sm focus:border-primary-brand focus:ring-primary-brand sm:text-sm py-2.5 pl-10 pr-3 bg-[#f5f8f8] dark:bg-[#0f2322]/50 text-right"
                                        />
                                    </div>
                                    <div className="flex items-center h-full pt-1">
                                        <input
                                            type="checkbox"
                                            checked={formData.gaji_bulan_3_checked !== false}
                                            onChange={(e) => updateField("gaji_bulan_3_checked", e.target.checked)}
                                            className="w-5 h-5 text-primary-brand border-gray-300 rounded focus:ring-primary-brand"
                                            title="Hitung dalam RPC"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Widget Khusus Tunjangan/Remunerasi UNG (PNS Non-Dosen) */}
                    {formData.ung_kategori_pegawai === "non_dosen" && (
                        <div className="mb-8 p-6 bg-[#f0f9f8] dark:bg-[#0f2322] border border-[#cdeae7] dark:border-opacity-20 rounded-xl space-y-4">
                            <div className="flex items-center gap-2 border-b border-[#cdeae7] dark:border-gray-700 pb-3">
                                <Landmark className="w-5 h-5 text-primary-brand dark:text-[#a5b4fc]" />
                                <h4 className="text-md font-bold text-primary-brand dark:text-[#a5b4fc]">
                                    Widget Tunjangan/Remunerasi Khusus UNG (PNS Non-Dosen)
                                </h4>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label
                                        htmlFor="ung_remunerasi_30_bulanan"
                                        className="block text-sm font-semibold text-[#0c1d1b] dark:text-gray-300 mb-1"
                                    >
                                        Tunjangan/Remunerasi 30% (Dibayarkan Setiap Bulan)
                                    </label>
                                    <div className="relative">
                                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500 text-sm">
                                            Rp
                                        </span>
                                        <input
                                            id="ung_remunerasi_30_bulanan"
                                            name="ung_remunerasi_30_bulanan"
                                            type="text"
                                            value={formatNumberForDisplay(formData.ung_remunerasi_30_bulanan)}
                                            onChange={(e) => handleCurrencyChange("ung_remunerasi_30_bulanan", e.target.value)}
                                            placeholder="contoh: 912.000"
                                            className="block w-full rounded-lg border-[#cdeae7] shadow-sm focus:border-primary-brand focus:ring-primary-brand sm:text-sm py-2.5 pl-10 pr-3 bg-white dark:bg-[#0f2322]/50 text-right font-bold text-primary-brand"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label
                                        htmlFor="ung_remunerasi_70_semesteran"
                                        className="block text-sm font-semibold text-[#0c1d1b] dark:text-gray-300 mb-1"
                                    >
                                        Tunjangan/Remunerasi 70% (Dibayarkan Setiap 6 Bulan Berjalan)
                                    </label>
                                    <div className="relative">
                                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500 text-sm">
                                            Rp
                                        </span>
                                        <input
                                            id="ung_remunerasi_70_semesteran"
                                            name="ung_remunerasi_70_semesteran"
                                            type="text"
                                            value={formatNumberForDisplay(formData.ung_remunerasi_70_semesteran)}
                                            onChange={(e) => handleCurrencyChange("ung_remunerasi_70_semesteran", e.target.value)}
                                            placeholder="contoh: 12.768.000"
                                            className="block w-full rounded-lg border-[#cdeae7] shadow-sm focus:border-primary-brand focus:ring-primary-brand sm:text-sm py-2.5 pl-10 pr-3 bg-white dark:bg-[#0f2322]/50 text-right font-bold text-primary-brand"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Hasil Kalkulasi Otomatis */}
                            <div className="p-4 bg-white dark:bg-[#1a2c2a] rounded-lg border border-[#cdeae7] dark:border-opacity-20 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div>
                                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">
                                        Total Remunerasi Diakui per Bulan (untuk RPC/DSR)
                                    </span>
                                    <span className="text-xs text-gray-400 block mt-0.5">
                                        Rumus: Remun 30% Bulanan + (Remun 70% Semesteran / 6)
                                    </span>
                                </div>
                                <div className="text-right">
                                    <span className="text-lg font-black text-primary-brand dark:text-[#a5b4fc]">
                                        Rp {
                                            formatNumberForDisplay(
                                                String(
                                                    (parseFloat(formData.ung_remunerasi_30_bulanan || "0") || 0) +
                                                    Math.round((parseFloat(formData.ung_remunerasi_70_semesteran || "0") || 0) / 6)
                                                )
                                            )
                                        },-
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Section: Penghasilan Tambahan (Dynamic) */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="text-md font-semibold text-[#0c1d1b] dark:text-white flex items-center gap-2">
                                <Plus className="w-5 h-5 text-primary-brand" />
                                Penghasilan Tambahan (Opsional)
                            </h4>
                            <button
                                type="button"
                                onClick={addAdditionalIncome}
                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#e6f4f3] text-primary-brand rounded-lg text-sm font-medium hover:bg-[#d0ebe9] transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                                Tambah Penghasilan
                            </button>
                        </div>

                        <div className="space-y-6">
                            {(formData.additional_incomes || []).map((income, index) => (
                                <div key={index} className="bg-[#f8fcfc] dark:bg-[#132b29] p-4 rounded-xl border border-[#e0f0ef] dark:border-gray-700 relative group">
                                    <button
                                        type="button"
                                        onClick={() => removeAdditionalIncome(index)}
                                        className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors p-1"
                                        title="Hapus"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>

                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                                        <div className="md:col-span-4 mb-2">
                                            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                                                Jenis Penghasilan
                                            </label>
                                            <input
                                                type="text"
                                                value={income.label}
                                                onChange={(e) => updateAdditionalIncome(index, "label", e.target.value)}
                                                placeholder="Contoh: Tunjangan Kinerja, Uang Makan"
                                                className="block w-full text-base font-semibold bg-transparent border-0 border-b-2 border-gray-200 focus:border-primary-brand focus:ring-0 px-0 py-1 transition-colors bg-[#f8fcfc] dark:bg-[#132b29]"
                                            />
                                        </div>

                                        {/* Bulan 1 */}
                                        <div>
                                            <div className="flex flex-col gap-1 mb-1">
                                                <label className="block text-xs text-gray-500">Bulan 1</label>
                                                <input
                                                    type="text"
                                                    value={income.bulan_1_nama || ""}
                                                    onChange={(e) => updateAdditionalIncome(index, "bulan_1_nama", e.target.value)}
                                                    placeholder="Nama Bulan"
                                                    className="block w-full rounded-md border-gray-200 text-xs py-1 px-2 bg-white dark:bg-[#0f2322]/50 focus:border-primary-brand focus:ring-primary-brand"
                                                />
                                            </div>
                                            <div className="flex gap-2 items-center">
                                                <div className="relative flex-1">
                                                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500 text-sm">Rp</span>
                                                    <input
                                                        type="text"
                                                        value={formatNumberForDisplay(income.bulan_1)}
                                                        onChange={(e) => updateAdditionalIncome(index, "bulan_1", e.target.value)}
                                                        className="block w-full rounded-lg border-[#cdeae7] shadow-sm focus:border-primary-brand focus:ring-primary-brand sm:text-sm py-2 pl-9 pr-3 text-right bg-white dark:bg-[#0f2322]/50"
                                                    />
                                                </div>
                                                <div className="flex items-center h-full">
                                                    <input
                                                        type="checkbox"
                                                        checked={income.bulan_1_checked !== false}
                                                        onChange={(e) => updateAdditionalIncome(index, "bulan_1_checked", e.target.checked)}
                                                        className="w-4 h-4 text-primary-brand border-gray-300 rounded focus:ring-primary-brand"
                                                        title="Hitung dalam RPC"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Bulan 2 */}
                                        <div>
                                            <div className="flex flex-col gap-1 mb-1">
                                                <label className="block text-xs text-gray-500">Bulan 2</label>
                                                <input
                                                    type="text"
                                                    value={income.bulan_2_nama || ""}
                                                    onChange={(e) => updateAdditionalIncome(index, "bulan_2_nama", e.target.value)}
                                                    placeholder="Nama Bulan"
                                                    className="block w-full rounded-md border-gray-200 text-xs py-1 px-2 bg-white dark:bg-[#0f2322]/50 focus:border-primary-brand focus:ring-primary-brand"
                                                />
                                            </div>
                                            <div className="flex gap-2 items-center">
                                                <div className="relative flex-1">
                                                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500 text-sm">Rp</span>
                                                    <input
                                                        type="text"
                                                        value={formatNumberForDisplay(income.bulan_2)}
                                                        onChange={(e) => updateAdditionalIncome(index, "bulan_2", e.target.value)}
                                                        className="block w-full rounded-lg border-[#cdeae7] shadow-sm focus:border-primary-brand focus:ring-primary-brand sm:text-sm py-2 pl-9 pr-3 text-right bg-white dark:bg-[#0f2322]/50"
                                                    />
                                                </div>
                                                <div className="flex items-center h-full">
                                                    <input
                                                        type="checkbox"
                                                        checked={income.bulan_2_checked !== false}
                                                        onChange={(e) => updateAdditionalIncome(index, "bulan_2_checked", e.target.checked)}
                                                        className="w-4 h-4 text-primary-brand border-gray-300 rounded focus:ring-primary-brand"
                                                        title="Hitung dalam RPC"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Bulan 3 */}
                                        <div>
                                            <div className="flex flex-col gap-1 mb-1">
                                                <label className="block text-xs text-gray-500">Bulan 3</label>
                                                <input
                                                    type="text"
                                                    value={income.bulan_3_nama || ""}
                                                    onChange={(e) => updateAdditionalIncome(index, "bulan_3_nama", e.target.value)}
                                                    placeholder="Nama Bulan"
                                                    className="block w-full rounded-md border-gray-200 text-xs py-1 px-2 bg-white dark:bg-[#0f2322]/50 focus:border-primary-brand focus:ring-primary-brand"
                                                />
                                            </div>
                                            <div className="flex gap-2 items-center">
                                                <div className="relative flex-1">
                                                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500 text-sm">Rp</span>
                                                    <input
                                                        type="text"
                                                        value={formatNumberForDisplay(income.bulan_3)}
                                                        onChange={(e) => updateAdditionalIncome(index, "bulan_3", e.target.value)}
                                                        className="block w-full rounded-lg border-[#cdeae7] shadow-sm focus:border-primary-brand focus:ring-primary-brand sm:text-sm py-2 pl-9 pr-3 text-right bg-white dark:bg-[#0f2322]/50"
                                                    />
                                                </div>
                                                <div className="flex items-center h-full">
                                                    <input
                                                        type="checkbox"
                                                        checked={income.bulan_3_checked !== false}
                                                        onChange={(e) => updateAdditionalIncome(index, "bulan_3_checked", e.target.checked)}
                                                        className="w-4 h-4 text-primary-brand border-gray-300 rounded focus:ring-primary-brand"
                                                        title="Hitung dalam RPC"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {(formData.additional_incomes?.length === 0 || !formData.additional_incomes) && (
                                <div className="text-center text-sm text-gray-400 py-6 italic border-2 border-dashed border-[#e0f0ef] dark:border-gray-700 rounded-xl bg-[#f8fcfc] dark:bg-[#132b29]">
                                    Belum ada penghasilan tambahan ditambahkan
                                </div>
                            )}
                        </div>
                    </div>


                </div>

                <hr className="border-[#cdeae7] dark:border-opacity-10" />

                {/* Section: Estimasi Hak Pensiun */}
                {/* Section: Estimasi Hak Pensiun - Hidden for Aktif */}
                {kategori !== "type_c" && (
                    <div>
                        <h3 className="text-lg font-bold text-[#0c1d1b] dark:text-white mb-4 flex items-center gap-2">
                            <Landmark className="w-6 h-6 text-primary-brand" />
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
                                        className="block w-full rounded-lg border-[#cdeae7] shadow-sm focus:border-primary-brand focus:ring-primary-brand sm:text-sm py-2.5 pl-10 pr-3 bg-[#f5f8f8] dark:bg-[#0f2322]/50 text-right font-bold"
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
                                        className="block w-full rounded-lg border-[#cdeae7] shadow-sm focus:border-primary-brand focus:ring-primary-brand sm:text-sm py-2.5 pl-10 pr-3 bg-[#f5f8f8] dark:bg-[#0f2322]/50 text-right font-bold"
                                    />
                                </div>
                            </div>

                            <div className="bg-[#e6f4f3] dark:bg-primary-brand/20 rounded-lg p-4">
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
