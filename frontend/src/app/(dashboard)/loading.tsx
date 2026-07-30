export default function DashboardLoading() {
  return (
    <div className="p-6 lg:p-8 space-y-6 animate-pulse max-w-[1440px] mx-auto">
      {/* Title skeleton */}
      <div className="h-10 bg-[var(--surface-container-high)] rounded-xl w-1/4"></div>

      {/* Grid for stats cards skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-[var(--surface-light)] dark:bg-[#2b2c40] p-6 rounded-xl border border-[var(--outline-variant)]/10 space-y-3 shadow-sm">
            <div className="h-4 bg-[var(--surface-container-high)] rounded w-1/2"></div>
            <div className="h-8 bg-[var(--surface-container-high)] rounded w-3/4"></div>
          </div>
        ))}
      </div>

      {/* Main content table skeleton */}
      <div className="bg-[var(--surface-light)] dark:bg-[#2b2c40] rounded-xl border border-[var(--outline-variant)]/10 p-6 shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <div className="h-6 bg-[var(--surface-container-high)] rounded w-1/3"></div>
          <div className="h-10 bg-[var(--surface-container-high)] rounded-xl w-1/6"></div>
        </div>
        <div className="space-y-3 pt-4">
          <div className="h-4 bg-[var(--surface-container-high)] rounded w-full"></div>
          <div className="h-4 bg-[var(--surface-container-high)] rounded w-5/6"></div>
          <div className="h-4 bg-[var(--surface-container-high)] rounded w-4/5"></div>
          <div className="h-4 bg-[var(--surface-container-high)] rounded w-full"></div>
          <div className="h-4 bg-[var(--surface-container-high)] rounded w-2/3"></div>
        </div>
      </div>
    </div>
  );
}
