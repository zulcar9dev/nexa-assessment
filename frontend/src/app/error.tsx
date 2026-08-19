'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Unhandled runtime error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--canvas-light)] dark:bg-[var(--background)] px-4">
      <div className="max-w-md w-full text-center bg-[var(--surface-light)] dark:bg-[#2b2c40] p-8 rounded-2xl shadow-lg border border-[var(--outline-variant)]/10">
        <div className="w-16 h-16 bg-danger/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-8 h-8 text-danger" />
        </div>
        
        <h1 className="text-title-lg font-heading font-bold text-primary mb-2">
          Terjadi Kesalahan Sistem
        </h1>
        
        <p className="text-on-surface-variant mb-6 text-sm">
          Aplikasi mengalami kesalahan yang tidak terduga. Silakan coba memuat ulang halaman atau kembali ke beranda.
        </p>

        {error.message && (
          <div className="mb-6 p-3 bg-[var(--surface-container-low)] rounded-lg text-left border border-[var(--outline-variant)]/20">
            <span className="text-label-caps text-on-surface-variant block mb-1">Rincian Error:</span>
            <code className="text-xs text-danger break-all">
              {error.message}
            </code>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => reset()}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-container text-white font-semibold text-sm transition-colors cursor-pointer active:scale-[0.98] shadow-sm"
          >
            <RefreshCw className="w-4 h-4" />
            Coba Lagi
          </button>
          
          <Link
            href="/"
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border-2 border-secondary hover:bg-secondary/10 text-secondary font-semibold text-sm transition-colors active:scale-[0.98]"
          >
            <Home className="w-4 h-4" />
            Ke Beranda
          </Link>
        </div>
      </div>
    </div>
  );
}
