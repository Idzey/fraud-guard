import * as React from "react";

import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, type, ...props }, ref) => (
  <input
    type={type}
    className={cn(
      "flex h-[34px] w-full rounded-md border border-input bg-white/[0.025] px-2.5 text-[13px] text-[var(--text-2)] tabular-nums outline-none transition-colors placeholder:text-muted-foreground focus:border-primary/45 focus:bg-white/[0.04] disabled:cursor-not-allowed disabled:opacity-50",
      className,
    )}
    ref={ref}
    {...props}
  />
));
Input.displayName = "Input";

export { Input };

