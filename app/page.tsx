import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Github, Zap, Users, CheckCircle2, ShieldCheck } from "lucide-react";
import { ScrollCollision } from "@/components/motion/ScrollCollision";
import { ScrollReveal } from "@/components/motion/ScrollReveal";
import { FloatingHeroElements } from "@/components/motion/FloatingHeroElements";

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
      <main className="flex-1 relative">
        {/* Background Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none -z-20" />

        {/* Floating Animated Elements (Mesh + Cubes) */}
        <FloatingHeroElements />

        <section className="max-w-5xl mx-auto px-4 pt-32 pb-32 text-center relative z-10">
          <ScrollReveal yOffset={20}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border/50 bg-background/50 backdrop-blur-md mb-8 shadow-sm">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">BumpFree 全新上线 · 告别排班烦恼</span>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.1}>
            <h1 className="text-5xl md:text-7xl lg:text-[5rem] font-extrabold tracking-tight mt-6 mb-8 leading-[1.1] text-foreground">
              高效整合团队课表，<br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-teal-400 to-indigo-500">
                精准定位协作时段
              </span>
            </h1>
          </ScrollReveal>

          <ScrollReveal delay={0.2}>
            <p className="text-lg md:text-xl text-muted-foreground/90 max-w-2xl mx-auto mb-12 leading-relaxed font-medium">
              告别在群里挨个问时间的烦恼。只需导入 WakeUp 课表数据，组建专属小房间。依靠聚合日历矩阵计算重叠，瞬间让所有人的共同空闲时段浮出水面。
            </p>
          </ScrollReveal>

          <ScrollReveal delay={0.3}>
            <div className="flex flex-col sm:flex-row gap-5 justify-center items-center">
              <Link href="/auth/register" className="w-full sm:w-auto relative group">
                {/* Glow ring */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/50 to-indigo-500/50 rounded-xl blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200" />
                <Button size="lg" className="relative w-full sm:w-auto h-14 px-10 text-base font-semibold rounded-xl gap-2 shadow-xl bg-primary hover:bg-primary/90">
                  免费创建 Room
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
                </Button>
              </Link>
              <Link href="/auth/login" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full sm:w-auto h-14 px-10 text-base font-semibold rounded-xl bg-background/50 backdrop-blur-md border-border/50 hover:bg-muted/50 transition-colors">
                  登录已有账号
                </Button>
              </Link>
            </div>
          </ScrollReveal>
        </section>

        {/* Scroll Linked Epic Animation Section */}
        <ScrollCollision />

        {/* Feature cards */}
        <section className="bg-muted/30 border-y border-border/40 py-24">
          <div className="max-w-6xl mx-auto px-4">
            <ScrollReveal className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">核心协作能力</h2>
              <p className="text-muted-foreground text-lg">一切为了让寻找会议时间变得毫无压力</p>
            </ScrollReveal>

            <div className="grid md:grid-cols-3 gap-6">
              <ScrollReveal delay={0.1} className="h-full">
                <FeatureCard
                  icon={<Zap className="w-6 h-6" />}
                  title="WakeUp 极速导入"
                  desc="无需繁琐的手动录制。直接粘贴 WakeUp 课表分享口令，系统将在瞬间完成解析与云端同步。"
                />
              </ScrollReveal>
              <ScrollReveal delay={0.2} className="h-full">
                <FeatureCard
                  icon={<Users className="w-6 h-6" />}
                  title="高密度聚合日历"
                  desc="将数十人的课表叠加于一个日历矩阵中，通过每个人专属的色彩标签，彻底消除日程盲区。"
                />
              </ScrollReveal>
              <ScrollReveal delay={0.3} className="h-full">
                <FeatureCard
                  icon={<Sparkles className="w-6 h-6" />}
                  title="空闲时段自显影"
                  desc="不再需要肉眼比对。颜色稀疏或完全留白的矩阵时间块，即刻指示出最完美的团队共同空闲时间。"
                />
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* Deep Dive / Extra content */}
        <section className="py-32 overflow-hidden relative">
          <div className="absolute inset-0 bg-primary/5 -skew-y-3 transform origin-top-left -z-10" />
          <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-2 gap-16 items-center">
            <ScrollReveal className="space-y-6">
              <Badge variant="outline" className="text-primary border-primary/30">
                <ShieldCheck className="w-4 h-4 mr-2" />
                数据安全与隔离
              </Badge>
              <h2 className="text-3xl md:text-5xl font-bold leading-tight">
                你的时间隐私，<br />我们绝不妥协
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                在分享空闲时间的同时，保留你的私人边界。基于 Supabase Row Level Security (RLS) 构建底层的安全堡垒，你的私有日常行程不仅被加密存储，仅在您允许的 Room 房间内计算空闲重叠，外界绝无可能窥探。
              </p>
              <ul className="space-y-4 pt-4">
                {[
                  "每个 Room 独立鉴权，信息仅成员可见",
                  "模糊显示非工作日程，只暴露空闲状态",
                  "可随时一键清除个人全部日程记录"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                    <span className="font-medium">{item}</span>
                  </li>
                ))}
              </ul>
            </ScrollReveal>

            <ScrollReveal delay={0.2} className="relative">
              <div className="aspect-square max-w-md mx-auto rounded-3xl border border-border/50 bg-card/50 backdrop-blur-xl p-8 flex flex-col justify-center relative shadow-sm">
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent rounded-3xl -z-10" />
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className={`h-16 rounded-xl border border-border/40 bg-background flex items-center px-4 gap-4 transform transition-transform hover:scale-105 ${i === 2 ? 'ml-8 bg-primary/5 border-primary/20' : ''}`}>
                      <div className={`w-3 h-3 rounded-full ${i === 2 ? 'bg-primary animate-pulse' : 'bg-muted'}`} />
                      <div className="flex-1 space-y-2">
                        <div className={`h-2 rounded-full ${i === 2 ? 'bg-primary/40 w-1/2' : 'bg-muted w-3/4'}`} />
                        <div className={`h-2 rounded-full ${i === 2 ? 'bg-primary/20 w-1/4' : 'bg-muted/50 w-1/2'}`} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* How it works */}
        <section className="bg-card border-t border-border/40 py-24">
          <div className="max-w-6xl mx-auto px-4">
            <ScrollReveal className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">极简三步，开始协作</h2>
              <p className="text-muted-foreground">抛弃繁琐的使用手册，即刻上手</p>
            </ScrollReveal>

            <div className="grid md:grid-cols-3 gap-12 relative">
              {/* Connector line */}
              <div className="hidden md:block absolute top-[28px] left-[15%] right-[15%] h-px bg-border/40 -z-10" />

              {[
                { step: "1", title: "安全注册", desc: "填写邮箱即可，5秒获取你的独立数字账户，完全免打扰。" },
                { step: "2", title: "无缝导入", desc: "前往原课表软件点击分享并复制口令，粘贴到个人设置中心。" },
                { step: "3", title: "一键开房", desc: "创建一个 Room 并发送专属链接给组员，日历矩阵瞬间生成。" },
              ].map((item, index) => (
                <ScrollReveal key={item.step} delay={index * 0.15} className="relative bg-card/50">
                  <div className="w-14 h-14 rounded-full bg-background border border-border/60 flex items-center justify-center text-xl font-bold text-primary mb-6 shadow-sm mx-auto md:mx-0">
                    {item.step}
                  </div>
                  <h3 className="font-semibold text-xl mb-3 text-center md:text-left">{item.title}</h3>
                  <p className="text-muted-foreground leading-relaxed text-center md:text-left">{item.desc}</p>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Footer Array */}
        <section className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-primary/[0.03] -z-10" />
          <div className="max-w-4xl mx-auto px-4 text-center">
            <ScrollReveal>
              <h2 className="text-4xl md:text-5xl font-bold mb-6">准备好找回被浪费的时间了吗？</h2>
              <p className="text-xl text-muted-foreground mb-10">
                加入 BumpFree，让每一次小组讨论、社团例会都完美踩在所有人的空闲点上。
              </p>
              <Link href="/auth/register">
                <Button size="lg" className="h-16 px-12 text-lg rounded-full">
                  现在免费加入
                </Button>
              </Link>
            </ScrollReveal>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/40 py-10 text-center text-sm text-muted-foreground bg-background">
        <div className="flex flex-col items-center justify-center gap-4">
          <p>© 2026 BumpFree</p>
          <a
            href="https://github.com/theLucius7/bumpfree"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 hover:text-foreground transition-colors"
          >
            <Github className="w-4 h-4" />
            <span>GitHub Repository</span>
          </a>
        </div>
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
    <div className="rounded-xl border border-border/60 bg-background p-8 hover:border-primary/30 transition-all duration-300 hover:-translate-y-1 h-full shadow-sm">
      <div className="text-primary mb-5 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">{icon}</div>
      <h3 className="font-semibold text-xl mb-3">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{desc}</p>
    </div>
  );
}
