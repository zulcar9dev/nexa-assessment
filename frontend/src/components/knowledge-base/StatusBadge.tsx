"use client";

interface StatusBadgeProps {
    status: string;
    className?: string;
}

const statusConfig: Record<string, { label: string; classes: string }> = {
    AKTIF: {
        label: "Aktif",
        classes: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    },
    SEGERA_BERAKHIR: {
        label: "Segera Berakhir",
        classes: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 animate-pulse-subtle",
    },
    EXPIRED: {
        label: "Expired",
        classes: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    },
    ARCHIVED: {
        label: "Archived",
        classes: "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400",
    },
};

export default function StatusBadge({ status, className = "" }: StatusBadgeProps) {
    const config = statusConfig[status] || statusConfig.AKTIF;

    return (
        <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.classes} ${className}`}
        >
            <span
                className={`w-1.5 h-1.5 rounded-full ${
                    status === "AKTIF"
                        ? "bg-green-500"
                        : status === "SEGERA_BERAKHIR"
                          ? "bg-amber-500"
                          : status === "EXPIRED"
                            ? "bg-red-500"
                            : "bg-gray-400"
                }`}
            />
            {config.label}
        </span>
    );
}
