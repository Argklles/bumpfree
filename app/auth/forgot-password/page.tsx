"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { requestPasswordResetAction } from "@/lib/actions/auth";
import { Loader2, MailCheck } from "lucide-react";
import { toast } from "sonner";
import { AuthShell } from "@/components/auth/AuthShell";

export default function ForgotPasswordPage() {
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string>("");
    const [successMessage, setSuccessMessage] = useState<string>("");

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError("");
        setSuccessMessage("");
        const formData = new FormData(e.currentTarget);
        startTransition(async () => {
            const result = await requestPasswordResetAction(formData);
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
            title="找回密码"
            description="输入你的注册邮箱，我们会向你发送一封安全重置邮件。"
            badge="密码恢复"
            panelTitle="把账户恢复流程做得足够清晰，也是在保护协作体验。"
            panelDescription="密码重置后，你依然可以安全地回到原有的 Room、邀请和课表视图，不必重新整理协作空间。"
        >
            {successMessage ? (
                <div className="space-y-5 py-2 text-center">
                    <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary/12 text-primary">
                        <MailCheck className="size-6" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-xl font-semibold">重置邮件已发送</h3>
                        <p className="text-sm leading-6 text-muted-foreground">{successMessage}</p>
                    </div>
                    <Button asChild size="lg" variant="outline" className="w-full">
                        <Link href="/auth/login">返回登录</Link>
                    </Button>
                </div>
            ) : (
                <>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">邮箱</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="请输入注册邮箱"
                                required
                                autoComplete="email"
                            />
                        </div>
                        {error && <p className="rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}
                        <Button type="submit" size="lg" className="w-full" disabled={isPending}>
                            {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
                            发送重置链接
                        </Button>
                    </form>
                    <div className="text-center text-sm text-muted-foreground">
                        <Link href="/auth/login" className="font-medium text-primary hover:underline">
                            返回登录
                        </Link>
                    </div>
                </>
            )}
        </AuthShell>
    );
}
