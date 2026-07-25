'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="max-w-md w-full text-center bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
        <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Terjadi Kesalahan Sistem
        </h1>
        
        <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm">
          Aplikasi mengalami kesalahan yang tidak terduga. Silakan coba memuat ulang halaman atau kembali ke beranda.
        </p>

        {error.message && (
          <div className="mb-6 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg text-left border border-gray-200 dark:border-gray-700">
            <span className="text-xs font-semibold text-gray-400 block mb-1">Rincian Error:</span>
            <code className="text-xs text-red-600 dark:text-red-400 break-all">
              {error.message}
            </code>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => reset()}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-brand hover:bg-brand-dark text-white font-semibold text-sm transition-colors cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            Coba Lagi
          </button>
          
          <a
            href="/"
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold text-sm transition-colors"
          >
            <Home className="w-4 h-4" />
            Ke Beranda
          </a>
        </div>
      </div>
    </div>
  );
}
