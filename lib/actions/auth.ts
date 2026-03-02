"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { z } from "zod";

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
});

const registerSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
    displayName: z.string().min(1).max(50),
});

export async function loginAction(formData: FormData) {
    const parsed = loginSchema.safeParse({
        email: formData.get("email"),
        password: formData.get("password"),
    });
    if (!parsed.success) return { error: "请填写有效的邮箱和密码（至少6位）" };

    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword(parsed.data);
    if (error) return { error: "邮箱或密码错误" };

    redirect("/dashboard");
}

export async function registerAction(formData: FormData) {
    const parsed = registerSchema.safeParse({
        email: formData.get("email"),
        password: formData.get("password"),
        displayName: formData.get("displayName"),
    });
    if (!parsed.success) return { error: "请检查输入格式" };

    const supabase = await createClient();

    const { data, error } = await supabase.auth.signUp({
        email: parsed.data.email,
        password: parsed.data.password,
    });
    if (error) return { error: error.message };
    if (!data.user) return { error: "注册失败，请重试" };

    // Check if this is the first user (becomes SuperAdmin via DB trigger)
    // Update display_name
    await supabase.from("profiles").upsert({
        id: data.user.id,
        display_name: parsed.data.displayName,
    });

    redirect("/dashboard");
}

export async function logoutAction() {
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect("/");
}

export async function getCurrentUser() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

    return profile;
}
