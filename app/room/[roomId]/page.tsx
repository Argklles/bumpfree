import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import { RoomCalendar } from "@/components/calendar/RoomCalendar";
import { Badge } from "@/components/ui/badge";
import { Lock, Globe, Users } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Zap } from "lucide-react";
import { FEATURES } from "@/plugins/features";

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
        // Logged in but not a member
        return (
            <div className="min-h-screen flex items-center justify-center bg-background px-4">
                <div className="text-center max-w-sm">
                    <Lock className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <h1 className="text-xl font-semibold mb-2">无访问权限</h1>
                    <p className="text-muted-foreground text-sm mb-6">
                        你需要是该 Room 的成员才能查看日历。请联系 Room 管理员获取邀请。
                    </p>
                    <Link href="/dashboard">
                        <Button variant="outline">返回 Dashboard</Button>
                    </Link>
                </div>
            </div>
        );
    }

    // Get all members and their active schedules + courses
    const { data: members } = await supabase
        .from("room_members")
        .select("user_id, color, profile:profiles(id, display_name)")
        .eq("room_id", roomId);

    // For each member, get their active schedule and courses
    const memberData = await Promise.all(
        (members ?? []).map(async (member) => {
            const { data: schedule } = await supabase
                .from("schedules")
                .select("id, semester_tag, start_date, max_weeks")
                .eq("user_id", member.user_id)
                .eq("is_active", true)
                .single();

            if (!schedule) return null;

            const { data: courses } = await supabase
                .from("courses")
                .select("*")
                .eq("schedule_id", schedule.id)
                .eq("user_id", member.user_id);

            const profile = Array.isArray(member.profile) ? member.profile[0] : member.profile;

            return {
                userId: member.user_id,
                displayName: (profile as { display_name: string | null } | null)?.display_name ?? "未知用户",
                color: member.color,
                schedule,
                courses: courses ?? [],
            };
        })
    );

    const validMemberData = memberData.filter(Boolean) as NonNullable<typeof memberData[0]>[];

    // [Feature: PENDING_EVENTS] Get room pending events
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let roomEvents: any[] = [];
    if (FEATURES.PENDING_EVENTS) {
        const { data } = await supabase
            .from("room_events")
            .select("*")
            .eq("room_id", roomId)
            .neq("status", "cancelled")
            .order("start_time", { ascending: true });
        roomEvents = data ?? [];
    }

    return (
        <div className="min-h-screen bg-background flex flex-col">
            {/* Header */}
            <header className="border-b border-border/60 sticky top-0 z-40 bg-background/80 backdrop-blur">
                <div className="max-w-screen-xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                        <Link href="/" className="flex items-center gap-1.5 flex-shrink-0">
                            <Zap className="w-4 h-4 text-primary" />
                            <span className="font-semibold text-sm hidden sm:block">BumpFree</span>
                        </Link>
                        <span className="text-border">/</span>
                        <h1 className="font-semibold text-sm truncate">{room.name}</h1>
                        {room.is_public && !isMember && (
                            <Badge variant="secondary" className="text-xs gap-1 flex-shrink-0">
                                <Globe className="w-3 h-3" />只读
                            </Badge>
                        )}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Users className="w-4 h-4" />
                            <span>{validMemberData.length}</span>
                        </div>
                        {/* Member color dots */}
                        <div className="flex -space-x-1">
                            {validMemberData.slice(0, 5).map((m) => (
                                <div
                                    key={m.userId}
                                    className="w-6 h-6 rounded-full border-2 border-background"
                                    style={{ backgroundColor: m.color }}
                                    title={m.displayName}
                                />
                            ))}
                        </div>
                        {user ? (
                            <Link href="/dashboard">
                                <Button variant="outline" size="sm">Dashboard</Button>
                            </Link>
                        ) : (
                            <Link href="/auth/login">
                                <Button variant="outline" size="sm">登录</Button>
                            </Link>
                        )}
                    </div>
                </div>
            </header>

            {/* Calendar */}
            <main className="flex-1 overflow-hidden">
                <RoomCalendar
                    memberData={validMemberData}
                    roomName={room.name}
                    isReadOnly={!isMember}
                    currentUser={user}
                    roomAdminId={room.admin_id}
                    roomBgImageUrl={room.bg_image_url}
                    {...(FEATURES.PENDING_EVENTS ? { roomEvents: roomEvents ?? [], roomId } : {})}
                />
            </main>
        </div>
    );
}
