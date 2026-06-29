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
  teal: "text-primary bg-primary/15",
  amber: "text-amber-200 bg-amber-500/15",
  rose: "text-rose-200 bg-rose-500/15",
  sky: "text-sky-200 bg-sky-500/15",
};

export function MetricCard({ title, value, description, icon: Icon, tone = "teal" }: MetricCardProps) {
  return (
    <Card className="metric-glow transition duration-200 hover:-translate-y-0.5 hover:border-primary/45">
      <CardContent className="flex min-h-32 items-start justify-between gap-4 p-5">
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">{title}</p>
          <div className="mt-3 text-2xl font-semibold">{value}</div>
          <p className="mt-2 text-xs leading-5 text-muted-foreground">{description}</p>
        </div>
        <div className={cn("flex size-10 shrink-0 items-center justify-center rounded-lg", toneClass[tone])}>
          <Icon className="size-5" />
        </div>
      </CardContent>
    </Card>
  );
}

