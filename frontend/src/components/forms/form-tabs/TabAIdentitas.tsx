"use client";

import { useFormStore } from "@/stores/form-store";

import { User, MapPin } from "lucide-react";

export default function TabAIdentitas() {
    const { formData, updateField } = useFormStore();

    return (
        <div className="bg-white dark:bg-[#1a2c2a] rounded-xl shadow-sm border border-[#cdeae7] dark:border-opacity-10 p-6 md:p-8">
            <form className="space-y-8">
                {/* Section 1: Data Diri */}
                <div>
                    <h3 className="text-lg font-bold text-[#0c1d1b] dark:text-white mb-4 flex items-center gap-2">
                        <User className="w-6 h-6 text-[#00665e]" />
                        Data Diri Pemohon
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Full Name */}
                        <div className="col-span-1 md:col-span-2">
                            <label
                                htmlFor="nama_pemohon"
                                className="block text-sm font-medium text-[#0c1d1b] dark:text-gray-300 mb-1"
                            >
                                Nama Lengkap (Sesuai KTP)
                            </label>
                            <input
                                id="nama_pemohon"
                                name="nama_pemohon"
                                type="text"
                                value={formData.nama_pemohon || ""}
                                onChange={(e) => updateField("nama_pemohon", e.target.value)}
                                placeholder="e.g. Budi Santoso"
                                className="block w-full rounded-lg border-[#cdeae7] shadow-sm focus:border-[#00665e] focus:ring-[#00665e] sm:text-sm py-2.5 px-3 bg-[#f5f8f8] dark:bg-[#0f2322]/50"
                            />
                        </div>

                        {/* NIK */}
                        <div>
                            <label
                                htmlFor="no_ktp_pemohon"
                                className="block text-sm font-medium text-[#0c1d1b] dark:text-gray-300 mb-1"
                            >
                                Nomor Induk Kependudukan (NIK)
                            </label>
                            <input
                                id="no_ktp_pemohon"
                                name="no_ktp_pemohon"
                                type="text"
                                value={formData.no_ktp_pemohon || ""}
                                onChange={(e) => updateField("no_ktp_pemohon", e.target.value)}
                                placeholder="3201xxxxxxxxxxxx"
                                maxLength={16}
                                className="block w-full rounded-lg border-[#cdeae7] shadow-sm focus:border-[#00665e] focus:ring-[#00665e] sm:text-sm py-2.5 px-3 bg-[#f5f8f8] dark:bg-[#0f2322]/50 font-mono"
                            />
                        </div>

                        {/* Date of Birth */}
                        <div>
                            <label
                                htmlFor="tgl_lahir_pemohon"
                                className="block text-sm font-medium text-[#0c1d1b] dark:text-gray-300 mb-1"
                            >
                                Tanggal Lahir
                            </label>
                            <div className="relative">
                                <input
                                    id="tgl_lahir_pemohon"
                                    name="tgl_lahir_pemohon"
                                    type="date"
                                    value={formData.tgl_lahir_pemohon || ""}
                                    onChange={(e) => updateField("tgl_lahir_pemohon", e.target.value)}
                                    className="block w-full rounded-lg border-[#cdeae7] shadow-sm focus:border-[#00665e] focus:ring-[#00665e] sm:text-sm py-2.5 px-3 bg-[#f5f8f8] dark:bg-[#0f2322]/50"
                                />
                            </div>
                        </div>



                        {/* Marital Status */}
                        <div>
                            <label
                                htmlFor="status_perkawinan"
                                className="block text-sm font-medium text-[#0c1d1b] dark:text-gray-300 mb-1"
                            >
                                Status Perkawinan
                            </label>
                            <select
                                id="status_perkawinan"
                                name="status_perkawinan"
                                value={formData.status_perkawinan || ""}
                                onChange={(e) => updateField("status_perkawinan", e.target.value)}
                                className="block w-full rounded-lg border-[#cdeae7] shadow-sm focus:border-[#00665e] focus:ring-[#00665e] sm:text-sm py-2.5 px-3 bg-[#f5f8f8] dark:bg-[#0f2322]/50"
                            >
                                <option value="">Pilih Status</option>
                                <option value="menikah">Menikah</option>
                                <option value="belum_menikah">Belum Menikah</option>
                                <option value="cerai_hidup">Cerai Hidup</option>
                                <option value="cerai_mati">Cerai Mati</option>
                            </select>
                        </div>


                    </div>
                </div>

                <hr className="border-[#cdeae7] dark:border-opacity-10" />

                {/* Section 2: Kontak & Alamat */}
                <div>
                    <h3 className="text-lg font-bold text-[#0c1d1b] dark:text-white mb-4 flex items-center gap-2">
                        <MapPin className="w-6 h-6 text-[#00665e]" />
                        Alamat &amp; Kontak
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
                        {/* Address */}
                        <div className="col-span-1 md:col-span-2 lg:col-span-4">
                            <label
                                htmlFor="alamat_ktp"
                                className="block text-sm font-medium text-[#0c1d1b] dark:text-gray-300 mb-1"
                            >
                                Alamat Sesuai KTP
                            </label>
                            <textarea
                                id="alamat_ktp"
                                name="alamat_ktp"
                                rows={3}
                                value={formData.alamat_ktp || ""}
                                onChange={(e) => updateField("alamat_ktp", e.target.value)}
                                className="block w-full rounded-lg border-[#cdeae7] shadow-sm focus:border-[#00665e] focus:ring-[#00665e] sm:text-sm py-2.5 px-3 bg-[#f5f8f8] dark:bg-[#0f2322]/50"
                            />
                        </div>

                        {/* Status Tempat Tinggal */}
                        <div className="lg:col-span-2">
                            <label
                                htmlFor="status_rumah"
                                className="block text-sm font-medium text-[#0c1d1b] dark:text-gray-300 mb-1"
                            >
                                Status Tempat Tinggal
                            </label>
                            <select
                                id="status_rumah"
                                name="status_rumah"
                                value={formData.status_rumah || ""}
                                onChange={(e) => updateField("status_rumah", e.target.value)}
                                className="block w-full rounded-lg border-[#cdeae7] shadow-sm focus:border-[#00665e] focus:ring-[#00665e] sm:text-sm py-2.5 px-3 bg-[#f5f8f8] dark:bg-[#0f2322]/50"
                            >
                                <option value="">Pilih Status</option>
                                <option value="milik_sendiri">Milik Sendiri</option>
                                <option value="milik_orangtua">Milik Orang Tua</option>
                                <option value="sewa">Sewa/Kontrak</option>
                                <option value="dinas">Dinas</option>
                            </select>
                        </div>

                        {/* Alamat Domisili */}
                        <div className="col-span-1 md:col-span-2 lg:col-span-4">
                            <label
                                htmlFor="alamat_domisili"
                                className="block text-sm font-medium text-[#0c1d1b] dark:text-gray-300 mb-1"
                            >
                                Alamat Domisili
                            </label>
                            <textarea
                                id="alamat_domisili"
                                name="alamat_domisili"
                                rows={3}
                                value={formData.alamat_domisili || ""}
                                onChange={(e) => updateField("alamat_domisili", e.target.value)}
                                className="block w-full rounded-lg border-[#cdeae7] shadow-sm focus:border-[#00665e] focus:ring-[#00665e] sm:text-sm py-2.5 px-3 bg-[#f5f8f8] dark:bg-[#0f2322]/50"
                            />
                        </div>

                        {/* Phone Number */}
                        <div className="lg:col-span-2">
                            <label
                                htmlFor="no_telepon"
                                className="block text-sm font-medium text-[#0c1d1b] dark:text-gray-300 mb-1"
                            >
                                No. Handphone
                            </label>
                            <div className="relative rounded-lg shadow-sm">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500 sm:text-sm">
                                    +62
                                </span>
                                <input
                                    id="no_telepon"
                                    name="no_telepon"
                                    type="text"
                                    value={formData.no_telepon || ""}
                                    onChange={(e) => updateField("no_telepon", e.target.value)}
                                    placeholder="812 3456 7890"
                                    className="block w-full rounded-lg border-[#cdeae7] pl-12 focus:border-[#00665e] focus:ring-[#00665e] sm:text-sm py-2.5 px-3 bg-[#f5f8f8] dark:bg-[#0f2322]/50"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}
