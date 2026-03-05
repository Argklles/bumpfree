"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Settings, Loader2, ImagePlus, X } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { updateMemberColor } from "@/plugins/room-settings/actions";
import { updateRoomGlobalBg } from "@/plugins/room-settings/actions";
import { createClient } from "@/lib/supabase/client";
import type { RoomMember, Profile } from "@/lib/types";

// Need extended type to include displayName
export interface MemberWithDisplay extends RoomMember {
    displayName: string;
    userId: string;
}

interface RoomSettingsDialogProps {
    roomId: string;
    currentUser: any | null;
    roomAdminId: string;
    members: MemberWithDisplay[];
    currentFontSize: number;
    onFontSizeChange: (size: number) => void;
    currentFontColor: string;
    onFontColorChange: (color: string) => void;
    currentBgImage: string;
    onBgImageChange: (dataUrl: string) => void;
    roomBgImageUrl?: string | null;
}

const PRESET_COLORS = [
    "#ffffff", // White
    "#f8fafc", // Slate 50
    "#0f172a", // Slate 900
    "#000000", // Black
];

export function RoomSettingsDialog({
    roomId,
    currentUser,
    roomAdminId,
    members,
    currentFontSize,
    onFontSizeChange,
    currentFontColor,
    onFontColorChange,
    currentBgImage,
    onBgImageChange,
    roomBgImageUrl
}: RoomSettingsDialogProps) {
    const [open, setOpen] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [uploadingBg, setUploadingBg] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const globalBgInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();
    const supabase = createClient();

    const isAdmin = currentUser?.id === roomAdminId;

    function handleColorChange(userId: string, newColor: string) {
        startTransition(async () => {
            const result = await updateMemberColor(roomId, userId, newColor);
            if (result.error) {
                toast.error(result.error);
            } else {
                router.refresh(); // Refresh page to get new server data
            }
        });
    }

    async function handleGlobalBgUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) {
            toast.error("全局背景图片不能超过 5MB");
            return;
        }

        setUploadingBg(true);
        const fileExt = file.name.split('.').pop();
        const fileName = `${roomId}/bg-${Date.now()}.${fileExt}`;

        try {
            // 1. Upload to Supabase Storage
            const { error: uploadError, data } = await supabase.storage
                .from("room-backgrounds")
                .upload(fileName, file, { upsert: true });

            if (uploadError) throw new Error(uploadError.message);

            // 2. Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from("room-backgrounds")
                .getPublicUrl(data.path);

            // 3. Update DB via server action
            startTransition(async () => {
                const res = await updateRoomGlobalBg(roomId, publicUrl);
                if (res.error) {
                    toast.error(res.error);
                } else {
                    toast.success("全局背景已更新");
                    router.refresh();
                }
            });
        } catch (err: any) {
            console.error("Upload error:", err);
            toast.error("图片上传失败: " + (err.message || "未知错误"));
        } finally {
            setUploadingBg(false);
            if (globalBgInputRef.current) globalBgInputRef.current.value = "";
        }
    }

    function handleGlobalBgRemove() {
        startTransition(async () => {
            const res = await updateRoomGlobalBg(roomId, null);
            if (res.error) {
                toast.error(res.error);
            } else {
                toast.success("全局背景已清除");
                router.refresh();
            }
        });
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full" title="设置">
                    <Settings className="w-4 h-4 text-muted-foreground" />
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>公共课表设置</DialogTitle>
                </DialogHeader>

                <div className="space-y-6 mt-4">
                    {/* Local Font Settings */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-medium text-muted-foreground border-b pb-2">显示偏好 (仅本地有效)</h3>

                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <Label>字体大小</Label>
                                <span className="text-xs text-muted-foreground">{currentFontSize}rem</span>
                            </div>
                            <Slider
                                value={[currentFontSize]}
                                min={0.5}
                                max={1.2}
                                step={0.02}
                                onValueChange={(vals) => onFontSizeChange(vals[0])}
                            />
                        </div>

                        <div className="space-y-3">
                            <Label>字体颜色</Label>
                            <div className="flex gap-2">
                                {PRESET_COLORS.map(color => (
                                    <button
                                        key={color}
                                        onClick={() => onFontColorChange(color)}
                                        className={`w-8 h-8 rounded-full border-2 ${currentFontColor === color ? 'border-primary' : 'border-transparent ring-1 ring-border shadow-sm'}`}
                                        style={{ backgroundColor: color }}
                                        title={color}
                                    />
                                ))}
                                {/* Custom Color Picker */}
                                <div className="relative">
                                    <input
                                        type="color"
                                        value={currentFontColor}
                                        onChange={(e) => onFontColorChange(e.target.value)}
                                        className="w-8 h-8 p-0 border-0 rounded-full overflow-hidden cursor-pointer"
                                        style={{ WebkitAppearance: 'none', background: 'none' }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Background Settings */}
                    <div className="space-y-6">
                        {/* Global Background (Admin only) */}
                        {isAdmin && (
                            <div className="space-y-4">
                                <h3 className="text-sm font-medium text-foreground border-b pb-2 flex items-center justify-between">
                                    <span>房间全局背景图 (所有人可见)</span>
                                </h3>
                                <div className="space-y-3">
                                    {roomBgImageUrl ? (
                                        <div className="relative rounded-lg overflow-hidden border border-border group">
                                            <img src={roomBgImageUrl} alt="全局背景" className="w-full h-24 object-cover" />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    disabled={uploadingBg || isPending}
                                                    onClick={() => handleGlobalBgRemove()}
                                                >
                                                    {isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <X className="w-4 h-4 mr-2" />}
                                                    清除全局背景
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => globalBgInputRef.current?.click()}
                                            disabled={uploadingBg || isPending}
                                            className="w-full h-24 rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center gap-1 text-muted-foreground hover:border-primary/50 hover:text-primary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {uploadingBg ? (
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                            ) : (
                                                <ImagePlus className="w-5 h-5" />
                                            )}
                                            <span className="text-xs">{uploadingBg ? "正在上传..." : "上传全局背景"}</span>
                                        </button>
                                    )}
                                    <input
                                        ref={globalBgInputRef}
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleGlobalBgUpload}
                                    />
                                    <p className="text-[10px] text-muted-foreground">全局背景对所有成员生效。如果成员设置了本地背景，则会被本地背景覆盖。</p>
                                </div>
                            </div>
                        )}

                        {/* Local Background */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-medium text-muted-foreground border-b pb-2">
                                个人本地背景 ({isAdmin ? "覆盖全局设置" : "仅自己可见"})
                            </h3>
                            <div className="space-y-3">
                                {currentBgImage ? (
                                    <div className="relative rounded-lg overflow-hidden border border-border">
                                        <img src={currentBgImage} alt="本地背景预览" className="w-full h-24 object-cover" />
                                        <button
                                            onClick={() => onBgImageChange("")}
                                            className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full w-6 h-6 flex items-center justify-center hover:opacity-80 shadow-sm"
                                            title="清除本地背景"
                                        >
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="w-full h-24 rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center gap-1 text-muted-foreground hover:border-primary/50 hover:text-primary/80 transition-colors"
                                    >
                                        <ImagePlus className="w-5 h-5" />
                                        <span className="text-xs">
                                            {roomBgImageUrl ? "上传本地背景（将覆盖全局图片）" : "上传本地背景图"}
                                        </span>
                                    </button>
                                )}
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (!file) return;
                                        if (file.size > 5 * 1024 * 1024) {
                                            toast.error("图片大小不能超过 5MB");
                                            return;
                                        }
                                        const reader = new FileReader();
                                        reader.onload = (ev) => {
                                            const dataUrl = ev.target?.result as string;
                                            onBgImageChange(dataUrl);
                                            toast.success("已设置本地背景");
                                        };
                                        reader.readAsDataURL(file);
                                        e.target.value = ""; // reset
                                    }}
                                />
                                <p className="text-[10px] text-muted-foreground">支持 JPG / PNG / WebP，建议 ≤ 5MB。本地设置优先级最高。</p>
                            </div>
                        </div>
                    </div>

                    {/* Global Member Settings */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-medium text-muted-foreground border-b pb-2">成员代表色 (全局同步)</h3>
                        <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
                            {members.map(member => {
                                const canEdit = !!currentUser && (currentUser.id === member.userId || isAdmin);
                                return (
                                    <div key={member.userId} className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2">
                                            <span className="truncate max-w-[150px]">{member.displayName}</span>
                                            {currentUser?.id === member.userId && (
                                                <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded">You</span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="color"
                                                defaultValue={member.color}
                                                disabled={!canEdit || isPending}
                                                onBlur={(e) => {
                                                    if (e.target.value !== member.color) {
                                                        handleColorChange(member.userId, e.target.value);
                                                    }
                                                }}
                                                className="w-6 h-6 p-0 border-0 rounded cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                                style={{ WebkitAppearance: 'none', background: 'none' }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
