"use client";

import { useFormStore } from "@/stores/form-store";
import { useTabNavigation } from "@/hooks/useTabNavigation";
import { CreditCard } from "lucide-react";
import { MentionTextArea } from "@/components/ui/MentionTextArea";
import { DOCUMENT_PLACEHOLDERS } from "@/constants/placeholders";

export default function TabEUsulan() {
    const { formData, updateField } = useFormStore();
    const { handleTabToPrev } = useTabNavigation();

    const formatCurrencyDisplay = (value: string | undefined) => {
        if (!value) return "";
        const numericValue = value.replace(/[^0-9]/g, "");
        if (!numericValue) return "";
        return parseInt(numericValue, 10).toLocaleString("id-ID");
    };

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
                    <label className="block text-sm font-medium text-[#0c1d1b] dark:text-gray-300 mb-1">
                        Jangka Waktu (Bulan)
                    </label>
                    <input
                        type="number"
                        value={formData.usulan_jangka_waktu_bulan || ""}
                        onChange={(e) => updateField("usulan_jangka_waktu_bulan", e.target.value)}
                        placeholder="120"
                        min="12"
                        max="180"
                        className="block w-full rounded-lg border-[#cdeae7] shadow-sm focus:border-[#00665e] focus:ring-[#00665e] sm:text-sm py-2.5 px-3 bg-[#f5f8f8] dark:bg-[#0f2322]/50 dark:text-white text-right [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
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
