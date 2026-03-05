-- ============================================================
-- BumpFree: 支持全局背景图片
-- ============================================================

-- 1. 向 rooms 表中添加 bg_image_url (背景图片 URL) 字段
ALTER TABLE public.rooms ADD COLUMN IF NOT EXISTS bg_image_url text;

-- 2. 为 room-backgrounds 创建 Supabase Storage Bucket
-- 注意：必须在 Supabase 中开启 'storage' 相关服务。
INSERT INTO storage.buckets (id, name, public) 
VALUES ('room-backgrounds', 'room-backgrounds', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Storage 行级安全 (RLS) 策略配置
-- (注意：Supabase 默认已在 storage.objects 上启用 RLS，普通用户无需/无权手动执行 ALTER TABLE ENABLE ROW LEVEL SECURITY)

-- 3.1 公开访问 (只读)
-- 所有人都可以查看背景图片
DROP POLICY IF EXISTS "Public background access" ON storage.objects;
CREATE POLICY "Public background access" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'room-backgrounds');

-- 3.2 登录用户上传权限 (通过 owner 绑定)
-- 允许登录用户上传图片，Supabase 会自动将该对象的 owner_id 设为上传者的 auth.uid()
DROP POLICY IF EXISTS "Admin background upload" ON storage.objects;
CREATE POLICY "Admin background upload" 
ON storage.objects FOR INSERT 
TO authenticated
WITH CHECK (
    bucket_id = 'room-backgrounds'
);

-- 3.3 只能更新自己上传的图片
DROP POLICY IF EXISTS "Admin background update" ON storage.objects;
CREATE POLICY "Admin background update" 
ON storage.objects FOR UPDATE 
TO authenticated
USING (
    bucket_id = 'room-backgrounds'
    AND owner = auth.uid()
);

-- 3.4 只能删除自己上传的图片
DROP POLICY IF EXISTS "Admin background delete" ON storage.objects;
CREATE POLICY "Admin background delete" 
ON storage.objects FOR DELETE 
TO authenticated
USING (
    bucket_id = 'room-backgrounds'
    AND owner = auth.uid()
);
