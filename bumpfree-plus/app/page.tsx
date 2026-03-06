import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  CalendarRange,
  CheckCircle2,
  Clock3,
  DoorOpen,
  Download,
  Github,
  ShieldCheck,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";

const featureCards = [
  {
    icon: <Download className="size-5" />,
    title: "WakeUp 一键导入",
    description: "粘贴分享口令即可同步课表，省去重复录入和人工校对。",
  },
  {
    icon: <Users className="size-5" />,
    title: "多人 Room 协作",
    description: "按成员聚合课表，统一查看谁忙谁闲，减少群聊来回确认。",
  },
  {
    icon: <CalendarRange className="size-5" />,
    title: "共同空闲可视化",
    description: "通过聚合日历快速识别重叠空档，让开会和活动安排更直接。",
  },
];

const steps = [
  {
    step: "01",
    title: "注册并导入课表",
    description: "使用邮箱创建账号，将个人 WakeUp 课表同步到 BumpFree。",
  },
  {
    step: "02",
    title: "创建专属 Room",
    description: "按班级、社团、项目组建立协作房间，集中管理多人节奏。",
  },
  {
    step: "03",
    title: "邀请成员并决策",
    description: "让成员加入后直接看聚合日历，快速锁定最合适的时段。",
  },
];

const trustPoints = [
  "Room 独立鉴权，成员外默认不可见",
  "支持公开只读房间，方便快速分享",
  "基于 Supabase RLS 做数据隔离与访问控制",
];

