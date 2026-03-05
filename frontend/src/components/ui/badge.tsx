import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "bg-brand-sidebar-hover text-brand-text-muted hover:bg-brand-sidebar-active",
        ok:
          "bg-brand-success/10 text-brand-success",
        warn:
          "bg-brand-warning/10 text-brand-warning",
        danger:
          "bg-brand-danger/10 text-brand-danger",
        info:
          "bg-brand-primary/10 text-brand-primary",
        purple:
          "bg-brand-purple/10 text-brand-purple",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
