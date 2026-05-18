"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Download, Edit, Calendar, User, Building, CreditCard, Loader2, AlertCircle, Briefcase, FileText } from "lucide-react";
import { useDebitur } from "@/hooks/use-debitur";
import type { Debitur } from "@/types/debitur";
import { formatRupiah } from "@/lib/utils";

// Labels for display
const kategoriLabels: Record<string, string> = {
    PRAPURNA: "BNI Fleksi Pensiun Prapurna",
    PURNA: "BNI Fleksi Pensiun Purna",
    AKTIF: "BNI Fleksi Aktif",
    prapurna: "BNI Fleksi Pensiun Prapurna",
    purna: "BNI Fleksi Pensiun Purna",
    aktif: "BNI Fleksi Aktif",
};

// Helper to normalize kategori
const getKategori = (debitur: Debitur): string => {
    const kategori = String(debitur.kategori || "").toUpperCase();
    if (kategori.includes("PRAPURNA")) return "PRAPURNA";
    if (kategori.includes("PURNA")) return "PURNA";
    if (kategori.includes("AKTIF")) return "AKTIF";
    return kategori;
};

export default function DebiturDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    const { getDebitur, downloadDocx, isLoading, error } = useDebitur();
    const [debitur, setDebitur] = useState<Debitur | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            const data = await getDebitur(id);
            if (data) {
                setDebitur(data);
            }
        };
        fetchData();
    }, [id, getDebitur]);

    const formatDate = (dateStr: string | undefined) => {
        if (!dateStr) return "-";
        return new Date(dateStr).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
        });
    };

    const handleDownload = async () => {
        if (debitur) {
            await downloadDocx(id, debitur.namaPemohon);
        }
    };

    // Loading state
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="flex items-center gap-3 text-gray-500">
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span>Memuat data...</span>
                </div>
            </div>
        );
    }

    // Error state
    if (error || !debitur) {
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Link
                        href="/debitur"
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#323249] transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </Link>
                    <h1 className="text-2xl font-bold text-[#00665e] dark:text-[#80cbc4]">
                        Detail Debitur
                    </h1>
                </div>
                <div className="card p-8 text-center">
                    <div className="flex flex-col items-center gap-4">
                        <AlertCircle className="w-12 h-12 text-red-500" />
                        <p className="text-lg font-medium text-gray-800 dark:text-gray-200">
                            {error || "Data tidak ditemukan"}
                        </p>
                        <Link
                            href="/debitur"
                            className="px-4 py-2 bg-[#00665e] text-white rounded-lg hover:bg-[#004d47]"
                        >
                            Kembali ke Riwayat
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // Get dataLengkap (the full form data stored as JSON)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Display-only page rendering 50+ dynamic JSON fields
    const data = (debitur.dataLengkap || {}) as Record<string, any>;
    const kategori = getKategori(debitur);
    const segmentasi = String(debitur.segmentasi || data.segmentasi || "").toUpperCase();

    // Determine if pensiun (PRAPURNA/PURNA use TASPEN/ASABRI)
    const _isPensiun = kategori === "PRAPURNA" || kategori === "PURNA";
    const isAktif = kategori === "AKTIF";

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link
                        href="/debitur"
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#323249] transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-[#00665e] dark:text-[#80cbc4]">
                            Detail Debitur
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {debitur.namaPemohon} - {kategoriLabels[kategori] || kategori}
                        </p>
                    </div>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={handleDownload}
                        className="flex items-center gap-2 px-4 py-2
              border border-green-500 text-green-500 
              hover:bg-green-500 hover:text-white
              rounded-lg font-medium transition-all duration-200"
                    >
                        <Download className="w-4 h-4" />
                        Download DOCX
                    </button>
                    <Link
                        href={`/debitur/${id}/edit`}
                        className="flex items-center gap-2 px-4 py-2
              bg-[#00665e] hover:bg-[#004d47] !text-white
              rounded-lg font-semibold transition-all duration-200"
                    >
                        <Edit className="w-4 h-4" />
                        Edit
                    </Link>
                </div>
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="card p-4 flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#e0f2f1] dark:bg-[#00665e]/20 rounded-lg flex items-center justify-center">
                        <Calendar className="w-6 h-6 text-[#00665e] dark:text-[#80cbc4]" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Tanggal Input</p>
                        <p className="font-semibold text-gray-800 dark:text-gray-200">
                            {formatDate(debitur.createdAt)}
                        </p>
                    </div>
                </div>

                <div className="card p-4 flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#fff3e0] dark:bg-[#f15a23]/20 rounded-lg flex items-center justify-center">
                        <Building className="w-6 h-6 text-[#f59e0b]" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Segmentasi</p>
                        <p className="font-semibold text-gray-800 dark:text-gray-200 uppercase">
                            {segmentasi || "-"}
                        </p>
                    </div>
                </div>

                <div className="card p-4 flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#e8f5e9] dark:bg-[#22c55e]/20 rounded-lg flex items-center justify-center">
                        <CreditCard className="w-6 h-6 text-[#22c55e]" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Plafon</p>
                        <p className="font-semibold text-gray-800 dark:text-gray-200">
                            Rp {formatRupiah(data.usulan_plafon_kredit)}
                        </p>
                    </div>
                </div>
            </div>

            {/* Detail Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Identitas */}
                <div className="card">
                    <div className="p-4 border-b border-gray-200 dark:border-[#444564]">
                        <h3 className="card-title font-semibold flex items-center gap-2">
                            <User className="w-5 h-5" />
                            Data Identitas
                        </h3>
                    </div>
                    <div className="p-4 space-y-3">
                        <div className="flex justify-between">
                            <span className="text-gray-500 dark:text-gray-400">Nama Lengkap</span>
                            <span className="font-medium text-gray-800 dark:text-gray-200">
                                {data.nama_pemohon || debitur.namaPemohon || "-"}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500 dark:text-gray-400">NIK</span>
                            <span className="font-mono text-gray-800 dark:text-gray-200">
                                {data.no_ktp_pemohon || debitur.noKtp || "-"}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500 dark:text-gray-400">Tanggal Lahir</span>
                            <span className="text-gray-800 dark:text-gray-200">
                                {formatDate(data.tgl_lahir_pemohon)}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500 dark:text-gray-400">Status</span>
                            <span className="text-gray-800 dark:text-gray-200 capitalize">
                                {data.status_perkawinan || "-"}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500 dark:text-gray-400">No. Telepon</span>
                            <span className="text-gray-800 dark:text-gray-200">
                                {data.no_telepon || "-"}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500 dark:text-gray-400">Alamat</span>
                            <span className="text-gray-800 dark:text-gray-200 text-right max-w-[200px]">
                                {data.alamat_ktp || data.alamat_tempat_tinggal || "-"}
                            </span>
                        </div>
                    </div>
                </div>

                {/* PRAPURNA & AKTIF: Data Pekerjaan */}
                {(kategori === "PRAPURNA" || kategori === "AKTIF") && (
                    <div className="card">
                        <div className="p-4 border-b border-gray-200 dark:border-[#444564]">
                            <h3 className="card-title font-semibold flex items-center gap-2">
                                <Briefcase className="w-5 h-5" />
                                Data Pekerjaan
                            </h3>
                        </div>
                        <div className="p-4 space-y-3">
                            <div className="flex justify-between">
                                <span className="text-gray-500 dark:text-gray-400">Segmentasi</span>
                                <span className="font-medium text-gray-800 dark:text-gray-200 uppercase">
                                    {segmentasi || "-"}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500 dark:text-gray-400">Instansi</span>
                                <span className="font-medium text-gray-800 dark:text-gray-200">
                                    {data.instansi || "-"}
                                </span>
                            </div>
                            {isAktif && data.status_kepegawaian_manual && (
                                <div className="flex justify-between">
                                    <span className="text-gray-500 dark:text-gray-400">Status Kepegawaian</span>
                                    <span className="text-gray-800 dark:text-gray-200">
                                        {data.status_kepegawaian_manual}
                                    </span>
                                </div>
                            )}
                            <div className="flex justify-between">
                                <span className="text-gray-500 dark:text-gray-400">Golongan</span>
                                <span className="text-gray-800 dark:text-gray-200">
                                    {data.golongan || "-"}
                                </span>
                            </div>
                            {data.jabatan && (
                                <div className="flex justify-between">
                                    <span className="text-gray-500 dark:text-gray-400">Jabatan</span>
                                    <span className="text-gray-800 dark:text-gray-200">
                                        {data.jabatan}
                                    </span>
                                </div>
                            )}
                            <div className="flex justify-between">
                                <span className="text-gray-500 dark:text-gray-400">NIP</span>
                                <span className="text-gray-800 dark:text-gray-200">
                                    {data.nip || "-"}
                                </span>
                            </div>
                            {data.tgl_mulai_kerja && (
                                <div className="flex justify-between">
                                    <span className="text-gray-500 dark:text-gray-400">Tgl Mulai Kerja</span>
                                    <span className="text-gray-800 dark:text-gray-200">
                                        {formatDate(data.tgl_mulai_kerja)}
                                    </span>
                                </div>
                            )}
                            {data.masa_kerja && (
                                <div className="flex justify-between">
                                    <span className="text-gray-500 dark:text-gray-400">Masa Kerja</span>
                                    <span className="text-gray-800 dark:text-gray-200">
                                        {data.masa_kerja}
                                    </span>
                                </div>
                            )}
                            {(data.tgl_pensiun_tmt || data.tgl_pensiun_pemohon) && (
                                <div className="flex justify-between">
                                    <span className="text-gray-500 dark:text-gray-400">Tgl Pensiun</span>
                                    <span className="text-gray-800 dark:text-gray-200">
                                        {formatDate(data.tgl_pensiun_tmt || data.tgl_pensiun_pemohon)}
                                    </span>
                                </div>
                            )}
                            {data.sisa_masa_kerja && (
                                <div className="flex justify-between">
                                    <span className="text-gray-500 dark:text-gray-400">Sisa Masa Kerja</span>
                                    <span className="text-gray-800 dark:text-gray-200">
                                        {data.sisa_masa_kerja}
                                    </span>
                                </div>
                            )}
                            {isAktif && data.penempatan_unit && (
                                <div className="flex justify-between">
                                    <span className="text-gray-500 dark:text-gray-400">Penempatan Unit</span>
                                    <span className="text-gray-800 dark:text-gray-200">
                                        {data.penempatan_unit}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* PURNA: Data Pensiun */}
                {kategori === "PURNA" && (
                    <div className="card">
                        <div className="p-4 border-b border-gray-200 dark:border-[#444564]">
                            <h3 className="card-title font-semibold flex items-center gap-2">
                                <Building className="w-5 h-5" />
                                Data Pensiun
                            </h3>
                        </div>
                        <div className="p-4 space-y-3">
                            <div className="flex justify-between">
                                <span className="text-gray-500 dark:text-gray-400">Segmentasi</span>
                                <span className="font-medium text-gray-800 dark:text-gray-200 uppercase">
                                    {segmentasi || "-"}
                                </span>
                            </div>
                            {data.pensiunan && (
                                <div className="flex justify-between">
                                    <span className="text-gray-500 dark:text-gray-400">Pensiunan</span>
                                    <span className="font-medium text-gray-800 dark:text-gray-200">
                                        {data.pensiunan}
                                    </span>
                                </div>
                            )}
                            <div className="flex justify-between">
                                <span className="text-gray-500 dark:text-gray-400">NOPEN</span>
                                <span className="text-gray-800 dark:text-gray-200">
                                    {data.nopen || "-"}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500 dark:text-gray-400">No. SK Pensiun</span>
                                <span className="text-gray-800 dark:text-gray-200">
                                    {data.no_sk_pensiun || "-"}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500 dark:text-gray-400">Tgl SK Pensiun</span>
                                <span className="text-gray-800 dark:text-gray-200">
                                    {formatDate(data.tgl_sk_pensiun)}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500 dark:text-gray-400">TMT Pensiun</span>
                                <span className="text-gray-800 dark:text-gray-200">
                                    {formatDate(data.tgl_pensiun_tmt)}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500 dark:text-gray-400">Instansi Terakhir</span>
                                <span className="font-medium text-gray-800 dark:text-gray-200">
                                    {data.instansi || "-"}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500 dark:text-gray-400">Golongan</span>
                                <span className="text-gray-800 dark:text-gray-200">
                                    {data.golongan || "-"}
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Penghasilan - Different per kategori */}
                <div className="card">
                    <div className="p-4 border-b border-gray-200 dark:border-[#444564]">
                        <h3 className="card-title font-semibold flex items-center gap-2">
                            <CreditCard className="w-5 h-5" />
                            Data Penghasilan
                        </h3>
                    </div>
                    <div className="p-4 space-y-3">
                        <div className="flex justify-between">
                            <span className="text-gray-500 dark:text-gray-400">Bank Pembayaran</span>
                            <span className="font-medium text-gray-800 dark:text-gray-200">
                                {data.nama_bank_pembayaran || "-"}
                            </span>
                        </div>
                        {data.payroll_no_rek && (
                            <div className="flex justify-between">
                                <span className="text-gray-500 dark:text-gray-400">No. Rekening</span>
                                <span className="font-mono text-gray-800 dark:text-gray-200">
                                    {data.payroll_no_rek}
                                </span>
                            </div>
                        )}

                        {/* PRAPURNA & AKTIF: Gaji 3 Bulan */}
                        {(kategori === "PRAPURNA" || kategori === "AKTIF") && (
                            <>
                                {(data.gaji_bulan_1_jumlah || data.gaji_bulan_2_jumlah || data.gaji_bulan_3_jumlah) && (
                                    <>
                                        <div className="border-t border-gray-100 dark:border-gray-800 pt-3 mt-3">
                                            <p className="text-xs font-medium text-gray-400 uppercase mb-2">Gaji 3 Bulan</p>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500 dark:text-gray-400">
                                                {data.gaji_bulan_1_nama || "Bulan 1"}
                                            </span>
                                            <span className="text-gray-800 dark:text-gray-200">
                                                Rp {formatRupiah(data.gaji_bulan_1_jumlah)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500 dark:text-gray-400">
                                                {data.gaji_bulan_2_nama || "Bulan 2"}
                                            </span>
                                            <span className="text-gray-800 dark:text-gray-200">
                                                Rp {formatRupiah(data.gaji_bulan_2_jumlah)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500 dark:text-gray-400">
                                                {data.gaji_bulan_3_nama || "Bulan 3"}
                                            </span>
                                            <span className="text-gray-800 dark:text-gray-200">
                                                Rp {formatRupiah(data.gaji_bulan_3_jumlah)}
                                            </span>
                                        </div>
                                    </>
                                )}

                                {/* PRAPURNA: Estimasi Hak Pensiun & THT */}
                                {kategori === "PRAPURNA" && (
                                    <>
                                        {data.estimasi_hak_pensiun && (
                                            <div className="flex justify-between pt-2 border-t border-gray-100 dark:border-gray-800">
                                                <span className="text-gray-500 dark:text-gray-400 font-medium">Estimasi Hak Pensiun</span>
                                                <span className="font-bold text-[#00665e] dark:text-[#80cbc4]">
                                                    Rp {formatRupiah(data.estimasi_hak_pensiun)}
                                                </span>
                                            </div>
                                        )}
                                        {data.estimasi_tht && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-500 dark:text-gray-400 font-medium">Estimasi THT</span>
                                                <span className="font-bold text-[#00665e] dark:text-[#80cbc4]">
                                                    Rp {formatRupiah(data.estimasi_tht)}
                                                </span>
                                            </div>
                                        )}
                                    </>
                                )}

                                {/* AKTIF: Additional Incomes (Tukin, Uang Makan, etc) */}
                                {kategori === "AKTIF" && data.additional_incomes && data.additional_incomes.length > 0 && (
                                    <div className="border-t border-gray-100 dark:border-gray-800 pt-3 mt-3">
                                        <p className="text-xs font-medium text-gray-400 uppercase mb-2">Penghasilan Tambahan</p>
                                        {data.additional_incomes.map((income: { label: string; bulan_1?: string; bulan_2?: string; bulan_3?: string }, idx: number) => (
                                            <div key={idx} className="mb-2">
                                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{income.label}</p>
                                                <div className="grid grid-cols-3 gap-2 text-xs text-gray-500 dark:text-gray-400">
                                                    <span>Rp {formatRupiah(income.bulan_1)}</span>
                                                    <span>Rp {formatRupiah(income.bulan_2)}</span>
                                                    <span>Rp {formatRupiah(income.bulan_3)}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}

                        {/* PURNA: Pensiun 3 Bulan */}
                        {kategori === "PURNA" && (
                            <>
                                {(data.pensiun_bulan_1_jumlah || data.pensiun_bulan_2_jumlah || data.pensiun_bulan_3_jumlah) && (
                                    <>
                                        <div className="border-t border-gray-100 dark:border-gray-800 pt-3 mt-3">
                                            <p className="text-xs font-medium text-gray-400 uppercase mb-2">Pensiun 3 Bulan</p>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500 dark:text-gray-400">
                                                {data.pensiun_bulan_1_nama || "Bulan 1"}
                                            </span>
                                            <span className="text-gray-800 dark:text-gray-200">
                                                Rp {formatRupiah(data.pensiun_bulan_1_jumlah)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500 dark:text-gray-400">
                                                {data.pensiun_bulan_2_nama || "Bulan 2"}
                                            </span>
                                            <span className="text-gray-800 dark:text-gray-200">
                                                Rp {formatRupiah(data.pensiun_bulan_2_jumlah)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500 dark:text-gray-400">
                                                {data.pensiun_bulan_3_nama || "Bulan 3"}
                                            </span>
                                            <span className="text-gray-800 dark:text-gray-200">
                                                Rp {formatRupiah(data.pensiun_bulan_3_jumlah)}
                                            </span>
                                        </div>
                                    </>
                                )}
                                {data.pensiun_bulan_jumlah && (
                                    <div className="flex justify-between pt-2 border-t border-gray-100 dark:border-gray-800">
                                        <span className="text-gray-500 dark:text-gray-400 font-medium">Rata-rata Pensiun</span>
                                        <span className="font-bold text-[#00665e] dark:text-[#80cbc4]">
                                            Rp {formatRupiah(data.pensiun_bulan_jumlah)}
                                        </span>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>

                {/* SLIK */}
                <div className="card">
                    <div className="p-4 border-b border-gray-200 dark:border-[#444564]">
                        <h3 className="card-title font-semibold flex items-center gap-2">
                            <FileText className="w-5 h-5" />
                            Data SLIK
                        </h3>
                    </div>
                    <div className="p-4">
                        {data.tgl_slik && (
                            <div className="flex justify-between mb-3">
                                <span className="text-gray-500 dark:text-gray-400">Tanggal SLIK</span>
                                <span className="text-gray-800 dark:text-gray-200">
                                    {formatDate(data.tgl_slik)}
                                </span>
                            </div>
                        )}
                        {data.fasilitas_nihil === "ya" ? (
                            <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                                <p className="font-medium text-green-600 dark:text-green-400">✓ Fasilitas Nihil</p>
                                <p className="text-sm mt-1">Tidak ada pinjaman eksisting</p>
                            </div>
                        ) : data.slik_facilities && data.slik_facilities.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-gray-200 dark:border-gray-700">
                                            <th className="text-left py-2 px-1 text-xs">Bank</th>
                                            <th className="text-right py-2 px-1 text-xs">Plafon</th>
                                            <th className="text-right py-2 px-1 text-xs">Outstanding</th>
                                            <th className="text-right py-2 px-1 text-xs">Angsuran</th>
                                            <th className="text-center py-2 px-1 text-xs">Kol</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.slik_facilities.map((facility: { nama_bank?: string; plafon_maks?: string; outstanding?: string; angsuran?: string; kolektibilitas?: string; is_takeover?: boolean; is_topup_lunas?: boolean }, idx: number) => (
                                            <tr key={idx} className="border-b border-gray-100 dark:border-gray-800">
                                                <td className="py-2 px-1 font-medium text-xs">
                                                    {facility.nama_bank || "-"}
                                                    {facility.is_takeover && <span className="ml-1 text-red-500">(TO)</span>}
                                                    {facility.is_topup_lunas && <span className="ml-1 text-blue-500">(L)</span>}
                                                </td>
                                                <td className="py-2 px-1 text-right text-xs">
                                                    Rp {formatRupiah(facility.plafon_maks)}
                                                </td>
                                                <td className="py-2 px-1 text-right text-xs">
                                                    Rp {formatRupiah(facility.outstanding)}
                                                </td>
                                                <td className="py-2 px-1 text-right text-xs font-semibold text-[#00665e]">
                                                    Rp {formatRupiah(facility.angsuran)}
                                                </td>
                                                <td className="py-2 px-1 text-center text-xs">{facility.kolektibilitas || "-"}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                                <p className="text-sm">Tidak ada data SLIK</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* AKTIF + PEMERINTAHAN: Data Verifikasi (Bendahara) */}
                {isAktif && segmentasi === "PEMERINTAHAN" && (data.nama_bendahara || data.nama_rekan_kerja) && (
                    <div className="card">
                        <div className="p-4 border-b border-gray-200 dark:border-[#444564]">
                            <h3 className="card-title font-semibold flex items-center gap-2">
                                <User className="w-5 h-5" />
                                Data Verifikasi
                            </h3>
                        </div>
                        <div className="p-4 space-y-3">
                            {data.nama_bendahara && (
                                <>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500 dark:text-gray-400">Nama Bendahara</span>
                                        <span className="font-medium text-gray-800 dark:text-gray-200">
                                            {data.nama_bendahara}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500 dark:text-gray-400">No. HP Bendahara</span>
                                        <span className="text-gray-800 dark:text-gray-200">
                                            {data.no_hp_bendahara || "-"}
                                        </span>
                                    </div>
                                </>
                            )}
                            {data.nama_rekan_kerja && (
                                <>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500 dark:text-gray-400">Nama Rekan Kerja</span>
                                        <span className="font-medium text-gray-800 dark:text-gray-200">
                                            {data.nama_rekan_kerja}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500 dark:text-gray-400">No. HP Rekan Kerja</span>
                                        <span className="text-gray-800 dark:text-gray-200">
                                            {data.no_hp_rekan_kerja || "-"}
                                        </span>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}

                {/* AKTIF + BUMN/BUMD: Data Verifikasi (SDM/Kepegawaian) */}
                {isAktif && (segmentasi === "BUMD_BUMN" || segmentasi.includes("BUMN") || segmentasi.includes("BUMD")) && (data.nama_sdm || data.nama_rekan_kerja) && (
                    <div className="card">
                        <div className="p-4 border-b border-gray-200 dark:border-[#444564]">
                            <h3 className="card-title font-semibold flex items-center gap-2">
                                <User className="w-5 h-5" />
                                Data Verifikasi
                            </h3>
                        </div>
                        <div className="p-4 space-y-3">
                            {data.nama_sdm && (
                                <>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500 dark:text-gray-400">Nama SDM/Kepegawaian</span>
                                        <span className="font-medium text-gray-800 dark:text-gray-200">
                                            {data.nama_sdm}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500 dark:text-gray-400">No. HP SDM/Kepegawaian</span>
                                        <span className="text-gray-800 dark:text-gray-200">
                                            {data.no_hp_sdm || "-"}
                                        </span>
                                    </div>
                                </>
                            )}
                            {data.nama_rekan_kerja && (
                                <>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500 dark:text-gray-400">Nama Rekan Kerja</span>
                                        <span className="font-medium text-gray-800 dark:text-gray-200">
                                            {data.nama_rekan_kerja}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500 dark:text-gray-400">No. HP Rekan Kerja</span>
                                        <span className="text-gray-800 dark:text-gray-200">
                                            {data.no_hp_rekan_kerja || "-"}
                                        </span>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}

                {/* Kredit - Full width */}
                <div className="card lg:col-span-2">
                    <div className="p-4 border-b border-gray-200 dark:border-[#444564]">
                        <h3 className="card-title font-semibold flex items-center gap-2">
                            <CreditCard className="w-5 h-5" />
                            Data Usulan Kredit
                        </h3>
                    </div>
                    <div className="p-4 grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Jenis Pengajuan</p>
                            <p className="text-lg font-bold text-gray-800 dark:text-gray-200 capitalize">
                                {String(debitur.jenisPengajuan || data.jenis_pengajuan || "-").replace(/_/g, " ")}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Plafon Kredit</p>
                            <p className="text-xl font-bold text-[#00665e] dark:text-[#80cbc4]">
                                Rp {formatRupiah(data.usulan_plafon_kredit)}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Jangka Waktu</p>
                            <p className="text-xl font-bold text-gray-800 dark:text-gray-200">
                                {data.usulan_jangka_waktu_bulan || 0} Bulan
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Suku Bunga</p>
                            <p className="text-xl font-bold text-gray-800 dark:text-gray-200">
                                {data.usulan_bunga_persen || 0}% p.a.
                            </p>
                        </div>
                    </div>
                    {data.tujuan_kredit && (
                        <div className="px-4 pb-4">
                            <p className="text-sm text-gray-500 dark:text-gray-400">Tujuan Kredit</p>
                            <p className="text-gray-800 dark:text-gray-200">{data.tujuan_kredit}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
