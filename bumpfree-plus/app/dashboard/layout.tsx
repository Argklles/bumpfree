import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { logoutAction, getAuthenticatedUser, getCurrentUser } from "@/lib/actions/auth";
import {
    LogOut,
    Shield,
    Sparkles,
    Zap,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { AppNav } from "@/components/shared/AppNav";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const user = await getAuthenticatedUser();
    if (!user) redirect("/auth/login");

    const profile = await getCurrentUser();

    const isSuperAdmin = profile?.role === "superadmin";

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
                                <p className="text-xs text-muted-foreground">多人课表协作工作台</p>
                            </div>
                        </Link>

                        <div className="mt-5 rounded-[1.5rem] border border-border/70 bg-background/75 px-4 py-4">
                            <div className="flex items-center gap-2 text-sm font-semibold">
                                <Sparkles className="size-4 text-primary" />
                                今日协作建议
                            </div>
                            <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                先维护你的课表，再进入 Room 邀请成员，后续所有聚合视图都会更稳定。
                            </p>
                        </div>
                    </div>

                    <div className="glass-panel px-3 py-3">
                        <AppNav type="dashboard" />
                        {isSuperAdmin && (
                            <>
                                <Separator className="my-3" />
                                <Button asChild variant="outline" className="w-full justify-start">
                                    <Link href="/admin/users">
                                        <Shield className="size-4" />
                                        进入管理后台
                                    </Link>
                                </Button>
                            </>
                        )}
                    </div>

                    <div className="glass-panel mt-auto px-4 py-4">
                        <div className="rounded-[1.4rem] border border-border/70 bg-background/75 px-4 py-4">
                            <p className="text-sm font-semibold">{profile?.display_name ?? user.email}</p>
                            <p className="mt-1 text-xs text-muted-foreground">
                                {isSuperAdmin ? "超级管理员账号" : "普通协作账号"}
                            </p>
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

                <div className="flex min-w-0 flex-1 flex-col">
                    <header className="glass-panel sticky top-4 z-30 mb-4 px-4 py-3 lg:hidden">
                        <div className="flex items-center justify-between gap-3">
                            <Link href="/" className="flex items-center gap-3">
                                <span className="flex size-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                                    <Zap className="size-4" />
                                </span>
                                <div>
                                    <p className="font-semibold">BumpFree</p>
                                    <p className="text-xs text-muted-foreground">{profile?.display_name ?? user.email}</p>
                                </div>
                            </Link>
                            <div className="flex items-center gap-2">
                                <ThemeToggle />
                                <form action={logoutAction}>
                                    <Button type="submit" variant="outline" size="icon-sm" aria-label="退出登录">
                                        <LogOut className="size-4" />
                                    </Button>
                                </form>
                            </div>
                        </div>
                    </header>

                    <main className="min-w-0 flex-1 pb-24 lg:pb-0">{children}</main>

                    <div className="fixed inset-x-0 bottom-3 z-40 px-3 lg:hidden">
                        <div className="mx-auto max-w-xl">
                            <AppNav type="dashboard" mobile />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
