"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
    ExternalLink,
    Users,
    UserPlus,
    Loader2,
    Globe,
    Lock,
    Search,
    Copy,
    Check,
} from "lucide-react";
import { searchUsers, inviteUserToRoom, updateRoom } from "@/lib/actions/rooms";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface RoomManageCardProps {
    room: {
        id: string;
        name: string;
        description: string | null;
        is_public: boolean;
        expires_at: string | null;
        created_at: string;
        room_members: { count: number }[];
    };
}

export function RoomManageCard({ room }: RoomManageCardProps) {
    const [copied, setCopied] = useState(false);
    const [inviteOpen, setInviteOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<{ id: string; display_name: string | null }[]>([]);
    const [isPending, startTransition] = useTransition();
    const [isPublicToggling, startPublicTransition] = useTransition();
    const [isSearching, startSearchTransition] = useTransition();
    const router = useRouter();

    const memberCount = room.room_members?.[0]?.count ?? 0;

    useEffect(() => {
        if (!inviteOpen) {
            return;
        }

        const normalizedQuery = searchQuery.trim();
        if (normalizedQuery.length < 2) {
            return;
        }

        let cancelled = false;
        const timeoutId = window.setTimeout(() => {
            startSearchTransition(async () => {
                const results = await searchUsers(normalizedQuery);
                if (!cancelled) {
                    setSearchResults(results);
                }
            });
        }, 250);

        return () => {
            cancelled = true;
            window.clearTimeout(timeoutId);
        };
    }, [inviteOpen, searchQuery, startSearchTransition]);

    async function copyLink() {
        try {
            await navigator.clipboard.writeText(`${window.location.origin}/room/${room.id}`);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
            toast.success("链接已复制");
        } catch {
            toast.error("复制失败，请手动复制链接");
        }
    }

    function handleSearch(q: string) {
        setSearchQuery(q);
        if (q.trim().length < 2) {
            setSearchResults([]);
        }
    }

    function handleInvite(inviteeId: string, name: string) {
        startTransition(async () => {
            const result = await inviteUserToRoom(room.id, inviteeId);
            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success(`已向 ${name} 发送邀请`);
                setInviteOpen(false);
            }
        });
    }

    function togglePublic() {
        startPublicTransition(async () => {
            const result = await updateRoom(room.id, { isPublic: !room.is_public });
            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success(room.is_public ? "已关闭公开访问" : "已开启公开只读访问");
                router.refresh();
            }
        });
    }

    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                        <CardTitle className="truncate text-lg">{room.name}</CardTitle>
                        {room.description && (
                            <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{room.description}</p>
                        )}
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                        {room.is_public ? (
                            <Badge variant="secondary" className="gap-1">
                                <Globe className="w-3 h-3" />公开
                            </Badge>
                        ) : (
                            <Badge variant="outline" className="gap-1">
                                <Lock className="w-3 h-3" />私密
                            </Badge>
                        )}
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-3">
                <div className="grid gap-3 md:grid-cols-2">
                    <div className="rounded-[1.35rem] border border-border/70 bg-background/70 px-4 py-3 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Users className="w-4 h-4" />
                            <span>成员规模</span>
                        </div>
                        <p className="mt-2 text-lg font-semibold">{memberCount} 名成员</p>
                    </div>
                    <div className="rounded-[1.35rem] border border-border/70 bg-background/70 px-4 py-3 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            {room.is_public ? <Globe className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                            <span>访问模式</span>
                        </div>
                        <p className="mt-2 text-lg font-semibold">{room.is_public ? "公开只读" : "仅成员可见"}</p>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2">
                    <Link href={`/room/${room.id}`}>
                        <Button variant="outline" size="sm" className="gap-1.5">
                            <ExternalLink className="w-3.5 h-3.5" />
                            查看日历
                        </Button>
                    </Link>

                    <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5"
                        onClick={copyLink}
                    >
                        {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        复制链接
                    </Button>

                    {/* Invite dialog */}
                    <Dialog
                        open={inviteOpen}
                        onOpenChange={(open) => {
                            setInviteOpen(open);
                            if (!open) {
                                setSearchQuery("");
                                setSearchResults([]);
                            }
                        }}
                    >
                        <DialogTrigger asChild>
                            <Button variant="outline" size="sm" className="gap-1.5">
                                <UserPlus className="w-3.5 h-3.5" />
                                邀请成员
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>邀请成员加入 {room.name}</DialogTitle>
                            </DialogHeader>
                            <div className="mt-2 space-y-3">
                                <div className="relative">
                                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        placeholder="搜索用户昵称..."
                                        className="pl-9"
                                        value={searchQuery}
                                        onChange={(e) => handleSearch(e.target.value)}
                                    />
                                </div>
                                {isSearching && <p className="text-sm text-muted-foreground text-center">搜索中...</p>}
                                {searchResults.length > 0 && (
                                    <div className="max-h-60 overflow-y-auto rounded-[1.2rem] border border-border divide-y divide-border">
                                        {searchResults.map((u) => (
                                            <div
                                                key={u.id}
                                                className="flex items-center justify-between px-3 py-3"
                                            >
                                                <div>
                                                    <p className="text-sm font-medium">{u.display_name ?? "未命名用户"}</p>
                                                    <p className="text-xs text-muted-foreground">发送邀请后，对方可在邀请通知中接受加入</p>
                                                </div>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    disabled={isPending}
                                                    onClick={() => handleInvite(u.id, u.display_name ?? "该用户")}
                                                >
                                                    {isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : "邀请"}
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {searchQuery.length >= 2 && !isSearching && searchResults.length === 0 && (
                                    <p className="text-sm text-muted-foreground text-center py-2">没有找到用户</p>
                                )}
                            </div>
                        </DialogContent>
                    </Dialog>

                    <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5"
                        onClick={togglePublic}
                        disabled={isPublicToggling}
                    >
                        {isPublicToggling ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : room.is_public ? (
                            <Lock className="w-3.5 h-3.5" />
                        ) : (
                            <Globe className="w-3.5 h-3.5" />
                        )}
                        {room.is_public ? "关闭公开" : "开启公开"}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
