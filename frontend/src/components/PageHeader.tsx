import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description: string;
  action?: ReactNode;
}

export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div className="mb-4 flex flex-col items-start justify-between gap-4 sm:flex-row">
      <div className="max-w-3xl">
        <h1 className="text-2xl font-medium leading-tight tracking-normal text-foreground md:text-[32px]">
          {title}
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--text-3)]">{description}</p>
      </div>
      {action ? <div className="flex shrink-0 flex-wrap items-center gap-2">{action}</div> : null}
    </div>
  );
}

