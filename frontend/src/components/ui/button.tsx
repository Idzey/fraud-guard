import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex min-h-[34px] items-center justify-center gap-2 whitespace-nowrap rounded-md px-3 text-[13px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "border border-primary/35 bg-primary text-primary-foreground hover:bg-[#828fff]",
        secondary: "border border-border bg-white/[0.025] text-[var(--text-2)] hover:bg-white/[0.05] hover:text-foreground",
        destructive: "border border-rose-400/25 bg-rose-500/15 text-rose-100 hover:bg-rose-500/20",
        outline: "border border-border bg-white/[0.025] text-[var(--text-2)] hover:bg-white/[0.05] hover:text-foreground",
        ghost: "text-muted-foreground hover:bg-white/[0.035] hover:text-foreground",
      },
      size: {
        default: "h-[34px] px-3",
        sm: "h-8 px-2.5 text-xs",
        lg: "h-9 px-4",
        icon: "size-[34px] p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };

