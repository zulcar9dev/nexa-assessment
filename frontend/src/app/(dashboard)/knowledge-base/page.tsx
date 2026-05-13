"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
    Search,
    Plus,
    LayoutGrid,
    List,
    RefreshCw,
    Loader2,
    AlertCircle,
    FileSearch,
} from "lucide-react";
import { useKnowledgeBase } from "@/hooks/use-knowledge-base";
import DocumentCard from "@/components/knowledge-base/DocumentCard";
import DocumentTable from "@/components/knowledge-base/DocumentTable";

export default function KnowledgeBasePage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [kategoriFilter, setKategoriFilter] = useState("");
    const [targetFilter, setTargetFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

    const {
        documents,
        pagination,
        isLoading,
        error,
        fetchDocuments,
        downloadDocument,
        deleteDocument,
        clearErrors,
    } = useKnowledgeBase();

    const loadData = useCallback(() => {
        fetchDocuments({
            q: searchQuery || undefined,
            kategori: kategoriFilter || undefined,
            targetMarket: targetFilter || undefined,
            status: statusFilter || undefined,
            startDate: startDate || undefined,
            endDate: endDate || undefined,
        });
    }, [fetchDocuments, searchQuery, kategoriFilter, targetFilter, statusFilter, startDate, endDate]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const resetFilters = () => {
        setSearchQuery("");
        setKategoriFilter("");
        setTargetFilter("");
        setStatusFilter("");
        setStartDate("");
        setEndDate("");
    };

    const hasFilters = searchQuery || kategoriFilter || targetFilter || statusFilter || startDate || endDate;

    const handleDownload = async (id: string, filename: string) => {
        await downloadDocument(id, filename);
    };

    const handleDelete = async (id: string) => {
        if (confirm("Yakin ingin menghapus dokumen ini?")) {
            const success = await deleteDocument(id);
            if (success) loadData();
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header Card */}
            <div className="card">
                {/* Title Section */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border-b border-gray-200 dark:border-[#444564]">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-[#00665e] to-[#004d47] rounded-lg flex items-center justify-center">
                            <FileSearch className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-[#00665e] dark:text-[#80cbc4]">
                                Knowledge Base
                            </h2>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Pencarian cepat dokumen memo & surat edaran
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {/* View Toggle */}
                        <div className="flex rounded-lg border border-gray-200 dark:border-[#444564] overflow-hidden">
                            <button
                                onClick={() => setViewMode("grid")}
                                className={`p-2 transition-colors ${
                                    viewMode === "grid"
                                        ? "bg-[#00665e] text-white"
                                        : "bg-white dark:bg-[#323249] text-gray-500 hover:bg-gray-50 dark:hover:bg-[#444564]"
                                }`}
                                title="Grid View"
                            >
                                <LayoutGrid className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setViewMode("table")}
                                className={`p-2 transition-colors ${
                                    viewMode === "table"
                                        ? "bg-[#00665e] text-white"
                                        : "bg-white dark:bg-[#323249] text-gray-500 hover:bg-gray-50 dark:hover:bg-[#444564]"
                                }`}
                                title="Table View"
                            >
                                <List className="w-4 h-4" />
                            </button>
                        </div>
                        <Link
                            href="/knowledge-base/upload"
                            className="inline-flex items-center gap-2 px-4 py-2.5
                                bg-[#00665e] hover:bg-[#004d47] !text-white hover:!text-white
                                rounded-lg font-medium text-sm
                                transition-all duration-200 shadow-sm hover:shadow-md"
                        >
                            <Plus className="w-4 h-4" />
                            Upload
                        </Link>
                    </div>
                </div>

                {/* Error Alert */}
                {error && (
                    <div className="mx-4 mt-4 flex items-start gap-3 rounded-lg bg-red-50 dark:bg-red-900/20 p-4 border border-red-200 dark:border-red-800">
                        <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                        <div className="flex-1">
                            <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
                        </div>
                        <button onClick={clearErrors} className="text-red-600 hover:text-red-800 dark:text-red-400">×</button>
                    </div>
                )}

                {/* Search & Filters */}
                <div className="p-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
                        {/* Search Input */}
                        <div className="lg:col-span-2 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Cari judul, kata kunci, nomor memo..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && loadData()}
                                className="w-full pl-10 pr-4 py-2.5
                                    bg-white dark:bg-[#323249]
                                    border border-gray-200 dark:border-[#444564]
                                    rounded-lg text-sm
                                    focus:outline-none focus:ring-2 focus:ring-[#00665e]/20 focus:border-[#00665e]
                                    transition-all duration-200"
                            />
                        </div>

                        {/* Kategori Filter */}
                        <select
                            value={kategoriFilter}
                            onChange={(e) => setKategoriFilter(e.target.value)}
                            className="w-full px-4 py-2.5
                                bg-white dark:bg-[#323249]
                                border border-gray-200 dark:border-[#444564]
                                rounded-lg text-sm
                                focus:outline-none focus:ring-2 focus:ring-[#00665e]/20 focus:border-[#00665e]
                                transition-all duration-200"
                        >
                            <option value="">-- Kategori --</option>
                            <option value="KREDIT_FLEKSI">Kredit Fleksi</option>
                            <option value="KREDIT_GRIYA">Kredit Griya</option>
                            <option value="KREDIT_PENSIUN">Kredit Pensiun</option>
                        </select>

                        {/* Target Market Filter */}
                        <select
                            value={targetFilter}
                            onChange={(e) => setTargetFilter(e.target.value)}
                            className="w-full px-4 py-2.5
                                bg-white dark:bg-[#323249]
                                border border-gray-200 dark:border-[#444564]
                                rounded-lg text-sm
                                focus:outline-none focus:ring-2 focus:ring-[#00665e]/20 focus:border-[#00665e]
                                transition-all duration-200"
                        >
                            <option value="">-- Target --</option>
                            <option value="ASN">ASN</option>
                            <option value="SWASTA">Swasta</option>
                            <option value="TASPEN">Taspen</option>
                            <option value="ASABRI">Asabri</option>
                            <option value="WIRASWASTA">Wiraswasta</option>
                        </select>

                        {/* Status Filter */}
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full px-4 py-2.5
                                bg-white dark:bg-[#323249]
                                border border-gray-200 dark:border-[#444564]
                                rounded-lg text-sm
                                focus:outline-none focus:ring-2 focus:ring-[#00665e]/20 focus:border-[#00665e]
                                transition-all duration-200"
                        >
                            <option value="">-- Status --</option>
                            <option value="AKTIF">Aktif</option>
                            <option value="SEGERA_BERAKHIR">Segera Berakhir</option>
                            <option value="EXPIRED">Expired</option>
                            <option value="ARCHIVED">Archived</option>
                        </select>

                        {/* Reset + Date */}
                        <div className="flex gap-2">
                            {hasFilters && (
                                <button
                                    onClick={resetFilters}
                                    className="px-3 py-2.5
                                        border border-gray-200 dark:border-[#444564]
                                        bg-white dark:bg-[#323249]
                                        rounded-lg text-gray-600 dark:text-gray-400
                                        hover:bg-gray-50 dark:hover:bg-[#444564]
                                        transition-all duration-200"
                                    title="Reset Filter"
                                >
                                    <RefreshCw className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Date Range */}
                    <div className="flex flex-wrap gap-3 mt-3">
                        <div className="flex items-center gap-2">
                            <label className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">Dari:</label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="px-3 py-2 bg-white dark:bg-[#323249] border border-gray-200 dark:border-[#444564] rounded-lg text-sm
                                    focus:outline-none focus:ring-2 focus:ring-[#00665e]/20 focus:border-[#00665e] transition-all duration-200"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <label className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">Sampai:</label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="px-3 py-2 bg-white dark:bg-[#323249] border border-gray-200 dark:border-[#444564] rounded-lg text-sm
                                    focus:outline-none focus:ring-2 focus:ring-[#00665e]/20 focus:border-[#00665e] transition-all duration-200"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            {isLoading ? (
                <div className="card p-12 text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-[#00665e] mx-auto mb-3" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">Memuat dokumen...</p>
                </div>
            ) : documents.length > 0 ? (
                <>
                    {viewMode === "grid" ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {documents.map((doc) => (
                                <DocumentCard
                                    key={doc.id}
                                    document={doc}
                                    onDownload={handleDownload}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="card overflow-hidden">
                            <DocumentTable
                                documents={documents}
                                onDownload={handleDownload}
                                onDelete={handleDelete}
                            />
                        </div>
                    )}

                    {/* Pagination */}
                    <div className="card">
                        <div className="flex items-center justify-between px-4 py-3">
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Menampilkan {documents.length} dari {pagination.total} dokumen
                            </p>
                            <div className="flex items-center gap-2">
                                <button
                                    disabled={pagination.page <= 1}
                                    onClick={() => fetchDocuments({ page: pagination.page - 1 })}
                                    className={`px-3 py-1.5 rounded-lg border border-gray-200 dark:border-[#444564]
                                        text-sm ${pagination.page <= 1 ? "text-gray-400 cursor-not-allowed" : "text-gray-600 hover:bg-gray-100 dark:hover:bg-[#323249]"}`}
                                >
                                    ← Prev
                                </button>
                                <span className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400">
                                    {pagination.page} / {pagination.totalPages || 1}
                                </span>
                                <button
                                    disabled={pagination.page >= pagination.totalPages}
                                    onClick={() => fetchDocuments({ page: pagination.page + 1 })}
                                    className={`px-3 py-1.5 rounded-lg border border-gray-200 dark:border-[#444564]
                                        text-sm ${pagination.page >= pagination.totalPages ? "text-gray-400 cursor-not-allowed" : "text-gray-600 hover:bg-gray-100 dark:hover:bg-[#323249]"}`}
                                >
                                    Next →
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            ) : (
                <div className="card p-12 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-[#323249] rounded-full flex items-center justify-center">
                        <FileSearch className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300 mb-2">
                        Belum ada dokumen
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                        {hasFilters
                            ? "Tidak ada dokumen yang sesuai dengan filter pencarian."
                            : "Mulai dengan mengunggah dokumen PDF pertama Anda."}
                    </p>
                    {!hasFilters && (
                        <Link
                            href="/knowledge-base/upload"
                            className="inline-flex items-center gap-2 px-5 py-2.5
                                bg-[#00665e] hover:bg-[#004d47] !text-white hover:!text-white
                                rounded-lg font-medium text-sm transition-all duration-200"
                        >
                            <Plus className="w-4 h-4" />
                            Upload Dokumen
                        </Link>
                    )}
                </div>
            )}
        </div>
    );
}
