"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export type ChartConfig = Record<
  string,
  {
    label: React.ReactNode
    icon?: React.ComponentType
    color?: string
  }
>

interface ChartContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  config: ChartConfig
  children: React.ReactNode
}

export function ChartContainer({
  config,
  children,
  className,
  ...props
}: ChartContainerProps) {
  return (
    <div
      className={cn(
        "flex aspect-video items-end justify-between p-4 bg-muted/20 rounded-md border text-xs",
        className
      )}
      {...props}
    >
      {/* Mock Chart Area */}
      <div className="w-full h-full flex flex-row items-end justify-around gap-2 pb-6 border-b border-l border-border relative">
          <div className="absolute left-0 bottom-0 text-[10px] -translate-x-full pr-1 text-muted-foreground">0</div>
          <div className="absolute left-0 top-0 text-[10px] -translate-x-full pr-1 text-muted-foreground">100</div>
          {children}
      </div>
    </div>
  )
}

export function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: any[]
  label?: string
}) {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-background p-2 shadow-sm">
        <div className="grid grid-cols-2 gap-2">
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex flex-col">
              <span className="text-[0.70rem] uppercase text-muted-foreground">
                {entry.name}
              </span>
              <span className="font-bold text-muted-foreground">
                {entry.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    )
  }
  return null
}
