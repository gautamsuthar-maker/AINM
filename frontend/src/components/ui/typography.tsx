import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const typographyVariants = cva(
  "text-brand-text",
  {
    variants: {
      variant: {
        h1: "text-3xl font-bold tracking-tight md:text-4xl",
        h2: "text-2xl font-bold tracking-tight md:text-3xl",
        h3: "text-xl font-bold tracking-tight",
        h4: "text-lg font-bold tracking-tight",
        p: "text-[13px] leading-relaxed",
        subtle: "text-[12px] text-brand-text-muted",
        label: "text-[11px] font-semibold tracking-wider text-brand-text-dim uppercase",
      },
    },
    defaultVariants: {
      variant: "p",
    },
  }
)

export interface TypographyProps
  extends React.HTMLAttributes<HTMLHeadingElement | HTMLParagraphElement | HTMLSpanElement>,
    VariantProps<typeof typographyVariants> {
  as?: React.ElementType
}

const Typography = React.forwardRef<HTMLElement, TypographyProps>(
  ({ className, variant, as, ...props }, ref) => {
    // Automatically map variants to HTML elements if 'as' is not provided
    const defaultElementMap: Record<string, React.ElementType> = {
      h1: "h1",
      h2: "h2",
      h3: "h3",
      h4: "h4",
      p: "p",
      subtle: "p",
      label: "label",
    }
    
    const Component = as || (variant ? defaultElementMap[variant] : "p") || "p"

    return (
      <Component
        ref={ref}
        className={cn(typographyVariants({ variant, className }))}
        {...props}
      />
    )
  }
)
Typography.displayName = "Typography"

export { Typography, typographyVariants }
