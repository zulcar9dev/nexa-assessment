"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Download, Edit, Calendar, User, Building, CreditCard, Loader2, AlertCircle } from "lucide-react";
import { useDebitur } from "@/hooks/use-debitur";
import type { Debitur } from "@/types/debitur";

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

    const formatRupiah = (value: string | number | undefined) => {
        if (!value) return "0";
        const num = typeof value === "string" ? parseInt(value.replace(/[^0-9]/g, ""), 10) : value;
        return num.toLocaleString("id-ID");
    };

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
    const data = debitur.dataLengkap || {};

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
                            {debitur.namaPemohon}
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
              bg-[#00665e] hover:bg-[#004d47] text-white
              rounded-lg font-medium transition-all duration-200"
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
                            {debitur.segmentasi}
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

                {/* Pekerjaan */}
                <div className="card">
                    <div className="p-4 border-b border-gray-200 dark:border-[#444564]">
                        <h3 className="card-title font-semibold flex items-center gap-2">
                            <Building className="w-5 h-5" />
                            Data Pekerjaan / Pensiun
                        </h3>
                    </div>
                    <div className="p-4 space-y-3">
                        <div className="flex justify-between">
                            <span className="text-gray-500 dark:text-gray-400">Instansi</span>
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
                        <div className="flex justify-between">
                            <span className="text-gray-500 dark:text-gray-400">NIP / NOPEN</span>
                            <span className="text-gray-800 dark:text-gray-200">
                                {data.nip || data.nopen || "-"}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500 dark:text-gray-400">Tgl Pensiun TMT</span>
                            <span className="text-gray-800 dark:text-gray-200">
                                {formatDate(data.tgl_pensiun_tmt || data.tgl_pensiun_pemohon)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Penghasilan */}
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
                        {/* Prapurna - Gaji */}
                        {(data.gaji_bulan_1_jumlah || data.gaji_bulan_2_jumlah || data.gaji_bulan_3_jumlah) && (
                            <>
                                <div className="flex justify-between">
                                    <span className="text-gray-500 dark:text-gray-400">Gaji Bulan 1</span>
                                    <span className="text-gray-800 dark:text-gray-200">
                                        Rp {formatRupiah(data.gaji_bulan_1_jumlah)}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500 dark:text-gray-400">Gaji Bulan 2</span>
                                    <span className="text-gray-800 dark:text-gray-200">
                                        Rp {formatRupiah(data.gaji_bulan_2_jumlah)}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500 dark:text-gray-400">Gaji Bulan 3</span>
                                    <span className="text-gray-800 dark:text-gray-200">
                                        Rp {formatRupiah(data.gaji_bulan_3_jumlah)}
                                    </span>
                                </div>
                            </>
                        )}
                        {/* Purna - Pensiun */}
                        {(data.pensiun_bulan_1_jumlah || data.pensiun_bulan_2_jumlah || data.pensiun_bulan_jumlah) && (
                            <>
                                <div className="flex justify-between">
                                    <span className="text-gray-500 dark:text-gray-400">Pensiun Bulan 1</span>
                                    <span className="text-gray-800 dark:text-gray-200">
                                        Rp {formatRupiah(data.pensiun_bulan_1_jumlah)}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500 dark:text-gray-400">Pensiun Bulan 2</span>
                                    <span className="text-gray-800 dark:text-gray-200">
                                        Rp {formatRupiah(data.pensiun_bulan_2_jumlah)}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500 dark:text-gray-400">Pensiun Bulan 3</span>
                                    <span className="text-gray-800 dark:text-gray-200">
                                        Rp {formatRupiah(data.pensiun_bulan_3_jumlah || data.pensiun_bulan_jumlah)}
                                    </span>
                                </div>
                            </>
                        )}
                        {/* Estimasi Hak Pensiun (Prapurna) */}
                        {data.estimasi_hak_pensiun && (
                            <div className="flex justify-between pt-2 border-t border-gray-100 dark:border-gray-800">
                                <span className="text-gray-500 dark:text-gray-400 font-medium">Estimasi Hak Pensiun</span>
                                <span className="font-bold text-[#00665e] dark:text-[#80cbc4]">
                                    Rp {formatRupiah(data.estimasi_hak_pensiun)}
                                </span>
                            </div>
                        )}
                        {/* Rata-rata Pensiun (Purna) */}
                        {data.pensiun_bulan_jumlah && (
                            <div className="flex justify-between pt-2 border-t border-gray-100 dark:border-gray-800">
                                <span className="text-gray-500 dark:text-gray-400 font-medium">Rata-rata Pensiun</span>
                                <span className="font-bold text-[#00665e] dark:text-[#80cbc4]">
                                    Rp {formatRupiah(data.pensiun_bulan_jumlah)}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* SLIK - Side by side with Penghasilan */}
                <div className="card">
                    <div className="p-4 border-b border-gray-200 dark:border-[#444564]">
                        <h3 className="card-title font-semibold">Data SLIK</h3>
                    </div>
                    <div className="p-4">
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
                                        {data.slik_facilities.map((facility: { nama_bank?: string; plafon_maks?: string; outstanding?: string; angsuran?: string; kolektibilitas?: string }, idx: number) => (
                                            <tr key={idx} className="border-b border-gray-100 dark:border-gray-800">
                                                <td className="py-2 px-1 font-medium text-xs">{facility.nama_bank || "-"}</td>
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

                {/* Kredit */}
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
                </div>
            </div>
        </div>
    );
}
