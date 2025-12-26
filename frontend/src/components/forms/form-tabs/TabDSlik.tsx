"use client";

import { useState } from "react";
import { useFormStore } from "@/stores/form-store";
import { Plus, Trash2, ClipboardCheck } from "lucide-react";
import type { SlikFacility } from "@/types/debitur";

export default function TabDSlik() {
    const { formData, updateField, setFormData } = useFormStore();
    const [newFacility, setNewFacility] = useState<Partial<SlikFacility>>({
        nama_bank: "",
        plafon_maks: "",
        outstanding: "",
        angsuran: "",
        is_takeover: false,
    });

    const facilities = formData.slik_facilities || [];

    const addFacility = () => {
        if (newFacility.nama_bank && newFacility.angsuran) {
            const updatedFacilities = [...facilities, newFacility as SlikFacility];
            setFormData({ slik_facilities: updatedFacilities });
            setNewFacility({ nama_bank: "", plafon_maks: "", outstanding: "", angsuran: "", is_takeover: false });
        }
    };

    const removeFacility = (index: number) => {
        const updatedFacilities = facilities.filter((_, i) => i !== index);
        setFormData({ slik_facilities: updatedFacilities });
    };

    return (
        <div className="bg-white dark:bg-[#1a2c2a] rounded-xl shadow-sm border border-[#cdeae7] p-6 md:p-8">
            <h3 className="text-lg font-bold text-[#0c1d1b] dark:text-white mb-4 flex items-center gap-2">
                <ClipboardCheck className="w-6 h-6 text-[#00665e]" />
                Hasil SLIK
            </h3>

            <div className="mb-6 p-4 bg-[#f5f8f8] dark:bg-[#0f2322]/50 rounded-lg">
                <label className="flex items-center gap-3 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={formData.fasilitas_nihil === "ya"}
                        onChange={(e) => updateField("fasilitas_nihil", e.target.checked ? "ya" : "tidak")}
                        className="h-5 w-5 rounded border-gray-300 text-[#00665e] focus:ring-[#00665e]"
                    />
                    <span className="font-medium text-[#0c1d1b] dark:text-white">Fasilitas Kredit Nihil</span>
                </label>
            </div>

            {formData.fasilitas_nihil !== "ya" && facilities.length > 0 && (
                <div className="mb-6 overflow-x-auto">
                    <table className="w-full text-left border-collapse text-sm">
                        <thead>
                            <tr className="bg-[#f8fcfc] dark:bg-[#0f2322]">
                                <th className="py-3 px-4 font-semibold">Nama Bank</th>
                                <th className="py-3 px-4 font-semibold text-right">Angsuran</th>
                                <th className="py-3 px-4 font-semibold text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {facilities.map((f, i) => (
                                <tr key={i} className="border-t border-[#e6f4f3]">
                                    <td className="py-3 px-4">{f.nama_bank}</td>
                                    <td className="py-3 px-4 text-right font-mono">{f.angsuran}</td>
                                    <td className="py-3 px-4 text-center">
                                        <button type="button" onClick={() => removeFacility(i)} className="text-red-500">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {formData.fasilitas_nihil !== "ya" && (
                <div className="border border-dashed border-[#cdeae7] rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <input
                            type="text"
                            value={newFacility.nama_bank || ""}
                            onChange={(e) => setNewFacility({ ...newFacility, nama_bank: e.target.value })}
                            placeholder="Nama Bank"
                            className="rounded-lg border-[#cdeae7] py-2 px-3 bg-[#f5f8f8] text-sm"
                        />
                        <input
                            type="text"
                            value={newFacility.angsuran || ""}
                            onChange={(e) => setNewFacility({ ...newFacility, angsuran: e.target.value.replace(/[^0-9]/g, "") })}
                            placeholder="Angsuran"
                            className="rounded-lg border-[#cdeae7] py-2 px-3 bg-[#f5f8f8] text-sm text-right"
                        />
                        <button
                            type="button"
                            onClick={addFacility}
                            className="flex items-center justify-center gap-1 px-3 py-2 bg-[#00665e] text-white text-sm font-medium rounded-lg"
                        >
                            <Plus className="w-4 h-4" />
                            Tambah
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
