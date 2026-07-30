"use client";

import { useFormStore } from "@/stores/form-store";
import { useTabNavigation } from "@/hooks/useTabNavigation";
import { Plus, Trash2, ClipboardCheck, Calendar } from "lucide-react";
import type { SlikFacility } from "@/types/clients";
import { MentionTextArea } from "@/components/ui/MentionTextArea";
import { DOCUMENT_PLACEHOLDERS } from "@/constants/placeholders";
import React, { useCallback, useMemo } from "react";
import { formatNumberForDisplay, cleanNumberInput } from "@/lib/utils";

// Helper for number display
// Removed local formatNumber, using utils

interface SlikFacilityRowProps {
    index: number;
    facility: SlikFacility;
    updateFacility: (index: number, field: keyof SlikFacility, value: string | boolean) => void;
    removeFacility: (index: number) => void;
    handleNumberInput: (index: number, field: keyof SlikFacility, value: string) => void;
    jenisPengajuan?: string;
}


const SlikFacilityRow = React.memo(function SlikFacilityRow({
    index,
    facility,
    updateFacility,
    removeFacility,
    handleNumberInput,
    jenisPengajuan
}: SlikFacilityRowProps) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-start bg-[#f8fcfc] dark:bg-[#0f2322]/30 p-4 lg:p-2 rounded-lg border border-[#e6f4f3] dark:border-gray-700">
            {/* Bank Name with Numbering */}
            <div className="col-span-1 lg:col-span-2">
                <label className="block lg:hidden text-xs font-medium text-gray-500 mb-1">Nama Bank</label>
                <div className="flex gap-2 items-center">
                    <span className="flex-none flex items-center justify-center w-6 h-6 rounded-full bg-primary-brand/10 text-primary text-xs font-bold border border-primary-brand/20">
                        {index + 1}
                    </span>
                    <input
                        type="text"
                        value={facility.nama_bank}
                        onChange={(e) => updateFacility(index, "nama_bank", e.target.value)}
                        placeholder="Nama Bank"
                        className="block w-full rounded-xl border border-outline-variant/50 shadow-sm focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all sm:text-sm py-2 px-3 bg-white dark:bg-[#1a2c2a] dark:text-gray-300"
                    />
                </div>
            </div>

            {/* Jenis Kredit */}
            <div className="col-span-1 lg:col-span-1">
                <label className="block lg:hidden text-xs font-medium text-gray-500 mb-1">Jenis Facility</label>
                <input
                    type="text"
                    value={facility.jenis_kredit || ""}
                    onChange={(e) => updateFacility(index, "jenis_kredit", e.target.value)}
                    placeholder="Konsumtif"
                    className="block w-full rounded-xl border border-outline-variant/50 shadow-sm focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all sm:text-sm py-2 px-3 bg-white dark:bg-[#1a2c2a] dark:text-gray-300"
                />
            </div>

            {/* Plafon Maks */}
            <div className="col-span-1 lg:col-span-2">
                <label className="block lg:hidden text-xs font-medium text-gray-500 mb-1">Plafon Maks</label>
                <input
                    type="text"
                    value={formatNumberForDisplay(facility.plafon_maks)}
                    onChange={(e) => handleNumberInput(index, "plafon_maks", e.target.value)}
                    placeholder="0"
                    className="block w-full rounded-xl border border-outline-variant/50 shadow-sm focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all sm:text-sm py-2 px-3 bg-white dark:bg-[#1a2c2a] dark:text-gray-300 text-right"
                />
            </div>

            {/* Outstanding */}
            <div className="col-span-1 lg:col-span-2">
                <label className="block lg:hidden text-xs font-medium text-gray-500 mb-1">Outstanding</label>
                <input
                    type="text"
                    value={formatNumberForDisplay(facility.outstanding)}
                    onChange={(e) => handleNumberInput(index, "outstanding", e.target.value)}
                    placeholder="0"
                    className="block w-full rounded-xl border border-outline-variant/50 shadow-sm focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all sm:text-sm py-2 px-3 bg-white dark:bg-[#1a2c2a] dark:text-gray-300 text-right"
                />
            </div>

            {/* Angsuran */}
            <div className="col-span-1 lg:col-span-1">
                <label className="block lg:hidden text-xs font-medium text-gray-500 mb-1">Angsuran</label>
                <input
                    type="text"
                    value={formatNumberForDisplay(facility.angsuran)}
                    onChange={(e) => handleNumberInput(index, "angsuran", e.target.value)}
                    placeholder="0"
                    className="block w-full rounded-xl border border-outline-variant/50 shadow-sm focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all sm:text-sm py-2 px-3 bg-white dark:bg-[#1a2c2a] dark:text-gray-300 text-right"
                />
            </div>

            {/* Rating */}
            <div className="col-span-1 lg:col-span-1 text-center">
                <label className="block lg:hidden text-xs font-medium text-gray-500 mb-1">Coll</label>
                <select
                    value={facility.kolektibilitas || ""}
                    onChange={(e) => updateFacility(index, "kolektibilitas", e.target.value)}
                    className="block w-full rounded-xl border border-outline-variant/50 shadow-sm focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all sm:text-sm py-2 px-3 bg-white dark:bg-[#1a2c2a] dark:text-gray-300"
                >
                    <option value="">-</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5">5</option>
                </select>
            </div>

            {/* Alasan/Keterangan */}
            <div className="col-span-1 lg:col-span-2">
                <label className="block lg:hidden text-xs font-medium text-gray-500 mb-1">Ket/Alasan</label>
                <MentionTextArea
                    value={facility.alasan || ""}
                    onChange={(val) => updateFacility(index, "alasan", val)}
                    options={DOCUMENT_PLACEHOLDERS}
                    placeholder="Keterangan"
                    rows={1}
                    className="block w-full rounded-xl border border-outline-variant/50 shadow-sm focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all sm:text-sm py-2 px-3 bg-white dark:bg-[#1a2c2a] dark:text-gray-300"
                />
            </div>

            {/* Delete Button */}
            <div className="col-span-1 lg:col-span-1 flex justify-end lg:justify-center items-end lg:items-center mt-6 lg:mt-0 h-full pb-2">
                <button
                    type="button"
                    onClick={() => removeFacility(index)}
                    className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors self-center"
                    title="Hapus baris"
                >
                    <Trash2 className="w-5 h-5" />
                </button>
            </div>

            {/* Top Up Sisa Gaji Specific Fields - Full Width Row */}
            {(() => {
                const isTopUp = jenisPengajuan === "top_up" || jenisPengajuan === "pensiunan_janda_top_up" || jenisPengajuan === "pensiunan_duda_top_up";
                const isTopUpSisaGaji = jenisPengajuan === "top_up_sisa_gaji";
                
                if (!isTopUp && !isTopUpSisaGaji) return null;

                return (
                    <div className="col-span-1 lg:col-span-12 grid grid-cols-1 lg:grid-cols-2 gap-4 mt-2 animate-in fade-in slide-in-from-top-2">
                        <div className={isTopUp ? "lg:col-span-2" : ""}>
                            <label className="block text-xs font-semibold text-[#0c1d1b] dark:text-gray-300 mb-1">Nomor Rekening Pinjaman Existing</label>
                            <input
                                type="text"
                                value={facility.nomor_rekening_pinjaman || ""}
                                onChange={(e) => updateFacility(index, "nomor_rekening_pinjaman", e.target.value)}
                                placeholder="Nomor Rekening"
                                className="block w-full rounded-xl border border-outline-variant/50 shadow-sm focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all sm:text-sm py-2 px-3 bg-white dark:bg-[#1a2c2a] dark:text-gray-300"
                            />
                        </div>
                        {isTopUpSisaGaji && (
                            <div>
                                <label className="block text-xs font-semibold text-[#0c1d1b] dark:text-gray-300 mb-1">Nomor PK Existing</label>
                                <input
                                    type="text"
                                    value={facility.nomor_pk || ""}
                                    onChange={(e) => updateFacility(index, "nomor_pk", e.target.value)}
                                    placeholder="Nomor PK"
                                    className="block w-full rounded-xl border border-outline-variant/50 shadow-sm focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all sm:text-sm py-2 px-3 bg-white dark:bg-[#1a2c2a] dark:text-gray-300"
                                />
                            </div>
                        )}
                    </div>
                );
            })()}
        </div>
    );
});

