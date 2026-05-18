"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import TagInput from "@/components/knowledge-base/TagInput";
import { useKnowledgeBase } from "@/hooks/use-knowledge-base";

export default function EditDokumenPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const { currentDocument: doc, isLoading, error, fetchDocument, updateDocument } = useKnowledgeBase();

    const [judul, setJudul] = useState("");
    const [nomorMemo, setNomorMemo] = useState("");
    const [kategori, setKategori] = useState("");
    const [targetMarket, setTargetMarket] = useState("");
    const [berlakuMulai, setBerlakuMulai] = useState("");
    const [berlakuAkhir, setBerlakuAkhir] = useState("");
    const [keywords, setKeywords] = useState<string[]>([]);
    const [success, setSuccess] = useState(false);
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (id) fetchDocument(id);
    }, [id, fetchDocument]);

    // Populate form when doc loads
    useEffect(() => {
        if (doc) {
            setJudul(doc.judul);
            setNomorMemo(doc.nomorMemo);
            setKategori(doc.kategori);
            setTargetMarket(doc.targetMarket);
            setBerlakuMulai(doc.berlakuMulai ? doc.berlakuMulai.split("T")[0] : "");
            setBerlakuAkhir(doc.berlakuAkhir ? doc.berlakuAkhir.split("T")[0] : "");
            setKeywords(doc.keywords || []);
        }
    }, [doc]);

    const validate = (): boolean => {
        const errors: Record<string, string> = {};
        if (!judul || judul.length < 5) errors.judul = "Judul minimal 5 karakter";
        if (!nomorMemo) errors.nomorMemo = "Nomor memo wajib diisi";
        if (!kategori) errors.kategori = "Kategori wajib dipilih";
        if (!targetMarket) errors.targetMarket = "Target market wajib dipilih";
        if (!berlakuMulai) errors.berlakuMulai = "Tanggal mulai wajib diisi";
        if (!berlakuAkhir) errors.berlakuAkhir = "Tanggal berakhir wajib diisi";
        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        setIsSaving(true);
        const ok = await updateDocument(id, {
            judul,
            nomorMemo,
            kategori,
            targetMarket,
            berlakuMulai,
            berlakuAkhir,
            keywords,
        });
        setIsSaving(false);

        if (ok) {
            setSuccess(true);
            setTimeout(() => router.push(`/knowledge-base/${id}`), 1500);
        }
    };

    const inputClasses = (field: string) =>
        `w-full px-4 py-2.5
        bg-white dark:bg-[#323249]
        border ${validationErrors[field] ? "border-red-400" : "border-gray-200 dark:border-[#444564]"}
        rounded-lg text-sm
        focus:outline-none focus:ring-2 focus:ring-[#00665e]/20 focus:border-[#00665e]
        transition-all duration-200`;

    if (isLoading && !doc) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-[#00665e]" />
            </div>
        );
    }

    if (!doc) {
        return (
            <div className="card p-12 text-center animate-fade-in">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-2">Dokumen Tidak Ditemukan</h2>
                <Link href="/knowledge-base" className="inline-flex items-center gap-2 px-4 py-2 bg-[#00665e] !text-white rounded-lg text-sm">
                    <ArrowLeft className="w-4 h-4" /> Kembali
                </Link>
            </div>
        );
    }

    if (success) {
        return (
            <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">Dokumen Berhasil Diperbarui!</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Mengalihkan...</p>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center gap-3">
                <Link href={`/knowledge-base/${id}`} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#323249] transition-colors">
                    <ArrowLeft className="w-5 h-5 text-gray-500" />
                </Link>
                <div>
                    <h1 className="text-xl font-bold text-[#00665e] dark:text-[#80cbc4]">Edit Metadata</h1>
                    <p className="text-xs text-gray-500 dark:text-gray-400">File PDF tidak dapat diubah. Upload versi baru untuk mengganti file.</p>
                </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="card p-6 space-y-5">
                {/* File Info (Read Only) */}
                <div className="p-3 rounded-lg bg-gray-50 dark:bg-[#323249] border border-gray-200 dark:border-[#444564]">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">File saat ini</p>
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{doc.filename}</p>
                </div>

                {/* Judul */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Judul Dokumen <span className="text-red-500">*</span></label>
                    <input type="text" value={judul} onChange={(e) => setJudul(e.target.value)} className={inputClasses("judul")} />
                    {validationErrors.judul && <p className="mt-1 text-xs text-red-500">{validationErrors.judul}</p>}
                </div>

                {/* Nomor Memo */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nomor Memo <span className="text-red-500">*</span></label>
                    <input type="text" value={nomorMemo} onChange={(e) => setNomorMemo(e.target.value)} className={inputClasses("nomorMemo")} />
                    {validationErrors.nomorMemo && <p className="mt-1 text-xs text-red-500">{validationErrors.nomorMemo}</p>}
                </div>

                {/* Kategori & Target */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Kategori Produk <span className="text-red-500">*</span></label>
                        <select value={kategori} onChange={(e) => setKategori(e.target.value)} className={inputClasses("kategori")}>
                            <option value="">-- Pilih --</option>
                            <option value="KREDIT_FLEKSI">Kredit Fleksi</option>
                            <option value="KREDIT_GRIYA">Kredit Griya</option>
                            <option value="KREDIT_PENSIUN">Kredit Pensiun</option>
                        </select>
                        {validationErrors.kategori && <p className="mt-1 text-xs text-red-500">{validationErrors.kategori}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Target Market <span className="text-red-500">*</span></label>
                        <select value={targetMarket} onChange={(e) => setTargetMarket(e.target.value)} className={inputClasses("targetMarket")}>
                            <option value="">-- Pilih --</option>
                            <option value="ASN">ASN</option>
                            <option value="SWASTA">Swasta</option>
                            <option value="TASPEN">Taspen</option>
                            <option value="ASABRI">Asabri</option>
                            <option value="WIRASWASTA">Wiraswasta</option>
                        </select>
                        {validationErrors.targetMarket && <p className="mt-1 text-xs text-red-500">{validationErrors.targetMarket}</p>}
                    </div>
                </div>

                {/* Tanggal Berlaku */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tanggal Mulai <span className="text-red-500">*</span></label>
                        <input type="date" value={berlakuMulai} onChange={(e) => setBerlakuMulai(e.target.value)} className={inputClasses("berlakuMulai")} />
                        {validationErrors.berlakuMulai && <p className="mt-1 text-xs text-red-500">{validationErrors.berlakuMulai}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tanggal Berakhir <span className="text-red-500">*</span></label>
                        <input type="date" value={berlakuAkhir} onChange={(e) => setBerlakuAkhir(e.target.value)} className={inputClasses("berlakuAkhir")} />
                        {validationErrors.berlakuAkhir && <p className="mt-1 text-xs text-red-500">{validationErrors.berlakuAkhir}</p>}
                    </div>
                </div>

                {/* Keywords */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Keywords</label>
                    <TagInput tags={keywords} onChange={setKeywords} />
                </div>

                {/* Error */}
                {error && (
                    <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                    </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-[#444564]">
                    <Link href={`/knowledge-base/${id}`} className="px-5 py-2.5 rounded-lg border border-gray-200 dark:border-[#444564] text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#323249] transition-all">
                        Batal
                    </Link>
                    <button type="submit" disabled={isSaving} className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#00665e] hover:bg-[#004d47] !text-white rounded-lg font-medium text-sm transition-all disabled:opacity-50">
                        {isSaving ? <><Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...</> : <><Save className="w-4 h-4" /> Simpan Perubahan</>}
                    </button>
                </div>
            </form>
        </div>
    );
}
