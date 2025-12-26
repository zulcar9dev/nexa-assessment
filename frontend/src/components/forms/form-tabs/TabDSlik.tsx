"use client";

import { useState } from "react";
import { useFormStore } from "@/stores/form-store";
import { Plus, Trash2, ClipboardCheck } from "lucide-react";
import type { SlikFacility } from "@/types/debitur";

export default function TabDSlik() {
    const { formData, updateField, setFormData } = useFormStore();

    const facilities = formData.slik_facilities || [];

    const addFacility = () => {
        const updatedFacilities = [
            ...facilities,
            {
                nama_bank: "",
                plafon_maks: "",
                outstanding: "",
                angsuran: "",
                kolektibilitas: "",
                is_takeover: false,
            } as SlikFacility
        ];
        setFormData({ slik_facilities: updatedFacilities });
    };

    const removeFacility = (index: number) => {
        const updatedFacilities = facilities.filter((_, i) => i !== index);
        setFormData({ slik_facilities: updatedFacilities });
    };

    const updateFacility = (index: number, field: keyof SlikFacility, value: any) => {
        const updatedFacilities = facilities.map((f, i) => {
            if (i === index) {
                return { ...f, [field]: value };
            }
            return f;
        });
        setFormData({ slik_facilities: updatedFacilities });
    };

    // Helper for number input
    const handleNumberInput = (index: number, field: keyof SlikFacility, value: string) => {
        const numericValue = value.replace(/[^0-9]/g, "");
        updateFacility(index, field, numericValue);
    };

    return (
        <div className="bg-white dark:bg-[#1a2c2a] rounded-xl shadow-sm border border-[#cdeae7] dark:border-opacity-10 p-6 md:p-8">
            <h3 className="text-lg font-bold text-[#0c1d1b] dark:text-white mb-4 flex items-center gap-2">
                <ClipboardCheck className="w-6 h-6 text-[#00665e]" />
                Hasil SLIK
            </h3>

            {/* Removed Fasilitas Kredit Nihil Checkbox */}

            <div className="space-y-4">
                {/* Header Row (Hidden on mobile) */}
                {facilities.length > 0 && (
                    <div className="hidden md:grid grid-cols-12 gap-4 px-2 text-sm font-semibold text-[#0c1d1b] dark:text-gray-300">
                        <div className="col-span-5">Nama Bank</div>
                        <div className="col-span-3 text-right">Angsuran</div>
                        <div className="col-span-3">Kolektibilitas</div>
                        <div className="col-span-1 text-center">Aksi</div>
                    </div>
                )}

                {/* Dynamic Rows */}
                {facilities.map((facility, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start bg-[#f8fcfc] dark:bg-[#0f2322]/30 p-4 md:p-2 rounded-lg border border-[#e6f4f3] dark:border-gray-700">
                        {/* Bank Name */}
                        <div className="col-span-1 md:col-span-5">
                            <label className="block md:hidden text-xs font-medium text-gray-500 mb-1">Nama Bank</label>
                            <input
                                type="text"
                                value={facility.nama_bank}
                                onChange={(e) => updateFacility(index, "nama_bank", e.target.value)}
                                placeholder="Nama Bank"
                                className="block w-full rounded-lg border-[#cdeae7] shadow-sm focus:border-[#00665e] focus:ring-[#00665e] sm:text-sm py-2 px-3 bg-white dark:bg-[#1a2c2a] dark:text-gray-300"
                            />
                        </div>

                        {/* Angsuran */}
                        <div className="col-span-1 md:col-span-3">
                            <label className="block md:hidden text-xs font-medium text-gray-500 mb-1">Angsuran</label>
                            <input
                                type="text"
                                value={facility.angsuran}
                                onChange={(e) => handleNumberInput(index, "angsuran", e.target.value)}
                                placeholder="0"
                                className="block w-full rounded-lg border-[#cdeae7] shadow-sm focus:border-[#00665e] focus:ring-[#00665e] sm:text-sm py-2 px-3 bg-white dark:bg-[#1a2c2a] dark:text-gray-300 text-right"
                            />
                        </div>

                        {/* Kolektibilitas */}
                        <div className="col-span-1 md:col-span-3">
                            <label className="block md:hidden text-xs font-medium text-gray-500 mb-1">Kolektibilitas</label>
                            <select
                                value={facility.kolektibilitas || ""}
                                onChange={(e) => updateFacility(index, "kolektibilitas", e.target.value)}
                                className="block w-full rounded-lg border-[#cdeae7] shadow-sm focus:border-[#00665e] focus:ring-[#00665e] sm:text-sm py-2 px-3 bg-white dark:bg-[#1a2c2a] dark:text-gray-300"
                            >
                                <option value="">Pilih Kol</option>
                                <option value="1">1 - Lancar</option>
                                <option value="2">2 - DPK</option>
                                <option value="3">3 - Kurang Lancar</option>
                                <option value="4">4 - Diragukan</option>
                                <option value="5">5 - Macet</option>
                            </select>
                        </div>

                        {/* Delete Button */}
                        <div className="col-span-1 md:col-span-1 flex justify-end md:justify-center items-center mt-1 md:mt-2">
                            <button
                                type="button"
                                onClick={() => removeFacility(index)}
                                className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors"
                                title="Hapus baris"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                ))}

                {/* Add Button */}
                <button
                    type="button"
                    onClick={addFacility}
                    className="flex items-center justify-center gap-2 w-full py-3 border-2 border-dashed border-[#00665e]/30 rounded-lg text-[#00665e] font-medium hover:bg-[#00665e]/5 hover:border-[#00665e] transition-all"
                >
                    <Plus className="w-5 h-5" />
                    Tambah Fasilitas Kredit
                </button>
            </div>
        </div>
    );
}
