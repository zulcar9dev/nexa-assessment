"use client";

import { useEffect, useRef, useMemo } from "react";
import { useFormStore } from "@/stores/form-store";
import { useTabNavigation } from "@/hooks/useTabNavigation";
import { calculateRemainingTime, formatRemainingTime, calculateElapsedTime, calculateContractPeriod, calculateElapsedTimeBetween } from "@/lib/utils";

import { Briefcase, UserCheck } from "lucide-react";
import { MentionTextArea } from "@/components/ui/MentionTextArea";
import { DOCUMENT_PLACEHOLDERS } from "@/constants/placeholders";
import React from "react";

export default React.memo(function TabBPekerjaan({ kategori }: { kategori?: string }) {
    const { formData, updateField } = useFormStore();
    const { handleTabToNext, handleTabToPrev } = useTabNavigation();

    // Determine if civilian/rank-related fields should be hidden
    // For "type_c" category: hide for BUMN/BUMD and Swasta (only show for Pemerintahan)
    // Special exception: Show rank fields for PNS in Swasta segmentation ONLY if instansi is RSUD Drg Clara Gobel
    const isPNSManual = /pegawai negeri sipil|pns/i.test(formData.status_kepegawaian_manual || "");
    const isClaraGobel = /rsud drg clara gobel/i.test(formData.instansi || "");
    const shouldHideRankFields = kategori === "type_c" && 
        (formData.segmentasi === "bumd_bumn" || 
         (formData.segmentasi === "swasta" && !(isClaraGobel && isPNSManual)));

    // Check for P3K/PPPK Manual Status
    const isP3K = kategori === "type_c" && /pppk|p3k|p3-k|p3\s*k|perjanjian\s*kerja/i.test(formData.status_kepegawaian_manual || "");
    const isKomisioner = kategori === "type_c" && /komisioner|anggota bawaslu/i.test(formData.status_kepegawaian_manual || "");
    const showTglBerakhir = isP3K || isKomisioner;

    // Calculate contract period for display dynamically
    const contractPeriodText = useMemo(() => {
        return calculateContractPeriod(formData.tgl_mulai_kerja, formData.tgl_berakhir_pengangkatan, "");
    }, [formData.tgl_mulai_kerja, formData.tgl_berakhir_pengangkatan]);

    // Check if the current company matches PLN Nusa Daya or Paguntaka
    const isPaguntaka = useMemo(() => {
        const inst = String(formData.instansi || "").toLowerCase();
        return inst.includes("paguntaka") || inst.includes("cahaya nusantara") || inst.includes("nusa daya");
    }, [formData.instansi]);

    const isPBT = useMemo(() => {
        const inst = String(formData.instansi || "").toLowerCase();
        return inst.includes("pani bersama") || inst.includes("pbt");
    }, [formData.instansi]);

    // Pre-populate previous employment vendor details for PLN Nusa Daya
    useEffect(() => {
        if (isPaguntaka && kategori === "type_c") {
            if (formData.prev_status_kepegawaian === undefined || formData.prev_status_kepegawaian === "") {
                updateField("prev_status_kepegawaian", "Karyawan Kontrak");
            }
            if (formData.prev_instansi === undefined || formData.prev_instansi === "") {
                updateField("prev_instansi", "PT Jaya Mahe (Vendor Outsourcing)");
            }
            if (formData.prev_tgl_mulai_kerja === undefined || formData.prev_tgl_mulai_kerja === "") {
                updateField("prev_tgl_mulai_kerja", "2019-01-01");
            }
        }
    }, [isPaguntaka, kategori, updateField]);





    // Effect: Calculate remaining service time when Date of Retirement changes
    useEffect(() => {
        if (formData.tgl_pensiun_pemohon) {
            // Pass roundUpDays = true for Pra Purna so any remaining days round up to 1 full month
            const remaining = calculateRemainingTime(formData.tgl_pensiun_pemohon, true);
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

    // Effect: Calculate previous elapsed service time (Prev Masa Kerja)
    useEffect(() => {
        if (formData.prev_tgl_mulai_kerja) {
            const endDate = formData.tgl_mulai_kerja || new Date().toISOString().split('T')[0];
            const elapsed = calculateElapsedTimeBetween(formData.prev_tgl_mulai_kerja, endDate);
            
            let formatted = "";
            if (elapsed.isFuture) {
                formatted = "Belum Mulai Kerja";
            } else {
                formatted = formatRemainingTime({ ...elapsed, isPast: false });
            }

            if (formData.prev_masa_kerja !== formatted) {
                updateField("prev_masa_kerja", formatted);
            }
        } else {
            if (formData.prev_masa_kerja !== "") {
                updateField("prev_masa_kerja", "");
            }
        }
    }, [formData.prev_tgl_mulai_kerja, formData.tgl_mulai_kerja, formData.prev_masa_kerja, updateField]);

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
                        <Briefcase className="w-6 h-6 text-primary-brand" />
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
                                className="block w-full rounded-lg border-[#cdeae7] shadow-sm focus:border-primary-brand focus:ring-primary-brand sm:text-sm py-2.5 px-3 bg-[#f5f8f8] dark:bg-[#0f2322]/50"
                            >
                                <option value="">Pilih Segmentasi</option>
                                {kategori === "type_c" ? (
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
                                className="block w-full rounded-lg border-[#cdeae7] shadow-sm focus:border-primary-brand focus:ring-primary-brand sm:text-sm py-2.5 px-3 bg-[#f5f8f8] dark:bg-[#0f2322]/50"
                            >
                                <option value="">Pilih Jenis</option>
                                <option value="baru">Baru</option>
                                <option value="top_up">Top Up</option>
                                {kategori !== "type_c" && (
                                    <option value="top_up_sisa_gaji">Top Up Sisa Gaji</option>
                                )}
                                {kategori !== "type_c" && kategori !== "type_b" && (
                                    <option value="tht">Tunjangan Hari Tua (THT)</option>
                                )}
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
                                className="block w-full rounded-lg border-[#cdeae7] shadow-sm focus:border-primary-brand focus:ring-primary-brand sm:text-sm py-2.5 px-3 bg-[#f5f8f8] dark:bg-[#0f2322]/50"
                            />
                        </div>

                        {/* Kategori Pegawai UNG (Conditional) */}
                        {formData.segmentasi === "pemerintahan" && 
                         (String(formData.instansi || "").toLowerCase().includes("universitas negeri gorontalo") || 
                          String(formData.instansi || "").toLowerCase().includes("ung")) && (
                            <div className="col-span-1">
                                <label
                                    htmlFor="ung_kategori_pegawai"
                                    className="block text-sm font-medium text-[#0c1d1b] dark:text-gray-300 mb-1"
                                >
                                    Kategori Pegawai UNG
                                </label>
                                <select
                                    id="ung_kategori_pegawai"
                                    name="ung_kategori_pegawai"
                                    value={formData.ung_kategori_pegawai || ""}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        updateField("ung_kategori_pegawai", val);
                                        // Clear remunerasi fields if switching away from non_dosen
                                        if (val !== "non_dosen") {
                                            updateField("ung_remunerasi_30_bulanan", "");
                                            updateField("ung_remunerasi_70_semesteran", "");
                                            updateField("ung_remunerasi_diakui_bulanan", 0);
                                        }
                                    }}
                                    className="block w-full rounded-lg border-[#cdeae7] shadow-sm focus:border-primary-brand focus:ring-primary-brand sm:text-sm py-2.5 px-3 bg-[#f5f8f8] dark:bg-[#0f2322]/50 font-semibold text-primary-brand dark:text-[#a5b4fc]"
                                >
                                    <option value="">Pilih Kategori</option>
                                    <option value="dosen">Dosen / Pengajar</option>
                                    <option value="non_dosen">Non-Dosen / Tenaga Kependidikan</option>
                                </select>
                            </div>
                        )}

                        {/* Status Kepegawaian Manual (Aktif Only) */}
                        {kategori === "type_c" && (
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
                                            : "border-[#cdeae7] focus:border-primary-brand focus:ring-primary-brand"
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
                                className="block w-full rounded-lg border-[#cdeae7] shadow-sm focus:border-primary-brand focus:ring-primary-brand sm:text-sm py-2.5 px-3 bg-[#f5f8f8] dark:bg-[#0f2322]/50"
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
                                    className="block w-full rounded-lg border-[#cdeae7] shadow-sm focus:border-primary-brand focus:ring-primary-brand sm:text-sm py-2.5 px-3 bg-[#f5f8f8] dark:bg-[#0f2322]/50"
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
                                    className="block w-full rounded-lg border-[#cdeae7] shadow-sm focus:border-primary-brand focus:ring-primary-brand sm:text-sm py-2.5 px-3 bg-[#f5f8f8] dark:bg-[#0f2322]/50 font-mono"
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
                                className="block w-full rounded-lg border-[#cdeae7] shadow-sm focus:border-primary-brand focus:ring-primary-brand sm:text-sm py-2.5 px-3 bg-[#f5f8f8] dark:bg-[#0f2322]/50"
                            />
                            {/* Calculation Result Display */}
                            {formData.tgl_mulai_kerja && (
                                <p className="mt-1.5 text-xs font-medium text-primary-brand dark:text-[#a5b4fc]">
                                    Masa Kerja: {formData.masa_kerja || "Menghitung..."}
                                </p>
                            )}
                        </div>

                        {/* SK CPNS / Pengangkatan */}
                        <div className={`col-span-1 md:col-span-2 lg:col-span-3 grid grid-cols-1 ${showTglBerakhir ? "md:grid-cols-3" : "md:grid-cols-2"} gap-6 p-4 bg-[#f5f8f8] dark:bg-[#0f2322]/30 rounded-lg border border-[#cdeae7] dark:border-opacity-10`}>
                            <h4 className={`col-span-1 ${showTglBerakhir ? "md:col-span-3" : "md:col-span-2"} text-sm font-bold text-primary-brand`}>
                                {kategori === "type_c"
                                    ? (isP3K ? "Data SK PENGANGKATAN PPPK" : (formData.segmentasi === "pemerintahan" ? "Data SK CPNS" : "Data SK PENGANGKATAN"))
                                    : (formData.segmentasi === "asabri" ? "Data SK PENGANGKATAN" : "Data SK CPNS")
                                }
                            </h4>
                            <div>
                                <label
                                    htmlFor="no_sk_cpns"
                                    className="block text-sm font-medium text-[#0c1d1b] dark:text-gray-300 mb-1"
                                >
                                    {kategori === "type_c"
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
                                    className="block w-full rounded-lg border-[#cdeae7] shadow-sm focus:border-primary-brand focus:ring-primary-brand sm:text-sm py-2.5 px-3 bg-white dark:bg-[#0f2322]/50"
                                />
                            </div>
                            <div>
                                <label
                                    htmlFor="tgl_sk_cpns"
                                    className="block text-sm font-medium text-[#0c1d1b] dark:text-gray-300 mb-1"
                                >
                                    {kategori === "type_c"
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
                                    className="block w-full rounded-lg border-[#cdeae7] shadow-sm focus:border-primary-brand focus:ring-primary-brand sm:text-sm py-2.5 px-3 bg-white dark:bg-[#0f2322]/50"
                                />
                            </div>
                            {/* Tanggal Berakhir Pengangkatan - P3K / Komisioner */}
                            {showTglBerakhir && (
                                <div>
                                    <label
                                        htmlFor="tgl_berakhir_pengangkatan"
                                        className="block text-sm font-medium text-[#0c1d1b] dark:text-gray-300 mb-1"
                                    >
                                        {isP3K ? "Tanggal Berakhir Pengangkatan PPPK" : "Tanggal Berakhir Masa Jabatan"}
                                    </label>
                                    <input
                                        id="tgl_berakhir_pengangkatan"
                                        name="tgl_berakhir_pengangkatan"
                                        type="date"
                                        value={formData.tgl_berakhir_pengangkatan || ""}
                                        onChange={(e) => updateField("tgl_berakhir_pengangkatan", e.target.value)}
                                        className="block w-full rounded-lg border-[#cdeae7] shadow-sm focus:border-primary-brand focus:ring-primary-brand sm:text-sm py-2.5 px-3 bg-white dark:bg-[#0f2322]/50"
                                    />
                                    <p className="mt-1 text-xs font-medium text-primary-brand dark:text-[#a5b4fc]">
                                         {contractPeriodText ? `Dihitung: Periode ${contractPeriodText}` : (isP3K ? "Periode masa kerja P3K selama 5 tahun" : "Periode masa jabatan Komisioner selama 5 tahun")}
                                     </p>
                                </div>
                            )}
                        </div>

                        {/* SK Kenaikan Pangkat */}
                        {/* SK Kenaikan Pangkat - Hidden for BUMN/BUMD and Swasta */}
                        {!shouldHideRankFields && (
                            <div className="col-span-1 md:col-span-2 lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-[#f5f8f8] dark:bg-[#0f2322]/30 rounded-lg border border-[#cdeae7] dark:border-opacity-10">
                                <h4 className="col-span-1 md:col-span-2 text-sm font-bold text-primary-brand">Data SK Kenaikan Pangkat Terakhir</h4>
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
                                        className="block w-full rounded-lg border-[#cdeae7] shadow-sm focus:border-primary-brand focus:ring-primary-brand sm:text-sm py-2.5 px-3 bg-white dark:bg-[#0f2322]/50"
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
                                        className="block w-full rounded-lg border-[#cdeae7] shadow-sm focus:border-primary-brand focus:ring-primary-brand sm:text-sm py-2.5 px-3 bg-white dark:bg-[#0f2322]/50"
                                    />
                                </div>
                            </div>
                        )}

                        {/* SK Mutasi - Specific for PLN */}
                        {kategori === "type_c" && formData.instansi?.toLowerCase().includes("pln") && (
                            <div className="col-span-1 md:col-span-2 lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-[#f5f8f8] dark:bg-[#0f2322]/30 rounded-lg border border-[#cdeae7] dark:border-opacity-10">
                                <h4 className="col-span-1 md:col-span-2 text-sm font-bold text-primary-brand">Data SK Mutasi (Khusus PLN)</h4>
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
                                        className="block w-full rounded-lg border-[#cdeae7] shadow-sm focus:border-primary-brand focus:ring-primary-brand sm:text-sm py-2.5 px-3 bg-white dark:bg-[#0f2322]/50"
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
                                        className="block w-full rounded-lg border-[#cdeae7] shadow-sm focus:border-primary-brand focus:ring-primary-brand sm:text-sm py-2.5 px-3 bg-white dark:bg-[#0f2322]/50"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Tanggal Pensiun - Hidden for Aktif */}
                        {kategori !== "type_c" && (
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
                                    className="block w-full rounded-lg border-[#cdeae7] shadow-sm focus:border-primary-brand focus:ring-primary-brand sm:text-sm py-2.5 px-3 bg-[#f5f8f8] dark:bg-[#0f2322]/50"
                                />
                                {/* Calculation Result Display */}
                                {formData.tgl_pensiun_pemohon && (
                                    <p className="mt-1.5 text-xs font-medium text-primary-brand dark:text-[#a5b4fc]">
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
                                className="block w-full rounded-lg border-[#cdeae7] shadow-sm focus:border-primary-brand focus:ring-primary-brand sm:text-sm py-2.5 px-3 bg-[#f5f8f8] dark:bg-[#0f2322]/50"
                            />
                        </div>

                        {/* Penempatan Unit (BUMN/BUMD Only) */}
                        {kategori === "type_c" && formData.segmentasi === "bumd_bumn" && (
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
                                    className="block w-full rounded-lg border-[#cdeae7] shadow-sm focus:border-primary-brand focus:ring-primary-brand sm:text-sm py-2.5 px-3 bg-[#f5f8f8] dark:bg-[#0f2322]/50 placeholder:text-gray-400 dark:placeholder:text-gray-600"
                                    placeholder="Contoh: ULP Limboto"
                                    />
                            </div>
                        )}

                        {/* Pekerjaan Sebelumnya (Dynamic PLN Nusa Daya/Paguntaka/PBT) */}
                        {(isPaguntaka || isPBT) && kategori === "type_c" && (
                            <div className="col-span-1 md:col-span-2 lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-[#f5f8f8] dark:bg-[#0f2322]/30 rounded-lg border border-[#cdeae7] dark:border-opacity-10">
                                <h4 className="col-span-1 md:col-span-2 text-sm font-bold text-primary-brand">
                                    Data Pekerjaan Sebelumnya (Riwayat Vendor / Alih Status)
                                </h4>
                                {isPBT && (
                                    <p className="col-span-1 md:col-span-2 text-xs text-gray-500 dark:text-gray-400 -mt-2">
                                        *Catatan: Jika pemohon adalah karyawan rekrutmen baru langsung di PBT (bukan alih status dari PT PETS), kosongkan kolom <strong>Nama Perusahaan Sebelumnya</strong>.
                                    </p>
                                )}
                                <div>
                                    <label
                                        htmlFor="prev_status_kepegawaian"
                                        className="block text-sm font-medium text-[#0c1d1b] dark:text-gray-300 mb-1"
                                    >
                                        Status Kepegawaian Sebelumnya
                                    </label>
                                    <input
                                        id="prev_status_kepegawaian"
                                        name="prev_status_kepegawaian"
                                        type="text"
                                        value={formData.prev_status_kepegawaian || ""}
                                        onChange={(e) => updateField("prev_status_kepegawaian", e.target.value)}
                                        className="block w-full rounded-lg border-[#cdeae7] shadow-sm focus:border-primary-brand focus:ring-primary-brand sm:text-sm py-2.5 px-3 bg-white dark:bg-[#0f2322]/50"
                                        placeholder="Contoh: Karyawan Kontrak"
                                    />
                                </div>
                                <div>
                                    <label
                                        htmlFor="prev_instansi"
                                        className="block text-sm font-medium text-[#0c1d1b] dark:text-gray-300 mb-1"
                                    >
                                        Nama Perusahaan Sebelumnya
                                    </label>
                                    <input
                                        id="prev_instansi"
                                        name="prev_instansi"
                                        type="text"
                                        value={formData.prev_instansi || ""}
                                        onChange={(e) => updateField("prev_instansi", e.target.value)}
                                        className="block w-full rounded-lg border-[#cdeae7] shadow-sm focus:border-primary-brand focus:ring-primary-brand sm:text-sm py-2.5 px-3 bg-white dark:bg-[#0f2322]/50"
                                        placeholder="Contoh: PT Puncak Emas Tani Sejahtera"
                                    />
                                </div>
                                <div>
                                    <label
                                        htmlFor="prev_masa_kerja"
                                        className="block text-sm font-medium text-[#0c1d1b] dark:text-gray-300 mb-1"
                                    >
                                        Lama Bekerja Sebelumnya
                                    </label>
                                    <input
                                        id="prev_masa_kerja"
                                        name="prev_masa_kerja"
                                        type="text"
                                        value={formData.prev_masa_kerja || ""}
                                        readOnly
                                        className="block w-full rounded-lg border-[#cdeae7] shadow-sm focus:border-primary-brand focus:ring-primary-brand sm:text-sm py-2.5 px-3 bg-[#f5f8f8] dark:bg-[#0f2322]/30 cursor-not-allowed"
                                        placeholder="Otomatis dihitung..."
                                    />
                                </div>
                                <div>
                                    <label
                                        htmlFor="prev_tgl_mulai_kerja"
                                        className="block text-sm font-medium text-[#0c1d1b] dark:text-gray-300 mb-1"
                                    >
                                        Mulai Kerja Sebelumnya (Sejak)
                                    </label>
                                    <input
                                        id="prev_tgl_mulai_kerja"
                                        name="prev_tgl_mulai_kerja"
                                        type="date"
                                        value={formData.prev_tgl_mulai_kerja || ""}
                                        onChange={(e) => updateField("prev_tgl_mulai_kerja", e.target.value)}
                                        className="block w-full rounded-lg border-[#cdeae7] shadow-sm focus:border-primary-brand focus:ring-primary-brand sm:text-sm py-2.5 px-3 bg-white dark:bg-[#0f2322]/50"
                                    />
                                </div>

                                {isPBT && (
                                    <>
                                        <div>
                                            <label
                                                htmlFor="prev_no_sk"
                                                className="block text-sm font-medium text-[#0c1d1b] dark:text-gray-300 mb-1"
                                            >
                                                Nomor SPK Sebelumnya
                                            </label>
                                            <input
                                                id="prev_no_sk"
                                                name="prev_no_sk"
                                                type="text"
                                                value={formData.prev_no_sk || ""}
                                                onChange={(e) => updateField("prev_no_sk", e.target.value)}
                                                className="block w-full rounded-lg border-[#cdeae7] shadow-sm focus:border-primary-brand focus:ring-primary-brand sm:text-sm py-2.5 px-3 bg-white dark:bg-[#0f2322]/50"
                                                placeholder="Contoh: 010/PETS-PEA/I/2024"
                                            />
                                        </div>
                                        <div>
                                            <label
                                                htmlFor="prev_tgl_sk"
                                                className="block text-sm font-medium text-[#0c1d1b] dark:text-gray-300 mb-1"
                                            >
                                                Tanggal SPK Sebelumnya
                                            </label>
                                            <input
                                                id="prev_tgl_sk"
                                                name="prev_tgl_sk"
                                                type="date"
                                                value={formData.prev_tgl_sk || ""}
                                                onChange={(e) => updateField("prev_tgl_sk", e.target.value)}
                                                className="block w-full rounded-lg border-[#cdeae7] shadow-sm focus:border-primary-brand focus:ring-primary-brand sm:text-sm py-2.5 px-3 bg-white dark:bg-[#0f2322]/50"
                                            />
                                        </div>
                                        <div>
                                            <label
                                                htmlFor="no_surat_pengalihan"
                                                className="block text-sm font-medium text-[#0c1d1b] dark:text-gray-300 mb-1"
                                            >
                                                Nomor Surat Pengalihan Pekerja
                                            </label>
                                            <input
                                                id="no_surat_pengalihan"
                                                name="no_surat_pengalihan"
                                                type="text"
                                                value={formData.no_surat_pengalihan || ""}
                                                onChange={(e) => updateField("no_surat_pengalihan", e.target.value)}
                                                className="block w-full rounded-lg border-[#cdeae7] shadow-sm focus:border-primary-brand focus:ring-primary-brand sm:text-sm py-2.5 px-3 bg-white dark:bg-[#0f2322]/50"
                                                placeholder="Contoh: 012/PETS-HR/I/2026"
                                            />
                                        </div>
                                        <div>
                                            <label
                                                htmlFor="tgl_surat_pengalihan"
                                                className="block text-sm font-medium text-[#0c1d1b] dark:text-gray-300 mb-1"
                                            >
                                                Tanggal Surat Pengalihan Pekerja
                                            </label>
                                            <input
                                                id="tgl_surat_pengalihan"
                                                name="tgl_surat_pengalihan"
                                                type="date"
                                                value={formData.tgl_surat_pengalihan || ""}
                                                onChange={(e) => updateField("tgl_surat_pengalihan", e.target.value)}
                                                className="block w-full rounded-lg border-[#cdeae7] shadow-sm focus:border-primary-brand focus:ring-primary-brand sm:text-sm py-2.5 px-3 bg-white dark:bg-[#0f2322]/50"
                                            />
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Section: Data Verifikasi */}
                <div>
                    <h3 className="text-lg font-bold text-[#0c1d1b] dark:text-white mb-4 flex items-center gap-2">
                        <UserCheck className="w-6 h-6 text-primary-brand" />
                        Data Verifikasi
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Dynamic Verifikasi Section: SDM/Kepegawaian (BUMN/BUMD) or Bendahara (Others) */}
                        {kategori === "type_c" && formData.segmentasi === "bumd_bumn" ? (
                            // Data SDM/Kepegawaian (BUMN/BUMD Only)
                            <div className="col-span-1 md:col-span-2 space-y-4">
                                <h4 className="font-semibold text-primary-brand dark:text-[#a5b4fc]">Data SDM/Kepegawaian</h4>
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
                                            className="block w-full rounded-lg border-[#cdeae7] shadow-sm focus:border-primary-brand focus:ring-primary-brand sm:text-sm py-2.5 px-3 bg-[#f5f8f8] dark:bg-[#0f2322]/50"
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
                                            className="block w-full rounded-lg border-[#cdeae7] shadow-sm focus:border-primary-brand focus:ring-primary-brand sm:text-sm py-2.5 px-3 bg-[#f5f8f8] dark:bg-[#0f2322]/50"
                                        />
                                    </div>
                                </div>
                            </div>
                        ) : (
                            // Data Bendahara (Default for Pemerintahan, Swasta, etc.)
                            <div className="col-span-1 md:col-span-2 space-y-4">
                                <h4 className="font-semibold text-primary-brand dark:text-[#a5b4fc]">Data Bendahara</h4>
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
                                            className="block w-full rounded-lg border-[#cdeae7] shadow-sm focus:border-primary-brand focus:ring-primary-brand sm:text-sm py-2.5 px-3 bg-[#f5f8f8] dark:bg-[#0f2322]/50"
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
                                            className="block w-full rounded-lg border-[#cdeae7] shadow-sm focus:border-primary-brand focus:ring-primary-brand sm:text-sm py-2.5 px-3 bg-[#f5f8f8] dark:bg-[#0f2322]/50"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Data Rekan Kerja */}
                        <div className="col-span-1 md:col-span-2 space-y-4">
                            <h4 className="font-semibold text-primary-brand dark:text-[#a5b4fc]">Data Rekan Kerja</h4>
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
                                        className="block w-full rounded-lg border-[#cdeae7] shadow-sm focus:border-primary-brand focus:ring-primary-brand sm:text-sm py-2.5 px-3 bg-[#f5f8f8] dark:bg-[#0f2322]/50"
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
                                        className="block w-full rounded-lg border-[#cdeae7] shadow-sm focus:border-primary-brand focus:ring-primary-brand sm:text-sm py-2.5 px-3 bg-[#f5f8f8] dark:bg-[#0f2322]/50"
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
