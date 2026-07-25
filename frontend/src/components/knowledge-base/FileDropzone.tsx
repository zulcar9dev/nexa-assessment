"use client";

import { useCallback, useState, useRef, DragEvent, ChangeEvent } from "react";
import { Upload, FileText, X, AlertCircle } from "lucide-react";

interface FileDropzoneProps {
    onFileSelect: (file: File | null) => void;
    file: File | null;
    maxSizeMB?: number;
    accept?: string;
}

export default function FileDropzone({
    onFileSelect,
    file,
    maxSizeMB = 10,
    accept = ".pdf",
}: FileDropzoneProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const validateFile = useCallback(
        (f: File): boolean => {
            if (!f.name.toLowerCase().endsWith(".pdf")) {
                setError("Hanya file PDF yang diperbolehkan.");
                return false;
            }
            if (f.size > maxSizeMB * 1024 * 1024) {
                setError(`Ukuran file maksimal ${maxSizeMB}MB.`);
                return false;
            }
            setError(null);
            return true;
        },
        [maxSizeMB]
    );

    const handleDragOver = useCallback((e: DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback(
        (e: DragEvent) => {
            e.preventDefault();
            setIsDragging(false);
            const droppedFile = e.dataTransfer.files[0];
            if (droppedFile && validateFile(droppedFile)) {
                onFileSelect(droppedFile);
            }
        },
        [onFileSelect, validateFile]
    );

    const handleChange = useCallback(
        (e: ChangeEvent<HTMLInputElement>) => {
            const selectedFile = e.target.files?.[0];
            if (selectedFile && validateFile(selectedFile)) {
                onFileSelect(selectedFile);
            }
        },
        [onFileSelect, validateFile]
    );

    const removeFile = () => {
        onFileSelect(null);
        setError(null);
        if (inputRef.current) inputRef.current.value = "";
    };

    const formatSize = (bytes: number) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    return (
        <div className="space-y-2">
            {!file ? (
                <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => inputRef.current?.click()}
                    className={`
                        relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer
                        transition-all duration-300 ease-in-out
                        ${isDragging
                            ? "border-brand bg-[#eef2ff] dark:bg-brand/10 scale-[1.02]"
                            : "border-gray-300 dark:border-[#444564] hover:border-brand hover:bg-gray-50 dark:hover:bg-[#323249]"
                        }
                    `}
                >
                    <Upload
                        className={`w-12 h-12 mx-auto mb-3 transition-colors ${
                            isDragging
                                ? "text-brand dark:text-[#a5b4fc]"
                                : "text-gray-400"
                        }`}
                    />
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Drag & drop file PDF di sini
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        atau klik untuk memilih file (Maks: {maxSizeMB}MB, format: .pdf)
                    </p>
                    <input
                        ref={inputRef}
                        type="file"
                        accept={accept}
                        onChange={handleChange}
                        className="hidden"
                    />
                </div>
            ) : (
                <div
                    className="flex items-center gap-3 p-4 rounded-xl
                        bg-[#eef2ff] dark:bg-brand/10
                        border border-brand/30 dark:border-[#a5b4fc]/30
                        animate-in fade-in duration-300"
                >
                    <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5 text-red-600 dark:text-red-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                            {file.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            {formatSize(file.size)}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={removeFile}
                        className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-gray-400 hover:text-red-500 transition-all"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            {error && (
                <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 animate-in fade-in duration-300">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {error}
                </div>
            )}
        </div>
    );
}
