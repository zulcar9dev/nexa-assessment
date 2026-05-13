"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Loader2, CheckCircle } from "lucide-react";
import FileDropzone from "@/components/knowledge-base/FileDropzone";
import TagInput from "@/components/knowledge-base/TagInput";
import { useKnowledgeBase } from "@/hooks/use-knowledge-base";

export default function UploadDokumenPage() {
    const router = useRouter();
    const { uploadDocument, isLoading, error } = useKnowledgeBase();

    const [file, setFile] = useState<File | null>(null);
    const [judul, setJudul] = useState("");
    const [nomorMemo, setNomorMemo] = useState("");
    const [kategori, setKategori] = useState("");
    const [targetMarket, setTargetMarket] = useState("");
    const [berlakuMulai, setBerlakuMulai] = useState("");
    const [berlakuAkhir, setBerlakuAkhir] = useState("");
    const [keywords, setKeywords] = useState<string[]>([]);
    const [replacesId, setReplacesId] = useState("");
    const [success, setSuccess] = useState(false);
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

    const validate = (): boolean => {
        const errors: Record<string, string> = {};
        if (!file) errors.file = "File PDF wajib diunggah";
        if (!judul || judul.length < 5) errors.judul = "Judul minimal 5 karakter";
        if (!nomorMemo) errors.nomorMemo = "Nomor memo wajib diisi";
        if (!kategori) errors.kategori = "Kategori wajib dipilih";
        if (!targetMarket) errors.targetMarket = "Target market wajib dipilih";
        if (!berlakuMulai) errors.berlakuMulai = "Tanggal mulai wajib diisi";
        if (!berlakuAkhir) errors.berlakuAkhir = "Tanggal berakhir wajib diisi";
        if (berlakuMulai && berlakuAkhir && berlakuMulai > berlakuAkhir) {
            errors.berlakuAkhir = "Tanggal berakhir harus setelah tanggal mulai";
        }
        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        const formData = new FormData();
        formData.append("file", file!);
        formData.append("judul", judul);
        formData.append("nomorMemo", nomorMemo);
        formData.append("kategori", kategori);
        formData.append("targetMarket", targetMarket);
        formData.append("berlakuMulai", berlakuMulai);
        formData.append("berlakuAkhir", berlakuAkhir);
        formData.append("keywords", JSON.stringify(keywords));
        if (replacesId) formData.append("replacesId", replacesId);

        const ok = await uploadDocument(formData);
        if (ok) {
            setSuccess(true);
            setTimeout(() => router.push("/knowledge-base"), 1500);
        }
    };

    const inputClasses = (field: string) =>
        `w-full px-4 py-2.5
        bg-white dark:bg-[#323249]
        border ${validationErrors[field] ? "border-red-400" : "border-gray-200 dark:border-[#444564]"}
        rounded-lg text-sm
        focus:outline-none focus:ring-2 focus:ring-[#00665e]/20 focus:border-[#00665e]
        transition-all duration-200`;

    if (success) {
        return (
            <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">
                    Dokumen Berhasil Diunggah!
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    Mengalihkan ke halaman Knowledge Base...
                </p>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Link
                        href="/knowledge-base"
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#323249] transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-500" />
                    </Link>
                    <div>
                        <h1 className="text-xl font-bold text-[#00665e] dark:text-[#80cbc4]">
                            Upload Dokumen Baru
                        </h1>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            Unggah memo atau surat edaran dalam format PDF
                        </p>
                    </div>
                </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="card p-6 space-y-5">
                {/* File Upload */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        File PDF <span className="text-red-500">*</span>
                    </label>
                    <FileDropzone file={file} onFileSelect={setFile} />
                    {validationErrors.file && (
                        <p className="mt-1 text-xs text-red-500">{validationErrors.file}</p>
                    )}
                </div>

                {/* Judul */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Judul Dokumen <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={judul}
                        onChange={(e) => setJudul(e.target.value)}
                        placeholder="Contoh: Memo Promo KPR Griya Fix Rate 2024"
                        className={inputClasses("judul")}
                    />
                    {validationErrors.judul && (
                        <p className="mt-1 text-xs text-red-500">{validationErrors.judul}</p>
                    )}
                </div>

                {/* Nomor Memo */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Nomor Memo <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={nomorMemo}
                        onChange={(e) => setNomorMemo(e.target.value)}
                        placeholder="Contoh: SE/2024/001"
                        className={inputClasses("nomorMemo")}
                    />
                    {validationErrors.nomorMemo && (
                        <p className="mt-1 text-xs text-red-500">{validationErrors.nomorMemo}</p>
                    )}
                </div>

                {/* Kategori & Target */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Kategori Produk <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={kategori}
                            onChange={(e) => setKategori(e.target.value)}
                            className={inputClasses("kategori")}
                        >
                            <option value="">-- Pilih Kategori --</option>
                            <option value="KREDIT_FLEKSI">Kredit Fleksi</option>
                            <option value="KREDIT_GRIYA">Kredit Griya</option>
                            <option value="KREDIT_PENSIUN">Kredit Pensiun</option>
                        </select>
                        {validationErrors.kategori && (
                            <p className="mt-1 text-xs text-red-500">{validationErrors.kategori}</p>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Target Market <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={targetMarket}
                            onChange={(e) => setTargetMarket(e.target.value)}
                            className={inputClasses("targetMarket")}
                        >
                            <option value="">-- Pilih Target --</option>
                            <option value="ASN">ASN</option>
                            <option value="SWASTA">Swasta</option>
                            <option value="TASPEN">Taspen</option>
                            <option value="ASABRI">Asabri</option>
                            <option value="WIRASWASTA">Wiraswasta</option>
                        </select>
                        {validationErrors.targetMarket && (
                            <p className="mt-1 text-xs text-red-500">{validationErrors.targetMarket}</p>
                        )}
                    </div>
                </div>

                {/* Tanggal Berlaku */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Tanggal Mulai <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="date"
                            value={berlakuMulai}
                            onChange={(e) => setBerlakuMulai(e.target.value)}
                            className={inputClasses("berlakuMulai")}
                        />
                        {validationErrors.berlakuMulai && (
                            <p className="mt-1 text-xs text-red-500">{validationErrors.berlakuMulai}</p>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Tanggal Berakhir <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="date"
                            value={berlakuAkhir}
                            onChange={(e) => setBerlakuAkhir(e.target.value)}
                            className={inputClasses("berlakuAkhir")}
                        />
                        {validationErrors.berlakuAkhir && (
                            <p className="mt-1 text-xs text-red-500">{validationErrors.berlakuAkhir}</p>
                        )}
                    </div>
                </div>

                {/* Keywords */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Keywords / Kata Kunci
                    </label>
                    <TagInput tags={keywords} onChange={setKeywords} />
                    <p className="mt-1 text-xs text-gray-400">
                        Tekan Enter atau koma untuk menambah kata kunci
                    </p>
                </div>

                {/* Version Linking (Optional) */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Menggantikan Dokumen Lama <span className="text-gray-400">(Opsional)</span>
                    </label>
                    <input
                        type="text"
                        value={replacesId}
                        onChange={(e) => setReplacesId(e.target.value)}
                        placeholder="ID dokumen yang digantikan (kosongkan jika baru)"
                        className={inputClasses("replacesId")}
                    />
                    <p className="mt-1 text-xs text-gray-400">
                        Dokumen lama akan otomatis berstatus &quot;Archived&quot;
                    </p>
                </div>

                {/* Error */}
                {error && (
                    <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                    </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-[#444564]">
                    <Link
                        href="/knowledge-base"
                        className="px-5 py-2.5 rounded-lg border border-gray-200 dark:border-[#444564]
                            text-sm font-medium text-gray-600 dark:text-gray-400
                            hover:bg-gray-50 dark:hover:bg-[#323249] transition-all"
                    >
                        Batal
                    </Link>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="inline-flex items-center gap-2 px-5 py-2.5
                            bg-[#00665e] hover:bg-[#004d47] !text-white
                            rounded-lg font-medium text-sm
                            transition-all duration-200 shadow-sm hover:shadow-md
                            disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Mengunggah...
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4" />
                                Simpan Dokumen
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
