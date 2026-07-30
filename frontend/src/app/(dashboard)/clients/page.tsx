"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Search, Plus, Download, Edit, Trash2, RefreshCw, Eye, Loader2, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { useClient } from "@/hooks/use-client";
import { useDebounce } from "@/hooks/use-debounce";

const kategoriLabels: Record<string, string> = {
    PRAPURNA: "Assessment Type A (Pre-Period)",
    PURNA: "Assessment Type B (Full-Period)",
    AKTIF: "Assessment Type C (Active)",
    type_a: "Assessment Type A (Pre-Period)",
    type_b: "Assessment Type B (Full-Period)",
    type_c: "Assessment Type C (Active)",
};

const jenisBadgeColors: Record<string, string> = {
    BARU: "bg-[var(--primary)]/10 text-[var(--primary)]",
    TOP_UP: "bg-[var(--warning)]/10 text-[var(--warning)]",
    TOP_UP_SISA_GAJI: "bg-[var(--outline-variant)]/20 text-[var(--on-surface-variant)]",
    TAKEOVER: "bg-[var(--danger)]/10 text-[var(--danger)]",
    FLEKSI_AKTIF: "bg-[var(--success)]/10 text-[var(--success)]",
    baru: "bg-[var(--primary)]/10 text-[var(--primary)]",
    top_up: "bg-[var(--warning)]/10 text-[var(--warning)]",
    top_up_sisa_gaji: "bg-[var(--outline-variant)]/20 text-[var(--on-surface-variant)]",
    takeover: "bg-[var(--danger)]/10 text-[var(--danger)]",
    fleksi_type_c: "bg-[var(--success)]/10 text-[var(--success)]",
    PENSIUNAN_JANDA_BARU: "bg-[var(--primary)]/10 text-[var(--primary)]",
    PENSIUNAN_JANDA_TOP_UP: "bg-[var(--warning)]/10 text-[var(--warning)]",
    PENSIUNAN_JANDA_TAKEOVER: "bg-[var(--danger)]/10 text-[var(--danger)]",
    pensiunan_janda_baru: "bg-[var(--primary)]/10 text-[var(--primary)]",
    pensiunan_janda_top_up: "bg-[var(--warning)]/10 text-[var(--warning)]",
    pensiunan_janda_takeover: "bg-[var(--danger)]/10 text-[var(--danger)]",
    PENSIUNAN_DUDA_BARU: "bg-[var(--primary)]/10 text-[var(--primary)]",
    PENSIUNAN_DUDA_TOP_UP: "bg-[var(--warning)]/10 text-[var(--warning)]",
    PENSIUNAN_DUDA_TAKEOVER: "bg-[var(--danger)]/10 text-[var(--danger)]",
    pensiunan_duda_baru: "bg-[var(--primary)]/10 text-[var(--primary)]",
    pensiunan_duda_top_up: "bg-[var(--warning)]/10 text-[var(--warning)]",
    pensiunan_duda_takeover: "bg-[var(--danger)]/10 text-[var(--danger)]",
};

const jenisLabels: Record<string, string> = {
    BARU: "Baru",
    TOP_UP: "Top Up",
    TOP_UP_SISA_GAJI: "Top Up Sisa Gaji",
    TAKEOVER: "Take Over",
    FLEKSI_AKTIF: "Active Assessment",
    baru: "Baru",
    top_up: "Top Up",
    top_up_sisa_gaji: "Top Up Sisa Gaji",
    takeover: "Take Over",
    fleksi_type_c: "Active Assessment",
    PENSIUNAN_JANDA_BARU: "Pensiunan Janda - Baru",
    PENSIUNAN_JANDA_TOP_UP: "Pensiunan Janda - Top Up",
    PENSIUNAN_JANDA_TAKEOVER: "Pensiunan Janda - Take Over",
    pensiunan_janda_baru: "Pensiunan Janda - Baru",
    pensiunan_janda_top_up: "Pensiunan Janda - Top Up",
    pensiunan_janda_takeover: "Pensiunan Janda - Take Over",
    PENSIUNAN_DUDA_BARU: "Pensiunan Duda - Baru",
    PENSIUNAN_DUDA_TOP_UP: "Pensiunan Duda - Top Up",
    PENSIUNAN_DUDA_TAKEOVER: "Pensiunan Duda - Take Over",
    pensiunan_duda_baru: "Pensiunan Duda - Baru",
    pensiunan_duda_top_up: "Pensiunan Duda - Top Up",
    pensiunan_duda_takeover: "Pensiunan Duda - Take Over",
};

