import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import { RoomCalendar } from "@/components/calendar/RoomCalendar";
import { Badge } from "@/components/ui/badge";
import { Lock, Globe, Users, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Zap } from "lucide-react";
import { getRelationItem } from "@/lib/utils";
import type { Course, Profile, Schedule } from "@/lib/types";
import { EmptyState } from "@/components/shared/EmptyState";

type ActiveScheduleRow = Pick<Schedule, "id" | "user_id" | "semester_tag" | "start_date" | "max_weeks">;
type MemberProfilePreview = Pick<Profile, "id" | "display_name">;

interface RoomPageProps {
    params: Promise<{ roomId: string }>;
}

export default async function RoomPage({ params }: RoomPageProps) {
    const { roomId } = await params;
    const supabase = await createClient();

    // Get current user
    const {
        data: { user },
    } = await supabase.auth.getUser();

    // Get room info
    const { data: room } = await supabase
        .from("rooms")
        .select("*")
        .eq("id", roomId)
        .single();

    if (!room) notFound();

    // Access check: must be member OR room is public
    let isMember = false;
    if (user) {
        const { data: membership } = await supabase
            .from("room_members")
            .select("color")
            .eq("room_id", roomId)
            .eq("user_id", user.id)
            .single();
        isMember = !!membership;
    }

    if (!isMember && !room.is_public) {
        if (!user) redirect("/auth/login");
        return (
            <div className="page-shell flex min-h-screen items-center py-8">
                <EmptyState
                    icon={<Lock className="size-6" />}
                    title="无访问权限"
                    description="你需要成为该 Room 的成员后才能查看聚合日历。请联系房主发送邀请。"
                    action={
                        <Link href="/dashboard">
                            <Button variant="outline">返回 Dashboard</Button>
                        </Link>
                    }
                    className="w-full"
                />
            </div>
        );
    }

    // Get all members with profiles
    const { data: members } = await supabase
        .from("room_members")
        .select("user_id, color, profile:profiles(id, display_name)")
        .eq("room_id", roomId);

    const memberList = members ?? [];
    const memberUserIds = memberList.map((m) => m.user_id);

    // Batch: get all active schedules for all members at once
    const { data: allSchedules } = memberUserIds.length > 0
        ? await supabase
            .from("schedules")
            .select("id, user_id, semester_tag, start_date, max_weeks")
            .in("user_id", memberUserIds)
            .eq("is_active", true)
        : { data: [] };

    const schedulesByUser = new Map<string, ActiveScheduleRow>();
    for (const s of allSchedules ?? []) {
        schedulesByUser.set(s.user_id, s);
    }

    // Batch: get all courses for active schedules at once
    const activeScheduleIds = (allSchedules ?? []).map((s) => s.id);
    const { data: allCourses } = activeScheduleIds.length > 0
        ? await supabase
            .from("courses")
            .select("*")
            .in("schedule_id", activeScheduleIds)
        : { data: [] };

    const coursesBySchedule = new Map<string, Course[]>();
    for (const c of allCourses ?? []) {
        const existing = coursesBySchedule.get(c.schedule_id) ?? [];
        existing.push(c);
        coursesBySchedule.set(c.schedule_id, existing);
    }

    // Assemble member data without N+1 queries
    const validMemberData = memberList
        .map((member) => {
            const schedule = schedulesByUser.get(member.user_id);
            if (!schedule) return null;

            const profile = getRelationItem<MemberProfilePreview>(member.profile);

            return {
                userId: member.user_id,
                displayName: profile?.display_name ?? "未知用户",
                color: member.color,
                schedule,
                courses: coursesBySchedule.get(schedule.id) ?? [],
            };
        })
        .filter(Boolean) as {
            userId: string;
            displayName: string;
            color: string;
            schedule: ActiveScheduleRow;
            courses: Course[];
        }[];

    return (
        <div className="page-shell page-stack min-h-screen py-4 md:py-6">
            <div className="glass-panel px-5 py-5 md:px-6">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 space-y-4">
                        <div className="flex flex-wrap items-center gap-3">
                            <Link href={user ? "/dashboard" : "/"} className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
                                <ArrowLeft className="size-4" />
                                {user ? "返回工作台" : "返回首页"}
                            </Link>
                            <span className="hidden text-border md:inline">/</span>
                            <span className="inline-flex items-center gap-2 text-sm font-semibold">
                                <span className="flex size-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                    <Zap className="size-4" />
                                </span>
                                Room
                            </span>
                        </div>
                        <div className="space-y-3">
                            <div className="flex flex-wrap items-center gap-2">
                                <h1 className="text-3xl font-semibold tracking-tight">{room.name}</h1>
                                {room.is_public && !isMember && (
                                    <Badge variant="secondary" className="gap-1">
                                        <Globe className="size-3.5" />
                                        公开只读
                                    </Badge>
                                )}
                                {!room.is_public && (
                                    <Badge variant="outline" className="gap-1">
                                        <Lock className="size-3.5" />
                                        私密 Room
                                    </Badge>
                                )}
                            </div>
                            <p className="max-w-2xl text-sm leading-7 text-muted-foreground">
                                {room.description || "通过聚合日历查看成员课表重叠区，快速决策适合所有人的时间。"}
                            </p>
                        </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2 lg:min-w-[320px]">
                        <div className="soft-panel px-4 py-4">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Users className="size-4" />
                                成员数量
                            </div>
                            <p className="mt-2 text-2xl font-semibold">{validMemberData.length}</p>
                        </div>
                        <div className="soft-panel px-4 py-4">
                            <div className="text-sm text-muted-foreground">访问状态</div>
                            <p className="mt-2 text-base font-semibold">
                                {isMember ? "成员可编辑上下文" : "访客只读查看"}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="mt-5 flex flex-wrap items-center gap-2">
                    {validMemberData.slice(0, 8).map((member) => (
                        <div
                            key={member.userId}
                            className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/80 px-3 py-2 text-sm"
                        >
                            <span className="size-2.5 rounded-full" style={{ backgroundColor: member.color }} />
                            <span>{member.displayName}</span>
                        </div>
                    ))}
                </div>
            </div>

            <RoomCalendar
                memberData={validMemberData}
                roomName={room.name}
                isReadOnly={!isMember}
            />
        </div>
    );
}
