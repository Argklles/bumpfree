"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updatePasswordFromRecoveryAction } from "@/lib/actions/auth";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { AuthShell } from "@/components/auth/AuthShell";

export default function UpdatePasswordPage() {
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string>("");

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError("");
        const formData = new FormData(e.currentTarget);

        const password = formData.get("password") as string;
        const confirmPassword = formData.get("confirmPassword") as string;

        if (password !== confirmPassword) {
            setError("两次输入的密码不一致");
            return;
        }

        startTransition(async () => {
            const result = await updatePasswordFromRecoveryAction(formData);
            if (result?.error) {
                setError(result.error);
                toast.error(result.error);
            }
        });
    }

    return (
        <AuthShell
            title="设置新密码"
            description="为了保护账号安全，请设置一个新的登录密码。"
            badge="重置密码"
            panelTitle="账号安全稳定，协作流程才不会被反复打断。"
            panelDescription="更新密码后即可直接回到你的课表、Room 和邀请列表，继续使用原有协作空间。"
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="password">新密码</Label>
                    <Input
                        id="password"
                        name="password"
                        type="password"
                        placeholder="至少 6 位"
                        required
                        minLength={6}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="confirmPassword">确认新密码</Label>
                    <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        placeholder="再次输入密码"
                        required
                        minLength={6}
                    />
                </div>
                {error && <p className="rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}
                <Button type="submit" size="lg" className="w-full" disabled={isPending}>
                    {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
                    确认修改
                </Button>
            </form>
        </AuthShell>
    );
}
