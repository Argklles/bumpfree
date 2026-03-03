"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requestPasswordResetAction } from "@/lib/actions/auth";
import { Zap, Loader2 } from "lucide-react";
import { toast } from "sonner";

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
        <div className="min-h-screen flex items-center justify-center bg-background px-4">
            <div className="w-full max-w-sm">
                <div className="flex items-center justify-center gap-2 mb-8">
                    <Zap className="w-6 h-6 text-primary" />
                    <span className="text-xl font-semibold">BumpFree</span>
                </div>
                <Card>
                    <CardHeader className="text-center">
                        <CardTitle>找回密码</CardTitle>
                        <CardDescription>查收邮件并重置你的密码</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {successMessage ? (
                            <div className="text-center py-6">
                                <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 dark:bg-green-900/30 dark:text-green-400">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-mail-check"><path d="M22 13V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12c0 1.1.9 2 2 2h8" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /><path d="m16 19 2 2 4-4" /></svg>
                                </div>
                                <h3 className="text-lg font-medium mb-2">邮件已发送</h3>
                                <p className="text-sm text-muted-foreground mb-6">
                                    {successMessage}
                                </p>
                                <Button asChild className="w-full" variant="outline">
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
                                            placeholder="预留的注册邮箱"
                                            required
                                            autoComplete="email"
                                        />
                                    </div>
                                    {error && <p className="text-sm text-destructive">{error}</p>}
                                    <Button type="submit" className="w-full" disabled={isPending}>
                                        {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                        发送重置链接
                                    </Button>
                                </form>
                                <div className="mt-4 text-center text-sm text-muted-foreground">
                                    <Link href="/auth/login" className="text-primary hover:underline">
                                        返回登录
                                    </Link>
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
