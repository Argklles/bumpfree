-- ============================================================
-- 插件模块：公共课表设置与全局系统配置 (Room Settings & App Settings)
-- 说明：包含系统级的全局背景图配置（app_settings），Storage 存储策略，
--       以及修复房间成员互相可见彼此颜色的 RLS 更新补丁。
-- ============================================================

-- ============================================================
-- 第一部分：App级全局背景配置表与存储 (原 003_app_settings)
-- ============================================================

-- 1. 创建 app_settings 表
CREATE TABLE IF NOT EXISTS public.app_settings (
    id int PRIMARY KEY DEFAULT 1 CHECK (id = 1), -- 保证全站只有一条配置记录
    bg_images jsonb NOT NULL DEFAULT '[]'::jsonb, -- 存放图片对象的数组: [{ url: string, name: string }]
    bg_play_mode text NOT NULL DEFAULT 'single' CHECK (bg_play_mode IN ('single', 'carousel', 'random')),
    bg_locations jsonb NOT NULL DEFAULT '["room", "login", "dashboard"]'::jsonb,
    bg_opacity numeric NOT NULL DEFAULT 0.12,
    updated_at timestamptz DEFAULT now()
);

-- 初始化唯一一条记录
INSERT INTO public.app_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- 2. 为 app_settings 启用 RLS
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- 2.1 所有人都可以读取系统配置
DROP POLICY IF EXISTS "Public can read app settings" ON public.app_settings;
CREATE POLICY "Public can read app settings"
ON public.app_settings FOR SELECT
USING (true);

-- 2.2 只有超级管理员 (superadmin) 可以修改系统配置
DROP POLICY IF EXISTS "Superadmin can update app settings" ON public.app_settings;
CREATE POLICY "Superadmin can update app settings"
ON public.app_settings FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() 
        AND role = 'superadmin'
    )
);

-- 3. 创建 app-backgrounds 存储桶
INSERT INTO storage.buckets (id, name, public) 
VALUES ('app-backgrounds', 'app-backgrounds', true)
ON CONFLICT (id) DO NOTHING;

-- 注意：Supabase Storage 的 objects 默认已挂载 RLS，无需 ENABLE ROW LEVEL SECURITY。

-- 3.1 所有人都可以查看全局背景图片
DROP POLICY IF EXISTS "Public app bg access" ON storage.objects;
CREATE POLICY "Public app bg access" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'app-backgrounds');

-- 3.2 只有 superadmin 可以上传、修改、删除
DROP POLICY IF EXISTS "Superadmin app bg upload" ON storage.objects;
CREATE POLICY "Superadmin app bg upload" 
ON storage.objects FOR INSERT 
TO authenticated
WITH CHECK (
    bucket_id = 'app-backgrounds'
    AND EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() 
        AND role = 'superadmin'
    )
);

DROP POLICY IF EXISTS "Superadmin app bg update" ON storage.objects;
CREATE POLICY "Superadmin app bg update" 
ON storage.objects FOR UPDATE 
TO authenticated
USING (
    bucket_id = 'app-backgrounds'
    AND EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() 
        AND role = 'superadmin'
    )
);

DROP POLICY IF EXISTS "Superadmin app bg delete" ON storage.objects;
CREATE POLICY "Superadmin app bg delete" 
ON storage.objects FOR DELETE 
TO authenticated
USING (
    bucket_id = 'app-backgrounds'
    AND EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() 
        AND role = 'superadmin'
    )
);

-- ============================================================
-- 第二部分：修复房间成员间资料查询及颜色可见性的 Bug (原 005_fix_room_members_select_policy)
-- ============================================================
-- 问题根源: 之前的 room_members_select 策略仅允许普通用户查询自己所在行的成员信息。
--          这阻止了前端在这个房间中去加载其他成员的自定义颜色及他们相关的课程时间表。
-- 修复方式：重新定义策略，只要该用户本人是这个房间的成员（使用 bypass RLS 的 SD 函数），
--          即可拥有拉取当前房间所有人的 SELECT 权限。

drop policy if exists "room_members_select" on public.room_members;

create policy "room_members_select" on public.room_members for select using (
  public.is_room_member_sd(room_id)
  or public.is_room_admin_or_public_sd(room_id)
);
