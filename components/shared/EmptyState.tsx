import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-[2rem] border border-dashed border-border/70 bg-card/70 px-6 py-12 text-center shadow-[0_24px_60px_-48px_rgba(15,23,42,0.35)] backdrop-blur-sm",
        className
      )}
    >
      <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        {icon}
      </div>
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="max-w-md text-sm leading-6 text-muted-foreground">{description}</p>
      </div>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
