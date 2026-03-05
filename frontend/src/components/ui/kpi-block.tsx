import * as React from "react"
import { cn } from "@/lib/utils"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

interface KPIBlockProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  value: string;
  trend?: {
    value: string;
    direction: "up" | "down" | "flat";
  };
  chart?: React.ReactNode;
}

export function KPIBlock({ label, value, trend, chart, className, ...props }: KPIBlockProps) {
  return (
    <div
      className={cn(
        "rounded-[10px] border border-brand-border bg-brand-sidebar p-4",
        className
      )}
      {...props}
    >
      <div className="mb-1.5 text-[11px] uppercase tracking-[0.5px] text-brand-text-muted">
        {label}
      </div>
      <div className="flex items-center justify-between">
        <div className="text-[22px] font-bold text-white">{value}</div>
        {chart && <div className="shrink-0">{chart}</div>}
      </div>
      {trend && (
        <div className={cn(
          "mt-1 flex items-center gap-1 text-[11px]",
          trend.direction === "up" && "text-brand-success",
          trend.direction === "down" && "text-brand-danger",
          trend.direction === "flat" && "text-brand-text-muted",
        )}>
          {trend.direction === "up" && <TrendingUp size={12} />}
          {trend.direction === "down" && <TrendingDown size={12} />}
          {trend.direction === "flat" && <Minus size={12} />}
          {trend.value}
        </div>
      )}
    </div>
  )
}
