"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateUserQuota, toggleUserRole } from "@/lib/actions/admin";
import { toast } from "sonner";
import { Shield, User, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import type { Profile } from "@/lib/types";

interface AdminUsersClientProps {
    users: Profile[];
    currentUserId: string;
}

export function AdminUsersClient({ users, currentUserId }: AdminUsersClientProps) {
    return (
        <div className="space-y-3">
            <h2 className="text-base font-semibold">用户列表 ({users.length})</h2>
            {users.map((u) => (
                <UserRow key={u.id} user={u} isSelf={u.id === currentUserId} />
            ))}
        </div>
    );
}

function UserRow({ user, isSelf }: { user: Profile; isSelf: boolean }) {
    const [quota, setQuota] = useState(String(user.room_quota));
    const [isPending, startTransition] = useTransition();
    const [isRolePending, startRoleTransition] = useTransition();

    function handleQuotaUpdate() {
        const formData = new FormData();
        formData.set("userId", user.id);
        formData.set("roomQuota", quota);
        startTransition(async () => {
            const result = await updateUserQuota(formData);
            if (result.error) toast.error(result.error);
            else toast.success("额度已更新");
        });
    }

    function handleRoleToggle() {
        if (isSelf) return;
        startRoleTransition(async () => {
            const result = await toggleUserRole(user.id, user.role);
            if (result?.error) toast.error(result.error);
            else toast.success("角色已更新");
        });
    }

    return (
        <Card>
            <CardContent className="pt-4 pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium text-sm">{user.display_name ?? "—"}</span>
                            <Badge
                                variant={user.role === "superadmin" ? "default" : "outline"}
                                className="text-xs gap-1"
                            >
                                {user.role === "superadmin" ? <Shield className="w-3 h-3" /> : <User className="w-3 h-3" />}
                                {user.role === "superadmin" ? "管理员" : "普通用户"}
                            </Badge>
                            {isSelf && <Badge variant="secondary" className="text-xs">你</Badge>}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            注册于 {format(new Date(user.created_at), "yyyy年MM月dd日", { locale: zhCN })}
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Quota editor */}
                        <div className="flex items-center gap-1.5">
                            <span className="text-xs text-muted-foreground whitespace-nowrap">Room 额度</span>
                            <Input
                                className="w-16 h-7 text-xs text-center"
                                value={quota}
                                onChange={(e) => setQuota(e.target.value)}
                                type="number"
                                min="0"
                                max="100"
                            />
                            <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-xs"
                                onClick={handleQuotaUpdate}
                                disabled={isPending || quota === String(user.room_quota)}
                            >
                                {isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : "保存"}
                            </Button>
                        </div>

                        {!isSelf && (
                            <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-xs"
                                onClick={handleRoleToggle}
                                disabled={isRolePending}
                            >
                                {isRolePending ? <Loader2 className="w-3 h-3 animate-spin" /> : user.role === "superadmin" ? "降为普通" : "升为管理"}
                            </Button>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
