import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Shield, Sparkles, Zap, LogOut } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { getAuthenticatedUser, getCurrentUser, logoutAction } from "@/lib/actions/auth";
import { AppNav } from "@/components/shared/AppNav";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    const user = await getAuthenticatedUser();
    if (!user) redirect("/auth/login");

    const profile = await getCurrentUser();
    if (profile?.role !== "superadmin") redirect("/dashboard");

    return (
        <div className="min-h-screen">
            <div className="page-shell flex min-h-screen gap-6 py-4 md:py-6">
                <aside className="hidden lg:flex w-[284px] shrink-0 flex-col gap-5">
                    <div className="glass-panel px-5 py-5">
                        <Link href="/" className="flex items-center gap-3">
                            <span className="flex size-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
                                <Zap className="size-5" />
                            </span>
                            <div>
                                <p className="text-lg font-semibold tracking-tight">BumpFree</p>
                                <p className="text-xs text-muted-foreground">系统管理后台</p>
                            </div>
                        </Link>

                        <div className="mt-5 rounded-[1.5rem] border border-border/70 bg-background/75 px-4 py-4">
                            <div className="flex items-center gap-2 text-sm font-semibold">
                                <Sparkles className="size-4 text-primary" />
                                管理提示
                            </div>
                            <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                用户角色和配额的变更会立即影响协作上限，建议优先检查目标用户是否已经达到当前容量。
                            </p>
                        </div>
                    </div>

                    <div className="glass-panel px-3 py-3">
                        <AppNav type="admin" />
                        <Separator className="my-3" />
                        <Button asChild variant="outline" className="w-full justify-start">
                            <Link href="/dashboard">
                                <Shield className="size-4" />
                                返回 Dashboard
                            </Link>
                        </Button>
                    </div>

                    <div className="glass-panel mt-auto px-4 py-4">
                        <div className="rounded-[1.4rem] border border-border/70 bg-background/75 px-4 py-4">
                            <p className="text-sm font-semibold">{profile?.display_name ?? user.email}</p>
                            <p className="mt-1 text-xs text-muted-foreground">SuperAdmin 会话</p>
                        </div>
                        <div className="mt-4 flex items-center gap-2">
                            <ThemeToggle />
                            <form action={logoutAction} className="flex-1">
                                <Button type="submit" variant="outline" className="w-full justify-start">
                                    <LogOut className="size-4" />
                                    退出登录
                                </Button>
                            </form>
                        </div>
                    </div>
                </aside>

                <main className="min-w-0 flex-1 pb-24 lg:pb-0">{children}</main>
            </div>
        </div>
    );
}
