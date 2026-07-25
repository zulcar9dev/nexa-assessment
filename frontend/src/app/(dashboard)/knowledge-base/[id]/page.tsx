"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
    ArrowLeft,
    Download,
    Edit,
    Trash2,
    Calendar,
    Tag,
    FileText,
    Loader2,
    AlertCircle,
} from "lucide-react";
import PdfViewer from "@/components/knowledge-base/PdfViewer";
import StatusBadge from "@/components/knowledge-base/StatusBadge";
import { useKnowledgeBase } from "@/hooks/use-knowledge-base";

const kategoriLabels: Record<string, string> = {
    KREDIT_FLEKSI: "Product Flex",
    KREDIT_GRIYA: "Product Home",
    KREDIT_PENSIUN: "Product Pension",
};

const targetLabels: Record<string, string> = {
    ASN: "ASN",
    SWASTA: "Swasta",
    TASPEN: "Taspen",
    ASABRI: "Asabri",
    WIRASWASTA: "Wiraswasta",
};

export default function ViewDokumenPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;
    const [deleteConfirm, setDeleteConfirm] = useState(false);

    const {
        currentDocument: doc,
        versions,
        isLoading,
        error,
        fetchDocument,
        downloadDocument,
        deleteDocument,
    } = useKnowledgeBase();

    useEffect(() => {
        if (id) fetchDocument(id);
    }, [id, fetchDocument]);

    const handleDownload = () => {
        if (doc) downloadDocument(doc.id, doc.filename);
    };

    const handleDelete = async () => {
        if (doc) {
            const success = await deleteDocument(doc.id);
            if (success) router.push("/knowledge-base");
        }
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "long",
            year: "numeric",
        });
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-brand" />
            </div>
        );
    }

    if (error || !doc) {
        return (
            <div className="card p-12 text-center animate-in fade-in duration-300">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-2">
                    Dokumen Tidak Ditemukan
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    {error || "Dokumen yang Anda cari tidak ada atau sudah dihapus."}
                </p>
                <Link
                    href="/knowledge-base"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-brand hover:bg-brand-dark !text-white rounded-lg text-sm transition-all"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Kembali
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-4 animate-in fade-in duration-300">
            {/* Header */}
            <div className="card p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                        <Link
                            href="/knowledge-base"
                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#323249] transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-500" />
                        </Link>
                        <div className="min-w-0">
                            <div className="flex items-start gap-2 flex-wrap">
                                <h1 className="text-lg font-bold text-brand dark:text-[#a5b4fc] break-words">
                                    {doc.judul}
                                </h1>
                                <StatusBadge status={doc.status} />
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                {doc.nomorMemo} • Versi {doc.version}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        <button
                            onClick={handleDownload}
                            className="inline-flex items-center gap-1.5 px-3 py-2
                                border border-green-500 text-green-600
                                hover:bg-green-500 hover:!text-white
                                rounded-lg text-xs font-medium transition-all"
                        >
                            <Download className="w-3.5 h-3.5" />
                            Unduh
                        </button>
                        <Link
                            href={`/knowledge-base/${doc.id}/edit`}
                            className="inline-flex items-center gap-1.5 px-3 py-2
                                border border-amber-500 text-amber-600
                                hover:bg-amber-500 hover:!text-white
                                rounded-lg text-xs font-medium transition-all"
                        >
                            <Edit className="w-3.5 h-3.5" />
                            Edit
                        </Link>
                        {!deleteConfirm ? (
                            <button
                                onClick={() => setDeleteConfirm(true)}
                                className="inline-flex items-center gap-1.5 px-3 py-2
                                    border border-red-500 text-red-600
                                    hover:bg-red-500 hover:!text-white
                                    rounded-lg text-xs font-medium transition-all"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                                Hapus
                            </button>
                        ) : (
                            <div className="flex gap-1.5">
                                <button
                                    onClick={handleDelete}
                                    className="px-3 py-2 bg-red-500 text-white rounded-lg text-xs font-medium hover:bg-red-600 transition-all"
                                >
                                    Ya, Hapus
                                </button>
                                <button
                                    onClick={() => setDeleteConfirm(false)}
                                    className="px-3 py-2 bg-gray-200 dark:bg-[#444564] rounded-lg text-xs font-medium transition-all"
                                >
                                    Batal
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Content: PDF + Sidebar */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                {/* PDF Viewer */}
                <div className="lg:col-span-3">
                    <div className="card overflow-hidden" style={{ minHeight: "600px" }}>
                        <PdfViewer
                            fileUrl={`/api/knowledge-base/${doc.id}/file`}
                            className="h-full min-h-[600px]"
                        />
                    </div>
                </div>

                {/* Metadata Sidebar */}
                <div className="space-y-4">
                    {/* Document Info */}
                    <div className="card p-4 space-y-4">
                        <h3 className="text-sm font-bold text-brand dark:text-[#a5b4fc] flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            Informasi Dokumen
                        </h3>

                        <div className="space-y-3">
                            <div>
                                <p className="text-[10px] uppercase font-semibold text-gray-400 tracking-wider">No. Memo</p>
                                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{doc.nomorMemo}</p>
                            </div>
                            <div>
                                <p className="text-[10px] uppercase font-semibold text-gray-400 tracking-wider">Kategori</p>
                                <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-[#eef2ff] text-brand dark:bg-brand/20 dark:text-[#a5b4fc]">
                                    {kategoriLabels[doc.kategori] || doc.kategori}
                                </span>
                            </div>
                            <div>
                                <p className="text-[10px] uppercase font-semibold text-gray-400 tracking-wider">Target Market</p>
                                <p className="text-sm text-gray-700 dark:text-gray-300">{targetLabels[doc.targetMarket] || doc.targetMarket}</p>
                            </div>
                            <div>
                                <p className="text-[10px] uppercase font-semibold text-gray-400 tracking-wider">Status</p>
                                <StatusBadge status={doc.status} />
                            </div>
                            <div>
                                <p className="text-[10px] uppercase font-semibold text-gray-400 tracking-wider flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    Masa Berlaku
                                </p>
                                <p className="text-sm text-gray-700 dark:text-gray-300">
                                    {formatDate(doc.berlakuMulai)}
                                </p>
                                <p className="text-xs text-gray-500">s/d {formatDate(doc.berlakuAkhir)}</p>
                            </div>
                        </div>

                        {/* Keywords */}
                        {doc.keywords.length > 0 && (
                            <div>
                                <p className="text-[10px] uppercase font-semibold text-gray-400 tracking-wider flex items-center gap-1 mb-2">
                                    <Tag className="w-3 h-3" />
                                    Keywords
                                </p>
                                <div className="flex flex-wrap gap-1.5">
                                    {doc.keywords.map((kw, i) => (
                                        <span
                                            key={i}
                                            className="px-2 py-0.5 rounded-full text-[10px] font-medium
                                                bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
                                        >
                                            {kw}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Version History */}
                    {versions.length > 0 && (
                        <div className="card p-4">
                            <h3 className="text-sm font-bold text-brand dark:text-[#a5b4fc] mb-3">
                                📁 Versi Lain
                            </h3>
                            <div className="space-y-2">
                                {versions.map((v) => (
                                    <Link
                                        key={v.id}
                                        href={`/knowledge-base/${v.id}`}
                                        className={`block p-2.5 rounded-lg border transition-all duration-200
                                            ${v.id === doc.id
                                                ? "border-brand bg-[#eef2ff] dark:bg-brand/10 dark:border-[#a5b4fc]"
                                                : "border-gray-200 dark:border-[#444564] hover:bg-gray-50 dark:hover:bg-[#323249]"
                                            }
                                        `}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                                v{v.version}
                                            </span>
                                            <StatusBadge status={v.status} />
                                        </div>
                                        <p className="text-[10px] text-gray-400 mt-1">
                                            {formatDate(v.createdAt)}
                                        </p>
                                        {v.id === doc.id && (
                                            <span className="text-[10px] text-brand dark:text-[#a5b4fc] font-medium">
                                                ← Sedang dilihat
                                            </span>
                                        )}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
