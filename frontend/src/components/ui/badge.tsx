import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex h-6 shrink-0 items-center gap-1 whitespace-nowrap rounded-full border px-2 text-xs font-medium leading-none transition-colors",
  {
    variants: {
      variant: {
        default: "border-border bg-white/[0.025] text-[var(--text-2)]",
        secondary: "border-border bg-white/[0.025] text-[var(--text-2)]",
        outline: "border-border text-[var(--text-2)]",
        success: "border-emerald-400/25 bg-emerald-500/15 text-emerald-200",
        warning: "border-amber-400/25 bg-amber-500/15 text-amber-100",
        danger: "border-rose-400/25 bg-rose-500/15 text-rose-100",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };

