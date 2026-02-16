"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Search, Plus, Download, Edit, Trash2, RefreshCw, Eye, Loader2, AlertCircle } from "lucide-react";
import { useDebitur } from "@/hooks/use-debitur";

const kategoriLabels: Record<string, string> = {
    PRAPURNA: "BNI Fleksi Pensiun Prapurna",
    PURNA: "BNI Fleksi Pensiun Purna",
    AKTIF: "BNI Fleksi Aktif",
    prapurna: "BNI Fleksi Pensiun Prapurna",
    purna: "BNI Fleksi Pensiun Purna",
    aktif: "BNI Fleksi Aktif",
};

const jenisBadgeColors: Record<string, string> = {
    BARU: "badge-primary",
    TOP_UP: "badge-warning",
    TOP_UP_SISA_GAJI: "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300",
    TAKEOVER: "badge-danger",
    FLEKSI_AKTIF: "badge-success",
    baru: "badge-primary",
    top_up: "badge-warning",
    top_up_sisa_gaji: "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300",
    takeover: "badge-danger",
    fleksi_aktif: "badge-success",
};

const jenisLabels: Record<string, string> = {
    BARU: "Baru",
    TOP_UP: "Top Up",
    TOP_UP_SISA_GAJI: "Top Up Sisa Gaji",
    TAKEOVER: "Take Over",
    FLEKSI_AKTIF: "Fleksi Aktif",
    baru: "Baru",
    top_up: "Top Up",
    top_up_sisa_gaji: "Top Up Sisa Gaji",
    takeover: "Take Over",
    fleksi_aktif: "Fleksi Aktif",
};

