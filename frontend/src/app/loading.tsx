export default function RootLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="flex flex-col items-center gap-4">
        {/* Loading Spinner */}
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-gray-200 dark:border-gray-700"></div>
          <div className="absolute inset-0 rounded-full border-4 border-t-[#4f46e5] animate-spin"></div>
        </div>
        
        {/* Branding Logo Placeholder */}
        <div className="flex flex-col items-center">
          <span className="text-[#4f46e5] font-bold text-lg tracking-wider">Nexa Assessment</span>
          <p className="text-gray-400 dark:text-gray-500 text-xs animate-pulse">Memuat aplikasi, harap tunggu...</p>
        </div>
      </div>
    </div>
  );
}
