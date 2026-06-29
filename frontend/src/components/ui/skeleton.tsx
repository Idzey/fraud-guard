import type * as React from "react";

import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-[linear-gradient(90deg,rgba(255,255,255,.035),rgba(255,255,255,.07),rgba(255,255,255,.035))] bg-[length:220%_100%]",
        className,
      )}
      {...props}
    />
  );
}

export { Skeleton };

