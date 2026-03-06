"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createRoom } from "@/lib/actions/rooms";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function CreateRoomDialog() {
    const [open, setOpen] = useState(false);
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        startTransition(async () => {
            const result = await createRoom(formData);
            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success("Room 创建成功！");
                setOpen(false);
                router.refresh();
            }
        });
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2">
                    <Plus className="w-4 h-4" />
                    创建 Room
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>创建新 Room</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="mt-2 space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="room-name">Room 名称 *</Label>
                        <Input
                            id="room-name"
                            name="name"
                            placeholder="例：计科2班班委"
                            required
                            maxLength={100}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="room-desc">描述（可选）</Label>
                        <Textarea
                            id="room-desc"
                            name="description"
                            placeholder="简单说明这个 Room 的用途..."
                            maxLength={500}
                            rows={3}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="room-expires">过期时间（可选）</Label>
                        <Input
                            id="room-expires"
                            name="expiresAt"
                            type="datetime-local"
                        />
                    </div>
                    <div className="rounded-[1.35rem] border border-border/70 bg-background/70 px-4 py-3 text-sm text-muted-foreground">
                        创建后你会自动成为房主并加入该 Room，之后可邀请成员或开启公开只读访问。
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            取消
                        </Button>
                        <Button type="submit" disabled={isPending}>
                            {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            创建
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
