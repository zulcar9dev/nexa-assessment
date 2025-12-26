import * as React from "react";
import { cn } from "@/lib/utils";

type BadgeVariant =
    | "default"
    | "primary"
    | "secondary"
    | "success"
    | "warning"
    | "danger"
    | "info";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
    variant?: BadgeVariant;
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
    ({ className, variant = "default", ...props }, ref) => {
        const variants = {
            default:
                "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300",
            primary:
                "bg-[#e0f2f1] dark:bg-[#00665e]/20 text-[#00665e] dark:text-[#80cbc4]",
            secondary:
                "bg-[#f15a23]/15 text-[#f15a23]",
            success:
                "bg-[#e8f5e9] dark:bg-[#22c55e]/20 text-[#22c55e]",
            warning:
                "bg-[#fff3e0] dark:bg-[#f59e0b]/20 text-[#f59e0b]",
            danger:
                "bg-[#ffebee] dark:bg-[#ef4444]/20 text-[#ef4444]",
            info:
                "bg-[#e0f2fe] dark:bg-[#3b82f6]/20 text-[#3b82f6]",
        };

        return (
            <span
                ref={ref}
                className={cn("badge", variants[variant], className)}
                {...props}
            />
        );
    }
);

Badge.displayName = "Badge";

export { Badge };
export type { BadgeVariant };
