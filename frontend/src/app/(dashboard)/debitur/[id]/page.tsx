"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft, Download, Edit, Calendar, User, Building, CreditCard } from "lucide-react";

// Mock data - replace with actual API call
const mockDebitur = {
    id: "1",
    namaPemohon: "Ahmad Sudirman",
    noKtp: "7501234567890001",
    kategori: "prapurna_reguler",
    jenisPengajuan: "baru",
    segmentasi: "taspen",
    createdAt: "2024-12-26",
    dataLengkap: {
        nama_pemohon: "Ahmad Sudirman",
        no_ktp_pemohon: "7501234567890001",
        tgl_lahir_pemohon: "1965-05-15",
        jenis_kelamin: "laki-laki",
        alamat_ktp: "Jl. Sudirman No. 123, Gorontalo",
        no_telepon: "081234567890",
        status_perkawinan: "menikah",
        segmentasi: "taspen",
        jenis_pengajuan: "baru",
        instansi: "Pemerintah Kota Gorontalo",
        golongan: "IV/a",
        estimasi_hak_pensiun: "8500000",
        usulan_plafon_kredit: "150000000",
        usulan_jangka_waktu_bulan: "120",
        usulan_bunga_persen: "6.5",
    },
};

export default function DebiturDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);

    // In real app, fetch data based on id
    const debitur = mockDebitur;

    const formatRupiah = (value: string) => {
        const number = parseInt(value, 10);
        return number.toLocaleString("id-ID");
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
        });
    };

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
                            ID: {id}
                        </p>
                    </div>
                </div>

                <div className="flex gap-2">
                    <button
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
                            Rp {formatRupiah(debitur.dataLengkap.usulan_plafon_kredit)}
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
                                {debitur.dataLengkap.nama_pemohon}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500 dark:text-gray-400">NIK</span>
                            <span className="font-mono text-gray-800 dark:text-gray-200">
                                {debitur.dataLengkap.no_ktp_pemohon}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500 dark:text-gray-400">Tanggal Lahir</span>
                            <span className="text-gray-800 dark:text-gray-200">
                                {formatDate(debitur.dataLengkap.tgl_lahir_pemohon)}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500 dark:text-gray-400">Jenis Kelamin</span>
                            <span className="text-gray-800 dark:text-gray-200 capitalize">
                                {debitur.dataLengkap.jenis_kelamin}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500 dark:text-gray-400">Status</span>
                            <span className="text-gray-800 dark:text-gray-200 capitalize">
                                {debitur.dataLengkap.status_perkawinan}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500 dark:text-gray-400">No. Telepon</span>
                            <span className="text-gray-800 dark:text-gray-200">
                                {debitur.dataLengkap.no_telepon}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Pekerjaan */}
                <div className="card">
                    <div className="p-4 border-b border-gray-200 dark:border-[#444564]">
                        <h3 className="card-title font-semibold flex items-center gap-2">
                            <Building className="w-5 h-5" />
                            Data Pekerjaan
                        </h3>
                    </div>
                    <div className="p-4 space-y-3">
                        <div className="flex justify-between">
                            <span className="text-gray-500 dark:text-gray-400">Instansi</span>
                            <span className="font-medium text-gray-800 dark:text-gray-200">
                                {debitur.dataLengkap.instansi}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500 dark:text-gray-400">Golongan</span>
                            <span className="text-gray-800 dark:text-gray-200">
                                {debitur.dataLengkap.golongan}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500 dark:text-gray-400">Estimasi Pensiun</span>
                            <span className="text-gray-800 dark:text-gray-200">
                                Rp {formatRupiah(debitur.dataLengkap.estimasi_hak_pensiun)}
                            </span>
                        </div>
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
                    <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Plafon Kredit</p>
                            <p className="text-xl font-bold text-[#00665e] dark:text-[#80cbc4]">
                                Rp {formatRupiah(debitur.dataLengkap.usulan_plafon_kredit)}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Jangka Waktu</p>
                            <p className="text-xl font-bold text-gray-800 dark:text-gray-200">
                                {debitur.dataLengkap.usulan_jangka_waktu_bulan} Bulan
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Suku Bunga</p>
                            <p className="text-xl font-bold text-gray-800 dark:text-gray-200">
                                {debitur.dataLengkap.usulan_bunga_persen}% p.a.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
