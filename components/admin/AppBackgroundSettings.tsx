"use client";

import { useState, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { updateAppSettings } from "@/plugins/app-settings/actions";
import type { AppSettings, AppBgImage } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { ImagePlus, X, Loader2, Save } from "lucide-react";
import { toast } from "sonner";

export function AppBackgroundSettings({ initialSettings }: { initialSettings: AppSettings }) {
    const [settings, setSettings] = useState<AppSettings>(initialSettings);
    const [isPending, startTransition] = useTransition();
    const [uploading, setUploading] = useState(false);
    const [showAllImages, setShowAllImages] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();
    const supabase = createClient();

    const handleSave = () => {
        startTransition(async () => {
            const { error } = await updateAppSettings({
                bg_images: settings.bg_images,
                bg_play_mode: settings.bg_play_mode,
                bg_locations: settings.bg_locations,
                bg_opacity: settings.bg_opacity
            });
            if (error) {
                toast.error(error);
            } else {
                toast.success("全局背景设置已保存");
                router.refresh();
            }
        });
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        // Filter valid files
        const validFiles = Array.from(files).filter(file => {
            if (file.size > 5 * 1024 * 1024) {
                toast.error(`文件 ${file.name} 超过 5MB，被跳过`);
                return false;
            }
            return true;
        });

        if (validFiles.length === 0) return;

        setUploading(true);
        toast.info(`正在上传 ${validFiles.length} 张图片...`);

        try {
            const uploadPromises = validFiles.map(async (file) => {
                const fileExt = file.name.split('.').pop();
                const fileName = `bg-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

                const { error: uploadError, data } = await supabase.storage
                    .from("app-backgrounds")
                    .upload(fileName, file, { upsert: true });

                if (uploadError) throw new Error(uploadError.message);

                const { data: { publicUrl } } = supabase.storage
                    .from("app-backgrounds")
                    .getPublicUrl(data.path);

                return { url: publicUrl, name: file.name } as AppBgImage;
            });

            // Wait for all uploads to finish
            const newImages = await Promise.all(uploadPromises);

            setSettings(prev => ({ ...prev, bg_images: [...prev.bg_images, ...newImages] }));
            toast.success(`成功添加 ${newImages.length} 张图片，请点击保存`);

        } catch (err: any) {
            console.error("Upload error:", err);
            toast.error("部分或全部图片上传失败: " + (err.message || "未知错误"));
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const handleRemoveImage = (indexToRemove: number) => {
        setSettings(prev => ({
            ...prev,
            bg_images: prev.bg_images.filter((_, i) => i !== indexToRemove)
        }));
    };

    const handleLocationChange = (loc: string, checked: boolean) => {
        setSettings(prev => {
            const current = new Set(prev.bg_locations);
            if (checked) current.add(loc);
            else current.delete(loc);
            return { ...prev, bg_locations: Array.from(current) };
        });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base flex items-center justify-between">
                    <span>系统全局背景</span>
                    <Button onClick={handleSave} disabled={isPending || uploading} size="sm">
                        {isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                        保存设置
                    </Button>
                </CardTitle>
                <CardDescription>配置作用于全站（登录、概览、所有的Room）的背景轮播</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Images */}
                <div className="space-y-3">
                    <div className="flex justify-between items-center">
                        <Label>背景图库 ({settings.bg_images.length})</Label>
                        {settings.bg_images.length > 4 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowAllImages(!showAllImages)}
                                className="h-8 text-xs"
                            >
                                {showAllImages ? "收起图库" : "查看全部"}
                            </Button>
                        )}
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {(showAllImages ? settings.bg_images : settings.bg_images.slice(0, 4)).map((img, i) => (
                            <div key={i} className="relative group rounded-lg overflow-hidden border border-border aspect-video">
                                <img src={img.url} alt={img.name} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <Button variant="destructive" size="icon" onClick={() => handleRemoveImage(i)}>
                                        <X className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploading}
                            className="aspect-video rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-primary/50 hover:text-primary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {uploading ? <Loader2 className="w-6 h-6 animate-spin" /> : <ImagePlus className="w-6 h-6" />}
                            <span className="text-xs">上传图片</span>
                        </button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            onChange={handleUpload}
                        />
                    </div>
                </div>

                {/* Display Mode */}
                <div className="space-y-3">
                    <Label>播放模式</Label>
                    <RadioGroup
                        value={settings.bg_play_mode}
                        onValueChange={(val: 'single' | 'carousel' | 'random') => setSettings(p => ({ ...p, bg_play_mode: val }))}
                        className="flex gap-4"
                    >
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="single" id="r1" />
                            <Label htmlFor="r1" className="font-normal cursor-pointer">固定首图</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="carousel" id="r2" />
                            <Label htmlFor="r2" className="font-normal cursor-pointer">顺序轮播 (随页面更新)</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="random" id="r3" />
                            <Label htmlFor="r3" className="font-normal cursor-pointer">随机播放 (随页面更新)</Label>
                        </div>
                    </RadioGroup>
                </div>

                {/* Locations */}
                <div className="space-y-3">
                    <Label>生效位置</Label>
                    <div className="flex gap-6">
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="loc-login"
                                checked={settings.bg_locations.includes('login')}
                                onCheckedChange={(c: boolean | 'indeterminate') => handleLocationChange('login', !!c)}
                            />
                            <Label htmlFor="loc-login" className="font-normal cursor-pointer">登录页面</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="loc-dashboard"
                                checked={settings.bg_locations.includes('dashboard')}
                                onCheckedChange={(c: boolean | 'indeterminate') => handleLocationChange('dashboard', !!c)}
                            />
                            <Label htmlFor="loc-dashboard" className="font-normal cursor-pointer">概览面板</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="loc-room"
                                checked={settings.bg_locations.includes('room')}
                                onCheckedChange={(c: boolean | 'indeterminate') => handleLocationChange('room', !!c)}
                            />
                            <Label htmlFor="loc-room" className="font-normal cursor-pointer">日历房间 (可被本地覆盖)</Label>
                        </div>
                    </div>
                </div>

                {/* Opacity */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <Label>全局默认透明度</Label>
                        <span className="text-xs text-muted-foreground">{Math.round(settings.bg_opacity * 100)}%</span>
                    </div>
                    <Slider
                        value={[settings.bg_opacity * 100]}
                        min={0}
                        max={35}
                        step={1}
                        onValueChange={(v) => setSettings(p => ({ ...p, bg_opacity: v[0] / 100 }))}
                    />
                </div>
            </CardContent>
        </Card>
    );
}
