"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const updateQuotaSchema = z.object({
    userId: z.string().uuid(),
    roomQuota: z.coerce.number().min(0).max(100),
});

async function assertSuperAdmin() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    if (!profile || profile.role !== "superadmin") throw new Error("Forbidden");
    return supabase;
}

export async function getAllUsers() {
    const supabase = await assertSuperAdmin();

    const { data } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

    return data ?? [];
}

export async function updateUserQuota(formData: FormData) {
    const supabase = await assertSuperAdmin();

    const parsed = updateQuotaSchema.safeParse({
        userId: formData.get("userId"),
        roomQuota: formData.get("roomQuota"),
    });
    if (!parsed.success) return { error: "无效参数" };

    const { error } = await supabase
        .from("profiles")
        .update({ room_quota: parsed.data.roomQuota })
        .eq("id", parsed.data.userId);

    if (error) return { error: "更新失败" };
    revalidatePath("/admin/users");
    return { success: true };
}

export async function toggleUserRole(userId: string, currentRole: string) {
    const supabase = await assertSuperAdmin();
    const newRole = currentRole === "superadmin" ? "user" : "superadmin";

    const { error } = await supabase
        .from("profiles")
        .update({ role: newRole })
        .eq("id", userId);

    if (error) return { error: "更新失败" };
    revalidatePath("/admin/users");
    return { success: true };
}

export async function getGlobalStats() {
    const supabase = await assertSuperAdmin();

    const [{ count: userCount }, { count: roomCount }] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("rooms").select("*", { count: "exact", head: true }),
    ]);

    return { userCount: userCount ?? 0, roomCount: roomCount ?? 0 };
}
