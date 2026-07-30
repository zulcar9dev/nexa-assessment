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
        <div className="space-y-6 animate-in fade-in duration-300">
            {/* Header Card */}
            <div className="bg-surface-light dark:bg-surface rounded-xl shadow-sm border border-outline-variant/20">
                {/* Title Section */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border-b border-outline-variant/20">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                            <FileSearch className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-title-lg font-bold text-on-surface font-heading">
                                Knowledge Base
                            </h2>
                            <p className="text-label-sm text-on-surface-variant">
                                Pencarian cepat dokumen memo & surat edaran
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {/* View Toggle */}
                        <div className="flex rounded-xl border border-outline-variant/30 overflow-hidden">
                            <button
                                onClick={() => setViewMode("grid")}
                                className={`p-2 transition-colors ${
                                    viewMode === "grid"
                                        ? "bg-primary text-on-primary"
                                        : "bg-surface-light dark:bg-surface text-on-surface-variant hover:bg-surface-container"
                                }`}
                                title="Grid View"
                            >
                                <LayoutGrid className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setViewMode("table")}
                                className={`p-2 transition-colors ${
                                    viewMode === "table"
                                        ? "bg-primary text-on-primary"
                                        : "bg-surface-light dark:bg-surface text-on-surface-variant hover:bg-surface-container"
                                }`}
                                title="Table View"
                            >
                                <List className="w-4 h-4" />
                            </button>
                        </div>
                        <Link
                            href="/knowledge-base/upload"
                            className="inline-flex items-center gap-2 px-4 py-2.5
                                bg-primary hover:bg-primary-container text-on-primary
                                rounded-xl font-medium text-sm
                                transition-all duration-200 shadow-sm"
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
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant/50" />
                            <input
                                type="text"
                                placeholder="Cari judul, kata kunci, nomor memo..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && loadData()}
                                className="w-full pl-10 pr-4 py-2.5
                                    bg-surface-light dark:bg-surface-container
                                    border border-outline-variant/30
                                    rounded-xl text-sm text-on-surface
                                    focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
                                    transition-all duration-200"
                            />
                        </div>

                        {/* Kategori Filter */}
                        <select
                            value={kategoriFilter}
                            onChange={(e) => setKategoriFilter(e.target.value)}
                            className="w-full px-4 py-2.5
                                bg-surface-light dark:bg-surface-container
                                border border-outline-variant/30
                                rounded-xl text-sm text-on-surface
                                focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
                                transition-all duration-200"
                        >
                            <option value="">-- Kategori --</option>
                            <option value="KREDIT_FLEKSI">Product Flex</option>
                            <option value="KREDIT_GRIYA">Product Home</option>
                            <option value="KREDIT_PENSIUN">Product Pension</option>
                        </select>

                        {/* Target Market Filter */}
                        <select
                            value={targetFilter}
                            onChange={(e) => setTargetFilter(e.target.value)}
                            className="w-full px-4 py-2.5
                                bg-surface-light dark:bg-surface-container
                                border border-outline-variant/30
                                rounded-xl text-sm text-on-surface
                                focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
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
                                bg-surface-light dark:bg-surface-container
                                border border-outline-variant/30
                                rounded-xl text-sm text-on-surface
                                focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
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
                                        border border-outline-variant/30
                                        bg-surface-light dark:bg-surface-container
                                        rounded-xl text-on-surface-variant
                                        hover:bg-surface-container/50
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
                            <label className="text-xs text-on-surface-variant whitespace-nowrap">Dari:</label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="px-3 py-2 bg-surface-light dark:bg-surface-container border border-outline-variant/30 rounded-xl text-sm text-on-surface
                                    focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <label className="text-xs text-on-surface-variant whitespace-nowrap">Sampai:</label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="px-3 py-2 bg-surface-light dark:bg-surface-container border border-outline-variant/30 rounded-xl text-sm text-on-surface
                                    focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            {isLoading ? (
                <div className="card p-12 text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-brand mx-auto mb-3" />
                    <p className="text-sm text-on-surface-variant">Memuat dokumen...</p>
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
                    <div className="bg-surface-light dark:bg-surface rounded-xl shadow-sm border border-outline-variant/20">
                        <div className="flex items-center justify-between px-4 py-3">
                            <p className="text-label-sm text-on-surface-variant">
                                Menampilkan {documents.length} dari {pagination.total} dokumen
                            </p>
                            <div className="flex items-center gap-2">
                                <button
                                    disabled={pagination.page <= 1}
                                    onClick={() => fetchDocuments({ page: pagination.page - 1 })}
                                    className={`px-3 py-1.5 rounded-xl border border-outline-variant/30
                                        text-sm ${pagination.page <= 1 ? "text-on-surface-variant/50 cursor-not-allowed" : "text-on-surface hover:bg-surface-container"}`}
                                >
                                    ← Prev
                                </button>
                                <span className="px-3 py-1 text-label-sm text-on-surface">
                                    {pagination.page} / {pagination.totalPages || 1}
                                </span>
                                <button
                                    disabled={pagination.page >= pagination.totalPages}
                                    onClick={() => fetchDocuments({ page: pagination.page + 1 })}
                                    className={`px-3 py-1.5 rounded-xl border border-outline-variant/30
                                        text-sm ${pagination.page >= pagination.totalPages ? "text-on-surface-variant/50 cursor-not-allowed" : "text-on-surface hover:bg-surface-container"}`}
                                >
                                    Next →
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            ) : (
                <div className="bg-surface-light dark:bg-surface rounded-xl shadow-sm border border-outline-variant/20 p-12 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-surface-container rounded-full flex items-center justify-center">
                        <FileSearch className="w-8 h-8 text-on-surface-variant/50" />
                    </div>
                    <h3 className="text-lg font-semibold text-on-surface font-heading mb-2">
                        Belum ada dokumen
                    </h3>
                    <p className="text-sm text-on-surface-variant mb-4">
                        {hasFilters
                            ? "Tidak ada dokumen yang sesuai dengan filter pencarian."
                            : "Mulai dengan mengunggah dokumen PDF pertama Anda."}
                    </p>
                    {!hasFilters && (
                        <Link
                            href="/knowledge-base/upload"
                            className="inline-flex items-center gap-2 px-5 py-2.5
                                bg-primary hover:bg-primary-container text-on-primary
                                rounded-xl font-medium text-sm transition-all duration-200"
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
