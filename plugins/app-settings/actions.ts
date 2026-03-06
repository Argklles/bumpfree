"use server";

import { createClient } from "@/lib/supabase/server";
import type { AppSettings, AppBgImage } from "@/lib/types";

export async function getAppSettings(): Promise<AppSettings | null> {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("app_settings")
        .select("*")
        .eq("id", 1)
        .single();

    if (error) {
        console.error("Failed to fetch app settings:", error);
        return null;
    }

    return data as AppSettings;
}

export async function updateAppSettings(updates: Partial<AppSettings>) {
    const supabase = await createClient();

    // Auth check - superadmin only
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { error: "未登录" };
    }

    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    if (profile?.role !== "superadmin") {
        return { error: "无权限：仅高级管理员可修改全局设定" };
    }

    const { error } = await supabase
        .from("app_settings")
        .update({
            ...updates,
            updated_at: new Date().toISOString()
        })
        .eq("id", 1);

    if (error) {
        console.error("Failed to update app settings:", error);
        return { error: error.message };
    }

    return { success: true };
}
