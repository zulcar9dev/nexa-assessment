"use client";

import { useFormStore } from "@/stores/form-store";
import { useTabNavigation } from "@/hooks/useTabNavigation";

import { Briefcase } from "lucide-react";
import React from "react";

export default React.memo(function TabBDataPensiun() {
    const { formData, updateField } = useFormStore();
    const { handleTabToNext, handleTabToPrev } = useTabNavigation();

    return (
        <div className="bg-white dark:bg-[#1a2c2a] rounded-xl shadow-sm border border-[#cdeae7] dark:border-opacity-10 p-6 md:p-8" data-tab-content="tab-b">
            <form className="space-y-8">
                {/* Section: Data Pensiun */}
                <div>
                    <h3 className="text-lg font-bold text-[#0c1d1b] dark:text-white mb-4 flex items-center gap-2">
                        <Briefcase className="w-6 h-6 text-primary-brand" />
                        Data Pensiun
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Pensiunan */}
                        <div>
                            <label
                                htmlFor="pensiunan"
                                className="block text-sm font-medium text-[#0c1d1b] dark:text-gray-300 mb-1"
                            >
                                Pensiunan
                            </label>
                            <input
                                id="pensiunan"
                                name="pensiunan"
                                type="text"
                                value={formData.pensiunan || ""}
                                onChange={(e) => updateField("pensiunan", e.target.value)}
                                placeholder="e.g. PNS / TNI / POLRI"
                                className="block w-full rounded-lg border-[#cdeae7] shadow-sm focus:border-primary-brand focus:ring-primary-brand sm:text-sm py-2.5 px-3 bg-[#f5f8f8] dark:bg-[#0f2322]/50"
                            />
                        </div>
                        {/* Segmentasi */}
                        <div>
                            <label
                                htmlFor="segmentasi"
                                className="block text-sm font-medium text-[#0c1d1b] dark:text-gray-300 mb-1"
                            >
                                Segmentasi
                            </label>
                            {/* First field: Shift+Tab goes to previous tab */}
                            <select
                                id="segmentasi"
                                name="segmentasi"
                                value={formData.segmentasi || ""}
                                onChange={(e) => updateField("segmentasi", e.target.value)}
                                onKeyDown={handleTabToPrev}
                                className="block w-full rounded-lg border-[#cdeae7] shadow-sm focus:border-primary-brand focus:ring-primary-brand sm:text-sm py-2.5 px-3 bg-[#f5f8f8] dark:bg-[#0f2322]/50"
                            >
                                <option value="">Pilih Segmentasi</option>
                                <option value="taspen">TASPEN</option>
                                <option value="asabri">ASABRI</option>
                                <option value="bumd_bumn">BUMD/BUMN</option>
                            </select>
                        </div>

                        {/* Jenis Pengajuan */}
                        <div>
                            <label
                                htmlFor="jenis_pengajuan"
                                className="block text-sm font-medium text-[#0c1d1b] dark:text-gray-300 mb-1"
                            >
                                Jenis Pengajuan
                            </label>
                            <select
                                id="jenis_pengajuan"
                                name="jenis_pengajuan"
                                value={formData.jenis_pengajuan || ""}
                                onChange={(e) => updateField("jenis_pengajuan", e.target.value)}
                                className="block w-full rounded-lg border-[#cdeae7] shadow-sm focus:border-primary-brand focus:ring-primary-brand sm:text-sm py-2.5 px-3 bg-[#f5f8f8] dark:bg-[#0f2322]/50"
                            >
                                <option value="">Pilih Jenis</option>
                                <option value="baru">Baru</option>
                                <option value="top_up">Top Up</option>
                                <option value="top_up_sisa_gaji">Top Up Sisa Gaji</option>
                                <option value="takeover">Take Over</option>
                                <option value="pensiunan_janda_baru">Pensiunan Janda - Baru</option>
                                <option value="pensiunan_janda_top_up">Pensiunan Janda - Top Up</option>
                                <option value="pensiunan_janda_takeover">Pensiunan Janda - Take Over</option>
                                <option value="pensiunan_duda_baru">Pensiunan Duda - Baru</option>
                                <option value="pensiunan_duda_top_up">Pensiunan Duda - Top Up</option>
                                <option value="pensiunan_duda_takeover">Pensiunan Duda - Take Over</option>
                            </select>
                        </div>

                        {/* Nama Almarhum/Almarhumah Pasangan (Conditional for Janda/Duda) */}
                        {(formData.jenis_pengajuan?.startsWith("pensiunan_janda_") ||
                          formData.jenis_pengajuan?.startsWith("pensiunan_duda_")) && (
                            <div>
                                <label
                                    htmlFor="nama_almarhum_pasangan"
                                    className="block text-sm font-medium text-[#0c1d1b] dark:text-gray-300 mb-1"
                                >
                                    Nama Almarhum/Almarhumah Pasangan
                                </label>
                                <input
                                    id="nama_almarhum_pasangan"
                                    name="nama_almarhum_pasangan"
                                    type="text"
                                    value={formData.nama_almarhum_pasangan || ""}
                                    onChange={(e) => updateField("nama_almarhum_pasangan", e.target.value)}
                                    placeholder="Nama Almarhum/Almarhumah"
                                    className="block w-full rounded-lg border-[#cdeae7] shadow-sm focus:border-primary-brand focus:ring-primary-brand sm:text-sm py-2.5 px-3 bg-[#f5f8f8] dark:bg-[#0f2322]/50"
                                />
                            </div>
                        )}

                        {/* No. SK Pensiun */}
                        <div>
                            <label
                                htmlFor="no_sk_pensiun"
                                className="block text-sm font-medium text-[#0c1d1b] dark:text-gray-300 mb-1"
                            >
                                No. SK Pensiun
                            </label>
                            <input
                                id="no_sk_pensiun"
                                name="no_sk_pensiun"
                                type="text"
                                value={formData.no_sk_pensiun || ""}
                                onChange={(e) => updateField("no_sk_pensiun", e.target.value)}
                                placeholder="Nomor SK Pensiun"
                                className="block w-full rounded-lg border-[#cdeae7] shadow-sm focus:border-primary-brand focus:ring-primary-brand sm:text-sm py-2.5 px-3 bg-[#f5f8f8] dark:bg-[#0f2322]/50"
                            />
                        </div>

                        {/* Tanggal SK Pensiun */}
                        <div>
                            <label
                                htmlFor="tgl_sk_pensiun"
                                className="block text-sm font-medium text-[#0c1d1b] dark:text-gray-300 mb-1"
                            >
                                Tanggal SK Pensiun
                            </label>
                            <input
                                id="tgl_sk_pensiun"
                                name="tgl_sk_pensiun"
                                type="date"
                                value={formData.tgl_sk_pensiun || ""}
                                onChange={(e) => updateField("tgl_sk_pensiun", e.target.value)}
                                className="block w-full rounded-lg border-[#cdeae7] shadow-sm focus:border-primary-brand focus:ring-primary-brand sm:text-sm py-2.5 px-3 bg-[#f5f8f8] dark:bg-[#0f2322]/50"
                            />
                        </div>

                        {/* TMT Pensiun */}
                        <div>
                            <label
                                htmlFor="tgl_pensiun_tmt"
                                className="block text-sm font-medium text-[#0c1d1b] dark:text-gray-300 mb-1"
                            >
                                TMT Pensiun
                            </label>
                            <input
                                id="tgl_pensiun_tmt"
                                name="tgl_pensiun_tmt"
                                type="date"
                                value={formData.tgl_pensiun_tmt || ""}
                                onChange={(e) => updateField("tgl_pensiun_tmt", e.target.value)}
                                className="block w-full rounded-lg border-[#cdeae7] shadow-sm focus:border-primary-brand focus:ring-primary-brand sm:text-sm py-2.5 px-3 bg-[#f5f8f8] dark:bg-[#0f2322]/50"
                            />
                        </div>

                        {/* Instansi Terakhir */}
                        <div className="col-span-1 md:col-span-2">
                            <label
                                htmlFor="instansi"
                                className="block text-sm font-medium text-[#0c1d1b] dark:text-gray-300 mb-1"
                            >
                                Instansi Terakhir
                            </label>
                            <input
                                id="instansi"
                                name="instansi"
                                type="text"
                                value={formData.instansi || ""}
                                onChange={(e) => updateField("instansi", e.target.value)}
                                placeholder="Instansi terakhir bekerja"
                                className="block w-full rounded-lg border-[#cdeae7] shadow-sm focus:border-primary-brand focus:ring-primary-brand sm:text-sm py-2.5 px-3 bg-[#f5f8f8] dark:bg-[#0f2322]/50"
                            />
                        </div>

                        {/* NOPEN (Nomor Pensiun) */}
                        <div>
                            <label
                                htmlFor="nopen"
                                className="block text-sm font-medium text-[#0c1d1b] dark:text-gray-300 mb-1"
                            >
                                Nomor Pensiun (NOPEN)
                            </label>
                            <input
                                id="nopen"
                                name="nopen"
                                type="text"
                                value={formData.nopen || ""}
                                onChange={(e) => updateField("nopen", e.target.value)}
                                placeholder="Nomor Pensiun"
                                className="block w-full rounded-lg border-[#cdeae7] shadow-sm focus:border-primary-brand focus:ring-primary-brand sm:text-sm py-2.5 px-3 bg-[#f5f8f8] dark:bg-[#0f2322]/50 font-mono"
                            />
                        </div>

                        {/* Golongan */}
                        {/* Golongan - Hidden for BUMN/BUMD */}
                        {formData.segmentasi !== "bumd_bumn" && (
                            <div>
                                <label
                                    htmlFor="golongan"
                                    className="block text-sm font-medium text-[#0c1d1b] dark:text-gray-300 mb-1"
                                >
                                    Golongan / Pangkat Terakhir
                                </label>
                                {/* Last field: Tab goes to next tab */}
                                <input
                                    id="golongan"
                                    name="golongan"
                                    type="text"
                                    value={formData.golongan || ""}
                                    onChange={(e) => updateField("golongan", e.target.value)}
                                    onKeyDown={handleTabToNext}
                                    placeholder="Contoh: IV/a"
                                    className="block w-full rounded-lg border-[#cdeae7] shadow-sm focus:border-primary-brand focus:ring-primary-brand sm:text-sm py-2.5 px-3 bg-[#f5f8f8] dark:bg-[#0f2322]/50"
                                />
                            </div>
                        )}
                    </div>
                </div>
            </form>
        </div>
    );
});
