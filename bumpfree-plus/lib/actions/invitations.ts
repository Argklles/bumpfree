"use server";

import { createClient } from "@/lib/supabase/server";
import { getNextAvailableColor } from "@/lib/utils/colors";
import { revalidatePath } from "next/cache";

export async function getMyInvitations() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) return [];

    const { data } = await supabase
        .from("invitations")
        .select(
            "*, room:rooms(id, name, description), inviter:profiles!invitations_inviter_id_fkey(id, display_name)"
        )
        .eq("invitee_id", user.id)
        .eq("status", "pending")
        .order("created_at", { ascending: false });

    return data ?? [];
}

export async function acceptInvitation(invitationId: string) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { error: "请先登录" };

    // Get the invitation
    const { data: inv } = await supabase
        .from("invitations")
        .select("*")
        .eq("id", invitationId)
        .eq("invitee_id", user.id)
        .eq("status", "pending")
        .single();

    if (!inv) return { error: "邀请不存在或已处理" };

    // Get existing member colors in this room
    const { data: members } = await supabase
        .from("room_members")
        .select("color")
        .eq("room_id", inv.room_id);

    const usedColors = (members ?? []).map((m) => m.color);
    const assignedColor = getNextAvailableColor(usedColors);

    // Add to room_members
    const { error: memberErr } = await supabase.from("room_members").insert({
        room_id: inv.room_id,
        user_id: user.id,
        color: assignedColor,
    });

    if (memberErr) return { error: "加入 Room 失败" };

    // Update invitation status
    await supabase
        .from("invitations")
        .update({ status: "accepted" })
        .eq("id", invitationId);

    revalidatePath("/dashboard/invitations");
    return { success: true, roomId: inv.room_id };
}

export async function declineInvitation(invitationId: string) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { error: "请先登录" };

    const { error } = await supabase
        .from("invitations")
        .update({ status: "declined" })
        .eq("id", invitationId)
        .eq("invitee_id", user.id);

    if (error) return { error: "操作失败" };
    revalidatePath("/dashboard/invitations");
    return { success: true };
}
