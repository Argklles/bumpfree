"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { AppSettings } from "@/lib/types";

export function AppBackground() {
    const pathname = usePathname();
    const [settings, setSettings] = useState<AppSettings | null>(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [mounted, setMounted] = useState(false);
    const [localOpacity, setLocalOpacity] = useState<number | null>(null);

    // 首次挂载：从 Supabase 直接拉取 app_settings
    useEffect(() => {
        setMounted(true);

        const storedOp = localStorage.getItem("room-bg-opacity");
        if (storedOp) {
            setLocalOpacity(parseFloat(storedOp));
        }

        const handleLocalOpacity = (e: Event) => {
            const ce = e as CustomEvent<number>;
            setLocalOpacity(ce.detail);
        };
        window.addEventListener("local-bg-opacity", handleLocalOpacity);

        // 客户端直接查数据库，绕过 Server Component 缓存
        const supabase = createClient();
        supabase
            .from("app_settings")
            .select("*")
            .eq("id", 1)
            .single()
            .then(({ data, error }) => {
                if (!error && data) {
                    setSettings(data as AppSettings);
                }
            });

        return () => window.removeEventListener("local-bg-opacity", handleLocalOpacity);
    }, []);

    // 页面导航时切换背景图
    useEffect(() => {
        if (!settings || settings.bg_images.length <= 1) return;

        if (settings.bg_play_mode === "carousel") {
            const lastIdxStr = localStorage.getItem("app-bg-last-index");
            const lastIdx = lastIdxStr ? parseInt(lastIdxStr) : -1;
            const nextIdx = (lastIdx + 1) % settings.bg_images.length;
            setCurrentIndex(nextIdx);
            localStorage.setItem("app-bg-last-index", nextIdx.toString());
        } else if (settings.bg_play_mode === "random") {
            setCurrentIndex(Math.floor(Math.random() * settings.bg_images.length));
        }
    }, [pathname, settings]);

    if (!settings || settings.bg_images.length === 0 || !mounted) {
        return null;
    }

    // 根据当前路径决定是否展示背景
    // bg_locations 为管理员勾选的生效位置；未被勾选的页面类型不显示背景
    // 对于不属于 login / dashboard / room 的页面，默认始终显示
    const { bg_locations } = settings;

    const isLogin = pathname.startsWith("/login") || pathname.startsWith("/auth");
    const isDashboard = pathname.startsWith("/dashboard");
    const isRoom = pathname.startsWith("/room/");

    // 只有明确属于某个分类且该分类未被勾选时，才隐藏
    if (isLogin && !bg_locations.includes("login")) return null;
    if (isDashboard && !bg_locations.includes("dashboard")) return null;
    if (isRoom && !bg_locations.includes("room")) return null;

    const safeIndex = currentIndex % settings.bg_images.length;
    const currentImageUrl = settings.bg_images[safeIndex]?.url;

    if (!currentImageUrl) return null;

    return (
        <div
            className="fixed inset-0 pointer-events-none transition-opacity duration-1000 ease-in-out"
            style={{
                backgroundImage: `url(${currentImageUrl})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                opacity: localOpacity !== null ? localOpacity : settings.bg_opacity,
                zIndex: 0,
            }}
        />
    );
}
