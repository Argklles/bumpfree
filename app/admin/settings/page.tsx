import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Info } from "lucide-react";
import { AppBackgroundSettings } from "@/components/admin/AppBackgroundSettings";
import { getAppSettings } from "@/plugins/app-settings/actions";

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

    const appSettings = await getAppSettings();

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold">全站配置</h1>
                <p className="text-muted-foreground text-sm mt-1">网站参数和系统信息</p>
            </div>

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

            {appSettings && <AppBackgroundSettings initialSettings={appSettings} />}

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
