"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const colorSchema = z.string().regex(/^#([0-9A-Fa-f]{3}){1,2}$/, "无效的颜色格式");

export async function updateMemberColor(roomId: string, targetUserId: string, newColor: string) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { error: "未登录" };

    const parsedColor = colorSchema.safeParse(newColor);
    if (!parsedColor.success) {
        return { error: parsedColor.error.issues[0]?.message || "颜色格式不正确" };
    }

    // Check permissions: Must be either the target user themselves OR the room admin
    let canEdit = user.id === targetUserId;

    if (!canEdit) {
        // Check if current user is admin of the room
        const { data: room } = await supabase
            .from("rooms")
            .select("admin_id")
            .eq("id", roomId)
            .single();

        if (room && room.admin_id === user.id) {
            canEdit = true;
        }
    }

    if (!canEdit) {
        return { error: "你没有权限修改此用户的颜色" };
    }

    // Perform the update
    const { error } = await supabase
        .from("room_members")
        .update({ color: parsedColor.data })
        .eq("room_id", roomId)
        .eq("user_id", targetUserId);

    if (error) {
        console.error("[updateMemberColor] Error:", error);
        return { error: `无法更新颜色: ${error.message}` };
    }

    revalidatePath(`/room/${roomId}`);
    return { success: true };
}
