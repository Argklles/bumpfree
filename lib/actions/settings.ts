"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateProfileAction(formData: FormData) {
    const displayName = formData.get("displayName") as string;
    if (!displayName || displayName.trim() === "") {
        return { error: "昵称不能为空" };
    }

    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { error: "未登录" };

    const { error } = await supabase
        .from("profiles")
        .update({ display_name: displayName.trim() })
        .eq("id", user.id);

    if (error) return { error: "保存失败：" + error.message };

    revalidatePath("/dashboard/settings");
    revalidatePath("/dashboard");
    return { success: true };
}

export async function updateAuthAction(formData: FormData) {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const updates: { email?: string; password?: string } = {};

    if (email && email.trim() !== "") {
        updates.email = email.trim();
    }

    if (password && password.trim() !== "") {
        if (password.length < 6) {
            return { error: "密码长度不能少于 6 位" };
        }
        updates.password = password;
    }

    if (Object.keys(updates).length === 0) {
        return { error: "没有需要更新的信息" };
    }

    const supabase = await createClient();

    // Supabase auth.updateUser will automatically handle sending confirmation emails if necessary
    const { error } = await supabase.auth.updateUser(updates);

    if (error) {
        return { error: "更新失败：" + error.message };
    }

    revalidatePath("/dashboard/settings");
    return { success: true, message: updates.email ? "已发送确认邮件，请查收，密码已更新。" : "更新成功" };
}
