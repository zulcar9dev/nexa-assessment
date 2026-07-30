"use client";

import Link from "next/link";
import { Eye, Save, Info } from "lucide-react";

interface FormActionsProps {
    onPreview?: () => void;
    onSave?: () => void;
    onSaveDraft?: () => void;
    onCancel?: () => void;
    isSubmitting?: boolean;
    cancelHref?: string;
}

export default function FormActions({
    onPreview,
    onSave,
    onSaveDraft,
    onCancel,
    isSubmitting = false,
    cancelHref = "/",
}: FormActionsProps) {
    return (
        <footer className="fixed bottom-0 left-0 right-0 bg-surface-light dark:bg-surface-dark border-t border-outline-variant/20 p-4 px-6 md:px-10 z-30">
            <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="text-sm text-on-surface-variant hidden sm:flex items-center gap-1 font-body-base">
                    <Info className="w-4 h-4" />
                    Pastikan semua data sudah sesuai dengan dokumen fisik.
                </div>

                <div className="flex w-full sm:w-auto gap-3">
                    {cancelHref ? (
                        <Link
                            href={cancelHref}
                            className="flex-1 sm:flex-none px-6 py-2.5 border border-outline-variant/50 text-on-surface dark:text-white font-title-sm text-title-sm rounded-xl hover:bg-surface-container transition-colors text-center"
                        >
                            Batal
                        </Link>
                    ) : (
                        <button
                            type="button"
                            onClick={onCancel}
                            className="flex-1 sm:flex-none px-6 py-2.5 border border-outline-variant/50 text-on-surface dark:text-white font-title-sm text-title-sm rounded-xl hover:bg-surface-container transition-colors"
                        >
                            Batal
                        </button>
                    )}

                    <button
                        type="button"
                        onClick={onPreview}
                        className="flex-1 sm:flex-none px-6 py-2.5 border border-primary text-primary font-title-sm text-title-sm rounded-xl hover:bg-primary/5 transition-colors flex items-center justify-center gap-2"
                    >
                        <Eye className="w-4 h-4" />
                        Preview
                    </button>

                    {onSaveDraft && (
                        <button
                            type="button"
                            onClick={onSaveDraft}
                            disabled={isSubmitting}
                            className="flex-1 sm:flex-none px-6 py-2.5 border border-on-surface text-on-surface dark:border-outline-variant/50 dark:text-white font-title-sm text-title-sm rounded-xl hover:bg-surface-container transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            <Save className="w-4 h-4" />
                            Simpan Draft
                        </button>
                    )}

                    <button
                        type="button"
                        onClick={onSave}
                        disabled={isSubmitting}
                        className="flex-1 sm:flex-none px-8 py-2.5 bg-primary text-white font-title-sm text-title-sm rounded-xl hover:bg-primary-container shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        <Save className="w-4 h-4" />
                        Simpan
                    </button>
                </div>
            </div>
        </footer>
    );
}
