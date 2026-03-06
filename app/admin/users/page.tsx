import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AdminUsersClient } from "@/components/admin/AdminUsersClient";
import { getGlobalStats } from "@/lib/actions/admin";
import { Users, DoorOpen } from "lucide-react";
import { PageWrapper } from "@/components/motion/PageWrapper";
import { PageHeader } from "@/components/shared/PageHeader";
import { MetricCard } from "@/components/shared/MetricCard";

export default async function AdminUsersPage() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) redirect("/auth/login");

    const { data: profiles } = await supabase
        .from("profiles")
        .select("id, display_name, role, room_quota, schedule_quota, created_at")
        .order("created_at", { ascending: false });

    const stats = await getGlobalStats();

    return (
        <PageWrapper className="page-stack max-w-5xl">
            <PageHeader
                eyebrow="Admin"
                title="用户管理"
                description="在这里统一管理用户角色、Room 配额和课表容量，所有更改都会立即作用到对应账号。"
            />

            <div className="grid gap-4 md:grid-cols-2">
                <MetricCard
                    icon={<Users className="size-5" />}
                    label="注册用户"
                    value={String(stats.userCount)}
                    hint="包含普通用户和超级管理员账号"
                />
                <MetricCard
                    icon={<DoorOpen className="size-5" />}
                    label="已创建 Room"
                    value={String(stats.roomCount)}
                    hint="用于衡量当前协作空间使用规模"
                />
            </div>

            <AdminUsersClient users={profiles ?? []} currentUserId={user.id} />
        </PageWrapper>
    );
}
