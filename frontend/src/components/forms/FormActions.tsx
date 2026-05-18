"use client";

import Link from "next/link";
import { Eye, Save } from "lucide-react";

interface FormActionsProps {
    onPreview?: () => void;
    onSave?: () => void;
    onCancel?: () => void;
    isSubmitting?: boolean;
    cancelHref?: string;
}

export default function FormActions({
    onPreview,
    onSave,
    onCancel,
    isSubmitting = false,
    cancelHref = "/",
}: FormActionsProps) {
    return (
        <footer className="fixed bottom-0 left-0 right-0 bg-white dark:bg-[#1a2c2a] border-t border-[#cdeae7] p-4 px-6 md:px-10 z-30">
            <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="text-sm text-[#45a199] hidden sm:flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">info</span>
                    Pastikan semua data sudah sesuai dengan dokumen fisik.
                </div>

                <div className="flex w-full sm:w-auto gap-3">
                    {cancelHref ? (
                        <Link
                            href={cancelHref}
                            className="flex-1 sm:flex-none px-6 py-2.5 border border-[#cdeae7] text-[#0c1d1b] dark:text-white font-bold rounded-lg hover:bg-[#f5f8f8] dark:hover:bg-white/10 transition-colors text-center"
                        >
                            Batal
                        </Link>
                    ) : (
                        <button
                            type="button"
                            onClick={onCancel}
                            className="flex-1 sm:flex-none px-6 py-2.5 border border-[#cdeae7] text-[#0c1d1b] dark:text-white font-bold rounded-lg hover:bg-[#f5f8f8] dark:hover:bg-white/10 transition-colors"
                        >
                            Batal
                        </button>
                    )}

                    <button
                        type="button"
                        onClick={onPreview}
                        className="flex-1 sm:flex-none px-6 py-2.5 border border-[#00665e] text-[#00665e] font-bold rounded-lg hover:bg-[#00665e]/5 transition-colors flex items-center justify-center gap-2"
                    >
                        <Eye className="w-4 h-4" />
                        Preview
                    </button>

                    <button
                        type="button"
                        onClick={onSave}
                        disabled={isSubmitting}
                        className="flex-1 sm:flex-none px-8 py-2.5 bg-[#00665e] text-white font-bold rounded-lg hover:bg-[#004d47] shadow-lg shadow-[#00665e]/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        <Save className="w-4 h-4" />
                        Simpan
                    </button>
                </div>
            </div>
        </footer>
    );
}
