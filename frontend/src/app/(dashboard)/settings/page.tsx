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
                <h1 className="text-headline-md font-bold text-on-surface font-heading">Pengaturan Aplikasi</h1>
            </div>

            <div className="bg-surface-light dark:bg-surface rounded-xl shadow-sm border border-outline-variant/20 p-6">
                <h2 className="text-title-lg font-semibold text-on-surface font-heading mb-4">
                    Konfigurasi Dokumen
                </h2>

                <form onSubmit={handleSave} className="space-y-6">
                    <div>
                        <label htmlFor="mitigasiText" className="block text-label-sm font-medium text-on-surface mb-2">
                            Teks Mitigasi Risiko SLIK
                        </label>
                        <p className="text-body-sm text-on-surface-variant/70 mb-2">
                            Teks ini akan muncul otomatis di dokumen jika kolektibilitas SLIK selain &quot;1 - Lancar&quot;.
                        </p>
                        <textarea
                            id="mitigasiText"
                            rows={4}
                            value={mitigasiText}
                            onChange={(e) => setMitigasiText(e.target.value)}
                            className="block w-full rounded-xl border-0 ring-1 ring-inset ring-outline-variant/30 shadow-sm focus:ring-2 focus:ring-inset focus:ring-primary focus:border-primary sm:text-sm py-2 px-3 bg-surface-light dark:bg-surface-container text-on-surface"
                            placeholder="Masukkan teks mitigasi..."
                        />
                    </div>

                    <div>
                        <label htmlFor="catatanPricing" className="block text-label-sm font-medium text-on-surface mb-2">
                            Catatan Program Pricing
                        </label>
                        <p className="text-body-sm text-on-surface-variant/70 mb-2">
                            Referensi surat program pricing Nexa Fleksi untuk dokumen usulan kredit.
                        </p>
                        <textarea
                            id="catatanPricing"
                            rows={3}
                            value={catatanPricing}
                            onChange={(e) => setCatatanPricing(e.target.value)}
                            className="block w-full rounded-xl border-0 ring-1 ring-inset ring-outline-variant/30 shadow-sm focus:ring-2 focus:ring-inset focus:ring-primary focus:border-primary sm:text-sm py-2 px-3 bg-surface-light dark:bg-surface-container text-on-surface"
                            placeholder="Cfm Surat No DNS/5.4/8023 Perihal Program Pricing..."
                        />
                    </div>

                    {message && (
                        <div className={`p-4 rounded-xl flex items-center gap-2 ${message.type === 'success'
                                ? 'bg-success/10 text-success border border-success/20'
                                : 'bg-danger/10 text-danger border border-danger/20'
                            }`}>
                            <AlertCircle className="w-5 h-5" />
                            <p className="text-sm font-medium">{message.text}</p>
                        </div>
                    )}

                    <div className="flex justify-end pt-4 border-t border-outline-variant/20">
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="flex items-center gap-2 px-4 py-2 bg-primary text-on-primary rounded-xl hover:bg-primary-container transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
