"use client";

import { useMemo } from "react";
import { useFormStore } from "@/stores/form-store";
import { useTabNavigation } from "@/hooks/useTabNavigation";

import { User, MapPin, Calendar } from "lucide-react";
import { MentionTextArea } from "@/components/ui/MentionTextArea";
import { DOCUMENT_PLACEHOLDERS } from "@/constants/placeholders";
import React from "react";

export default React.memo(function TabAIdentitas() {
    const { formData, updateField } = useFormStore();
    const { handleTabToNext, handleTabToPrev } = useTabNavigation();
    // Auto-calculate age from birth date
    const usiaPemohon = useMemo(() => {
        if (!formData.tgl_lahir_pemohon) return null;
        const birthDate = new Date(formData.tgl_lahir_pemohon);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    }, [formData.tgl_lahir_pemohon]);

    return (
        <div className="bg-white dark:bg-[#1a2c2a] rounded-xl shadow-sm border border-[#cdeae7] dark:border-opacity-10 p-6 md:p-8" data-tab-content="tab-a">
            <form className="space-y-8">
                {/* Section 1: Data Diri */}
                <div>
                    <h3 className="text-lg font-bold text-[#0c1d1b] dark:text-white mb-4 flex items-center gap-2">
                        <User className="w-6 h-6 text-[#00665e]" />
                        Data Diri Pemohon
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Full Name - First field: Shift+Tab goes to previous tab */}
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
                                onKeyDown={handleTabToPrev}
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

                        {/* Usia Pemohon - Auto calculated */}
                        <div>
                            <label
                                htmlFor="usia_pemohon"
                                className="block text-sm font-medium text-[#0c1d1b] dark:text-gray-300 mb-1"
                            >
                                Usia Pemohon
                            </label>
                            <div className="relative">
                                <input
                                    id="usia_pemohon"
                                    name="usia_pemohon"
                                    type="text"
                                    value={usiaPemohon !== null ? `${usiaPemohon} Tahun` : ""}
                                    readOnly
                                    placeholder="Otomatis dari tanggal lahir"
                                    className="block w-full rounded-lg border-[#cdeae7] shadow-sm sm:text-sm py-2.5 px-3 bg-gray-100 dark:bg-[#0f2322]/30 text-gray-600 dark:text-gray-400 cursor-not-allowed"
                                />
                            </div>
                        </div>

                        {/* Tanggal Terbit KTP */}
                        <div>
                            <label
                                htmlFor="tgl_terbit_ktp"
                                className="block text-sm font-medium text-[#0c1d1b] dark:text-gray-300 mb-1"
                            >
                                <Calendar className="w-4 h-4 inline mr-1" />
                                Tanggal Terbit KTP
                            </label>
                            <div className="relative">
                                <input
                                    id="tgl_terbit_ktp"
                                    name="tgl_terbit_ktp"
                                    type="date"
                                    value={formData.tgl_terbit_ktp || ""}
                                    onChange={(e) => updateField("tgl_terbit_ktp", e.target.value)}
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
                            <MentionTextArea
                                value={formData.alamat_ktp || ""}
                                onChange={(val) => updateField("alamat_ktp", val)}
                                options={DOCUMENT_PLACEHOLDERS}
                                rows={3}
                                placeholder="Ketik alamat KTP... (Gunakan @ untuk insert data)"
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

                        {/* Lama Tinggal */}
                        <div className="lg:col-span-2">
                            <label
                                htmlFor="lama_tinggal"
                                className="block text-sm font-medium text-[#0c1d1b] dark:text-gray-300 mb-1"
                            >
                                Lama Tinggal
                            </label>
                            <input
                                id="lama_tinggal"
                                name="lama_tinggal"
                                type="text"
                                value={formData.lama_tinggal || ""}
                                onChange={(e) => updateField("lama_tinggal", e.target.value)}
                                placeholder="e.g. 10 Tahun 5 Bulan"
                                className="block w-full rounded-lg border-[#cdeae7] shadow-sm focus:border-[#00665e] focus:ring-[#00665e] sm:text-sm py-2.5 px-3 bg-[#f5f8f8] dark:bg-[#0f2322]/50"
                            />
                        </div>

                        {/* Checkbox Domisili Berbeda */}
                        <div className="col-span-1 md:col-span-2 lg:col-span-6">
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <input
                                    id="tempat_tinggal_berbeda"
                                    name="tempat_tinggal_berbeda"
                                    type="checkbox"
                                    checked={formData.tempat_tinggal_berbeda || false}
                                    onChange={(e) => {
                                        updateField("tempat_tinggal_berbeda", e.target.checked);
                                        // Reset alamat tempat tinggal jika checkbox di-uncheck
                                        if (!e.target.checked) {
                                            updateField("alamat_tempat_tinggal", "");
                                        }
                                    }}
                                    className="w-5 h-5 rounded border-[#cdeae7] text-[#00665e] focus:ring-[#00665e] focus:ring-offset-0 cursor-pointer transition-all duration-200"
                                />
                                <span className="text-sm font-medium text-[#0c1d1b] dark:text-gray-300 group-hover:text-[#00665e] dark:group-hover:text-[#80cbc4] transition-colors duration-200">
                                    Alamat Tempat Tinggal berbeda dengan Alamat KTP
                                </span>
                            </label>
                        </div>

                        {/* Alamat Tempat Tinggal - Conditional */}
                        {formData.tempat_tinggal_berbeda && (
                            <div className="col-span-1 md:col-span-2 lg:col-span-4 animate-fade-in">
                                <label
                                    htmlFor="alamat_tempat_tinggal"
                                    className="block text-sm font-medium text-[#0c1d1b] dark:text-gray-300 mb-1"
                                >
                                    Alamat Tempat Tinggal
                                </label>
                                <MentionTextArea
                                    value={formData.alamat_tempat_tinggal || ""}
                                    onChange={(val) => updateField("alamat_tempat_tinggal", val)}
                                    options={DOCUMENT_PLACEHOLDERS}
                                    rows={3}
                                    placeholder="Ketik alamat tempat tinggal... (Gunakan @ untuk insert data)"
                                    className="block w-full rounded-lg border-[#cdeae7] shadow-sm focus:border-[#00665e] focus:ring-[#00665e] sm:text-sm py-2.5 px-3 bg-[#f5f8f8] dark:bg-[#0f2322]/50"
                                />
                            </div>
                        )}

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

                <hr className="border-[#cdeae7] dark:border-opacity-10" />

                {/* Section 3: Kerabat */}
                <div>
                    <h3 className="text-lg font-bold text-[#0c1d1b] dark:text-white mb-4 flex items-center gap-2">
                        <User className="w-6 h-6 text-[#00665e]" />
                        Data Kerabat (Verifikasi)
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Nama Kerabat */}
                        <div>
                            <label
                                htmlFor="nama_kerabat"
                                className="block text-sm font-medium text-[#0c1d1b] dark:text-gray-300 mb-1"
                            >
                                Nama Kerabat
                            </label>
                            <input
                                id="nama_kerabat"
                                name="nama_kerabat"
                                type="text"
                                value={formData.nama_kerabat || ""}
                                onChange={(e) => updateField("nama_kerabat", e.target.value)}
                                placeholder="e.g. Ahmad Susanto"
                                className="block w-full rounded-lg border-[#cdeae7] shadow-sm focus:border-[#00665e] focus:ring-[#00665e] sm:text-sm py-2.5 px-3 bg-[#f5f8f8] dark:bg-[#0f2322]/50"
                            />
                        </div>

                        {/* Hubungan Kerabat */}
                        <div>
                            <label
                                htmlFor="hubungan_kerabat"
                                className="block text-sm font-medium text-[#0c1d1b] dark:text-gray-300 mb-1"
                            >
                                Hubungan
                            </label>
                            <select
                                id="hubungan_kerabat"
                                name="hubungan_kerabat"
                                value={formData.hubungan_kerabat || ""}
                                onChange={(e) => updateField("hubungan_kerabat", e.target.value)}
                                className="block w-full rounded-lg border-[#cdeae7] shadow-sm focus:border-[#00665e] focus:ring-[#00665e] sm:text-sm py-2.5 px-3 bg-[#f5f8f8] dark:bg-[#0f2322]/50"
                            >
                                <option value="">Pilih Hubungan</option>
                                <option value="anak_kandung">Anak Kandung</option>
                                <option value="suami">Suami</option>
                                <option value="istri">Istri</option>
                                <option value="saudara_kandung">Saudara Kandung</option>
                                <option value="orang_tua">Orang Tua</option>
                                <option value="lainnya">Lainnya</option>
                            </select>
                        </div>

                        {/* No Telepon Kerabat - Last field: Tab goes to next tab */}
                        <div>
                            <label
                                htmlFor="no_telepon_kerabat"
                                className="block text-sm font-medium text-[#0c1d1b] dark:text-gray-300 mb-1"
                            >
                                No. Telepon Kerabat
                            </label>
                            <div className="relative rounded-lg shadow-sm">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500 sm:text-sm">
                                    +62
                                </span>
                                <input
                                    id="no_telepon_kerabat"
                                    name="no_telepon_kerabat"
                                    type="text"
                                    value={formData.no_telepon_kerabat || ""}
                                    onChange={(e) => updateField("no_telepon_kerabat", e.target.value)}
                                    onKeyDown={handleTabToNext}
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
});
