"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { registerAction } from "@/lib/actions/auth";
import { Zap, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function RegisterPage() {
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string>("");

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError("");
        const formData = new FormData(e.currentTarget);
        startTransition(async () => {
            const result = await registerAction(formData);
            if (result?.error) {
                setError(result.error);
                toast.error(result.error);
            }
        });
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4">
            <div className="w-full max-w-sm">
                <div className="flex items-center justify-center gap-2 mb-8">
                    <Zap className="w-6 h-6 text-primary" />
                    <span className="text-xl font-semibold">BumpFree</span>
                </div>
                <Card>
                    <CardHeader className="text-center">
                        <CardTitle>创建账号</CardTitle>
                        <CardDescription>加入 BumpFree，开始找共同空闲</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="displayName">昵称</Label>
                                <Input
                                    id="displayName"
                                    name="displayName"
                                    placeholder="你的名字"
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
                                    placeholder="至少6位"
                                    required
                                    minLength={6}
                                    autoComplete="new-password"
                                />
                            </div>
                            {error && <p className="text-sm text-destructive">{error}</p>}
                            <Button type="submit" className="w-full" disabled={isPending}>
                                {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                注册
                            </Button>
                        </form>
                        <div className="mt-4 text-center text-sm text-muted-foreground">
                            已有账号？{" "}
                            <Link href="/auth/login" className="text-primary hover:underline">
                                直接登录
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
