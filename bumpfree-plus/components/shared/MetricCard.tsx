import Link from "next/link";
import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  icon: ReactNode;
  label: string;
  value: string;
  hint?: string;
  href?: string;
  emphasis?: boolean;
  className?: string;
}

export function MetricCard({
  icon,
  label,
  value,
  hint,
  href,
  emphasis = false,
  className,
}: MetricCardProps) {
  const content = (
    <Card
      className={cn(
        "rounded-[1.75rem] border-border/70 bg-card/85 shadow-[0_22px_55px_-40px_rgba(15,23,42,0.45)] backdrop-blur-sm transition-all duration-200",
        href && "hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-[0_28px_70px_-42px_rgba(79,70,229,0.45)]",
        emphasis && "border-primary/30 bg-primary/[0.06]",
        className
      )}
    >
      <CardContent className="space-y-4 px-5 py-5">
        <div
          className={cn(
            "flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary",
            emphasis && "bg-primary text-primary-foreground"
          )}
        >
          {icon}
        </div>
        <div className="space-y-1.5">
          <p className="text-3xl font-semibold tracking-tight">{value}</p>
          <p className="text-sm font-medium text-foreground">{label}</p>
          {hint && <p className="text-xs leading-5 text-muted-foreground">{hint}</p>}
        </div>
      </CardContent>
    </Card>
  );

  if (!href) return content;

  return <Link href={href}>{content}</Link>;
}