export default function ClientHistoryPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const debouncedSearch = useDebounce(searchQuery, 400);
    const [jenisFilter, setJenisFilter] = useState("");
    const [kategoriFilter, setKategoriFilter] = useState("");
    const [segmenFilter, setSegmenFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

    const {
        debiturList,
        pagination,
        isLoading,
        error,
        fetchDebitur,
        deleteDebitur,
        downloadDocx,
        clearErrors
    } = useClient();

    // Fetch data on mount and when filters change
    const loadData = useCallback((targetPage?: number) => {
        fetchDebitur({
            q: debouncedSearch || undefined,
            jenis: jenisFilter || undefined,
            kategori: kategoriFilter || undefined,
            segmentasi: segmenFilter || undefined,
            status: statusFilter || undefined,
            page: targetPage || 1,
        });
    }, [fetchDebitur, debouncedSearch, jenisFilter, kategoriFilter, segmenFilter, statusFilter]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const resetFilters = () => {
        setSearchQuery("");
        setJenisFilter("");
        setKategoriFilter("");
        setSegmenFilter("");
        setStatusFilter("");
    };

    const handleDelete = async (id: string) => {
        const success = await deleteDebitur(id);
        if (success) {
            setDeleteConfirm(null);
            loadData(); // Refresh list
        }
    };

    const handleDownload = async (id: string, nama: string) => {
        await downloadDocx(id, nama);
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "2-digit",
            year: "2-digit",
        });
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h2 className="font-heading text-headline-lg text-[var(--on-surface)]">
                        Riwayat Input Client
                    </h2>
                    <p className="text-body-lg text-[var(--on-surface-variant)] mt-1">
                        Track and manage assessment results across your entire organization.
                    </p>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="md:col-span-1 bg-[var(--surface-light)] dark:bg-[var(--surface-dark)] p-6 rounded-xl shadow-sm border border-[var(--outline-variant)]/10 relative overflow-hidden group">
                    <div className="relative z-10">
                        <p className="text-sm font-medium text-[var(--on-surface-variant)] uppercase tracking-wider mb-2">Processed</p>
                        <h3 className="text-display-lg font-bold text-[var(--primary)]">1,284</h3>
                    </div>
                </div>
                <div className="md:col-span-1 bg-[var(--surface-light)] dark:bg-[var(--surface-dark)] p-6 rounded-xl shadow-sm border border-[var(--outline-variant)]/10 relative overflow-hidden group">
                    <div className="relative z-10">
                        <p className="text-sm font-medium text-[var(--on-surface-variant)] uppercase tracking-wider mb-2">Pending Approval</p>
                        <h3 className="text-display-lg font-bold text-[var(--warning)]">42</h3>
                    </div>
                </div>
                <div className="md:col-span-2 bg-[var(--primary-container)] p-6 rounded-xl shadow-lg relative overflow-hidden group">
                    <div className="relative z-10 flex h-full items-center">
                        <div className="flex-1">
                            <p className="text-sm font-medium text-[var(--on-primary-container)] uppercase tracking-wider mb-2">Avg. Assessment Score</p>
                            <h3 className="text-display-lg font-bold text-[var(--on-primary)]">88.4<span className="text-xl ml-1">%</span></h3>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-[var(--surface-light)] dark:bg-[var(--surface-dark)] rounded-xl shadow-sm border border-[var(--outline-variant)]/20 relative overflow-hidden">
                {/* Gradient Top Line */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[var(--primary-container)] to-[var(--secondary-container)] z-10" />

                {/* Error Alert */}
                {error && (
                    <div className="mx-4 mt-4 flex items-start gap-3 rounded-lg bg-red-50 dark:bg-red-900/20 p-4 border border-red-200 dark:border-red-800">
                        <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                        <div className="flex-1">
                            <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
                        </div>
                        <button
                            onClick={clearErrors}
                            className="text-red-600 hover:text-red-800 dark:text-red-400"
                        >
                            ×
                        </button>
                    </div>
                )}

                {/* Filter Section */}
                <div className="p-6 border-b border-[var(--outline-variant)]/20">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
                        {/* Search Input */}
                        <div className="lg:col-span-2 relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--outline)]" />
                            <input
                                type="text"
                                placeholder="Cari Nama / NIK..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && loadData()}
                                className="w-full pl-12 pr-4 py-2.5 
                  bg-[var(--surface-container-low)] dark:bg-[var(--surface-dark)] 
                  border border-[var(--outline-variant)]
                  rounded-xl text-sm
                  focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)]
                  transition-all duration-200"
                            />
                        </div>

                        {/* Kategori Filter */}
                        <select
                            value={kategoriFilter}
                            onChange={(e) => setKategoriFilter(e.target.value)}
                            className="w-full px-4 py-2.5 
                bg-[var(--surface-light)] dark:bg-[var(--surface-dark)] 
                border border-[var(--outline-variant)]
                rounded-lg text-sm
                focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)]
                transition-all duration-200"
                        >
                            <option value="">-- Semua Kategori --</option>
                            <option value="PRAPURNA">Assessment Type A (Pre-Period)</option>
                            <option value="PURNA">Assessment Type B (Full-Period)</option>
                            <option value="AKTIF">Active Assessment</option>
                        </select>

                        {/* Jenis Filter */}
                        <select
                            value={jenisFilter}
                            onChange={(e) => setJenisFilter(e.target.value)}
                            className="w-full px-4 py-2.5 
                bg-[var(--surface-light)] dark:bg-[var(--surface-dark)] 
                border border-[var(--outline-variant)]
                rounded-lg text-sm
                focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)]
                transition-all duration-200"
                        >
                            <option value="">-- Semua Jenis --</option>
                            <option value="BARU">Baru</option>
                            <option value="TOP_UP">Top Up</option>
                            <option value="TOP_UP_SISA_GAJI">Top Up Sisa Gaji</option>
                            <option value="TAKEOVER">Take Over</option>
                            <option value="FLEKSI_AKTIF">Active Assessment (Fleksi)</option>
                            <option value="THT">THT</option>
                            <option value="PENSIUNAN_JANDA_BARU">Pensiunan Janda - Baru</option>
                            <option value="PENSIUNAN_JANDA_TOP_UP">Pensiunan Janda - Top Up</option>
                            <option value="PENSIUNAN_JANDA_TAKEOVER">Pensiunan Janda - Take Over</option>
                            <option value="PENSIUNAN_DUDA_BARU">Pensiunan Duda - Baru</option>
                            <option value="PENSIUNAN_DUDA_TOP_UP">Pensiunan Duda - Top Up</option>
                            <option value="PENSIUNAN_DUDA_TAKEOVER">Pensiunan Duda - Take Over</option>
                        </select>

                        {/* Segmen Filter */}
                        <select
                            value={segmenFilter}
                            onChange={(e) => setSegmenFilter(e.target.value)}
                            className="w-full px-4 py-2.5 
                bg-[var(--surface-light)] dark:bg-[var(--surface-dark)] 
                border border-[var(--outline-variant)]
                rounded-lg text-sm
                focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)]
                transition-all duration-200"
                        >
                            <option value="">-- Semua Segmen --</option>
                            <option value="TASPEN">TASPEN (PNS)</option>
                            <option value="ASABRI">ASABRI (TNI/POLRI)</option>
                            <option value="BUMD_BUMN">BUMD/BUMN</option>
                            <option value="SWASTA">Swasta</option>
                            <option value="PEMERINTAHAN">Pemerintahan</option>
                        </select>

                        {/* Status Filter */}
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full px-4 py-2.5 
                bg-[var(--surface-light)] dark:bg-[var(--surface-dark)] 
                border border-[var(--outline-variant)]
                rounded-lg text-sm
                focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)]
                transition-all duration-200"
                        >
                            <option value="">-- Semua Status --</option>
                            <option value="DRAFT">Draft</option>
                            <option value="SUBMITTED">Submitted</option>
                        </select>

                        {/* Buttons */}
                        <div className="flex gap-2 lg:col-span-6 lg:justify-end mt-2">
                            <Link
                                href="/"
                                className="inline-flex items-center justify-center gap-2 px-6 py-2.5
                  bg-[var(--primary)] hover:bg-[var(--primary-container)] text-[var(--on-primary)]
                  rounded-xl font-semibold text-sm
                  transition-all duration-200 shadow-sm"
                            >
                                <Plus className="w-4 h-4" />
                                Input Baru
                            </Link>

                            {(searchQuery || jenisFilter || kategoriFilter || segmenFilter || statusFilter) && (
                                <button
                                    onClick={resetFilters}
                                    className="px-4 py-2.5 
                    border border-[var(--outline-variant)]
                    bg-transparent
                    rounded-xl text-[var(--on-surface-variant)]
                    hover:bg-[var(--surface-container-low)]
                    transition-all duration-200 font-medium"
                                    title="Reset Filters"
                                >
                                    <RefreshCw className="w-4 h-4 mr-2 inline" />
                                    Reset Filter
                                </button>
                            )}
                        </div>
                    </div>
                </div>

            {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[var(--surface-container-low)]/50">
                                <th className="px-6 py-4 text-label-caps text-[var(--on-surface-variant)] border-b border-[var(--outline-variant)]/20">Tanggal</th>
                                <th className="px-6 py-4 text-label-caps text-[var(--on-surface-variant)] border-b border-[var(--outline-variant)]/20">Nama Pemohon</th>
                                <th className="px-6 py-4 text-label-caps text-[var(--on-surface-variant)] border-b border-[var(--outline-variant)]/20">Pekerjaan</th>
                                <th className="px-6 py-4 text-label-caps text-[var(--on-surface-variant)] border-b border-[var(--outline-variant)]/20">Segmentasi</th>
                                <th className="px-6 py-4 text-label-caps text-[var(--on-surface-variant)] border-b border-[var(--outline-variant)]/20">Jenis Pengajuan</th>
                                <th className="px-6 py-4 text-label-caps text-[var(--on-surface-variant)] border-b border-[var(--outline-variant)]/20">NIK</th>
                                <th className="px-6 py-4 text-label-caps text-[var(--on-surface-variant)] border-b border-[var(--outline-variant)]/20">Produk</th>
                                <th className="px-6 py-4 text-label-caps text-[var(--on-surface-variant)] border-b border-[var(--outline-variant)]/20">Status</th>
                                <th className="px-6 py-4 text-label-caps text-[var(--on-surface-variant)] border-b border-[var(--outline-variant)]/20 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan={9} className="px-4 py-8 text-center">
                                        <div className="flex items-center justify-center gap-2 text-gray-500">
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            <span>Memuat data...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : debiturList.length > 0 ? (
                                debiturList.map((item) => (
                                    <tr
                                        key={item.id}
                                        className="hover:bg-[var(--surface-container-low)]/30 transition-colors group border-b border-[var(--outline-variant)]/10"
                                    >
                                        <td className="px-6 py-4 text-sm font-medium text-[var(--on-surface-variant)]">{formatDate(item.createdAt)}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-[var(--secondary-container)]/20 text-[var(--secondary)] flex items-center justify-center font-bold">
                                                    {item.applicantName ? item.applicantName.substring(0, 2).toUpperCase() : 'NA'}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-[var(--on-surface)]">{item.applicantName}</p>
                                                    <p className="text-xs text-[var(--on-surface-variant)]">ID: {item.idNumber.substring(0, 8)}***</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-medium text-[var(--on-surface-variant)]">
                                                {item.pekerjaan || "-"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`px-3 py-1 text-[11px] font-bold uppercase rounded-full ${String(item.segmentasi).toUpperCase() === "ASABRI"
                                                    ? "bg-[var(--success)]/10 text-[var(--success)]"
                                                    : "bg-[var(--info)]/10 text-[var(--info)]"
                                                    }`}
                                            >
                                                {String(item.segmentasi).toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 text-[11px] font-bold uppercase rounded-full ${jenisBadgeColors[item.jenisPengajuan] || "bg-[var(--primary)]/10 text-[var(--primary)]"}`}>
                                                {jenisLabels[item.jenisPengajuan] || item.jenisPengajuan}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-mono text-[var(--on-surface-variant)]">
                                            {item.idNumber}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-medium text-[var(--on-surface-variant)]">
                                                {kategoriLabels[item.kategori] || item.kategori}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 text-[11px] font-bold uppercase rounded-full inline-flex items-center gap-1.5 ${
                                                item.status === 'DRAFT'
                                                    ? 'bg-[var(--warning)]/10 text-[var(--warning)]'
                                                    : 'bg-[var(--success)]/10 text-[var(--success)]'
                                            }`}>
                                                {item.status === 'DRAFT' ? (
                                                    <>
                                                        <span className="w-1.5 h-1.5 bg-[var(--warning)] rounded-full"></span>
                                                        Draft
                                                    </>
                                                ) : (
                                                    <>
                                                        <span className="w-1.5 h-1.5 bg-[var(--success)] rounded-full animate-pulse"></span>
                                                        Submitted
                                                    </>
                                                )}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center gap-2">
                                                {/* Download */}
                                                <button
                                                    onClick={() => handleDownload(item.id, item.applicantName)}
                                                    className="p-2 rounded-xl
                                                        border border-[var(--outline-variant)] text-[var(--on-surface-variant)]
                                                        hover:bg-[var(--success)]/10 hover:text-[var(--success)] hover:border-[var(--success)]/50
                                                        transition-all duration-200"
                                                    title="Download Docx"
                                                >
                                                    <Download className="w-4 h-4" />
                                                </button>
                                                {/* Detail */}
                                                <Link
                                                    href={`/clients/${item.id}`}
                                                    className="p-2 rounded-xl
                                                        border border-[var(--outline-variant)] text-[var(--on-surface-variant)]
                                                        hover:bg-[var(--info)]/10 hover:text-[var(--info)] hover:border-[var(--info)]/50
                                                        transition-all duration-200"
                                                    title="Lihat Detail"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </Link>
                                                {/* Edit */}
                                                <Link
                                                    href={`/clients/${item.id}/edit`}
                                                    className="p-2 rounded-xl
                                                        border border-[var(--outline-variant)] text-[var(--on-surface-variant)]
                                                        hover:bg-[var(--warning)]/10 hover:text-[var(--warning)] hover:border-[var(--warning)]/50
                                                        transition-all duration-200"
                                                    title="Edit"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </Link>
                                                {/* Delete */}
                                                {deleteConfirm === item.id ? (
                                                    <div className="flex items-center gap-1">
                                                        <button
                                                            onClick={() => handleDelete(item.id)}
                                                            className="p-2 rounded-xl bg-[var(--danger)] text-white shadow-sm hover:shadow-md transition-all duration-200"
                                                            title="Konfirmasi Hapus"
                                                        >
                                                            ✓
                                                        </button>
                                                        <button
                                                            onClick={() => setDeleteConfirm(null)}
                                                            className="p-2 rounded-xl bg-[var(--outline)] text-white shadow-sm hover:shadow-md transition-all duration-200"
                                                            title="Batal"
                                                        >
                                                            ×
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => setDeleteConfirm(item.id)}
                                                        className="p-2 rounded-xl
                                                            border border-[var(--outline-variant)] text-[var(--on-surface-variant)]
                                                            hover:bg-[var(--danger)]/10 hover:text-[var(--danger)] hover:border-[var(--danger)]/50
                                                            transition-all duration-200"
                                                        title="Hapus"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan={9}
                                        className="px-6 py-8 text-center text-[var(--on-surface-variant)]"
                                    >
                                        Belum ada data ditemukan.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {debiturList.length > 0 && (
                    <div className="p-6 bg-[var(--surface-bright)] flex flex-col md:flex-row gap-6 items-center justify-between border-t border-[var(--outline-variant)]/20">
                        <p className="text-sm text-[var(--on-surface-variant)] font-medium">
                            Menampilkan <span className="text-[var(--on-surface)] font-bold">{debiturList.length}</span> dari {pagination.total} data
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                disabled={pagination.page <= 1}
                                onClick={() => loadData(pagination.page - 1)}
                                className={`w-10 h-10 flex items-center justify-center rounded-lg border border-[var(--outline-variant)] 
                  ${pagination.page <= 1 ? 'text-[var(--outline)] opacity-50 cursor-not-allowed' : 'text-[var(--on-surface-variant)] hover:bg-[var(--surface-container-low)] transition-colors'}`}
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <span className="w-10 h-10 flex items-center justify-center rounded-lg bg-[var(--primary)] text-[var(--on-primary)] font-bold shadow-md">
                                {pagination.page}
                            </span>
                            <span className="px-2 text-[var(--outline-variant)]">of</span>
                            <span className="w-10 h-10 flex items-center justify-center rounded-lg border border-[var(--outline-variant)] text-[var(--on-surface-variant)] font-medium">
                                {pagination.totalPages || 1}
                            </span>
                            <button
                                disabled={pagination.page >= pagination.totalPages}
                                onClick={() => loadData(pagination.page + 1)}
                                className={`w-10 h-10 flex items-center justify-center rounded-lg border border-[var(--outline-variant)] 
                  ${pagination.page >= pagination.totalPages ? 'text-[var(--outline)] opacity-50 cursor-not-allowed' : 'text-[var(--on-surface-variant)] hover:bg-[var(--surface-container-low)] transition-colors'}`}
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
