"use client";

import { useEffect, useRef } from "react";
import { useFormStore } from "@/stores/form-store";
import { useTabNavigation } from "@/hooks/useTabNavigation";
import { calculateRemainingTime, formatRemainingTime, calculateElapsedTime } from "@/lib/utils";

import { Briefcase, UserCheck } from "lucide-react";
import { MentionTextArea } from "@/components/ui/MentionTextArea";
import { DOCUMENT_PLACEHOLDERS } from "@/constants/placeholders";
import React from "react";

export default React.memo(function TabBPekerjaan({ kategori }: { kategori?: string }) {
    const { formData, updateField } = useFormStore();
    const { handleTabToNext, handleTabToPrev } = useTabNavigation();

    // Determine if civilian/rank-related fields should be hidden
    // For "aktif" category: hide for BUMN/BUMD and Swasta (only show for Pemerintahan)
    const shouldHideRankFields = kategori === "aktif" && 
        (formData.segmentasi === "bumd_bumn" || formData.segmentasi === "swasta");

    // Check for P3K/PPPK Manual Status
    const isP3K = kategori === "aktif" && /p3k|pppk/i.test(formData.status_kepegawaian_manual || "");



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

    // Effect: Sync verifier data when segmentation changes
    // This ensures data is preserved when switching between BUMN/BUMD and other segments
    const prevSegmentasi = useRef(formData.segmentasi);
    useEffect(() => {
        const currentSeg = formData.segmentasi;
        const prevSeg = prevSegmentasi.current;

        // Only sync if segmentation actually changed
        if (prevSeg !== currentSeg) {
            const isBumnBumd = currentSeg === "bumd_bumn";
            const wasBumnBumd = prevSeg === "bumd_bumn";

            if (isBumnBumd && !wasBumnBumd) {
                // Switched TO BUMN/BUMD: Copy Bendahara → SDM (if SDM is empty)
                if (!formData.nama_sdm && formData.nama_bendahara) {
                    updateField("nama_sdm", formData.nama_bendahara);
                }
                if (!formData.no_hp_sdm && formData.no_hp_bendahara) {
                    updateField("no_hp_sdm", formData.no_hp_bendahara);
                }
            } else if (!isBumnBumd && wasBumnBumd) {
                // Switched FROM BUMN/BUMD: Copy SDM → Bendahara (if Bendahara is empty)
                if (!formData.nama_bendahara && formData.nama_sdm) {
                    updateField("nama_bendahara", formData.nama_sdm);
                }
                if (!formData.no_hp_bendahara && formData.no_hp_sdm) {
                    updateField("no_hp_bendahara", formData.no_hp_sdm);
                }
            }

            // Update ref for next comparison
            prevSegmentasi.current = currentSeg;
        }
    }, [formData.segmentasi, formData.nama_bendahara, formData.no_hp_bendahara, formData.nama_sdm, formData.no_hp_sdm, updateField]);

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
                                {kategori === "aktif" ? (
                                    <>
                                        <option value="bumd_bumn">Perusahaan BUMD/BUMN (Group)</option>
                                        <option value="swasta">Perusahaan Swasta (Payroll/Non Payroll)</option>
                                        <option value="pemerintahan">Instansi Pemerintahan/Kementerian</option>
                                    </>
                                ) : (
                                    <>
                                        <option value="taspen">TASPEN</option>
                                        <option value="asabri">ASABRI</option>
                                    </>
                                )}
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

                        {/* Status Kepegawaian Manual (Aktif Only) */}
                        {kategori === "aktif" && (
                            <div className="col-span-1 md:col-span-2 lg:col-span-3">
                                <label
                                    htmlFor="status_kepegawaian_manual"
                                    className="block text-sm font-medium text-[#0c1d1b] dark:text-gray-300 mb-1"
                                >
                                    Status Kepegawaian
                                </label>
                                <input
                                    id="status_kepegawaian_manual"
                                    name="status_kepegawaian_manual"
                                    type="text"
                                    value={formData.status_kepegawaian_manual || ""}
                                    onChange={(e) => updateField("status_kepegawaian_manual", e.target.value)}
                                    placeholder={
                                        formData.segmentasi === "pemerintahan"
                                            ? "e.g. Pegawai Negeri Sipil (PNS)"
                                            : formData.segmentasi === "bumd_bumn"
                                                ? "e.g. Pegawai PKWT"
                                                : "e.g. Karyawan Tetap"
                                    }
                                    className={`block w-full rounded-lg shadow-sm sm:text-sm py-2.5 px-3 bg-[#f5f8f8] dark:bg-[#0f2322]/50 ${!formData.status_kepegawaian_manual?.trim()
                                            ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                                            : "border-[#cdeae7] focus:border-[#00665e] focus:ring-[#00665e]"
                                        }`}
                                />
                                {!formData.status_kepegawaian_manual?.trim() && (
                                    <p className="mt-1 text-xs text-red-500">
                                        Status kepegawaian wajib diisi
                                    </p>
                                )}
                                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                    Contoh: &quot;Pegawai Negeri Sipil (PNS)&quot;, &quot;Pegawai PKWT&quot;, &quot;Karyawan Tetap&quot;
                                </p>
                            </div>
                        )}




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
                        {/* Golongan - Hidden for BUMN/BUMD and Swasta */}
                        {!shouldHideRankFields && (
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
                        )}

                        {/* NIP */}
                        {/* NIP - Hidden for BUMN/BUMD and Swasta */}
                        {!shouldHideRankFields && (
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
                        )}

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
                        <div className={`col-span-1 md:col-span-2 lg:col-span-3 grid grid-cols-1 ${isP3K ? "md:grid-cols-3" : "md:grid-cols-2"} gap-6 p-4 bg-[#f5f8f8] dark:bg-[#0f2322]/30 rounded-lg border border-[#cdeae7] dark:border-opacity-10`}>
                            <h4 className={`col-span-1 ${isP3K ? "md:col-span-3" : "md:col-span-2"} text-sm font-bold text-[#00665e]`}>
                                {kategori === "aktif"
                                    ? (isP3K ? "Data SK PENGANGKATAN PPPK" : (formData.segmentasi === "pemerintahan" ? "Data SK CPNS" : "Data SK PENGANGKATAN"))
                                    : (formData.segmentasi === "asabri" ? "Data SK PENGANGKATAN" : "Data SK CPNS")
                                }
                            </h4>
                            <div>
                                <label
                                    htmlFor="no_sk_cpns"
                                    className="block text-sm font-medium text-[#0c1d1b] dark:text-gray-300 mb-1"
                                >
                                    {kategori === "aktif"
                                        ? (isP3K ? "Nomor SK Pengangkatan PPPK" : (formData.segmentasi === "pemerintahan" ? "Nomor SK CPNS" : "Nomor SK PENGANGKATAN"))
                                        : (formData.segmentasi === "asabri" ? "Nomor SK PENGANGKATAN" : "Nomor SK CPNS")
                                    }
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
                                    {kategori === "aktif"
                                        ? (isP3K ? "Tanggal SK Pengangkatan PPPK" : (formData.segmentasi === "pemerintahan" ? "Tanggal SK CPNS" : "Tanggal SK PENGANGKATAN"))
                                        : (formData.segmentasi === "asabri" ? "Tanggal SK PENGANGKATAN" : "Tanggal SK CPNS")
                                    }
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
                            {/* Tanggal Berakhir Pengangkatan - P3K Only */}
                            {isP3K && (
                                <div>
                                    <label
                                        htmlFor="tgl_berakhir_pengangkatan"
                                        className="block text-sm font-medium text-[#0c1d1b] dark:text-gray-300 mb-1"
                                    >
                                        Tanggal Berakhir Pengangkatan PPPK
                                    </label>
                                    <input
                                        id="tgl_berakhir_pengangkatan"
                                        name="tgl_berakhir_pengangkatan"
                                        type="date"
                                        value={formData.tgl_berakhir_pengangkatan || ""}
                                        onChange={(e) => updateField("tgl_berakhir_pengangkatan", e.target.value)}
                                        className="block w-full rounded-lg border-[#cdeae7] shadow-sm focus:border-[#00665e] focus:ring-[#00665e] sm:text-sm py-2.5 px-3 bg-white dark:bg-[#0f2322]/50"
                                    />
                                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                        Periode masa kerja P3K selama 5 tahun
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* SK Kenaikan Pangkat */}
                        {/* SK Kenaikan Pangkat - Hidden for BUMN/BUMD and Swasta */}
                        {!shouldHideRankFields && (
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
                        )}

                        {/* SK Mutasi - Specific for PLN */}
                        {kategori === "aktif" && formData.instansi?.toLowerCase().includes("pln") && (
                            <div className="col-span-1 md:col-span-2 lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-[#f5f8f8] dark:bg-[#0f2322]/30 rounded-lg border border-[#cdeae7] dark:border-opacity-10">
                                <h4 className="col-span-1 md:col-span-2 text-sm font-bold text-[#00665e]">Data SK Mutasi (Khusus PLN)</h4>
                                <div>
                                    <label
                                        htmlFor="no_sk_mutasi"
                                        className="block text-sm font-medium text-[#0c1d1b] dark:text-gray-300 mb-1"
                                    >
                                        Nomor SK Mutasi
                                    </label>
                                    <input
                                        id="no_sk_mutasi"
                                        name="no_sk_mutasi"
                                        type="text"
                                        value={formData.no_sk_mutasi || ""}
                                        onChange={(e) => updateField("no_sk_mutasi", e.target.value)}
                                        className="block w-full rounded-lg border-[#cdeae7] shadow-sm focus:border-[#00665e] focus:ring-[#00665e] sm:text-sm py-2.5 px-3 bg-white dark:bg-[#0f2322]/50"
                                    />
                                </div>
                                <div>
                                    <label
                                        htmlFor="tgl_sk_mutasi"
                                        className="block text-sm font-medium text-[#0c1d1b] dark:text-gray-300 mb-1"
                                    >
                                        Tanggal SK Mutasi
                                    </label>
                                    <input
                                        id="tgl_sk_mutasi"
                                        name="tgl_sk_mutasi"
                                        type="date"
                                        value={formData.tgl_sk_mutasi || ""}
                                        onChange={(e) => updateField("tgl_sk_mutasi", e.target.value)}
                                        className="block w-full rounded-lg border-[#cdeae7] shadow-sm focus:border-[#00665e] focus:ring-[#00665e] sm:text-sm py-2.5 px-3 bg-white dark:bg-[#0f2322]/50"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Tanggal Pensiun - Hidden for Aktif */}
                        {kategori !== "aktif" && (
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
                        )}

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

                        {/* Penempatan Unit (BUMN/BUMD Only) */}
                        {kategori === "aktif" && formData.segmentasi === "bumd_bumn" && (
                            <div className="col-span-1 md:col-span-2 lg:col-span-3">
                                <label
                                    htmlFor="penempatan_unit"
                                    className="block text-sm font-medium text-[#0c1d1b] dark:text-gray-300 mb-1"
                                >
                                    Unit Penempatan
                                </label>
                                <input
                                    id="penempatan_unit"
                                    name="penempatan_unit"
                                    type="text"
                                    value={formData.penempatan_unit || ""}
                                    onChange={(e) => updateField("penempatan_unit", e.target.value)}
                                    onKeyDown={handleTabToNext}
                                    className="block w-full rounded-lg border-[#cdeae7] shadow-sm focus:border-[#00665e] focus:ring-[#00665e] sm:text-sm py-2.5 px-3 bg-[#f5f8f8] dark:bg-[#0f2322]/50 placeholder:text-gray-400 dark:placeholder:text-gray-600"
                                    placeholder="Contoh: ULP Limboto"
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* Section: Data Verifikasi */}
                <div>
                    <h3 className="text-lg font-bold text-[#0c1d1b] dark:text-white mb-4 flex items-center gap-2">
                        <UserCheck className="w-6 h-6 text-[#00665e]" />
                        Data Verifikasi
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Dynamic Verifikasi Section: SDM/Kepegawaian (BUMN/BUMD) or Bendahara (Others) */}
                        {kategori === "aktif" && formData.segmentasi === "bumd_bumn" ? (
                            // Data SDM/Kepegawaian (BUMN/BUMD Only)
                            <div className="col-span-1 md:col-span-2 space-y-4">
                                <h4 className="font-semibold text-[#00665e] dark:text-[#80cbc4]">Data SDM/Kepegawaian</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label
                                            htmlFor="nama_sdm"
                                            className="block text-sm font-medium text-[#0c1d1b] dark:text-gray-300 mb-1"
                                        >
                                            Nama SDM/Kepegawaian
                                        </label>
                                        <input
                                            id="nama_sdm"
                                            name="nama_sdm"
                                            type="text"
                                            value={formData.nama_sdm || ""}
                                            onChange={(e) => updateField("nama_sdm", e.target.value)}
                                            placeholder="Contoh: Ahmad Hidayat"
                                            className="block w-full rounded-lg border-[#cdeae7] shadow-sm focus:border-[#00665e] focus:ring-[#00665e] sm:text-sm py-2.5 px-3 bg-[#f5f8f8] dark:bg-[#0f2322]/50"
                                        />
                                    </div>
                                    <div>
                                        <label
                                            htmlFor="no_hp_sdm"
                                            className="block text-sm font-medium text-[#0c1d1b] dark:text-gray-300 mb-1"
                                        >
                                            No. HP SDM/Kepegawaian
                                        </label>
                                        <input
                                            id="no_hp_sdm"
                                            name="no_hp_sdm"
                                            type="tel"
                                            value={formData.no_hp_sdm || ""}
                                            onChange={(e) => updateField("no_hp_sdm", e.target.value)}
                                            placeholder="08xxxxxxxxxx"
                                            className="block w-full rounded-lg border-[#cdeae7] shadow-sm focus:border-[#00665e] focus:ring-[#00665e] sm:text-sm py-2.5 px-3 bg-[#f5f8f8] dark:bg-[#0f2322]/50"
                                        />
                                    </div>
                                </div>
                            </div>
                        ) : (
                            // Data Bendahara (Default for Pemerintahan, Swasta, etc.)
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
                        )}

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
});
