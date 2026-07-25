"use client";

import Link from "next/link";
import { Eye, Download, FileText, Calendar } from "lucide-react";
import StatusBadge from "./StatusBadge";

// Type definition for document data
export interface DocumentData {
    id: string;
    judul: string;
    nomorMemo: string;
    kategori: string;
    targetMarket: string;
    status: string;
    berlakuMulai: string;
    berlakuAkhir: string;
    keywords: string[];
    filename: string;
    filesize: number;
    version: number;
    createdAt: string;
}

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

interface DocumentCardProps {
    document: DocumentData;
    onDownload?: (id: string, filename: string) => void;
}

export default function DocumentCard({ document: doc, onDownload }: DocumentCardProps) {
    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    return (
        <div className="card card-hover overflow-hidden group">
            {/* Top color accent */}
            <div
                className={`h-1.5 ${
                    doc.kategori === "KREDIT_FLEKSI"
                        ? "bg-gradient-to-r from-[#1976d2] to-[#0d47a1]"
                        : doc.kategori === "KREDIT_GRIYA"
                          ? "bg-gradient-to-r from-brand to-brand-dark"
                          : "bg-gradient-to-r from-[#0f172a] to-[#0891b2]"
                }`}
            />

            <div className="p-5">
                {/* Header: icon + badges */}
                <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-red-50 dark:bg-red-900/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
                        <FileText className="w-5 h-5 text-red-500 dark:text-red-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap gap-1.5 mb-1.5">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[#eef2ff] text-brand dark:bg-brand/20 dark:text-[#a5b4fc]">
                                {kategoriLabels[doc.kategori] || doc.kategori}
                            </span>
                            <StatusBadge status={doc.status} />
                        </div>
                    </div>
                </div>

                {/* Title */}
                <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2 line-clamp-2 min-h-[40px]">
                    {doc.judul}
                </h3>

                {/* Metadata */}
                <div className="space-y-1.5 mb-3">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        No. Memo: <span className="font-medium text-gray-700 dark:text-gray-300">{doc.nomorMemo}</span>
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        Target: <span className="font-medium text-gray-700 dark:text-gray-300">{targetLabels[doc.targetMarket] || doc.targetMarket}</span>
                    </p>
                    <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                        <Calendar className="w-3 h-3" />
                        <span>{formatDate(doc.berlakuMulai)} — {formatDate(doc.berlakuAkhir)}</span>
                    </div>
                </div>

                {/* Keywords */}
                {doc.keywords.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                        {doc.keywords.slice(0, 3).map((kw, i) => (
                            <span
                                key={i}
                                className="px-2 py-0.5 rounded-full text-[10px] font-medium
                                    bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
                            >
                                {kw}
                            </span>
                        ))}
                        {doc.keywords.length > 3 && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium text-gray-400">
                                +{doc.keywords.length - 3}
                            </span>
                        )}
                    </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2 pt-3 border-t border-gray-100 dark:border-[#444564]">
                    <Link
                        href={`/knowledge-base/${doc.id}`}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2
                            text-xs font-medium rounded-lg
                            border border-brand text-brand dark:border-[#a5b4fc] dark:text-[#a5b4fc]
                            hover:bg-brand hover:!text-white dark:hover:bg-[#a5b4fc] dark:hover:!text-[#232333]
                            transition-all duration-200"
                    >
                        <Eye className="w-3.5 h-3.5" />
                        Lihat
                    </Link>
                    <button
                        onClick={() => onDownload?.(doc.id, doc.filename)}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2
                            text-xs font-medium rounded-lg
                            border border-[#0f172a] text-secondary-brand
                            hover:bg-secondary-brand hover:!text-white
                            transition-all duration-200"
                    >
                        <Download className="w-3.5 h-3.5" />
                        Unduh
                    </button>
                </div>
            </div>
        </div>
    );
}
