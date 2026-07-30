'use client';

import { useEffect } from 'react';
import { AlertCircle, RefreshCw, ChevronLeft } from 'lucide-react';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Dashboard error:', error);
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-[70vh] px-4">
      <div className="max-w-md w-full text-center bg-[var(--surface-light)] p-8 rounded-xl shadow-md border border-[var(--outline-variant)]/10">
        <div className="w-14 h-14 bg-danger/10 rounded-full flex items-center justify-center mx-auto mb-5">
          <AlertCircle className="w-7 h-7 text-danger" />
        </div>
        
        <h2 className="text-title-lg font-heading font-bold text-primary mb-2">
          Terjadi Gangguan pada Dashboard
        </h2>
        
        <p className="text-on-surface-variant mb-6 text-sm">
          Gagal menampilkan data halaman dashboard ini. Silakan coba muat ulang bagian ini atau kembali ke menu sebelumnya.
        </p>

        {error.message && (
          <div className="mb-6 p-3 bg-[var(--surface-container-low)] rounded-lg text-left border border-[var(--outline-variant)]/20">
            <span className="text-label-caps text-on-surface-variant block mb-1">Rincian Error:</span>
            <code className="text-xs text-danger break-all">
              {error.message}
            </code>
          </div>
        )}

        <div className="flex gap-3 justify-center">
          <button
            onClick={() => reset()}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-primary hover:bg-primary-container text-white font-semibold text-sm transition-colors cursor-pointer shadow-sm active:scale-[0.98]"
          >
            <RefreshCw className="w-4 h-4" />
            Coba Lagi
          </button>
          
          <button
            onClick={() => window.history.back()}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl border-2 border-secondary hover:bg-secondary/10 text-secondary font-semibold text-sm transition-colors cursor-pointer active:scale-[0.98]"
          >
            <ChevronLeft className="w-4 h-4" />
            Kembali
          </button>
        </div>
      </div>
    </div>
  );
}
