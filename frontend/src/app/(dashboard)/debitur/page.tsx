"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Plus, Download, Edit, Trash2, RefreshCw } from "lucide-react";

// Mock data for demonstration
const mockDebiturData = [
    {
        id: "1",
        tanggal: "2024-12-26",
        namaPemohon: "Ahmad Sudirman",
        segmentasi: "taspen",
        jenisPengajuan: "baru",
        noKtp: "7501234567890001",
        kategori: "prapurna_reguler",
    },
    {
        id: "2",
        tanggal: "2024-12-25",
        namaPemohon: "Budi Raharjo",
        segmentasi: "asabri",
        jenisPengajuan: "top_up",
        noKtp: "7501234567890002",
        kategori: "purna_reguler",
    },
    {
        id: "3",
        tanggal: "2024-12-24",
        namaPemohon: "Citra Dewi",
        segmentasi: "taspen",
        jenisPengajuan: "takeover",
        noKtp: "7501234567890003",
        kategori: "prapurna_reguler",
    },
];

const kategoriLabels: Record<string, string> = {
    prapurna_reguler: "BNI Fleksi Pensiun Prapurna",
    prapurna_takeover: "BNI Fleksi Pensiun Prapurna Take Over",
    purna_reguler: "BNI Fleksi Pensiun Purna",
    purna_takeover: "BNI Fleksi Pensiun Purna Take Over",
};

const jenisBadgeColors: Record<string, string> = {
    baru: "badge-primary",
    top_up: "badge-warning",
    top_up_sisa_gaji: "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300",
    takeover: "badge-danger",
};

const jenisLabels: Record<string, string> = {
    baru: "Baru",
    top_up: "Top Up",
    top_up_sisa_gaji: "Top Up Sisa Gaji",
    takeover: "Take Over",
};

export default function RiwayatDebiturPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [jenisFilter, setJenisFilter] = useState("");
    const [segmenFilter, setSegmenFilter] = useState("");

    // Filter data
    const filteredData = mockDebiturData.filter((item) => {
        const matchSearch =
            !searchQuery ||
            item.namaPemohon.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.noKtp.includes(searchQuery);
        const matchJenis = !jenisFilter || item.jenisPengajuan === jenisFilter;
        const matchSegmen = !segmenFilter || item.segmentasi === segmenFilter;
        return matchSearch && matchJenis && matchSegmen;
    });

    const resetFilters = () => {
        setSearchQuery("");
        setJenisFilter("");
        setSegmenFilter("");
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
                    <Link
                        href="/"
                        className="inline-flex items-center justify-center gap-2 px-4 py-2
              bg-[#00665e] hover:bg-[#004d47] text-white
              rounded-lg font-medium text-sm
              transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                        <Plus className="w-4 h-4" />
                        Input Baru
                    </Link>
                </div>

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
                                className="w-full pl-10 pr-4 py-2.5 
                  bg-white dark:bg-[#323249] 
                  border border-gray-200 dark:border-[#444564]
                  rounded-lg text-sm
                  focus:outline-none focus:ring-2 focus:ring-[#00665e]/20 focus:border-[#00665e]
                  transition-all duration-200"
                            />
                        </div>

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
                            <option value="baru">Baru</option>
                            <option value="top_up">Top Up</option>
                            <option value="top_up_sisa_gaji">Top Up Sisa Gaji</option>
                            <option value="takeover">Take Over</option>
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
                            <option value="taspen">TASPEN (PNS)</option>
                            <option value="asabri">ASABRI (TNI/POLRI)</option>
                        </select>

                        {/* Buttons */}
                        <div className="flex gap-2">
                            <button
                                className="flex-1 px-4 py-2.5 
                  bg-[#00665e] hover:bg-[#004d47] text-white
                  rounded-lg text-sm font-medium
                  transition-all duration-200"
                            >
                                Filter
                            </button>
                            {(searchQuery || jenisFilter || segmenFilter) && (
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
                                <th className="table-header px-4 py-3 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredData.length > 0 ? (
                                filteredData.map((item) => (
                                    <tr
                                        key={item.id}
                                        className="border-b border-gray-100 dark:border-[#444564] hover:bg-gray-50 dark:hover:bg-[#323249] transition-colors"
                                    >
                                        <td className="px-4 py-3 text-sm">{formatDate(item.tanggal)}</td>
                                        <td className="px-4 py-3">
                                            <span className="font-semibold text-gray-800 dark:text-gray-200">
                                                {item.namaPemohon}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span
                                                className={`badge ${item.segmentasi === "asabri"
                                                        ? "badge-success"
                                                        : "badge-info"
                                                    }`}
                                            >
                                                {item.segmentasi.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`badge ${jenisBadgeColors[item.jenisPengajuan]}`}>
                                                {jenisLabels[item.jenisPengajuan]}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm font-mono text-gray-600 dark:text-gray-400">
                                            {item.noKtp}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                                {kategoriLabels[item.kategori]}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-end gap-2">
                                                {/* Download */}
                                                <button
                                                    className="p-2 rounded-lg
                            border border-green-500 text-green-500
                            hover:bg-green-500 hover:text-white
                            transition-all duration-200"
                                                    title="Download Docx"
                                                >
                                                    <Download className="w-4 h-4" />
                                                </button>
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
                                                <button
                                                    className="p-2 rounded-lg
                            border border-red-500 text-red-500
                            hover:bg-red-500 hover:text-white
                            transition-all duration-200"
                                                    title="Hapus"
                                                    onClick={() => {
                                                        if (confirm("Hapus data ini?")) {
                                                            // Handle delete
                                                        }
                                                    }}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
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
                {filteredData.length > 0 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-[#444564]">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Menampilkan {filteredData.length} data
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                disabled
                                className="px-3 py-1 rounded border border-gray-200 dark:border-[#444564] 
                  text-sm text-gray-400 cursor-not-allowed"
                            >
                                ← Prev
                            </button>
                            <span className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400">
                                Page 1 of 1
                            </span>
                            <button
                                disabled
                                className="px-3 py-1 rounded border border-gray-200 dark:border-[#444564] 
                  text-sm text-gray-400 cursor-not-allowed"
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
