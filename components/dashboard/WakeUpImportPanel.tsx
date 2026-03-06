"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { importWakeUpSchedule } from "@/lib/actions/courses";
import { Download, Loader2, CheckCircle2 } from "lucide-react";
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
                    打开 WakeUp 课程表 App → 右上角第二个按钮 → 分享口令。导入同一学期时会自动覆盖原数据。
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="wakeup-token">分享口令或完整分享消息</Label>
                    <Textarea
                        id="wakeup-token"
                        placeholder="粘贴完整的 WakeUp 分享消息，或直接粘贴32位口令..."
                        value={token}
                        onChange={(e) => setToken(e.target.value)}
                        rows={3}
                        className="min-h-28 resize-none font-mono text-sm"
                    />
                </div>
                <div className="rounded-[1.4rem] border border-border/70 bg-background/70 px-4 py-4 text-sm text-muted-foreground">
                    推荐直接粘贴完整分享消息，解析成功率更高；也支持单独粘贴 32 位口令。
                </div>
                <Button onClick={handleImport} size="lg" disabled={isPending || !token.trim()} className="w-full">
                    {isPending ? (
                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" />正在导入...</>
                    ) : (
                        <><Download className="w-4 h-4 mr-2" />导入课表</>
                    )}
                </Button>
                {hasSchedule && (
                    <p className="flex items-center gap-1 text-xs text-muted-foreground">
                        <CheckCircle2 className="w-3 h-3 text-green-500" />
                        已有课表数据，导入相同学期将自动替换
                    </p>
                )}
            </CardContent>
        </Card>
    );
}
