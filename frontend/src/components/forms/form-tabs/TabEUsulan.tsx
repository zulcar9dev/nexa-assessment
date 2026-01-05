"use client";

import { useFormStore } from "@/stores/form-store";
import { useTabNavigation } from "@/hooks/useTabNavigation";
import { CreditCard, Calculator } from "lucide-react";
import { MentionTextArea } from "@/components/ui/MentionTextArea";
import { DOCUMENT_PLACEHOLDERS } from "@/constants/placeholders";
import { calculateMonthsDifference, terbilang, calculateAge } from "@/lib/utils";
import { useEffect, useMemo } from "react";


interface TabEUsulanProps {
    kategori?: "purna" | "prapurna";
}

export default function TabEUsulan({ kategori = "purna" }: TabEUsulanProps) {
    const { formData, updateField } = useFormStore();
    const { handleTabToPrev } = useTabNavigation();

    const formatCurrencyDisplay = (value: string | undefined) => {
        if (!value) return "";
        const numericValue = value.replace(/[^0-9]/g, "");
        if (!numericValue) return "";
        return parseInt(numericValue, 10).toLocaleString("id-ID");
    };

    // Calculate Max Duration based on Age and Category
    const { maxDuration, currentAge, limitYears } = useMemo(() => {
        const birthDateStr = formData.tgl_lahir_pemohon;
        const age = birthDateStr ? calculateAge(birthDateStr) : 0;
        
        // Determine limit based on category
        const isPrapurna = kategori === "prapurna";
        const limitYears = isPrapurna ? 20 : 15;
        const limitMonths = limitYears * 12;

        let maxMonthsByAge = 0;

        if (birthDateStr) {
            const birthDate = new Date(birthDateStr);
            // Calculate 75th birthday
            const seventyFifthBirthday = new Date(birthDate);
            seventyFifthBirthday.setFullYear(birthDate.getFullYear() + 75);
            
            const today = new Date();
            const todayStr = today.toISOString().split("T")[0];
            const maxAgeStatStr = seventyFifthBirthday.toISOString().split("T")[0];

            // Use months difference
            maxMonthsByAge = calculateMonthsDifference(todayStr, maxAgeStatStr);
        } else {
            // Fallback if no birthdate (though it should be there)
            maxMonthsByAge = (75 - age) * 12; 
        }

        // Calculate max allowed
        let maxAllowed = Math.min(limitMonths, maxMonthsByAge);

        // Ensure not negative
        maxAllowed = Math.max(0, maxAllowed);

        return {
            maxDuration: maxAllowed, // in months
            currentAge: age,
            limitYears: limitYears
        };
    }, [formData.tgl_lahir_pemohon, kategori]);

    // Validate duration on change
    const handleDurationChange = (value: string) => {
        let months = parseInt(value) || 0;
        
        // Don't allow negative
        if (months < 0) months = 0;

        // Check against max duration
        if (months > maxDuration) {
            // Logic for handling exceeding max duration handled in render
        }
        
        updateField("usulan_jangka_waktu_bulan", months.toString());
    };

    // Auto-calculate Blokiran Fields
    useEffect(() => {
        const today = new Date().toISOString().split("T")[0];
        const tglPensiun = formData.tgl_pensiun_pemohon; // from Tab B

        // 1. Calculate Blokiran Prapurna (Months to Pension)
        let prapurnaMonths = 0;
        if (tglPensiun) {
            prapurnaMonths = calculateMonthsDifference(today, tglPensiun);
        }

        // 2. Get Manual Inputs
        const pindahGaji = formData.blokiran_pindah_gaji_jml || 0;
        const wajib = formData.blokiran_wajib_jml || 0;

        // 3. Calculate Total
        const total = prapurnaMonths + pindahGaji + wajib;

        // Update if different to avoid loops
        if (
            formData.blokiran_prapurna_jml !== prapurnaMonths ||
            formData.total_blokiran_jml !== total
        ) {
            updateField("blokiran_prapurna_jml", prapurnaMonths);
            updateField("total_blokiran_jml", total);
        }
    }, [
        formData.tgl_pensiun_pemohon,
        formData.blokiran_pindah_gaji_jml,
        formData.blokiran_wajib_jml,
        formData.blokiran_prapurna_jml, 
        formData.total_blokiran_jml,
        updateField
    ]);

    return (
        <div className="bg-white dark:bg-[#1a2c2a] rounded-xl shadow-sm border border-[#cdeae7] p-6 md:p-8" data-tab-content="tab-e">
            <h3 className="text-lg font-bold text-[#0c1d1b] dark:text-white mb-4 flex items-center gap-2">
                <CreditCard className="w-6 h-6 text-[#00665e]" />
                Usulan Kredit
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Plafon Kredit */}
                <div>
                    <label className="block text-sm font-medium text-[#0c1d1b] dark:text-gray-300 mb-1">
                        Plafon Kredit
                    </label>
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500 text-sm">Rp</span>
                        {/* First field: Shift+Tab goes to previous tab */}
                        <input
                            type="text"
                            value={formatCurrencyDisplay(formData.usulan_plafon_kredit)}
                            onChange={(e) => updateField("usulan_plafon_kredit", e.target.value.replace(/[^0-9]/g, ""))}
                            onKeyDown={handleTabToPrev}
                            placeholder="0"
                            className="block w-full rounded-lg border-[#cdeae7] shadow-sm focus:border-[#00665e] focus:ring-[#00665e] sm:text-sm py-2.5 pl-10 pr-3 bg-[#f5f8f8] dark:bg-[#0f2322]/50 dark:text-white text-right"
                        />
                    </div>
                </div>

                {/* Jangka Waktu */}
                <div>
                    <div className="flex justify-between items-center mb-1">
                        <label className="block text-sm font-medium text-[#0c1d1b] dark:text-gray-300">
                            Jangka Waktu (Bulan)
                        </label>
                        <span className="text-xs text-orange-600 dark:text-orange-400 font-medium">
                            Max: {maxDuration} Bulan ({maxDuration/12} Tahun)
                        </span>
                    </div>
                    <input
                        type="number"
                        value={formData.usulan_jangka_waktu_bulan || ""}
                        onChange={(e) => handleDurationChange(e.target.value)}
                        placeholder="120"
                        min="12"
                        max={maxDuration}
                        className={`block w-full rounded-lg shadow-sm sm:text-sm py-2.5 px-3 bg-[#f5f8f8] dark:bg-[#0f2322]/50 dark:text-white text-right [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
                            (parseInt(formData.usulan_jangka_waktu_bulan || "0") > maxDuration)
                            ? "border-red-500 ring-red-500 focus:border-red-500 focus:ring-red-500" 
                            : "border-[#cdeae7] focus:border-[#00665e] focus:ring-[#00665e]"
                        }`}
                    />
                    {(parseInt(formData.usulan_jangka_waktu_bulan || "0") > maxDuration) && (
                         <p className="text-xs text-red-500 mt-1">
                            Melebihi batas maksimal {limitYears} tahun atau usia 75 tahun (Usia saat ini: {currentAge} th)
                         </p>
                    )}
                </div>

                {/* Suku Bunga */}
                <div>
                    <label className="block text-sm font-medium text-[#0c1d1b] dark:text-gray-300 mb-1">
                        Suku Bunga (% p.a.)
                    </label>
                    <input
                        type="text"
                        value={formData.usulan_bunga_persen || ""}
                        onChange={(e) => updateField("usulan_bunga_persen", e.target.value)}
                        placeholder="11"
                        className="block w-full rounded-lg border-[#cdeae7] shadow-sm focus:border-[#00665e] focus:ring-[#00665e] sm:text-sm py-2.5 px-3 bg-[#f5f8f8] dark:bg-[#0f2322]/50 dark:text-white text-right"
                    />
                </div>

                {/* Tujuan Kredit */}
                <div>
                    <label className="block text-sm font-medium text-[#0c1d1b] dark:text-gray-300 mb-1">
                        Tujuan Penggunaan Kredit
                    </label>
                    <select
                        value={formData.tujuan_kredit || ""}
                        onChange={(e) => updateField("tujuan_kredit", e.target.value)}
                        className="block w-full rounded-lg border-[#cdeae7] shadow-sm focus:border-[#00665e] focus:ring-[#00665e] sm:text-sm py-2.5 px-3 bg-[#f5f8f8] dark:bg-[#0f2322]/50 dark:text-white"
                    >
                        <option value="">Pilih Tujuan</option>
                        <option value="modal_usaha">Modal Usaha</option>
                        <option value="renovasi_rumah">Renovasi Rumah</option>
                        <option value="biaya_pendidikan">Biaya Pendidikan</option>
                        <option value="biaya_kesehatan">Biaya Kesehatan</option>
                        <option value="pembelian_kendaraan">Pembelian Kendaraan</option>
                        <option value="kebutuhan_konsumtif">Kebutuhan Konsumtif</option>
                        <option value="lainnya">Lainnya</option>
                    </select>
                </div>

                {/* Kode Program */}
                <div>
                    <label className="block text-sm font-medium text-[#0c1d1b] dark:text-gray-300 mb-1">
                        Kode Program
                    </label>
                    <input
                        type="text"
                        value={formData.kode_program || ""}
                        onChange={(e) => updateField("kode_program", e.target.value)}
                        placeholder="Contoh: KK001"
                        className="block w-full rounded-lg border-[#cdeae7] shadow-sm focus:border-[#00665e] focus:ring-[#00665e] sm:text-sm py-2.5 px-3 bg-[#f5f8f8] dark:bg-[#0f2322]/50 dark:text-white"
                    />
                </div>

                {/* Biaya Provisi */}
                <div>
                    <label className="block text-sm font-medium text-[#0c1d1b] dark:text-gray-300 mb-1">
                        Biaya Provisi (%)
                    </label>
                    <div className="relative">
                        <input
                            type="number"
                            value={formData.biaya_provisi || ""}
                            onChange={(e) => updateField("biaya_provisi", e.target.value)}
                            placeholder="1"
                            className="block w-full rounded-lg border-[#cdeae7] shadow-sm focus:border-[#00665e] focus:ring-[#00665e] sm:text-sm py-2.5 pl-3 pr-8 bg-[#f5f8f8] dark:bg-[#0f2322]/50 dark:text-white text-right"
                        />
                        <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 text-sm pointer-events-none">%</span>
                    </div>
                </div>

                {/* Biaya Tata Laksana */}
                <div>
                    <label className="block text-sm font-medium text-[#0c1d1b] dark:text-gray-300 mb-1">
                        Biaya Tata Laksana (%)
                    </label>
                    <div className="relative">
                        <input
                            type="number"
                            value={formData.biaya_tatalaksana || ""}
                            onChange={(e) => updateField("biaya_tatalaksana", e.target.value)}
                            placeholder="2"
                            className="block w-full rounded-lg border-[#cdeae7] shadow-sm focus:border-[#00665e] focus:ring-[#00665e] sm:text-sm py-2.5 pl-3 pr-8 bg-[#f5f8f8] dark:bg-[#0f2322]/50 dark:text-white text-right"
                        />
                        <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 text-sm pointer-events-none">%</span>
                    </div>
                </div>

                {/* Biaya PSJT */}
                <div>
                    <label className="block text-sm font-medium text-[#0c1d1b] dark:text-gray-300 mb-1">
                        Biaya PSJT (%)
                    </label>
                    <div className="relative">
                        <input
                            type="number"
                            value={formData.biaya_psjt_percent || ""}
                            onChange={(e) => updateField("biaya_psjt_percent", e.target.value)}
                            placeholder="0"
                            className="block w-full rounded-lg border-[#cdeae7] shadow-sm focus:border-[#00665e] focus:ring-[#00665e] sm:text-sm py-2.5 pl-3 pr-8 bg-[#f5f8f8] dark:bg-[#0f2322]/50 dark:text-white text-right"
                        />
                        <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 text-sm pointer-events-none">%</span>
                    </div>
                </div>

                {/* Biaya Administrasi */}
                <div>
                    <div className="flex justify-between items-center mb-1">
                        <label className="block text-sm font-medium text-[#0c1d1b] dark:text-gray-300">
                            Biaya Administrasi
                        </label>
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="bebas_biaya_admin"
                                checked={formData.biaya_administrasi_is_bebas || false}
                                onChange={(e) => {
                                    updateField("biaya_administrasi_is_bebas", e.target.checked);
                                    if (e.target.checked) {
                                        updateField("biaya_administrasi_nominal", "0");
                                    } else {
                                        updateField("biaya_administrasi_nominal", "");
                                    }
                                }}
                                className="w-3.5 h-3.5 text-[#00665e] bg-gray-100 border-gray-300 rounded focus:ring-[#00665e] dark:focus:ring-[#00665e] dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                            />
                            <label htmlFor="bebas_biaya_admin" className="text-xs text-gray-500 dark:text-gray-400 select-none cursor-pointer">
                                Bebas Biaya
                            </label>
                        </div>
                    </div>

                    <div className="relative">
                        <span className={`absolute inset-y-0 left-0 pl-3 flex items-center text-sm ${formData.biaya_administrasi_is_bebas ? 'text-gray-400' : 'text-gray-500'}`}>Rp</span>
                        <input
                            type="text"
                            value={formatCurrencyDisplay(formData.biaya_administrasi_nominal)}
                            onChange={(e) => updateField("biaya_administrasi_nominal", e.target.value.replace(/[^0-9]/g, ""))}
                            disabled={formData.biaya_administrasi_is_bebas}
                            placeholder="0"
                            className={`block w-full rounded-lg border-[#cdeae7] shadow-sm focus:border-[#00665e] focus:ring-[#00665e] sm:text-sm py-2.5 pl-10 pr-3 text-right ${formData.biaya_administrasi_is_bebas
                                ? 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500'
                                : 'bg-[#f5f8f8] dark:bg-[#0f2322]/50 dark:text-white'
                                }`}
                        />
                    </div>
                </div>

                {/* --- DATA BLOKIRAN (KHUSUS PRAPURNA) --- */}
                <div className="md:col-span-2 lg:col-span-3">
                     <hr className="my-2 border-[#cdeae7] dark:border-opacity-10" />
                     <h3 className="text-lg font-bold text-[#0c1d1b] dark:text-white mb-4 flex items-center gap-2 mt-4">
                        <Calculator className="w-6 h-6 text-[#00665e]" />
                        Data Blokiran (Khusus Prapurna)
                    </h3>
                </div>

                {/* Blokiran Prapurna */}
                <div>
                    <label className="block text-sm font-medium text-[#0c1d1b] dark:text-gray-300 mb-1">
                        Blokiran Prapurna
                    </label>
                    <p className="text-xs text-gray-500 mb-2">
                        Otomatis: Selisih bulan (Tgl Pensiun - Hari Ini)
                    </p>
                    <div className="relative">
                        <input
                            type="number"
                            value={formData.blokiran_prapurna_jml || ""}
                            readOnly
                            className="block w-full rounded-lg border-[#cdeae7] shadow-sm bg-gray-100 text-gray-500 sm:text-sm py-2.5 pr-12 pl-3 text-right"
                        />
                        <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 text-sm pointer-events-none">Kali</span>
                    </div>
                </div>

                {/* Blokiran Pindah Gaji */}
                <div>
                     <label className="block text-sm font-medium text-[#0c1d1b] dark:text-gray-300 mb-1">
                        Blokiran Pindah Gaji
                    </label>
                    <p className="text-xs text-gray-500 mb-2">
                         Input manual jumlah kali angsuran
                    </p>
                    <div className="relative">
                        <input
                            type="number"
                            value={formData.blokiran_pindah_gaji_jml || ""}
                            onChange={(e) => {
                                const val = parseInt(e.target.value) || 0;
                                updateField("blokiran_pindah_gaji_jml", val);
                            }}
                            placeholder="0"
                            className="block w-full rounded-lg border-[#cdeae7] shadow-sm focus:border-[#00665e] focus:ring-[#00665e] sm:text-sm py-2.5 pr-12 pl-3 bg-[#f5f8f8] dark:bg-[#0f2322]/50 dark:text-white text-right"
                        />
                        <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 text-sm pointer-events-none">Kali</span>
                    </div>
                </div>

                {/* Blokiran Wajib */}
                <div>
                     <label className="block text-sm font-medium text-[#0c1d1b] dark:text-gray-300 mb-1">
                        Blokiran Wajib
                    </label>
                    <p className="text-xs text-gray-500 mb-2">
                         Input manual jumlah kali angsuran
                    </p>
                    <div className="relative">
                        <input
                            type="number"
                            value={formData.blokiran_wajib_jml || ""}
                            onChange={(e) => {
                                const val = parseInt(e.target.value) || 0;
                                updateField("blokiran_wajib_jml", val);
                            }}
                            placeholder="0"
                            className="block w-full rounded-lg border-[#cdeae7] shadow-sm focus:border-[#00665e] focus:ring-[#00665e] sm:text-sm py-2.5 pr-12 pl-3 bg-[#f5f8f8] dark:bg-[#0f2322]/50 dark:text-white text-right"
                        />
                         <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 text-sm pointer-events-none">Kali</span>
                    </div>
                </div>

                {/* Total Blokiran */}
                <div className="md:col-span-2 lg:col-span-3 bg-[#e6f4f3] dark:bg-[#00665e]/20 rounded-lg p-4 mt-2">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div>
                             <label className="block text-sm font-bold text-[#0c1d1b] dark:text-gray-200">
                                Total Blokiran
                            </label>
                            <p className="text-sm text-[#00665e] italic">
                                Terbilang: {formData.total_blokiran_jml ? terbilang(formData.total_blokiran_jml) : "Nol"}
                            </p>
                        </div>
                        <div className="relative w-full md:w-1/3">
                             <input
                                type="number"
                                value={formData.total_blokiran_jml || 0}
                                readOnly
                                className="block w-full rounded-lg border-[#cdeae7] shadow-sm bg-white font-bold text-[#00665e] sm:text-lg py-2.5 pr-12 pl-3 text-right"
                            />
                            <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 text-sm pointer-events-none">Kali</span>
                        </div>
                    </div>
                </div>


                {/* Syarat Penandatanganan */}
                <div className="md:col-span-2 lg:col-span-3">
                    <label className="block text-sm font-medium text-[#0c1d1b] dark:text-gray-300 mb-1">
                        Syarat Penandatanganan (Manual)
                    </label>
                    <p className="text-xs text-gray-500 mb-2">
                        Ketik <strong>@</strong> untuk menyebutkan field data (contoh: @Biaya Provisi).
                        <br />
                        Jika diisi, teks ini akan <strong>menggantikan</strong> syarat penandatanganan otomatis.
                    </p>
                    <MentionTextArea
                        value={formData.syarat_penandatanganan_text || ""}
                        onChange={(val) => updateField("syarat_penandatanganan_text", val)}
                        options={DOCUMENT_PLACEHOLDERS}
                        placeholder="Ketik syarat penandatanganan di sini... (Gunakan @ untuk insert data)"
                        className="block w-full rounded-lg border-[#cdeae7] shadow-sm focus:border-[#00665e] focus:ring-[#00665e] sm:text-sm py-2.5 px-3 bg-[#f5f8f8] dark:bg-[#0f2322]/50 dark:text-white font-mono text-sm"
                    />
                </div>

                {/* Syarat Pencairan */}
                <div className="md:col-span-2 lg:col-span-3">
                    <label className="block text-sm font-medium text-[#0c1d1b] dark:text-gray-300 mb-1">
                        Syarat Pencairan (Manual)
                    </label>
                    <p className="text-xs text-gray-500 mb-2">
                        Ketik <strong>@</strong> untuk menyebutkan field data.
                        <br />
                        Jika diisi, teks ini akan <strong>menggantikan</strong> syarat pencairan otomatis.
                    </p>
                    <MentionTextArea
                        value={formData.syarat_pencairan_text || ""}
                        onChange={(val) => updateField("syarat_pencairan_text", val)}
                        options={DOCUMENT_PLACEHOLDERS}
                        placeholder="Ketik syarat pencairan di sini... (Gunakan @ untuk insert data)"
                        className="block w-full rounded-lg border-[#cdeae7] shadow-sm focus:border-[#00665e] focus:ring-[#00665e] sm:text-sm py-2.5 px-3 bg-[#f5f8f8] dark:bg-[#0f2322]/50 dark:text-white font-mono text-sm"
                    />
                </div>
            </div>
        </div>
    );
}
