import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-primary/20 bg-primary/10 text-primary",
        secondary:
          "border-secondary/20 bg-secondary/10 text-secondary",
        destructive:
          "border-destructive/20 bg-destructive/10 text-destructive",
        outline: "text-foreground border-[var(--outline-variant)]",
        // Status Variants (Nexa Design System v2)
        primary: "border-primary/15 bg-primary/10 text-primary",
        success: "border-success/20 bg-success/15 text-success",
        warning: "border-warning/20 bg-warning/15 text-[#b45309] dark:text-warning",
        danger: "border-danger/20 bg-danger/15 text-[#b91c1c] dark:text-danger",
        info: "border-info/20 bg-info/15 text-[#1d4ed8] dark:text-info",
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
