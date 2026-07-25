"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import TagInput from "@/components/knowledge-base/TagInput";
import { useKnowledgeBase } from "@/hooks/use-knowledge-base";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const formSchema = z.object({
    judul: z.string().min(5, "Judul minimal 5 karakter"),
    nomorMemo: z.string().min(1, "Nomor memo wajib diisi"),
    kategori: z.string().min(1, "Kategori wajib dipilih"),
    targetMarket: z.string().min(1, "Target market wajib dipilih"),
    berlakuMulai: z.string().min(1, "Tanggal mulai wajib diisi"),
    berlakuAkhir: z.string().min(1, "Tanggal berakhir wajib diisi"),
    keywords: z.array(z.string()),
});

type FormValues = z.infer<typeof formSchema>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function EditForm({ doc, id, updateDocument, error }: any) {
    const router = useRouter();
    const [success, setSuccess] = useState(false);

    const {
        register,
        handleSubmit,
        control,
        formState: { errors, isSubmitting },
    } = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            judul: doc.judul || "",
            nomorMemo: doc.nomorMemo || "",
            kategori: doc.kategori || "",
            targetMarket: doc.targetMarket || "",
            berlakuMulai: doc.berlakuMulai ? doc.berlakuMulai.split("T")[0] : "",
            berlakuAkhir: doc.berlakuAkhir ? doc.berlakuAkhir.split("T")[0] : "",
            keywords: doc.keywords || [],
        },
    });

    const onSubmit = async (data: FormValues) => {
        const ok = await updateDocument(id, data);
        if (ok) {
            setSuccess(true);
            setTimeout(() => router.push(`/knowledge-base/${id}`), 1500);
        }
    };

    const inputClasses = (hasError: boolean) =>
        `w-full px-4 py-2.5
        bg-white dark:bg-[#323249]
        border ${hasError ? "border-red-400" : "border-gray-200 dark:border-[#444564]"}
        rounded-lg text-sm
        focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand
        transition-all duration-200`;

    if (success) {
        return (
            <div className="flex flex-col items-center justify-center py-20 animate-in fade-in duration-300">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">Dokumen Berhasil Diperbarui!</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Mengalihkan...</p>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-300">
            {/* Header */}
            <div className="flex items-center gap-3">
                <Link href={`/knowledge-base/${id}`} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#323249] transition-colors">
                    <ArrowLeft className="w-5 h-5 text-gray-500" />
                </Link>
                <div>
                    <h1 className="text-xl font-bold text-brand dark:text-[#a5b4fc]">Edit Metadata</h1>
                    <p className="text-xs text-gray-500 dark:text-gray-400">File PDF tidak dapat diubah. Upload versi baru untuk mengganti file.</p>
                </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="card p-6 space-y-5">
                {/* File Info (Read Only) */}
                <div className="p-3 rounded-lg bg-gray-50 dark:bg-[#323249] border border-gray-200 dark:border-[#444564]">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">File saat ini</p>
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{doc.filename}</p>
                </div>

                {/* Judul */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Judul Dokumen <span className="text-red-500">*</span></label>
                    <input type="text" {...register("judul")} className={inputClasses(!!errors.judul)} />
                    {errors.judul && <p className="mt-1 text-xs text-red-500">{errors.judul.message}</p>}
                </div>

                {/* Nomor Memo */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nomor Memo <span className="text-red-500">*</span></label>
                    <input type="text" {...register("nomorMemo")} className={inputClasses(!!errors.nomorMemo)} />
                    {errors.nomorMemo && <p className="mt-1 text-xs text-red-500">{errors.nomorMemo.message}</p>}
                </div>

                {/* Kategori & Target */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Kategori Produk <span className="text-red-500">*</span></label>
                        <select {...register("kategori")} className={inputClasses(!!errors.kategori)}>
                            <option value="">-- Pilih --</option>
                            <option value="KREDIT_FLEKSI">Product Flex</option>
                            <option value="KREDIT_GRIYA">Product Home</option>
                            <option value="KREDIT_PENSIUN">Product Pension</option>
                        </select>
                        {errors.kategori && <p className="mt-1 text-xs text-red-500">{errors.kategori.message}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Target Market <span className="text-red-500">*</span></label>
                        <select {...register("targetMarket")} className={inputClasses(!!errors.targetMarket)}>
                            <option value="">-- Pilih --</option>
                            <option value="ASN">ASN</option>
                            <option value="SWASTA">Swasta</option>
                            <option value="TASPEN">Taspen</option>
                            <option value="ASABRI">Asabri</option>
                            <option value="WIRASWASTA">Wiraswasta</option>
                        </select>
                        {errors.targetMarket && <p className="mt-1 text-xs text-red-500">{errors.targetMarket.message}</p>}
                    </div>
                </div>

                {/* Tanggal Berlaku */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tanggal Mulai <span className="text-red-500">*</span></label>
                        <input type="date" {...register("berlakuMulai")} className={inputClasses(!!errors.berlakuMulai)} />
                        {errors.berlakuMulai && <p className="mt-1 text-xs text-red-500">{errors.berlakuMulai.message}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tanggal Berakhir <span className="text-red-500">*</span></label>
                        <input type="date" {...register("berlakuAkhir")} className={inputClasses(!!errors.berlakuAkhir)} />
                        {errors.berlakuAkhir && <p className="mt-1 text-xs text-red-500">{errors.berlakuAkhir.message}</p>}
                    </div>
                </div>

                {/* Keywords */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Keywords</label>
                    <Controller
                        name="keywords"
                        control={control}
                        render={({ field }) => (
                            <TagInput tags={field.value} onChange={field.onChange} />
                        )}
                    />
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
                    <button type="submit" disabled={isSubmitting} className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand hover:bg-brand-dark !text-white rounded-lg font-medium text-sm transition-all disabled:opacity-50">
                        {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...</> : <><Save className="w-4 h-4" /> Simpan Perubahan</>}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default function EditDokumenPage() {
    const params = useParams();
    const id = params.id as string;

    const { currentDocument: doc, isLoading, error, fetchDocument, updateDocument } = useKnowledgeBase();

    useEffect(() => {
        if (id) fetchDocument(id);
    }, [id, fetchDocument]);

    if (isLoading && !doc) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-brand" />
            </div>
        );
    }

    if (!doc) {
        return (
            <div className="card p-12 text-center animate-in fade-in duration-300">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-2">Dokumen Tidak Ditemukan</h2>
                <Link href="/knowledge-base" className="inline-flex items-center gap-2 px-4 py-2 bg-brand !text-white rounded-lg text-sm">
                    <ArrowLeft className="w-4 h-4" /> Kembali
                </Link>
            </div>
        );
    }

    return <EditForm doc={doc} id={id} updateDocument={updateDocument} error={error} />;
}
