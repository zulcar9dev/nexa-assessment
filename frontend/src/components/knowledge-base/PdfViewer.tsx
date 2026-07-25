"use client";

import { useState, useCallback } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCw, Loader2 } from "lucide-react";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PdfViewerProps {
    fileUrl: string;
    className?: string;
}

export default function PdfViewer({ fileUrl, className = "" }: PdfViewerProps) {
    const [numPages, setNumPages] = useState<number>(0);
    const [pageNumber, setPageNumber] = useState<number>(1);
    const [scale, setScale] = useState<number>(1.0);
    const [rotation, setRotation] = useState<number>(0);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const onDocumentLoadSuccess = useCallback(({ numPages }: { numPages: number }) => {
        setNumPages(numPages);
        setIsLoading(false);
    }, []);

    const goToPrev = () => setPageNumber((prev) => Math.max(1, prev - 1));
    const goToNext = () => setPageNumber((prev) => Math.min(numPages, prev + 1));
    const zoomIn = () => setScale((prev) => Math.min(2.5, prev + 0.25));
    const zoomOut = () => setScale((prev) => Math.max(0.5, prev - 0.25));
    const rotate = () => setRotation((prev) => (prev + 90) % 360);

    return (
        <div className={`flex flex-col ${className}`}>
            {/* Toolbar */}
            <div className="flex items-center justify-between px-4 py-2 bg-gray-50 dark:bg-[#323249] border-b border-gray-200 dark:border-[#444564] rounded-t-lg">
                {/* Page Navigation */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={goToPrev}
                        disabled={pageNumber <= 1}
                        className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-[#444564] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        title="Halaman sebelumnya"
                    >
                        <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                    </button>
                    <span className="text-sm text-gray-600 dark:text-gray-300 min-w-[80px] text-center">
                        Hal {pageNumber} / {numPages || "..."}
                    </span>
                    <button
                        onClick={goToNext}
                        disabled={pageNumber >= numPages}
                        className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-[#444564] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        title="Halaman berikutnya"
                    >
                        <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                    </button>
                </div>

                {/* Zoom & Rotate */}
                <div className="flex items-center gap-1">
                    <button
                        onClick={zoomOut}
                        disabled={scale <= 0.5}
                        className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-[#444564] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        title="Perkecil"
                    >
                        <ZoomOut className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                    </button>
                    <span className="text-xs text-gray-500 dark:text-gray-400 min-w-[45px] text-center">
                        {Math.round(scale * 100)}%
                    </span>
                    <button
                        onClick={zoomIn}
                        disabled={scale >= 2.5}
                        className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-[#444564] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        title="Perbesar"
                    >
                        <ZoomIn className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                    </button>
                    <div className="w-px h-5 bg-gray-300 dark:bg-[#444564] mx-1" />
                    <button
                        onClick={rotate}
                        className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-[#444564] transition-colors"
                        title="Putar"
                    >
                        <RotateCw className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                    </button>
                </div>
            </div>

            {/* PDF Content */}
            <div className="flex-1 overflow-auto bg-gray-100 dark:bg-[#1a1a2e] rounded-b-lg flex justify-center p-4">
                {isLoading && (
                    <div className="flex items-center justify-center gap-2 text-gray-500 py-20">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span className="text-sm">Memuat PDF...</span>
                    </div>
                )}
                <Document
                    file={fileUrl}
                    onLoadSuccess={onDocumentLoadSuccess}
                    onLoadError={() => setIsLoading(false)}
                    loading=""
                    className="flex flex-col items-center gap-4"
                >
                    <Page
                        pageNumber={pageNumber}
                        scale={scale}
                        rotate={rotation}
                        className="shadow-lg rounded-lg overflow-hidden"
                        renderTextLayer={true}
                        renderAnnotationLayer={true}
                    />
                </Document>
            </div>
        </div>
    );
}
