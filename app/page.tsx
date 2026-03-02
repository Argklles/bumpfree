import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, Zap, Clock, ArrowRight, Moon } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Nav */}
      <header className="border-b border-border/40 backdrop-blur sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2 font-semibold text-lg">
            <Zap className="w-5 h-5 text-primary" />
            BumpFree
          </div>
          <div className="flex items-center gap-2">
            <Link href="/auth/login">
              <Button variant="ghost" size="sm">登录</Button>
            </Link>
            <Link href="/auth/register">
              <Button size="sm">免费注册</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1">
        <section className="max-w-6xl mx-auto px-4 pt-24 pb-16 text-center">
          <Badge variant="secondary" className="mb-6">
            🎓 专为高校学生设计
          </Badge>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-tight">
            找共同空闲，
            <br />
            <span className="text-muted-foreground">从未这么简单</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            导入 WakeUp 口令，创建 Room，邀请班委社团成员——聚合日历一键看清所有人的共同空闲时间。
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/auth/register">
              <Button size="lg" className="gap-2">
                立即开始 <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button size="lg" variant="outline">已有账号？登录</Button>
            </Link>
          </div>
        </section>

        {/* Feature cards */}
        <section className="max-w-6xl mx-auto px-4 pb-24 grid md:grid-cols-3 gap-6">
          <FeatureCard
            icon={<Zap className="w-6 h-6" />}
            title="WakeUp 一键导入"
            desc="粘贴分享口令，3秒完成课表导入，无需手动录入"
          />
          <FeatureCard
            icon={<Users className="w-6 h-6" />}
            title="多人聚合日历"
            desc="每人用独特颜色区分，月/周/按人三种视图，清晰直观"
          />
          <FeatureCard
            icon={<Clock className="w-6 h-6" />}
            title="零门槛找空闲"
            desc="颜色空白区域即共同空闲，不再发消息挨个问时间"
          />
        </section>

        {/* How it works */}
        <section className="border-t border-border/40">
          <div className="max-w-6xl mx-auto px-4 py-20">
            <h2 className="text-3xl font-bold text-center mb-12">三步搞定</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { step: "01", title: "注册登录", desc: "填写邮箱密码，5秒完成注册" },
                { step: "02", title: "导入课表", desc: "从 WakeUp 获取分享口令，粘贴即导入" },
                { step: "03", title: "创建 Room", desc: "邀请成员加入，共享聚合日历链接" },
              ].map((item) => (
                <div key={item.step} className="flex gap-4">
                  <span className="text-4xl font-bold text-border">{item.step}</span>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">{item.title}</h3>
                    <p className="text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/40 py-8 text-center text-sm text-muted-foreground">
        © 2026 BumpFree · 为高校学生打造
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-card p-6 hover:border-border transition-colors">
      <div className="text-primary mb-3">{icon}</div>
      <h3 className="font-semibold text-lg mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm leading-relaxed">{desc}</p>
    </div>
  );
}
