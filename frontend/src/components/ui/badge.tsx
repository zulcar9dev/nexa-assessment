import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        // Legacy BNI Variants
        primary: "border-transparent bg-[#e0f2f1] dark:bg-[#00665e]/20 text-[#00665e] dark:text-[#80cbc4]",
        success: "border-transparent bg-[#e8f5e9] dark:bg-[#22c55e]/20 text-[#22c55e]",
        warning: "border-transparent bg-[#fff3e0] dark:bg-[#f59e0b]/20 text-[#f59e0b]",
        danger: "border-transparent bg-[#ffebee] dark:bg-[#ef4444]/20 text-[#ef4444]",
        info: "border-transparent bg-[#e0f2fe] dark:bg-[#3b82f6]/20 text-[#3b82f6]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

type BadgeVariant = VariantProps<typeof badgeVariants>["variant"];

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
export type { BadgeVariant }
