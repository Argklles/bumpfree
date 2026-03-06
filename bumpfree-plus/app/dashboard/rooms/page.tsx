import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { CreateRoomDialog } from "@/components/dashboard/CreateRoomDialog";
import { RoomManageCard } from "@/components/dashboard/RoomManageCard";
import { DoorOpen } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";

export default async function RoomsPage() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) redirect("/auth/login");

    const [{ data: profile }, { data: rooms }] = await Promise.all([
        supabase.from("profiles").select("room_quota").eq("id", user.id).single(),
        supabase
            .from("rooms")
            .select("*, room_members(count)")
            .eq("admin_id", user.id)
            .order("created_at", { ascending: false }),
    ]);

    const quota = profile?.room_quota ?? 3;
    const roomCount = rooms?.length ?? 0;

    return (
        <div className="page-stack">
            <PageHeader
                eyebrow="Rooms"
                title="我的 Room"
                description="创建协作房间、邀请成员加入，并为每个房间控制公开访问和链接分享方式。"
                meta={
                    <p className="text-sm text-muted-foreground">
                        已创建 <span className="font-semibold text-foreground">{roomCount}</span> / {quota} 个 Room
                    </p>
                }
                actions={<CreateRoomDialog />}
            />

            {roomCount === 0 ? (
                <EmptyState
                    icon={<DoorOpen className="size-6" />}
                    title="还没有创建任何 Room"
                    description="从班委排班、社团例会到项目组对时，都可以先创建一个房间，再把成员拉进来统一看日历。"
                    action={<CreateRoomDialog />}
                />
            ) : (
                <div className="grid gap-4">
                    {rooms?.map((room) => (
                        <RoomManageCard key={room.id} room={room} />
                    ))}
                </div>
            )}
        </div>
    );
}
