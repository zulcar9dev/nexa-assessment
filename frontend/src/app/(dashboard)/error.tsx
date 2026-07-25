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
      <div className="max-w-md w-full text-center bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md border border-gray-100 dark:border-gray-700">
        <div className="w-14 h-14 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-5">
          <AlertCircle className="w-7 h-7 text-red-600 dark:text-red-400" />
        </div>
        
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          Terjadi Gangguan pada Dashboard
        </h2>
        
        <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">
          Gagal menampilkan data halaman dashboard ini. Silakan coba muat ulang bagian ini atau kembali ke menu sebelumnya.
        </p>

        {error.message && (
          <div className="mb-6 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg text-left border border-gray-200 dark:border-gray-700">
            <span className="text-xs font-semibold text-gray-400 block mb-1">Rincian Error:</span>
            <code className="text-xs text-red-600 dark:text-red-400 break-all">
              {error.message}
            </code>
          </div>
        )}

        <div className="flex gap-3 justify-center">
          <button
            onClick={() => reset()}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-brand hover:bg-brand-dark text-white font-semibold text-sm transition-colors cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            Coba Lagi
          </button>
          
          <button
            onClick={() => window.history.back()}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold text-sm transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            Kembali
          </button>
        </div>
      </div>
    </div>
  );
}
