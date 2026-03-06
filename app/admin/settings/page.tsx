import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Info } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";

export default async function AdminSettingsPage() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) redirect("/auth/login");

    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    if (profile?.role !== "superadmin") redirect("/dashboard");

    return (
        <div className="page-stack max-w-3xl">
            <PageHeader
                eyebrow="Admin"
                title="全站配置"
                description="当前版本暂时只开放系统信息查看与用户权限管理入口，更多全局配置仍建议在后续版本分模块开放。"
            />

            <Card>
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <Shield className="w-4 h-4" />
                        系统信息
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="flex items-center justify-between py-2 border-b border-border/60">
                        <span className="text-sm text-muted-foreground">当前版本</span>
                        <Badge variant="outline">v1.0.0</Badge>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-border/60">
                        <span className="text-sm text-muted-foreground">默认 Room 额度</span>
                        <Badge variant="outline">3 个 / 用户</Badge>
                    </div>
                    <div className="flex items-center justify-between py-2">
                        <span className="text-sm text-muted-foreground">新用户角色</span>
                        <Badge variant="outline">user</Badge>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <Info className="w-4 h-4" />
                        使用说明
                    </CardTitle>
                    <CardDescription>修改用户的 Room 额度或角色请前往用户管理页面操作</CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground space-y-2">
                    <p>• 第一个注册的用户自动成为 SuperAdmin</p>
                    <p>• SuperAdmin 可以在用户管理页面调整任意用户的 Room 创建额度</p>
                    <p>• 更多全局配置功能将在后续版本中开放</p>
                </CardContent>
            </Card>
        </div>
    );
}
