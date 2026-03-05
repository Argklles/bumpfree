"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createRoomEvent, updateRoomEvent, deleteRoomEvent } from "@/plugins/pending-events/actions";
import { CalendarPlus, Loader2, Trash2 } from "lucide-react";
import type { CalendarEvent } from "@/lib/types";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface CreateEventDialogProps {
    roomId: string;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    defaultStartTime?: Date;
    defaultEndTime?: Date;
    editingEvent?: CalendarEvent | null;
}

// Helper to format Date for datetime-local input
function formatForInput(date?: Date) {
    if (!date) return undefined;

    // Create a local date string preserving the exact local time
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export function CreateEventDialog({ roomId, open: controlledOpen, onOpenChange: controlledOnOpenChange, defaultStartTime, defaultEndTime, editingEvent }: CreateEventDialogProps) {
    const [uncontrolledOpen, setUncontrolledOpen] = useState(false);

    const isControlled = controlledOpen !== undefined;
    const open = isControlled ? controlledOpen : uncontrolledOpen;

    const setOpen = (newOpen: boolean) => {
        if (!isControlled) {
            setUncontrolledOpen(newOpen);
        }
        controlledOnOpenChange?.(newOpen);
    };
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const isEditing = !!editingEvent;

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        // Convert datetime-local string (e.g. "2026-03-05T21:00") to ISO 8601 with timezone offset.
        // We append the local timezone offset directly to avoid any double-conversion issues.
        const toTimezoneISO = (dtString: string) => {
            if (!dtString) return "";
            // Get timezone offset in ±HH:MM format
            const now = new Date();
            const offsetMinutes = now.getTimezoneOffset(); // e.g. -480 for UTC+8
            const sign = offsetMinutes <= 0 ? "+" : "-";
            const absMinutes = Math.abs(offsetMinutes);
            const offsetHours = String(Math.floor(absMinutes / 60)).padStart(2, "0");
            const offsetMins = String(absMinutes % 60).padStart(2, "0");
            const offsetStr = `${sign}${offsetHours}:${offsetMins}`; // e.g. "+08:00"
            // datetime-local gives "YYYY-MM-DDTHH:mm", append ":00" for seconds and timezone
            return `${dtString}:00${offsetStr}`;
        };

        const localStart = formData.get("startTime") as string;
        const localEnd = formData.get("endTime") as string;
        if (localStart) formData.set("startTime", toTimezoneISO(localStart));
        if (localEnd) formData.set("endTime", toTimezoneISO(localEnd));

        startTransition(async () => {
            let result;
            if (isEditing) {
                // Determine the original event ID (we prefixed it with 'event-' in RoomCalendar)
                const eventId = editingEvent.id.replace("event-", "");
                result = await updateRoomEvent(eventId, roomId, {
                    title: formData.get("title") as string,
                    description: formData.get("description") as string,
                    location: formData.get("location") as string,
                    startTime: formData.get("startTime") as string,
                    endTime: formData.get("endTime") as string,
                });
            } else {
                result = await createRoomEvent(roomId, formData);
            }

            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success(isEditing ? "事件已更新！" : "事件已创建！");
                setOpen(false);
                router.refresh();
            }
        });
    }

    function handleDelete() {
        if (!isEditing || !confirm("确定要删除这个待定事件吗？")) return;

        startTransition(async () => {
            const eventId = editingEvent.id.replace("event-", "");
            const result = await deleteRoomEvent(eventId, roomId);
            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success("事件已删除！");
                setOpen(false);
                router.refresh();
            }
        });
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs">
                    <CalendarPlus className="w-3.5 h-3.5" />
                    新建事件
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{isEditing ? "编辑待定事件" : "新建待定事件"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 mt-2">
                    <div className="space-y-2">
                        <Label htmlFor="event-title">事件标题 *</Label>
                        <Input
                            id="event-title"
                            name="title"
                            defaultValue={editingEvent?.resource.courseName}
                            placeholder="例：周五班委会议"
                            required
                            maxLength={200}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                            <Label htmlFor="event-start">开始时间 *</Label>
                            <Input
                                id="event-start"
                                name="startTime"
                                type="datetime-local"
                                defaultValue={isEditing ? formatForInput(editingEvent.start) : formatForInput(defaultStartTime)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="event-end">结束时间 *</Label>
                            <Input
                                id="event-end"
                                name="endTime"
                                type="datetime-local"
                                defaultValue={isEditing ? formatForInput(editingEvent.end) : formatForInput(defaultEndTime)}
                                required
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="event-location">地点（可选）</Label>
                        <Input
                            id="event-location"
                            name="location"
                            defaultValue={editingEvent?.resource.room || ""}
                            placeholder="例：教学楼A302"
                            maxLength={200}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="event-desc">描述（可选）</Label>
                        <Textarea
                            id="event-desc"
                            name="description"
                            defaultValue={editingEvent?.resource.description || ""}
                            placeholder="补充说明..."
                            maxLength={1000}
                            rows={2}
                        />
                    </div>
                    <div className="flex gap-2 justify-between pt-2">
                        {isEditing ? (
                            <Button type="button" variant="destructive" size="sm" onClick={handleDelete} disabled={isPending}>
                                <Trash2 className="w-4 h-4 mr-1.5" />
                                删除
                            </Button>
                        ) : (
                            <div /> // Spacer
                        )}
                        <div className="flex gap-2">
                            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                                取消
                            </Button>
                            <Button type="submit" disabled={isPending}>
                                {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                {isEditing ? "保存修改" : "创建事件"}
                            </Button>
                        </div>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
