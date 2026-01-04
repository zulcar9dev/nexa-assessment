"use client";

import { useEffect } from "react";
import { useFormStore } from "@/stores/form-store";
import { useTabNavigation } from "@/hooks/useTabNavigation";
import { calculateRemainingTime, formatRemainingTime, calculateElapsedTime } from "@/lib/utils";

import { Briefcase, UserCheck } from "lucide-react";
import { MentionTextArea } from "@/components/ui/MentionTextArea";
import { DOCUMENT_PLACEHOLDERS } from "@/constants/placeholders";

export default function TabBPekerjaan() {
    const { formData, updateField } = useFormStore();
    const { handleTabToNext, handleTabToPrev } = useTabNavigation();

    // Effect: Calculate remaining service time when Date of Retirement changes
    useEffect(() => {
        if (formData.tgl_pensiun_pemohon) {
            const remaining = calculateRemainingTime(formData.tgl_pensiun_pemohon);
            const formatted = formatRemainingTime(remaining);

            // Only update if different to avoid infinite loops (though zustand handles this well)
            if (formData.sisa_masa_kerja !== formatted) {
                updateField("sisa_masa_kerja", formatted);
            }
        }
    }, [formData.tgl_pensiun_pemohon, formData.sisa_masa_kerja, updateField]);

    // Effect: Calculate elapsed service time (Masa Kerja)
    useEffect(() => {
        if (formData.tgl_mulai_kerja) {
            const elapsed = calculateElapsedTime(formData.tgl_mulai_kerja);
            // Reuse formatRemainingTime as the structure is compatible {years, months, weeks, days}
            // but we need to handle isFuture
            let formatted = "";
            if (elapsed.isFuture) {
                formatted = "Belum Mulai Kerja";
            } else {
                // Manually format to avoid "Sudah Pensiun" or just pass isPast: false shim
                // Actually formatRemainingTime checks isPast. We can pass isPast: false.
                formatted = formatRemainingTime({ ...elapsed, isPast: false });
            }

            if (formData.masa_kerja !== formatted) {
                updateField("masa_kerja", formatted);
            }
        }
    }, [formData.tgl_mulai_kerja, formData.masa_kerja, updateField]);

    return (
        <div className="bg-white dark:bg-[#1a2c2a] rounded-xl shadow-sm border border-[#cdeae7] dark:border-opacity-10 p-6 md:p-8" data-tab-content="tab-b">
            <form className="space-y-8">
                {/* Section: Data Pekerjaan */}
                <div>
                    <h3 className="text-lg font-bold text-[#0c1d1b] dark:text-white mb-4 flex items-center gap-2">
                        <Briefcase className="w-6 h-6 text-[#00665e]" />
                        Data Pekerjaan
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                                className="block w-full rounded-lg border-[#cdeae7] shadow-sm focus:border-[#00665e] focus:ring-[#00665e] sm:text-sm py-2.5 px-3 bg-[#f5f8f8] dark:bg-[#0f2322]/50"
                            >
                                <option value="">Pilih Segmentasi</option>
                                <option value="taspen">TASPEN</option>
                                <option value="asabri">ASABRI</option>
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
                                className="block w-full rounded-lg border-[#cdeae7] shadow-sm focus:border-[#00665e] focus:ring-[#00665e] sm:text-sm py-2.5 px-3 bg-[#f5f8f8] dark:bg-[#0f2322]/50"
                            >
                                <option value="">Pilih Jenis</option>
                                <option value="baru">Baru</option>
                                <option value="top_up">Top Up</option>
                                <option value="top_up_sisa_gaji">Top Up Sisa Gaji</option>
                                <option value="tht">Tunjangan Hari Tua (THT)</option>
                                <option value="takeover">Take Over</option>
                            </select>
                        </div>

                        {/* Instansi */}
                        <div className="col-span-1 md:col-span-2">
                            <label
                                htmlFor="instansi"
                                className="block text-sm font-medium text-[#0c1d1b] dark:text-gray-300 mb-1"
                            >
                                Nama Instansi/Perusahaan
                            </label>
                            <input
                                id="instansi"
                                name="instansi"
                                type="text"
                                value={formData.instansi || ""}
                                onChange={(e) => updateField("instansi", e.target.value)}
                                placeholder="e.g. Pemerintah Kota Gorontalo"
                                className="block w-full rounded-lg border-[#cdeae7] shadow-sm focus:border-[#00665e] focus:ring-[#00665e] sm:text-sm py-2.5 px-3 bg-[#f5f8f8] dark:bg-[#0f2322]/50"
                            />
                        </div>

                        {/* Jabatan */}
                        <div>
                            <label
                                htmlFor="jabatan"
                                className="block text-sm font-medium text-[#0c1d1b] dark:text-gray-300 mb-1"
                            >
                                Jabatan
                            </label>
                            <input
                                id="jabatan"
                                name="jabatan"
                                type="text"
                                value={formData.jabatan || ""}
                                onChange={(e) => updateField("jabatan", e.target.value)}
                                placeholder="e.g. Kepala Bagian"
                                className="block w-full rounded-lg border-[#cdeae7] shadow-sm focus:border-[#00665e] focus:ring-[#00665e] sm:text-sm py-2.5 px-3 bg-[#f5f8f8] dark:bg-[#0f2322]/50"
                            />
                        </div>

                        {/* Golongan */}
                        <div>
                            <label
                                htmlFor="golongan"
                                className="block text-sm font-medium text-[#0c1d1b] dark:text-gray-300 mb-1"
                            >
                                Golongan/Pangkat
                            </label>
                            <input
                                id="golongan"
                                name="golongan"
                                type="text"
                                value={formData.golongan || ""}
                                onChange={(e) => updateField("golongan", e.target.value)}
                                placeholder="e.g. IV/a"
                                className="block w-full rounded-lg border-[#cdeae7] shadow-sm focus:border-[#00665e] focus:ring-[#00665e] sm:text-sm py-2.5 px-3 bg-[#f5f8f8] dark:bg-[#0f2322]/50"
                            />
                        </div>

                        {/* NIP */}
                        <div>
                            <label
                                htmlFor="nip"
                                className="block text-sm font-medium text-[#0c1d1b] dark:text-gray-300 mb-1"
                            >
                                NIP/NRP
                            </label>
                            <input
                                id="nip"
                                name="nip"
                                type="text"
                                value={formData.nip || ""}
                                onChange={(e) => updateField("nip", e.target.value)}
                                placeholder="19xxxxxxxxxxxxxxxxx"
                                className="block w-full rounded-lg border-[#cdeae7] shadow-sm focus:border-[#00665e] focus:ring-[#00665e] sm:text-sm py-2.5 px-3 bg-[#f5f8f8] dark:bg-[#0f2322]/50 font-mono"
                            />
                        </div>

                        {/* Tanggal Mulai Kerja */}
                        <div>
                            <label
                                htmlFor="tgl_mulai_kerja"
                                className="block text-sm font-medium text-[#0c1d1b] dark:text-gray-300 mb-1"
                            >
                                Tanggal Mulai Kerja
                            </label>
                            <input
                                id="tgl_mulai_kerja"
                                name="tgl_mulai_kerja"
                                type="date"
                                value={formData.tgl_mulai_kerja || ""}
                                onChange={(e) => updateField("tgl_mulai_kerja", e.target.value)}
                                className="block w-full rounded-lg border-[#cdeae7] shadow-sm focus:border-[#00665e] focus:ring-[#00665e] sm:text-sm py-2.5 px-3 bg-[#f5f8f8] dark:bg-[#0f2322]/50"
                            />
                            {/* Calculation Result Display */}
                            {formData.tgl_mulai_kerja && (
                                <p className="mt-1.5 text-xs font-medium text-[#00665e] dark:text-[#80cbc4]">
                                    Masa Kerja: {formData.masa_kerja || "Menghitung..."}
                                </p>
                            )}
                        </div>

                        {/* SK CPNS / Pengangkatan */}
                        <div className="col-span-1 md:col-span-2 lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-[#f5f8f8] dark:bg-[#0f2322]/30 rounded-lg border border-[#cdeae7] dark:border-opacity-10">
                            <h4 className="col-span-1 md:col-span-2 text-sm font-bold text-[#00665e]">
                                {formData.segmentasi === "asabri" ? "Data SK PENGANGKATAN" : "Data SK CPNS"}
                            </h4>
                            <div>
                                <label
                                    htmlFor="no_sk_cpns"
                                    className="block text-sm font-medium text-[#0c1d1b] dark:text-gray-300 mb-1"
                                >
                                    {formData.segmentasi === "asabri" ? "Nomor SK PENGANGKATAN" : "Nomor SK CPNS"}
                                </label>
                                <input
                                    id="no_sk_cpns"
                                    name="no_sk_cpns"
                                    type="text"
                                    value={formData.no_sk_cpns || ""}
                                    onChange={(e) => updateField("no_sk_cpns", e.target.value)}
                                    className="block w-full rounded-lg border-[#cdeae7] shadow-sm focus:border-[#00665e] focus:ring-[#00665e] sm:text-sm py-2.5 px-3 bg-white dark:bg-[#0f2322]/50"
                                />
                            </div>
                            <div>
                                <label
                                    htmlFor="tgl_sk_cpns"
                                    className="block text-sm font-medium text-[#0c1d1b] dark:text-gray-300 mb-1"
                                >
                                    {formData.segmentasi === "asabri" ? "Tanggal SK PENGANGKATAN" : "Tanggal SK CPNS"}
                                </label>
                                <input
                                    id="tgl_sk_cpns"
                                    name="tgl_sk_cpns"
                                    type="date"
                                    value={formData.tgl_sk_cpns || ""}
                                    onChange={(e) => updateField("tgl_sk_cpns", e.target.value)}
                                    className="block w-full rounded-lg border-[#cdeae7] shadow-sm focus:border-[#00665e] focus:ring-[#00665e] sm:text-sm py-2.5 px-3 bg-white dark:bg-[#0f2322]/50"
                                />
                            </div>
                        </div>

                        {/* SK Kenaikan Pangkat */}
                        <div className="col-span-1 md:col-span-2 lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-[#f5f8f8] dark:bg-[#0f2322]/30 rounded-lg border border-[#cdeae7] dark:border-opacity-10">
                            <h4 className="col-span-1 md:col-span-2 text-sm font-bold text-[#00665e]">Data SK Kenaikan Pangkat Terakhir</h4>
                            <div>
                                <label
                                    htmlFor="no_sk_kenaikan_pangkat"
                                    className="block text-sm font-medium text-[#0c1d1b] dark:text-gray-300 mb-1"
                                >
                                    Nomor SK Kenaikan Pangkat
                                </label>
                                <input
                                    id="no_sk_kenaikan_pangkat"
                                    name="no_sk_kenaikan_pangkat"
                                    type="text"
                                    value={formData.no_sk_kenaikan_pangkat || ""}
                                    onChange={(e) => updateField("no_sk_kenaikan_pangkat", e.target.value)}
                                    className="block w-full rounded-lg border-[#cdeae7] shadow-sm focus:border-[#00665e] focus:ring-[#00665e] sm:text-sm py-2.5 px-3 bg-white dark:bg-[#0f2322]/50"
                                />
                            </div>
                            <div>
                                <label
                                    htmlFor="tgl_sk_kenaikan_pangkat"
                                    className="block text-sm font-medium text-[#0c1d1b] dark:text-gray-300 mb-1"
                                >
                                    Tanggal SK Kenaikan Pangkat
                                </label>
                                <input
                                    id="tgl_sk_kenaikan_pangkat"
                                    name="tgl_sk_kenaikan_pangkat"
                                    type="date"
                                    value={formData.tgl_sk_kenaikan_pangkat || ""}
                                    onChange={(e) => updateField("tgl_sk_kenaikan_pangkat", e.target.value)}
                                    className="block w-full rounded-lg border-[#cdeae7] shadow-sm focus:border-[#00665e] focus:ring-[#00665e] sm:text-sm py-2.5 px-3 bg-white dark:bg-[#0f2322]/50"
                                />
                            </div>
                        </div>

                        {/* Tanggal Pensiun */}
                        <div>
                            <label
                                htmlFor="tgl_pensiun_pemohon"
                                className="block text-sm font-medium text-[#0c1d1b] dark:text-gray-300 mb-1"
                            >
                                Tanggal Pensiun (TMT)
                            </label>
                            <input
                                id="tgl_pensiun_pemohon"
                                name="tgl_pensiun_pemohon"
                                type="date"
                                value={formData.tgl_pensiun_pemohon || ""}
                                onChange={(e) => updateField("tgl_pensiun_pemohon", e.target.value)}
                                className="block w-full rounded-lg border-[#cdeae7] shadow-sm focus:border-[#00665e] focus:ring-[#00665e] sm:text-sm py-2.5 px-3 bg-[#f5f8f8] dark:bg-[#0f2322]/50"
                            />
                            {/* Calculation Result Display */}
                            {formData.tgl_pensiun_pemohon && (
                                <p className="mt-1.5 text-xs font-medium text-[#00665e] dark:text-[#80cbc4]">
                                    Sisa Masa Kerja: {formData.sisa_masa_kerja || "Menghitung..."}
                                </p>
                            )}
                        </div>

                        {/* Alamat Kantor */}
                        <div className="col-span-1 md:col-span-2 lg:col-span-3">
                            <label
                                htmlFor="alamat_kantor"
                                className="block text-sm font-medium text-[#0c1d1b] dark:text-gray-300 mb-1"
                            >
                                Alamat Kantor/Instansi
                            </label>
                            {/* Last field: Tab goes to next tab */}
                            <MentionTextArea
                                value={formData.alamat_kantor || ""}
                                onChange={(val) => updateField("alamat_kantor", val)}
                                options={DOCUMENT_PLACEHOLDERS}
                                rows={2}
                                placeholder="Ketik alamat kantor... (Gunakan @ untuk insert data)"
                                className="block w-full rounded-lg border-[#cdeae7] shadow-sm focus:border-[#00665e] focus:ring-[#00665e] sm:text-sm py-2.5 px-3 bg-[#f5f8f8] dark:bg-[#0f2322]/50"
                            />
                        </div>
                    </div>
                </div>

                {/* Section: Data Verifikasi */}
                <div>
                    <h3 className="text-lg font-bold text-[#0c1d1b] dark:text-white mb-4 flex items-center gap-2">
                        <UserCheck className="w-6 h-6 text-[#00665e]" />
                        Data Verifikasi
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Data Bendahara */}
                        <div className="col-span-1 md:col-span-2 space-y-4">
                            <h4 className="font-semibold text-[#00665e] dark:text-[#80cbc4]">Data Bendahara</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label
                                        htmlFor="nama_bendahara"
                                        className="block text-sm font-medium text-[#0c1d1b] dark:text-gray-300 mb-1"
                                    >
                                        Nama Bendahara
                                    </label>
                                    <input
                                        id="nama_bendahara"
                                        name="nama_bendahara"
                                        type="text"
                                        value={formData.nama_bendahara || ""}
                                        onChange={(e) => updateField("nama_bendahara", e.target.value)}
                                        placeholder="Contoh: Budi Santoso"
                                        className="block w-full rounded-lg border-[#cdeae7] shadow-sm focus:border-[#00665e] focus:ring-[#00665e] sm:text-sm py-2.5 px-3 bg-[#f5f8f8] dark:bg-[#0f2322]/50"
                                    />
                                </div>
                                <div>
                                    <label
                                        htmlFor="no_hp_bendahara"
                                        className="block text-sm font-medium text-[#0c1d1b] dark:text-gray-300 mb-1"
                                    >
                                        No. HP Bendahara
                                    </label>
                                    <input
                                        id="no_hp_bendahara"
                                        name="no_hp_bendahara"
                                        type="tel"
                                        value={formData.no_hp_bendahara || ""}
                                        onChange={(e) => updateField("no_hp_bendahara", e.target.value)}
                                        placeholder="08xxxxxxxxxx"
                                        className="block w-full rounded-lg border-[#cdeae7] shadow-sm focus:border-[#00665e] focus:ring-[#00665e] sm:text-sm py-2.5 px-3 bg-[#f5f8f8] dark:bg-[#0f2322]/50"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Data Rekan Kerja */}
                        <div className="col-span-1 md:col-span-2 space-y-4">
                            <h4 className="font-semibold text-[#00665e] dark:text-[#80cbc4]">Data Rekan Kerja</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label
                                        htmlFor="nama_rekan_kerja"
                                        className="block text-sm font-medium text-[#0c1d1b] dark:text-gray-300 mb-1"
                                    >
                                        Nama Rekan Kerja
                                    </label>
                                    <input
                                        id="nama_rekan_kerja"
                                        name="nama_rekan_kerja"
                                        type="text"
                                        value={formData.nama_rekan_kerja || ""}
                                        onChange={(e) => updateField("nama_rekan_kerja", e.target.value)}
                                        placeholder="Contoh: Siti Aminah"
                                        className="block w-full rounded-lg border-[#cdeae7] shadow-sm focus:border-[#00665e] focus:ring-[#00665e] sm:text-sm py-2.5 px-3 bg-[#f5f8f8] dark:bg-[#0f2322]/50"
                                    />
                                </div>
                                <div>
                                    <label
                                        htmlFor="no_hp_rekan_kerja"
                                        className="block text-sm font-medium text-[#0c1d1b] dark:text-gray-300 mb-1"
                                    >
                                        No. HP Rekan Kerja
                                    </label>
                                    <input
                                        id="no_hp_rekan_kerja"
                                        name="no_hp_rekan_kerja"
                                        type="tel"
                                        value={formData.no_hp_rekan_kerja || ""}
                                        onChange={(e) => updateField("no_hp_rekan_kerja", e.target.value)}
                                        placeholder="08xxxxxxxxxx"
                                        onKeyDown={handleTabToNext}
                                        className="block w-full rounded-lg border-[#cdeae7] shadow-sm focus:border-[#00665e] focus:ring-[#00665e] sm:text-sm py-2.5 px-3 bg-[#f5f8f8] dark:bg-[#0f2322]/50"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}
