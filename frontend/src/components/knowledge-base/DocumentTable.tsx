"use client";

import Link from "next/link";
import { Eye, Download, Trash2 } from "lucide-react";
import StatusBadge from "./StatusBadge";
import type { DocumentData } from "./DocumentCard";

const kategoriLabels: Record<string, string> = {
    KREDIT_FLEKSI: "Kredit Fleksi",
    KREDIT_GRIYA: "Kredit Griya",
    KREDIT_PENSIUN: "Kredit Pensiun",
};

const targetLabels: Record<string, string> = {
    ASN: "ASN",
    SWASTA: "Swasta",
    TASPEN: "Taspen",
    ASABRI: "Asabri",
    WIRASWASTA: "Wiraswasta",
};

interface DocumentTableProps {
    documents: DocumentData[];
    onDownload?: (id: string, filename: string) => void;
    onDelete?: (id: string) => void;
}

export default function DocumentTable({ documents, onDownload, onDelete }: DocumentTableProps) {
    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "2-digit",
            year: "2-digit",
        });
    };

    return (
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead>
                    <tr className="border-b-2 border-gray-200 dark:border-[#444564]">
                        <th className="table-header px-4 py-3 text-left">Judul</th>
                        <th className="table-header px-4 py-3 text-left">No. Memo</th>
                        <th className="table-header px-4 py-3 text-left">Kategori</th>
                        <th className="table-header px-4 py-3 text-left">Target</th>
                        <th className="table-header px-4 py-3 text-left">Status</th>
                        <th className="table-header px-4 py-3 text-left">Berlaku</th>
                        <th className="table-header px-4 py-3 text-center">Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    {documents.map((doc) => (
                        <tr
                            key={doc.id}
                            className="border-b border-gray-100 dark:border-[#444564] hover:bg-gray-50 dark:hover:bg-[#323249] transition-colors"
                        >
                            <td className="px-4 py-3">
                                <div className="max-w-[250px]">
                                    <p className="font-semibold text-sm text-gray-800 dark:text-gray-200 truncate">
                                        {doc.judul}
                                    </p>
                                    {doc.keywords.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mt-1">
                                            {doc.keywords.slice(0, 2).map((kw, i) => (
                                                <span
                                                    key={i}
                                                    className="px-1.5 py-0.5 rounded text-[10px] bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
                                                >
                                                    {kw}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 font-mono">
                                {doc.nomorMemo}
                            </td>
                            <td className="px-4 py-3">
                                <span className="badge badge-primary text-xs">
                                    {kategoriLabels[doc.kategori] || doc.kategori}
                                </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                                {targetLabels[doc.targetMarket] || doc.targetMarket}
                            </td>
                            <td className="px-4 py-3">
                                <StatusBadge status={doc.status} />
                            </td>
                            <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                {formatDate(doc.berlakuMulai)} — {formatDate(doc.berlakuAkhir)}
                            </td>
                            <td className="px-4 py-3">
                                <div className="flex items-center justify-center gap-1.5">
                                    <Link
                                        href={`/knowledge-base/${doc.id}`}
                                        className="p-2 rounded-lg border border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white transition-all duration-200"
                                        title="Lihat"
                                    >
                                        <Eye className="w-4 h-4" />
                                    </Link>
                                    <button
                                        onClick={() => onDownload?.(doc.id, doc.filename)}
                                        className="p-2 rounded-lg border border-green-500 text-green-500 hover:bg-green-500 hover:text-white transition-all duration-200"
                                        title="Unduh"
                                    >
                                        <Download className="w-4 h-4" />
                                    </button>
                                    {onDelete && (
                                        <button
                                            onClick={() => onDelete(doc.id)}
                                            className="p-2 rounded-lg border border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-all duration-200"
                                            title="Hapus"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
