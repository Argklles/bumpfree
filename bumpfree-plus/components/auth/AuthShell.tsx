import Link from "next/link";
import type { ReactNode } from "react";
import { ShieldCheck, Sparkles, Zap } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface AuthShellProps {
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
  badge?: string;
  panelTitle?: string;
  panelDescription?: string;
  highlights?: string[];
}

const defaultHighlights = [
  "一键导入 WakeUp 课表，快速建立个人时间基线",
  "通过 Room 聚合成员课表，直接锁定共同空闲时段",
  "基于 Supabase RLS 做数据隔离，分享协作但保留边界",
];

export function AuthShell({
  title,
  description,
  children,
  footer,
  badge = "BumpFree",
  panelTitle = "让团队协作时间，一眼可见。",
  panelDescription = "从个人课表导入，到多人 Room 聚合，再到邀请协作，整个流程尽量少步骤、低学习成本、高可见性。",
  highlights = defaultHighlights,
}: AuthShellProps) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.16),transparent_30%),radial-gradient(circle_at_right_top,rgba(45,212,191,0.14),transparent_24%)]" />
      <div className="mx-auto grid min-h-screen w-full max-w-7xl items-center gap-10 px-4 py-10 md:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14 lg:px-8">
        <div className="hidden lg:block">
          <div className="space-y-8">
            <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-foreground">
              <span className="flex size-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
                <Zap className="size-5" />
              </span>
              BumpFree
            </Link>

            <div className="max-w-xl space-y-5">
              <span className="inline-flex w-fit items-center gap-2 rounded-full border border-primary/15 bg-primary/10 px-3 py-1 text-xs font-semibold tracking-[0.14em] text-primary uppercase">
                <Sparkles className="size-3.5" />
                {badge}
              </span>
              <h1 className="text-5xl font-semibold tracking-tight text-balance">
                {panelTitle}
              </h1>
              <p className="text-base leading-8 text-muted-foreground">
                {panelDescription}
              </p>
            </div>

            <div className="grid gap-4">
              {highlights.map((item) => (
                <div
                  key={item}
                  className="flex items-start gap-3 rounded-[1.5rem] border border-border/70 bg-card/70 px-5 py-4 shadow-[0_18px_45px_-38px_rgba(15,23,42,0.4)] backdrop-blur-sm"
                >
                  <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/12 text-primary">
                    <ShieldCheck className="size-4" />
                  </span>
                  <p className="text-sm leading-6 text-foreground/88">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mx-auto w-full max-w-md">
          <div className="mb-6 flex items-center justify-center gap-2 lg:hidden">
            <span className="flex size-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/25">
              <Zap className="size-5" />
            </span>
            <span className="text-lg font-semibold">BumpFree</span>
          </div>

          <Card className="rounded-[2rem] border-border/70 bg-card/88 shadow-[0_28px_80px_-54px_rgba(15,23,42,0.45)] backdrop-blur-xl">
            <CardHeader className="space-y-2 text-center">
              <CardTitle className="text-2xl">{title}</CardTitle>
              <CardDescription className="text-sm leading-6">{description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {children}
              {footer}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
