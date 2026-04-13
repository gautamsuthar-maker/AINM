import * as React from "react"
import { cn } from "@/lib/utils"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

interface KPIBlockProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  value: string;
  sub?: string;
  trend?: string | {
    value: string;
    direction: "up" | "down" | "flat";
  };
  chart?: React.ReactNode;
}

export function KPIBlock({ label, value, sub, trend, chart, className, ...props }: KPIBlockProps) {
  const trendDir: "up" | "down" | "flat" =
    typeof trend === "string"
      ? trend === "up" ? "up" : trend === "down" ? "down" : "flat"
      : trend?.direction ?? "flat";
  const trendLabel = typeof trend === "string" ? "" : (trend?.value ?? "");

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
      {sub && !trend && (
        <div className="mt-1 text-[11px] text-brand-text-muted">{sub}</div>
      )}
      {trend && (
        <div className={cn(
          "mt-1 flex items-center gap-1 text-[11px]",
          trendDir === "up" && "text-brand-success",
          trendDir === "down" && "text-brand-danger",
          trendDir === "flat" && "text-brand-text-muted",
        )}>
          {trendDir === "up" && <TrendingUp size={12} />}
          {trendDir === "down" && <TrendingDown size={12} />}
          {trendDir === "flat" && <Minus size={12} />}
          {trendLabel || sub}
        </div>
      )}
    </div>
  )
}
