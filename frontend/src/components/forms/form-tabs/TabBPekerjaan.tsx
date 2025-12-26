"use client";

import { useFormStore } from "@/stores/form-store";

import { Briefcase } from "lucide-react";

export default function TabBPekerjaan() {
    const { formData, updateField } = useFormStore();

    return (
        <div className="bg-white dark:bg-[#1a2c2a] rounded-xl shadow-sm border border-[#cdeae7] dark:border-opacity-10 p-6 md:p-8">
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
                            <select
                                id="segmentasi"
                                name="segmentasi"
                                value={formData.segmentasi || ""}
                                onChange={(e) => updateField("segmentasi", e.target.value)}
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
                                <option value="top_up_sisa_gaji">Tunjangan Hari Tua (THT)</option>
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
                        </div>

                        {/* Alamat Kantor */}
                        <div className="col-span-1 md:col-span-2 lg:col-span-3">
                            <label
                                htmlFor="alamat_kantor"
                                className="block text-sm font-medium text-[#0c1d1b] dark:text-gray-300 mb-1"
                            >
                                Alamat Kantor/Instansi
                            </label>
                            <textarea
                                id="alamat_kantor"
                                name="alamat_kantor"
                                rows={2}
                                value={formData.alamat_kantor || ""}
                                onChange={(e) => updateField("alamat_kantor", e.target.value)}
                                className="block w-full rounded-lg border-[#cdeae7] shadow-sm focus:border-[#00665e] focus:ring-[#00665e] sm:text-sm py-2.5 px-3 bg-[#f5f8f8] dark:bg-[#0f2322]/50"
                            />
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}
