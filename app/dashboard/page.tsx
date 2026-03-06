import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { DoorOpen, Calendar, Mail, ArrowRight, Sparkles } from "lucide-react";
import { getAuthenticatedUser, getCurrentUser } from "@/lib/actions/auth";
import { getRelationItem } from "@/lib/utils";
import type { Room } from "@/lib/types";
import { MetricCard } from "@/components/shared/MetricCard";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";

type JoinedRoomPreview = Pick<Room, "id" | "name" | "is_public" | "created_at">;

export default async function DashboardPage() {
    const user = await getAuthenticatedUser();
    if (!user) redirect("/auth/login");

    const profile = await getCurrentUser();

    const supabase = await createClient();
    const [
        { count: roomCount },
        { count: scheduleCount },
        { count: invitationCount },
    ] = await Promise.all([
        supabase.from("rooms").select("*", { count: "exact", head: true }).eq("admin_id", user.id),
        supabase.from("schedules").select("*", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("invitations").select("*", { count: "exact", head: true }).eq("invitee_id", user.id).eq("status", "pending"),
    ]);

    // Get rooms the user is a member of
    const { data: memberRooms } = await supabase
        .from("room_members")
        .select("room:rooms(id, name, is_public, created_at)")
        .eq("user_id", user.id)
        .limit(5);

    const joinedRooms = (memberRooms ?? [])
        .map((memberRoom) => getRelationItem<JoinedRoomPreview>(memberRoom.room))
        .filter((room): room is JoinedRoomPreview => room !== null);

    return (
        <div className="page-stack">
            <PageHeader
                eyebrow="Dashboard"
                title={`你好，${profile?.display_name ?? "同学"}`}
                description="先看清你的课表容量、Room 协作状态和待处理邀请，再决定接下来要处理的事项。"
                meta={
                    profile?.role === "superadmin" ? (
                        <Badge variant="secondary" className="gap-1">
                            <Sparkles className="size-3.5" />
                            网站管理员
                        </Badge>
                    ) : undefined
                }
            />

            <div className="grid gap-4 md:grid-cols-3">
                <MetricCard
                    icon={<DoorOpen className="w-5 h-5" />}
                    label="我创建的 Room"
                    value={`${roomCount ?? 0} / ${profile?.room_quota ?? 3}`}
                    href="/dashboard/rooms"
                    hint="可以继续创建、管理成员并控制公开访问"
                />
                <MetricCard
                    icon={<Calendar className="w-5 h-5" />}
                    label="已导入学期"
                    value={String(scheduleCount ?? 0)}
                    href="/dashboard/profile"
                    hint="导入或切换学期后，Room 聚合视图会自动使用当前课表"
                />
                <MetricCard
                    icon={<Mail className="w-5 h-5" />}
                    label="待处理邀请"
                    value={String(invitationCount ?? 0)}
                    href="/dashboard/invitations"
                    emphasis={(invitationCount ?? 0) > 0}
                    hint={(invitationCount ?? 0) > 0 ? "建议优先处理邀请，避免错过协作安排" : "暂无待处理邀请"}
                />
            </div>

            <Card className="overflow-hidden">
                <CardHeader className="border-b border-border/60">
                    <CardTitle className="text-lg">我加入的 Room</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                    {joinedRooms.length === 0 ? (
                        <EmptyState
                            icon={<DoorOpen className="size-6" />}
                            title="你还没有加入任何 Room"
                            description="可以先创建自己的房间，也可以等待他人邀请你加入协作空间。"
                            action={
                                <Link href="/dashboard/rooms">
                                    <Button>去创建 Room</Button>
                                </Link>
                            }
                        />
                    ) : (
                        <div className="grid gap-3">
                            {joinedRooms.map((room) => (
                                <Link
                                    key={room.id}
                                    href={`/room/${room.id}`}
                                    className="soft-panel flex items-center justify-between px-4 py-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/25"
                                >
                                    <div className="flex min-w-0 items-center gap-3">
                                        <div className="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                                            <DoorOpen className="size-4" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-semibold">{room.name}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {room.is_public ? "支持公开只读访问" : "仅成员可访问"}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {room.is_public && <Badge variant="outline">公开</Badge>}
                                        <ArrowRight className="size-4 text-muted-foreground" />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