export default function RiwayatDebiturPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [jenisFilter, setJenisFilter] = useState("");
    const [kategoriFilter, setKategoriFilter] = useState("");
    const [segmenFilter, setSegmenFilter] = useState("");
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
    } = useDebitur();

    // Fetch data on mount and when filters change
    const loadData = useCallback(() => {
        fetchDebitur({
            q: searchQuery || undefined,
            jenis: jenisFilter || undefined,
            kategori: kategoriFilter || undefined,
            segmentasi: segmenFilter || undefined,
        });
    }, [fetchDebitur, searchQuery, jenisFilter, kategoriFilter, segmenFilter]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const resetFilters = () => {
        setSearchQuery("");
        setJenisFilter("");
        setKategoriFilter("");
        setSegmenFilter("");
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
            <div className="card">
                {/* Top Section */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border-b border-gray-200 dark:border-[#444564]">
                    <h2 className="text-xl font-bold text-[#00665e] dark:text-[#80cbc4]">
                        Riwayat Input Debitur
                    </h2>
                </div>

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
                <div className="p-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                        {/* Search Input */}
                        <div className="lg:col-span-2 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Cari Nama / NIK..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && loadData()}
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
                            <option value="">-- Semua Kategori --</option>
                            <option value="PRAPURNA">Fleksi Pensiun Prapurna</option>
                            <option value="PURNA">Fleksi Pensiun Purna</option>
                            <option value="AKTIF">Fleksi Aktif</option>
                        </select>

                        {/* Jenis Filter */}
                        <select
                            value={jenisFilter}
                            onChange={(e) => setJenisFilter(e.target.value)}
                            className="w-full px-4 py-2.5 
                bg-white dark:bg-[#323249] 
                border border-gray-200 dark:border-[#444564]
                rounded-lg text-sm
                focus:outline-none focus:ring-2 focus:ring-[#00665e]/20 focus:border-[#00665e]
                transition-all duration-200"
                        >
                            <option value="">-- Semua Jenis --</option>
                            <option value="BARU">Baru</option>
                            <option value="TOP_UP">Top Up</option>
                            <option value="TOP_UP_SISA_GAJI">Top Up Sisa Gaji</option>
                            <option value="TAKEOVER">Take Over</option>
                        </select>

                        {/* Segmen Filter */}
                        <select
                            value={segmenFilter}
                            onChange={(e) => setSegmenFilter(e.target.value)}
                            className="w-full px-4 py-2.5 
                bg-white dark:bg-[#323249] 
                border border-gray-200 dark:border-[#444564]
                rounded-lg text-sm
                focus:outline-none focus:ring-2 focus:ring-[#00665e]/20 focus:border-[#00665e]
                transition-all duration-200"
                        >
                            <option value="">-- Semua Segmen --</option>
                            <option value="TASPEN">TASPEN (PNS)</option>
                            <option value="ASABRI">ASABRI (TNI/POLRI)</option>
                            <option value="BUMD_BUMN">BUMD/BUMN</option>
                            <option value="SWASTA">Swasta</option>
                            <option value="PEMERINTAHAN">Pemerintahan</option>
                        </select>

                        {/* Buttons */}
                        <div className="flex gap-2">
                            <Link
                                href="/"
                                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5
                  bg-[#00665e] hover:bg-[#004d47] !text-white hover:!text-white
                  rounded-lg font-medium text-sm
                  transition-all duration-200 shadow-sm hover:shadow-md"
                            >
                                <Plus className="w-4 h-4" />
                                Input Baru
                            </Link>

                            {(searchQuery || jenisFilter || kategoriFilter || segmenFilter) && (
                                <button
                                    onClick={resetFilters}
                                    className="px-3 py-2.5 
                    border border-gray-200 dark:border-[#444564]
                    bg-white dark:bg-[#323249]
                    rounded-lg text-gray-600 dark:text-gray-400
                    hover:bg-gray-50 dark:hover:bg-[#444564]
                    transition-all duration-200"
                                    title="Reset"
                                >
                                    <RefreshCw className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b-2 border-gray-200 dark:border-[#444564]">
                                <th className="table-header px-4 py-3 text-left">Tanggal</th>
                                <th className="table-header px-4 py-3 text-left">Nama Pemohon</th>
                                <th className="table-header px-4 py-3 text-left">Segmentasi</th>
                                <th className="table-header px-4 py-3 text-left">Jenis Pengajuan</th>
                                <th className="table-header px-4 py-3 text-left">NIK</th>
                                <th className="table-header px-4 py-3 text-left">Produk</th>
                                <th className="table-header px-4 py-3 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan={7} className="px-4 py-8 text-center">
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
                                        className="border-b border-gray-100 dark:border-[#444564] hover:bg-gray-50 dark:hover:bg-[#323249] transition-colors"
                                    >
                                        <td className="px-4 py-3 text-sm">{formatDate(item.createdAt)}</td>
                                        <td className="px-4 py-3">
                                            <span className="font-semibold text-gray-800 dark:text-gray-200">
                                                {item.namaPemohon}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span
                                                className={`badge ${String(item.segmentasi).toUpperCase() === "ASABRI"
                                                    ? "badge-success"
                                                    : "badge-info"
                                                    }`}
                                            >
                                                {String(item.segmentasi).toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`badge ${jenisBadgeColors[item.jenisPengajuan] || "badge-primary"}`}>
                                                {jenisLabels[item.jenisPengajuan] || item.jenisPengajuan}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm font-mono text-gray-600 dark:text-gray-400">
                                            {item.noKtp}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                                {kategoriLabels[item.kategori] || item.kategori}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-center gap-2">
                                                {/* Download */}
                                                <button
                                                    onClick={() => handleDownload(item.id, item.namaPemohon)}
                                                    className="p-2 rounded-lg
                            border border-green-500 text-green-500
                            hover:bg-green-500 hover:text-white
                            transition-all duration-200"
                                                    title="Download Docx"
                                                >
                                                    <Download className="w-4 h-4" />
                                                </button>
                                                {/* Detail */}
                                                <Link
                                                    href={`/debitur/${item.id}`}
                                                    className="p-2 rounded-lg
                            border border-blue-500 text-blue-500
                            hover:bg-blue-500 hover:text-white
                            transition-all duration-200"
                                                    title="Lihat Detail"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </Link>
                                                {/* Edit */}
                                                <Link
                                                    href={`/debitur/${item.id}/edit`}
                                                    className="p-2 rounded-lg
                            border border-amber-500 text-amber-500
                            hover:bg-amber-500 hover:text-white
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
                                                            className="p-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-all duration-200"
                                                            title="Konfirmasi Hapus"
                                                        >
                                                            ✓
                                                        </button>
                                                        <button
                                                            onClick={() => setDeleteConfirm(null)}
                                                            className="p-2 rounded-lg bg-gray-500 text-white hover:bg-gray-600 transition-all duration-200"
                                                            title="Batal"
                                                        >
                                                            ×
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => setDeleteConfirm(item.id)}
                                                        className="p-2 rounded-lg
                              border border-red-500 text-red-500
                              hover:bg-red-500 hover:text-white
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
                                        colSpan={7}
                                        className="px-4 py-8 text-center text-gray-500 dark:text-gray-400"
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
                    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-[#444564]">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Menampilkan {debiturList.length} dari {pagination.total} data
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                disabled={pagination.page <= 1}
                                onClick={() => fetchDebitur({ page: pagination.page - 1 })}
                                className={`px-3 py-1 rounded border border-gray-200 dark:border-[#444564] 
                  text-sm ${pagination.page <= 1 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'}`}
                            >
                                ← Prev
                            </button>
                            <span className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400">
                                Page {pagination.page} of {pagination.totalPages || 1}
                            </span>
                            <button
                                disabled={pagination.page >= pagination.totalPages}
                                onClick={() => fetchDebitur({ page: pagination.page + 1 })}
                                className={`px-3 py-1 rounded border border-gray-200 dark:border-[#444564] 
                  text-sm ${pagination.page >= pagination.totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'}`}
                            >
                                Next →
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
