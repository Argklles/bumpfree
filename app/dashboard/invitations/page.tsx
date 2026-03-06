import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { InvitationCard } from "@/components/dashboard/InvitationCard";
import { Mail } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { getRelationItem } from "@/lib/utils";
import type { Profile, Room } from "@/lib/types";

export default async function InvitationsPage() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) redirect("/auth/login");

    const { data: invitations } = await supabase
        .from("invitations")
        .select("*, room:rooms(id, name, description), inviter:profiles!invitations_inviter_id_fkey(id, display_name)")
        .eq("invitee_id", user.id)
        .eq("status", "pending")
        .order("created_at", { ascending: false });

    const normalizedInvitations = (invitations ?? []).map((invitation) => ({
        ...invitation,
        room: getRelationItem<Pick<Room, "id" | "name" | "description">>(invitation.room),
        inviter: getRelationItem<Pick<Profile, "id" | "display_name">>(invitation.inviter),
    }));

    return (
        <div className="page-stack">
            <PageHeader
                eyebrow="Invitations"
                title="邀请通知"
                description="这里会集中显示待处理的 Room 邀请。接受后可以直接进入聚合日历，拒绝后也会自动清理列表。"
            />

            {normalizedInvitations.length === 0 ? (
                <EmptyState
                    icon={<Mail className="size-6" />}
                    title="暂无待处理邀请"
                    description="当有人邀请你加入 Room 时，这里会出现新的待处理项。"
                />
            ) : (
                <div className="grid gap-4">
                    {normalizedInvitations.map((inv) => (
                        <InvitationCard key={inv.id} invitation={inv} />
                    ))}
                </div>
            )}
        </div>
    );
}
