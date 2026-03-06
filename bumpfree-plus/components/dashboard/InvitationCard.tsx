"use client";

import { useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { acceptInvitation, declineInvitation } from "@/lib/actions/invitations";
import { Check, X, Loader2, DoorOpen } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";

interface InvitationCardProps {
    invitation: {
        id: string;
        created_at: string;
        room: { id: string; name: string; description: string | null } | null;
        inviter: { id: string; display_name: string | null } | null;
    };
}

export function InvitationCard({ invitation }: InvitationCardProps) {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    function handleAccept() {
        startTransition(async () => {
            const result = await acceptInvitation(invitation.id);
            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success(`已加入 ${invitation.room?.name}`);
                router.push(`/room/${result.roomId}`);
            }
        });
    }

    function handleDecline() {
        startTransition(async () => {
            const result = await declineInvitation(invitation.id);
            if (result.error) {
                toast.error(result.error);
            } else {
                toast.info("已拒绝邀请");
                router.refresh();
            }
        });
    }

    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex items-start gap-3">
                    <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary flex-shrink-0">
                        <DoorOpen className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                        <CardTitle className="text-lg">
                            {invitation.inviter?.display_name ?? "某人"} 邀请你加入
                        </CardTitle>
                        <CardDescription className="mt-1">
                            Room：{invitation.room?.name}
                            {invitation.room?.description && ` · ${invitation.room.description}`}
                        </CardDescription>
                        <p className="mt-2 text-xs text-muted-foreground">
                            {format(new Date(invitation.created_at), "MM月dd日 HH:mm", { locale: zhCN })}
                        </p>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex flex-wrap gap-2">
                    <Button
                        size="sm"
                        onClick={handleAccept}
                        disabled={isPending}
                        className="gap-1.5"
                    >
                        {isPending ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                            <Check className="w-3.5 h-3.5" />
                        )}
                        接受邀请
                    </Button>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={handleDecline}
                        disabled={isPending}
                        className="gap-1.5"
                    >
                        <X className="w-3.5 h-3.5" />
                        暂不加入
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
