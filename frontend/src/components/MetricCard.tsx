import type { LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string;
  description: string;
  icon: LucideIcon;
  tone?: "teal" | "amber" | "rose" | "sky";
}

const toneClass = {
  teal: "bg-emerald-500/15 text-emerald-200",
  amber: "bg-amber-500/15 text-amber-100",
  rose: "bg-rose-500/15 text-rose-100",
  sky: "bg-primary/15 text-[#c2c7ff]",
};

export function MetricCard({ title, value, description, icon: Icon, tone = "teal" }: MetricCardProps) {
  return (
    <Card className="transition-colors hover:border-white/15 hover:bg-white/[0.03]">
      <CardContent className="flex min-h-[112px] items-start justify-between gap-3 p-3.5">
        <div className="min-w-0">
          <p className="text-xs font-medium text-[var(--text-4)]">{title}</p>
          <div className="metric-number mt-2 text-2xl font-medium leading-none tracking-normal text-foreground">
            {value}
          </div>
          <p className="mt-2 flex items-center gap-1 text-xs leading-5 text-[var(--text-3)]">{description}</p>
        </div>
        <div className={cn("flex size-8 shrink-0 items-center justify-center rounded-md", toneClass[tone])}>
          <Icon className="size-4" />
        </div>
      </CardContent>
    </Card>
  );
}

