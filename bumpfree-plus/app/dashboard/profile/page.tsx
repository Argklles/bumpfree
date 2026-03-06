import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { WakeUpImportPanel } from "@/components/dashboard/WakeUpImportPanel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Calendar } from "lucide-react";
import { setActiveSchedule } from "@/lib/actions/courses";
import { Button } from "@/components/ui/button";
import { DeleteScheduleButton } from "@/components/dashboard/DeleteScheduleButton";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import type { Course } from "@/lib/types";

const DAY_NAMES = ["", "周一", "周二", "周三", "周四", "周五", "周六", "周日"];

export default async function ProfilePage() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) redirect("/auth/login");

    const { data: schedules } = await supabase
        .from("schedules")
        .select("*, courses(*)")
        .eq("user_id", user.id)
        .order("imported_at", { ascending: false });

    const { data: profile } = await supabase
        .from("profiles")
        .select("schedule_quota")
        .eq("id", user.id)
        .single();

    const hasSchedule = (schedules?.length ?? 0) > 0;
    const scheduleCount = schedules?.length ?? 0;
    const quota = profile?.schedule_quota ?? 3;
    const quotaReached = scheduleCount >= quota;

    return (
        <div className="page-stack">
            <PageHeader
                eyebrow="Schedules"
                title="我的课表"
                description="通过 WakeUp 口令导入个人课表，保留多个学期存档，并切换当前用于 Room 聚合的课表。"
                meta={
                    <Badge variant={quotaReached ? "destructive" : "secondary"} className="gap-1">
                        已存放 {scheduleCount} / {quota}
                    </Badge>
                }
            />

            {quotaReached ? (
                <div className="rounded-[1.6rem] border border-destructive/20 bg-destructive/10 px-5 py-4 text-sm text-destructive">
                    <BookOpen className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="font-semibold mb-1">课表额度已满</p>
                        <p className="opacity-90">你的账号目前受限于最大 {quota} 份课表。若要导入新学期课表，请先删除下方的过期课表。</p>
                    </div>
                </div>
            ) : (
                <WakeUpImportPanel hasSchedule={hasSchedule} />
            )}

            {/* Schedule list */}
            {hasSchedule && (
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold tracking-tight">已存课表</h2>
                    {schedules?.map((schedule) => (
                        <Card key={schedule.id} className={schedule.is_active ? "border-primary/35 bg-primary/[0.04]" : ""}>
                            <CardHeader className="pb-3">
                                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                                    <div>
                                        <CardTitle className="flex items-center gap-2 text-lg">
                                            <BookOpen className={schedule.is_active ? "w-4 h-4 text-primary" : "w-4 h-4 text-muted-foreground"} />
                                            {schedule.semester_tag}
                                            {schedule.is_active && (
                                                <Badge variant="default" className="text-xs">当前使用</Badge>
                                            )}
                                        </CardTitle>
                                        <p className="mt-2 text-sm text-muted-foreground">
                                            {schedule.school} · 起始 {schedule.start_date} · {schedule.max_weeks} 周
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {!schedule.is_active && (
                                            <form
                                                action={async () => {
                                                    "use server";
                                                    await setActiveSchedule(schedule.id);
                                                }}
                                            >
                                                <Button variant="outline" size="sm" type="submit">
                                                    设为当前
                                                </Button>
                                            </form>
                                        )}
                                        <DeleteScheduleButton scheduleId={schedule.id} scheduleName={schedule.semester_tag} />
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="mb-4 text-sm text-muted-foreground">
                                    共 {schedule.courses?.length ?? 0} 条课程记录
                                </p>
                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                    {schedule.courses?.slice(0, 6).map((course: Course) => (
                                        <div
                                            key={course.id}
                                            className="soft-panel flex items-start gap-3 px-4 py-4 text-sm"
                                        >
                                            <span
                                                className="mt-1.5 h-2.5 w-2.5 flex-shrink-0 rounded-full"
                                                style={{ backgroundColor: course.color ?? "#6366f1" }}
                                            />
                                            <div className="min-w-0">
                                                <p className="font-medium truncate">{course.name}</p>
                                                <p className="text-muted-foreground text-xs">
                                                    {DAY_NAMES[course.day_of_week]} {course.start_time}-{course.end_time}
                                                    {course.teacher && ` · ${course.teacher}`}
                                                </p>
                                                <p className="text-muted-foreground text-xs">
                                                    第{course.start_week}-{course.end_week}周
                                                    {course.room && ` · ${course.room}`}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                    {(schedule.courses?.length ?? 0) > 6 && (
                                        <div className="soft-panel flex items-center justify-center px-4 py-4 text-sm text-muted-foreground">
                                            ...还有 {schedule.courses.length - 6} 条
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {!hasSchedule && (
                <EmptyState
                    icon={<Calendar className="size-6" />}
                    title="还没有导入任何课表"
                    description="从上方粘贴 WakeUp 分享口令开始，导入后即可在 Room 中参与聚合日历协作。"
                />
            )}
        </div>
    );
}
