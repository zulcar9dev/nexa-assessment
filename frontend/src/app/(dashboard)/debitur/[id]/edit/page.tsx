"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";

// This page will reuse the form components from prapurna/purna
// For now, showing a placeholder that will be replaced with actual form

export default function EditDebiturPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link
                        href={`/debitur/${id}`}
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#323249] transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-[#00665e] dark:text-[#80cbc4]">
                            Edit Data Debitur
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            ID: {id}
                        </p>
                    </div>
                </div>
            </div>

            {/* Placeholder Message */}
            <div className="card p-8 text-center">
                <div className="max-w-md mx-auto">
                    <div className="w-16 h-16 bg-[#e0f2f1] dark:bg-[#00665e]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Save className="w-8 h-8 text-[#00665e] dark:text-[#80cbc4]" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
                        Form Edit Debitur
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">
                        Form ini akan memuat data debitur yang sudah ada dan memungkinkan Anda untuk mengubahnya.
                        Form yang sama dengan form input baru akan digunakan.
                    </p>
                    <div className="flex justify-center gap-3">
                        <Link
                            href={`/debitur/${id}`}
                            className="px-6 py-2.5 border-2 border-gray-300 dark:border-[#444564] 
                text-gray-600 dark:text-gray-400 rounded-lg font-medium
                hover:bg-gray-50 dark:hover:bg-[#323249] transition-all duration-200"
                        >
                            Kembali
                        </Link>
                        <button
                            className="px-6 py-2.5 bg-[#00665e] hover:bg-[#004d47] text-white 
                rounded-lg font-medium transition-all duration-200
                flex items-center gap-2"
                        >
                            <Save className="w-4 h-4" />
                            Simpan Perubahan
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
