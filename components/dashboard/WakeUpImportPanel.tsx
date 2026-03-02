"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { importWakeUpSchedule } from "@/lib/actions/courses";
import { Download, Loader2, CheckCircle2, BookOpen } from "lucide-react";
import { toast } from "sonner";

interface ImportPanelProps {
    hasSchedule: boolean;
}

export function WakeUpImportPanel({ hasSchedule }: ImportPanelProps) {
    const [token, setToken] = useState("");
    const [isPending, startTransition] = useTransition();

    function handleImport() {
        if (!token.trim()) return;
        startTransition(async () => {
            const result = await importWakeUpSchedule(token.trim());
            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success(`已导入「${result.semesterTag}」，共 ${result.courseCount} 条课程`);
                setToken("");
            }
        });
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    WakeUp 课表导入
                </CardTitle>
                <CardDescription>
                    打开 WakeUp 课程表 App → 右上角第二个按钮 → 分享口令
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
                <div className="space-y-2">
                    <Label htmlFor="wakeup-token">分享口令或完整分享消息</Label>
                    <Textarea
                        id="wakeup-token"
                        placeholder="粘贴完整的 WakeUp 分享消息，或直接粘贴32位口令..."
                        value={token}
                        onChange={(e) => setToken(e.target.value)}
                        rows={3}
                        className="font-mono text-sm resize-none"
                    />
                </div>
                <Button onClick={handleImport} disabled={isPending || !token.trim()} className="w-full">
                    {isPending ? (
                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" />正在导入...</>
                    ) : (
                        <><Download className="w-4 h-4 mr-2" />导入课表</>
                    )}
                </Button>
                {hasSchedule && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-green-500" />
                        已有课表数据，导入相同学期将自动替换
                    </p>
                )}
            </CardContent>
        </Card>
    );
}
