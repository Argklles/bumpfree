import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  eyebrow?: string;
  actions?: ReactNode;
  meta?: ReactNode;
  align?: "left" | "center";
  className?: string;
}

export function PageHeader({
  title,
  description,
  eyebrow,
  actions,
  meta,
  align = "left",
  className,
}: PageHeaderProps) {
  const centered = align === "center";

  return (
    <div
      className={cn(
        "flex flex-col gap-5 md:flex-row md:items-end md:justify-between",
        centered && "items-center text-center md:items-center",
        className
      )}
    >
      <div className="space-y-3">
        {eyebrow && (
          <span className="inline-flex w-fit items-center rounded-full border border-primary/15 bg-primary/10 px-3 py-1 text-xs font-semibold tracking-[0.14em] text-primary uppercase">
            {eyebrow}
          </span>
        )}
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight text-balance md:text-4xl">
            {title}
          </h1>
          {description && (
            <p className="max-w-2xl text-sm leading-7 text-muted-foreground md:text-base">
              {description}
            </p>
          )}
        </div>
        {meta}
      </div>
      {actions && (
        <div className={cn("flex shrink-0 items-center gap-3", centered && "justify-center")}>
          {actions}
        </div>
      )}
    </div>
  );
}
