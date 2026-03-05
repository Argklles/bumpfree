"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const eventSchema = z.object({
    title: z.string().min(1, "请填写事件标题").max(200),
    description: z.string().max(1000).optional(),
    location: z.string().max(200).optional(),
    startTime: z.string().min(1, "请选择开始时间"),
    endTime: z.string().min(1, "请选择结束时间"),
});

export async function createRoomEvent(roomId: string, formData: FormData) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { error: "请先登录" };

    const parsed = eventSchema.safeParse({
        title: formData.get("title"),
        description: formData.get("description"),
        location: formData.get("location"),
        startTime: formData.get("startTime"),
        endTime: formData.get("endTime"),
    });

    if (!parsed.success) {
        return { error: parsed.error.issues[0]?.message || "表单数据无效" };
    }

    const { title, description, location, startTime, endTime } = parsed.data;

    if (new Date(endTime) <= new Date(startTime)) {
        return { error: "结束时间必须晚于开始时间" };
    }

    const { error } = await supabase.from("room_events").insert({
        room_id: roomId,
        creator_id: user.id,
        title,
        description: description || null,
        location: location || null,
        start_time: startTime,
        end_time: endTime,
        status: "pending",
    });

    if (error) {
        console.error("[createRoomEvent] Error:", error);
        return { error: `创建事件失败: ${error.message}` };
    }

    revalidatePath(`/room/${roomId}`);
    return { success: true };
}

export async function updateRoomEvent(
    eventId: string,
    roomId: string,
    data: {
        title?: string;
        description?: string | null;
        location?: string | null;
        startTime?: string;
        endTime?: string;
        status?: "pending" | "confirmed" | "cancelled";
    }
) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { error: "请先登录" };

    const updateData: Record<string, unknown> = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.location !== undefined) updateData.location = data.location;
    if (data.startTime !== undefined) updateData.start_time = data.startTime;
    if (data.endTime !== undefined) updateData.end_time = data.endTime;
    if (data.status !== undefined) updateData.status = data.status;

    const { error } = await supabase
        .from("room_events")
        .update(updateData)
        .eq("id", eventId);

    if (error) {
        console.error("[updateRoomEvent] Error:", error);
        return { error: `更新事件失败: ${error.message}` };
    }

    revalidatePath(`/room/${roomId}`);
    return { success: true };
}

export async function deleteRoomEvent(eventId: string, roomId: string) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { error: "请先登录" };

    const { error } = await supabase
        .from("room_events")
        .delete()
        .eq("id", eventId);

    if (error) {
        console.error("[deleteRoomEvent] Error:", error);
        return { error: `删除事件失败: ${error.message}` };
    }

    revalidatePath(`/room/${roomId}`);
    return { success: true };
}
