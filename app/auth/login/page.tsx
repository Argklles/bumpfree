"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginAction } from "@/lib/actions/auth";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { AuthShell } from "@/components/auth/AuthShell";

export default function LoginPage() {
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string>("");

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError("");
        const formData = new FormData(e.currentTarget);
        startTransition(async () => {
            const result = await loginAction(formData);
            if (result?.error) {
                setError(result.error);
                toast.error(result.error);
            }
        });
    }

    return (
        <AuthShell
            title="欢迎回来"
            description="登录你的 BumpFree 账号，继续管理课表与 Room 协作。"
            badge="账号登录"
            panelTitle="把所有人的课表，收拢成一次清晰决策。"
            panelDescription="登录后你可以继续导入课表、管理房间成员、接受邀请，并在聚合日历中直接看到团队重叠时间。"
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="email">邮箱</Label>
                    <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="you@example.com"
                        required
                        autoComplete="email"
                    />
                </div>
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="password">密码</Label>
                        <Link href="/auth/forgot-password" className="text-xs font-medium text-primary hover:underline">
                            忘记密码？
                        </Link>
                    </div>
                    <Input
                        id="password"
                        name="password"
                        type="password"
                        placeholder="请输入登录密码"
                        required
                        autoComplete="current-password"
                    />
                </div>
                {error && <p className="rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}
                <Button type="submit" size="lg" className="w-full" disabled={isPending}>
                    {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
                    登录并进入工作台
                </Button>
            </form>

            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <span>还没有账号？</span>
                <Link href="/auth/register" className="font-medium text-primary hover:underline">
                    免费注册
                </Link>
            </div>
        </AuthShell>
    );
}
