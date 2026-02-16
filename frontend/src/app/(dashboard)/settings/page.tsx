"use client";

import { useState, useEffect } from "react";
import { Save, AlertCircle } from "lucide-react";

export default function SettingsPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [mitigasiText, setMitigasiText] = useState("");
    const [catatanPricing, setCatatanPricing] = useState("");
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await fetch('/api/settings');
            const data = await res.json();
            if (data.success) {
                setMitigasiText(data.data.slikMitigasiRiskText);
                setCatatanPricing(data.data.catatanProgramPricing || "");
            }
        } catch (error) {
            console.error('Failed to fetch settings:', error);
            setMessage({ type: 'error', text: 'Gagal memuat pengaturan.' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setMessage(null);

        try {
            const res = await fetch('/api/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    slikMitigasiRiskText: mitigasiText,
                    catatanProgramPricing: catatanPricing
                }),
            });

            const data = await res.json();
            if (data.success) {
                setMessage({ type: 'success', text: 'Pengaturan berhasil disimpan.' });
                setMitigasiText(data.data.slikMitigasiRiskText);
                setCatatanPricing(data.data.catatanProgramPricing || "");
            } else {
                throw new Error(data.error?.message || 'Gagal menyimpan');
            }
        } catch (error) {
            console.error('Failed to save settings:', error);
            setMessage({ type: 'error', text: 'Gagal menyimpan pengaturan.' });
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return <div className="p-8 text-center">Memuat pengaturan...</div>;
    }

    return (
        <div className="p-6 md:p-8 space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Pengaturan Aplikasi</h1>
            </div>

            <div className="bg-white dark:bg-[#1a2c2a] rounded-xl shadow-sm border border-[#cdeae7] dark:border-opacity-10 p-6">
                <h2 className="text-lg font-semibold text-[#0c1d1b] dark:text-white mb-4">
                    Konfigurasi Dokumen
                </h2>

                <form onSubmit={handleSave} className="space-y-6">
                    <div>
                        <label htmlFor="mitigasiText" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Teks Mitigasi Risiko SLIK
                        </label>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                            Teks ini akan muncul otomatis di dokumen jika kolektibilitas SLIK selain "1 - Lancar".
                        </p>
                        <textarea
                            id="mitigasiText"
                            rows={4}
                            value={mitigasiText}
                            onChange={(e) => setMitigasiText(e.target.value)}
                            className="block w-full rounded-lg border-[#cdeae7] shadow-sm focus:border-[#00665e] focus:ring-[#00665e] sm:text-sm py-2 px-3 bg-white dark:bg-[#0f2322] dark:text-gray-300"
                            placeholder="Masukkan teks mitigasi..."
                        />
                    </div>

                    <div>
                        <label htmlFor="catatanPricing" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Catatan Program Pricing
                        </label>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                            Referensi surat program pricing BNI Fleksi untuk dokumen usulan kredit.
                        </p>
                        <textarea
                            id="catatanPricing"
                            rows={3}
                            value={catatanPricing}
                            onChange={(e) => setCatatanPricing(e.target.value)}
                            className="block w-full rounded-lg border-[#cdeae7] shadow-sm focus:border-[#00665e] focus:ring-[#00665e] sm:text-sm py-2 px-3 bg-white dark:bg-[#0f2322] dark:text-gray-300"
                            placeholder="Cfm Surat No DNS/5.4/8023 Perihal Program Pricing..."
                        />
                    </div>

                    {message && (
                        <div className={`p-4 rounded-lg flex items-center gap-2 ${message.type === 'success'
                                ? 'bg-green-50 text-green-700 border border-green-200'
                                : 'bg-red-50 text-red-700 border border-red-200'
                            }`}>
                            <AlertCircle className="w-5 h-5" />
                            <p className="text-sm font-medium">{message.text}</p>
                        </div>
                    )}

                    <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-gray-800">
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="flex items-center gap-2 px-4 py-2 bg-[#00665e] text-white rounded-lg hover:bg-[#004d47] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Save className="w-4 h-4" />
                            {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
