export default function RootLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--canvas-light)] dark:bg-[var(--background)]">
      <div className="flex flex-col items-center gap-4">
        {/* Loading Spinner */}
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-[var(--outline-variant)]/20"></div>
          <div className="absolute inset-0 rounded-full border-4 border-t-transparent border-primary animate-spin"></div>
        </div>
        
        {/* Branding Logo Placeholder */}
        <div className="flex flex-col items-center">
          <span className="text-primary font-heading font-bold text-lg tracking-wider">Nexa Assessment</span>
          <p className="text-on-surface-variant text-xs animate-pulse">Memuat aplikasi, harap tunggu...</p>
        </div>
      </div>
    </div>
  );
}