const heroMetrics = [
  { label: "导入方式", value: "WakeUp 口令" },
  { label: "协作单元", value: "Room 房间" },
  { label: "目标结果", value: "共同空闲" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="page-shell flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-3 font-semibold">
            <span className="flex size-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
              <Zap className="size-5" />
            </span>
            <span className="text-lg tracking-tight">BumpFree</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/auth/login">
              <Button variant="ghost" size="sm">登录</Button>
            </Link>
            <Link href="/auth/register">
              <Button size="sm">免费开始</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="pb-24">
        <section className="page-shell grid gap-12 py-16 md:py-24 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
          <div className="space-y-8">
            <Badge variant="outline" className="gap-2 border-primary/20 bg-primary/10 text-primary">
              <Sparkles className="size-3.5" />
              面向班委、社团和项目组的课表协作平台
            </Badge>

            <div className="space-y-5">
              <h1 className="text-5xl font-semibold leading-[1.02] tracking-tight text-balance md:text-6xl lg:text-7xl">
                从个人课表到
                <span className="block bg-gradient-to-r from-primary via-indigo-500 to-teal-500 bg-clip-text text-transparent">
                  团队共同空闲
                </span>
              </h1>
              <p className="max-w-2xl text-base leading-8 text-muted-foreground md:text-lg">
                BumpFree 让你从“群里一个个问时间”转向“直接看聚合日历做决定”。
                导入 WakeUp 课表、创建 Room、邀请成员，整个链路围绕一件事展开：
                更快找到所有人都能参与的时间。
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/auth/register">
                <Button size="lg" className="w-full sm:w-auto">
                  免费创建 Room
                  <ArrowRight className="size-4" />
                </Button>
              </Link>
              <Link href="/auth/login">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  登录已有账号
                </Button>
              </Link>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {heroMetrics.map((metric) => (
                <div key={metric.label} className="soft-panel px-4 py-4">
                  <p className="text-xs font-medium tracking-[0.14em] text-muted-foreground uppercase">
                    {metric.label}
                  </p>
                  <p className="mt-2 text-lg font-semibold tracking-tight">{metric.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-x-8 top-8 h-56 rounded-full bg-primary/20 blur-3xl" />
            <div className="glass-panel relative overflow-hidden p-6 md:p-7">
              <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(99,102,241,0.11),transparent_46%,rgba(45,212,191,0.08))]" />
              <div className="relative space-y-5">
                <div className="flex items-center justify-between rounded-[1.4rem] border border-border/70 bg-background/80 px-4 py-3 backdrop-blur-sm">
                  <div>
                    <p className="text-sm font-semibold">Room 聚合日历</p>
                    <p className="text-xs text-muted-foreground">周视图下快速识别重叠忙碌区</p>
                  </div>
                  <Badge>Live</Badge>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <PreviewColumn
                    title="成员课表"
                    items={[
                      { label: "周一 08:00 - 10:00", accent: "bg-indigo-500" },
                      { label: "周三 14:00 - 16:00", accent: "bg-pink-500" },
                      { label: "周五 10:00 - 12:00", accent: "bg-emerald-500" },
                    ]}
                  />
                  <PreviewColumn
                    title="共同空闲"
                    items={[
                      { label: "周二 19:00 - 20:30", accent: "bg-primary" },
                      { label: "周四 16:00 - 18:00", accent: "bg-teal-500" },
                      { label: "周日 15:00 - 17:00", accent: "bg-amber-500" },
                    ]}
                  />
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                  <MiniInsight
                    icon={<DoorOpen className="size-4" />}
                    title="房间协作"
                    description="按团队维度组织排期"
                  />
                  <MiniInsight
                    icon={<Clock3 className="size-4" />}
                    title="快速决策"
                    description="减少反复确认时间"
                  />
                  <MiniInsight
                    icon={<ShieldCheck className="size-4" />}
                    title="只读分享"
                    description="公开页也能控制权限"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="page-shell page-stack py-10 md:py-16">
          <div className="space-y-3">
            <Badge variant="outline" className="gap-2 border-primary/20 bg-primary/10 text-primary">
              <Sparkles className="size-3.5" />
              核心能力
            </Badge>
            <h2 className="section-title">围绕“找共同空闲”这件事，把流程压到最短。</h2>
            <p className="section-description max-w-3xl">
              不是做一个复杂的排班系统，而是把导入、聚合、邀请、查看这几个高频步骤打磨到足够直接。
            </p>
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            {featureCards.map((feature) => (
              <FeatureCard
                key={feature.title}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
              />
            ))}
          </div>
        </section>

        <section className="page-shell grid gap-6 py-10 md:py-16 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="glass-panel p-6 md:p-8">
            <div className="space-y-4">
              <Badge variant="outline" className="gap-2 border-primary/20 bg-primary/10 text-primary">
                <ShieldCheck className="size-3.5" />
                数据边界清晰
              </Badge>
              <h2 className="section-title">协作是开放的，权限边界也要足够明确。</h2>
              <p className="section-description">
                Room 只负责让成员看到需要协作的信息，而不是暴露所有数据细节。公开访问也限定在只读场景，适合快速共享结果。
              </p>
              <ul className="space-y-3 pt-2">
                {trustPoints.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm leading-6">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {steps.map((item) => (
              <div key={item.step} className="soft-panel h-full px-5 py-6">
                <span className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold tracking-[0.14em] text-primary uppercase">
                  {item.step}
                </span>
                <h3 className="mt-4 text-lg font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="page-shell py-10 md:py-16">
          <div className="glass-panel px-6 py-10 text-center md:px-10 md:py-14">
            <div className="mx-auto max-w-3xl space-y-5">
              <Badge variant="outline" className="gap-2 border-primary/20 bg-primary/10 text-primary">
                <Sparkles className="size-3.5" />
                准备开始
              </Badge>
              <h2 className="text-4xl font-semibold tracking-tight text-balance md:text-5xl">
                让每一次开会、活动、讨论，都更快落在正确的时间上。
              </h2>
              <p className="text-base leading-8 text-muted-foreground md:text-lg">
                注册之后导入课表，建立你的第一个 Room，把时间协调这件事从“靠聊天”变成“靠可视化判断”。
              </p>
              <div className="flex flex-col justify-center gap-3 sm:flex-row">
                <Link href="/auth/register">
                  <Button size="lg">
                    立即开始
                    <ArrowRight className="size-4" />
                  </Button>
                </Link>
                <Link href="/auth/login">
                  <Button size="lg" variant="outline">进入已有账号</Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/60 py-8">
        <div className="page-shell flex flex-col items-center justify-between gap-4 text-sm text-muted-foreground md:flex-row">
          <p>© 2026 BumpFree · 零门槛找共同空闲</p>
          <a
            href="https://github.com/theLucius7/bumpfree"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 hover:text-foreground"
          >
            <Github className="size-4" />
            GitHub Repository
          </a>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="glass-panel h-full px-6 py-6">
      <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        {icon}
      </div>
      <h3 className="mt-5 text-xl font-semibold tracking-tight">{title}</h3>
      <p className="mt-2 text-sm leading-7 text-muted-foreground">{description}</p>
    </div>
  );
}

function PreviewColumn({
  title,
  items,
}: {
  title: string;
  items: { label: string; accent: string }[];
}) {
  return (
    <div className="rounded-[1.5rem] border border-border/70 bg-background/80 p-4 backdrop-blur-sm">
      <p className="text-sm font-semibold">{title}</p>
      <div className="mt-4 space-y-3">
        {items.map((item) => (
          <div key={item.label} className="flex items-center gap-3 rounded-2xl border border-border/60 bg-background/70 px-3 py-3">
            <span className={`size-2.5 rounded-full ${item.accent}`} />
            <span className="text-sm text-foreground/88">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function MiniInsight({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-[1.4rem] border border-border/70 bg-background/78 px-4 py-4 backdrop-blur-sm">
      <div className="flex items-center gap-2 text-primary">
        {icon}
        <span className="text-sm font-semibold text-foreground">{title}</span>
      </div>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
    </div>
  );
}
