"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { registerAction } from "@/lib/actions/auth";
import { Loader2, MailCheck } from "lucide-react";
import { toast } from "sonner";
import { AuthShell } from "@/components/auth/AuthShell";

export default function RegisterPage() {
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string>("");
    const [successMessage, setSuccessMessage] = useState<string>("");

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError("");
        setSuccessMessage("");
        const formData = new FormData(e.currentTarget);
        startTransition(async () => {
            const result = await registerAction(formData);
            if (result?.error) {
                setError(result.error);
                toast.error(result.error);
            } else if (result?.success && result?.message) {
                setSuccessMessage(result.message);
                toast.success(result.message);
            }
        });
    }

    return (
        <AuthShell
            title="创建账号"
            description="加入 BumpFree，开始管理个人课表并快速发起多人协作。"
            badge="免费注册"
            panelTitle="导入课表之后，你会第一次真正看见团队节奏。"
            panelDescription="注册后即可导入 WakeUp 课表、创建 Room、邀请成员，并把反复沟通的时间成本压缩成一次可视化判断。"
        >
            {successMessage ? (
                <div className="space-y-5 py-2 text-center">
                    <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary/12 text-primary">
                        <MailCheck className="size-6" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-xl font-semibold">验证邮件已发送</h3>
                        <p className="text-sm leading-6 text-muted-foreground">{successMessage}</p>
                    </div>
                    <Button asChild size="lg" variant="outline" className="w-full">
                        <Link href="/auth/login">前往登录</Link>
                    </Button>
                </div>
            ) : (
                <>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="displayName">昵称</Label>
                            <Input
                                id="displayName"
                                name="displayName"
                                placeholder="你希望展示给成员的名字"
                                required
                                maxLength={50}
                            />
                        </div>
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
                            <Label htmlFor="password">密码</Label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                placeholder="至少 6 位"
                                required
                                minLength={6}
                                autoComplete="new-password"
                            />
                        </div>
                        {error && <p className="rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}
                        <Button type="submit" size="lg" className="w-full" disabled={isPending}>
                            {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
                            创建账号
                        </Button>
                    </form>
                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                        <span>已有账号？</span>
                        <Link href="/auth/login" className="font-medium text-primary hover:underline">
                            直接登录
                        </Link>
                    </div>
                </>
            )}
        </AuthShell>
    );
}