export default React.memo(function TabDSlik() {
    const { formData, setFormData } = useFormStore();
    const { handleTabToNext, handleTabToPrev } = useTabNavigation();

    const facilities = useMemo(() => formData.slik_facilities || [], [formData.slik_facilities]);

    const addFacility = useCallback(() => {
        const updatedFacilities = [
            ...facilities,
            {
                nama_bank: "",
                jenis_kredit: "",
                plafon_maks: "",
                outstanding: "",
                angsuran: "",
                kolektibilitas: "",
                nomor_rekening_pinjaman: "",
                nomor_pk: "",
            } as SlikFacility
        ];
        setFormData({ slik_facilities: updatedFacilities });
    }, [facilities, setFormData]);

    const removeFacility = useCallback((index: number) => {
        const updatedFacilities = facilities.filter((_, i) => i !== index);
        setFormData({ slik_facilities: updatedFacilities });
    }, [facilities, setFormData]);

    const updateFacility = useCallback((index: number, field: keyof SlikFacility, value: string | boolean) => {
        const updatedFacilities = facilities.map((f, i) => {
            if (i === index) {
                return { ...f, [field]: value };
            }
            return f;
        });
        setFormData({ slik_facilities: updatedFacilities });
    }, [facilities, setFormData]);

    // Helper for number input with formatting
    const handleNumberInput = useCallback((index: number, field: keyof SlikFacility, value: string) => {
        const numericValue = cleanNumberInput(value);
        // We can call updateFacility here, but need to make sure updateFacility is in deps or stable.
        // To avoid chaining deps, let's just duplicate logic or call the function.
        // Since updateFacility is useCallback'd, we can use it.
        // But better to just inline to avoid complexity with deps if not needed.
        // Let's use updateFacility since it is there.
        const updatedFacilities = facilities.map((f, i) => {
            if (i === index) {
                return { ...f, [field]: numericValue };
            }
            return f;
        });
        setFormData({ slik_facilities: updatedFacilities });
    }, [facilities, setFormData]);

    return (
        <div className="bg-surface-light rounded-xl shadow-sm border border-outline-variant/20 overflow-hidden p-6 md:p-8" data-tab-content="tab-d">
            <h3 className="text-label-caps font-bold text-on-surface uppercase tracking-widest mb-4 flex items-center gap-2">
                <ClipboardCheck className="w-6 h-6 text-primary" />
                Data Eksternal
            </h3>

            {/* Tanggal SLIK Input */}
            <div className="mb-6 bg-[#f8fcfc] dark:bg-[#0f2322]/50 p-4 rounded-lg border border-[#e6f4f3] dark:border-gray-700">
                <label className="block text-xs font-semibold text-[#0c1d1b] dark:text-gray-300 mb-2">
                    Tanggal Pengecekan SLIK
                </label>
                <div className="relative max-w-sm">
                    <input
                        type="date"
                        value={formData.tgl_slik ?? ""}
                        onChange={(e) => setFormData({ tgl_slik: e.target.value })}
                        className="block w-full rounded-xl border border-outline-variant/50 shadow-sm focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all sm:text-sm py-2 px-3 pl-10 bg-white dark:bg-[#1a2c2a] dark:text-gray-300"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Calendar className="h-4 w-4 text-gray-500" />
                    </div>
                </div>
                <p className="mt-2 text-xs text-gray-500">
                    Tanggal ini akan digunakan sebagai &quot;Tanggal SLIK&quot; pada dokumen yang dicetak.
                </p>
            </div>

            <div className="space-y-4">
                {/* Header Row (Hidden on mobile) */}
                {facilities.length > 0 && (
                    <div className="hidden lg:grid grid-cols-12 gap-2 px-2 text-xs font-semibold text-[#0c1d1b] dark:text-gray-300">
                        <div className="col-span-2">Nama Bank</div>
                        <div className="col-span-1">Jenis</div>
                        <div className="col-span-2 text-right">Plafon Maks</div>
                        <div className="col-span-2 text-right">Outstanding</div>
                        <div className="col-span-1 text-right">Angsuran</div>
                        <div className="col-span-1 text-center">Coll</div>
                        <div className="col-span-2">Ket/Alasan</div>
                        <div className="col-span-1 text-center">Aksi</div>
                    </div>
                )}

                {/* Dynamic Rows */}
                {facilities.map((facility, index) => (
                    <SlikFacilityRow
                        key={index}
                        index={index}
                        facility={facility}
                        updateFacility={updateFacility}
                        removeFacility={removeFacility}
                        handleNumberInput={handleNumberInput}
                        jenisPengajuan={formData.jenis_pengajuan}
                    />
                ))}

                {/* Empty State */}
                {facilities.length === 0 && (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        <ClipboardCheck className="w-12 h-12 mx-auto mb-3 opacity-30" />
                        <p className="text-sm">Belum ada data facility</p>
                        <p className="text-xs mt-1">Klik tombol di bawah untuk menambahkan</p>
                    </div>
                )}

                {/* Add Button - Last focusable element: Tab goes to next tab */}
                <button
                    type="button"
                    onClick={addFacility}
                    onKeyDown={(e) => {
                        // Handle Tab to go to next tab
                        handleTabToNext(e);
                        // Handle Shift+Tab when no facilities exist
                        if (facilities.length === 0) {
                            handleTabToPrev(e);
                        }
                    }}
                    className="flex items-center justify-center gap-2 w-full py-3 border-2 border-dashed border-primary-brand/30 rounded-lg text-primary font-medium hover:bg-primary-brand/5 hover:border-primary-brand transition-all"
                >
                    <Plus className="w-5 h-5" />
                    Tambah Assessment Facility
                </button>
            </div>
        </div>
    );
});


