"use client";

import { useState, useMemo } from "react";
import { Calendar, dateFnsLocalizer, type View } from "react-big-calendar";
import {
    addDays,
    format,
    parse,
    startOfWeek,
    getDay,
} from "date-fns";
import { zhCN } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { expandCourses } from "@/lib/utils/calendar";
import type { CalendarEvent, Course, Schedule } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { hexToRgba } from "@/lib/utils/colors";
import { Calendar as CalendarIcon, User, LayoutGrid, ChevronLeft, ChevronRight } from "lucide-react";

const locales = { "zh-CN": zhCN };

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek: (date: Date) => startOfWeek(date, { weekStartsOn: 1 }),
    getDay,
    locales,
});

interface MemberData {
    userId: string;
    displayName: string;
    color: string;
    schedule: Pick<Schedule, "id" | "semester_tag" | "start_date" | "max_weeks">;
    courses: Course[];
}

interface RoomCalendarProps {
    memberData: MemberData[];
    roomName: string;
    isReadOnly: boolean;
}

type ViewMode = "month" | "week" | "person";

function eventStyleGetter(event: CalendarEvent) {
    const color = event.resource.color;
    return {
        style: {
            backgroundColor: hexToRgba(color, 0.85),
            borderLeft: `3px solid ${color}`,
            color: "#fff",
            borderRadius: "4px",
            fontSize: "0.72rem",
            padding: "1px 4px",
        },
    };
}

function EventComponent({ event }: { event: CalendarEvent }) {
    return (
        <div className="leading-tight">
            <div className="font-medium truncate">{event.resource.courseName}</div>
            <div className="opacity-80 truncate text-[0.65rem]">
                {event.resource.displayName}
                {event.resource.room && ` · ${event.resource.room}`}
            </div>
        </div>
    );
}

function MonthEventComponent({ event }: { event: CalendarEvent }) {
    return (
        <div
            className="flex items-center gap-1 px-1"
            style={{ color: event.resource.color }}
        >
            <span
                className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: event.resource.color }}
            />
            <span className="truncate text-xs font-medium">{event.resource.displayName}</span>
        </div>
    );
}

const CALENDAR_CSS = `
  .rbc-calendar { height: 100% !important; font-family: var(--font-geist-sans), sans-serif; }
  .rbc-toolbar { display: none; }
  .rbc-time-view { border: none; }
  .rbc-month-view { border: none; }
  .rbc-header { padding: 8px 4px; font-size: 0.8rem; font-weight: 500; color: hsl(var(--muted-foreground)); border-bottom: 1px solid hsl(var(--border)); }
  .rbc-day-bg + .rbc-day-bg { border-left: 1px solid hsl(var(--border)); }
  .rbc-month-row + .rbc-month-row { border-top: 1px solid hsl(var(--border)); }
  .rbc-off-range-bg { background: hsl(var(--muted) / 30%); }
  .rbc-today { background: hsl(var(--primary) / 5%); }
  .rbc-event { border: none !important; }
  .rbc-event.rbc-selected { box-shadow: 0 0 0 2px hsl(var(--primary)); }
  .rbc-slot-selection { background: hsl(var(--primary) / 20%); }
  .rbc-time-content { border-top: 1px solid hsl(var(--border)); }
  .rbc-time-slot { border-top: 1px solid hsl(var(--border) / 40%); }
  .rbc-timeslot-group { border-bottom: 1px solid hsl(var(--border)); }
  .rbc-time-header-content { border-left: 1px solid hsl(var(--border)); }
  .rbc-day-slot .rbc-time-slot { border-top: 1px solid hsl(var(--border) / 30%); }
  .rbc-time-gutter .rbc-time-slot { font-size: 0.7rem; color: hsl(var(--muted-foreground)); }
  .dark .rbc-calendar { color-scheme: dark; }
  .dark .rbc-month-view, .dark .rbc-time-view { background: hsl(var(--background)); }
  .dark .rbc-header { background: hsl(var(--background)); }
  .dark .rbc-off-range-bg { background: hsl(var(--muted) / 20%); }
  .dark .rbc-today { background: hsl(var(--primary) / 8%); }
  .dark .rbc-time-content { background: hsl(var(--background)); }
`;

const calendarMessages = {
    noEventsInRange: "该时间段内没有课程",
    showMore: (total: number) => `还有 ${total} 节课`,
};

const calendarMinTime = new Date(0, 0, 0, 7, 0);
const calendarMaxTime = new Date(0, 0, 0, 22, 0);

const noop = () => { };

export function RoomCalendar({ memberData, roomName, isReadOnly }: RoomCalendarProps) {
    const [viewMode, setViewMode] = useState<ViewMode>("week");
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
    const [currentDate, setCurrentDate] = useState(new Date());

    const allEvents = useMemo(() => {
        const events: CalendarEvent[] = [];
        for (const member of memberData) {
            const memberEvents = expandCourses(
                member.courses,
                member.schedule,
                member.userId,
                member.displayName,
                member.color
            );
            events.push(...memberEvents);
        }
        return events;
    }, [memberData]);

    const displayEvents = useMemo(() => {
        if (viewMode === "person" && selectedUserId) {
            return allEvents.filter((e) => e.resource.userId === selectedUserId);
        }
        return allEvents;
    }, [allEvents, viewMode, selectedUserId]);

    const rbcView: View = viewMode === "person" ? "week" : viewMode === "month" ? "month" : "week";

    const components = useMemo(() => ({
        event: viewMode === "month" ? MonthEventComponent : EventComponent,
    }), [viewMode]);

    const currentLabel = useMemo(() => {
        if (viewMode === "month") {
            return format(currentDate, "yyyy年M月", { locale: zhCN });
        }

        const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
        const weekEnd = addDays(weekStart, 6);
        return `${format(weekStart, "M月d日", { locale: zhCN })} - ${format(weekEnd, "M月d日", { locale: zhCN })}`;
    }, [currentDate, viewMode]);

    const selectedMemberName = memberData.find((member) => member.userId === selectedUserId)?.displayName;

    return (
        <div className="relative flex min-h-[72vh] flex-col gap-4">
            <div className="glass-panel px-4 py-4">
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                        <div className="space-y-1">
                            <p className="text-xs font-medium tracking-[0.14em] text-muted-foreground uppercase">
                                {roomName}
                            </p>
                            <div className="flex flex-wrap items-center gap-2">
                                <h2 className="text-xl font-semibold tracking-tight">{currentLabel}</h2>
                                {viewMode === "person" && selectedMemberName && (
                                    <Badge variant="secondary">{selectedMemberName}</Badge>
                                )}
                                {isReadOnly && (
                                    <Badge variant="outline" className="text-xs">只读模式</Badge>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                            <div className="flex items-center gap-1 rounded-2xl bg-muted/75 p-1">
                                <Button
                                    variant={viewMode === "month" ? "default" : "ghost"}
                                    size="sm"
                                    className="h-8 px-3 text-xs gap-1"
                                    onClick={() => setViewMode("month")}
                                >
                                    <LayoutGrid className="w-3.5 h-3.5" />
                                    月视图
                                </Button>
                                <Button
                                    variant={viewMode === "week" ? "default" : "ghost"}
                                    size="sm"
                                    className="h-8 px-3 text-xs gap-1"
                                    onClick={() => setViewMode("week")}
                                >
                                    <CalendarIcon className="w-3.5 h-3.5" />
                                    周视图
                                </Button>
                                <Button
                                    variant={viewMode === "person" ? "default" : "ghost"}
                                    size="sm"
                                    className="h-8 px-3 text-xs gap-1"
                                    onClick={() => {
                                        setViewMode("person");
                                        if (!selectedUserId && memberData.length > 0) {
                                            setSelectedUserId(memberData[0].userId);
                                        }
                                    }}
                                >
                                    <User className="w-3.5 h-3.5" />
                                    按人
                                </Button>
                            </div>

                            <div className="flex items-center gap-2">
                                <Button variant="outline" size="icon-sm" onClick={() => {
                                    const d = new Date(currentDate);
                                    if (viewMode === "month") d.setMonth(d.getMonth() - 1);
                                    else d.setDate(d.getDate() - 7);
                                    setCurrentDate(d);
                                }}>
                                    <ChevronLeft className="w-4 h-4" />
                                </Button>
                                <Button variant="outline" size="sm" className="h-9 text-xs" onClick={() => setCurrentDate(new Date())}>
                                    今天
                                </Button>
                                <Button variant="outline" size="icon-sm" onClick={() => {
                                    const d = new Date(currentDate);
                                    if (viewMode === "month") d.setMonth(d.getMonth() + 1);
                                    else d.setDate(d.getDate() + 7);
                                    setCurrentDate(d);
                                }}>
                                    <ChevronRight className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        {memberData.map((m) => {
                            const isSelected = viewMode === "person" && selectedUserId === m.userId;

                            return (
                                <button
                                    key={m.userId}
                                    onClick={() => {
                                        if (viewMode === "person") {
                                            setSelectedUserId(m.userId);
                                        }
                                    }}
                                    className={`flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-medium transition-all ${isSelected
                                        ? "border-transparent bg-background shadow-sm"
                                        : "border-border/70 bg-background/55 hover:bg-background/80"
                                        }`}
                                    style={isSelected ? {
                                        boxShadow: `0 0 0 1px ${hexToRgba(m.color, 0.3)}, 0 16px 36px -26px ${hexToRgba(m.color, 0.75)}`,
                                    } : undefined}
                                >
                                    <span
                                        className="h-2.5 w-2.5 rounded-full flex-shrink-0"
                                        style={{ backgroundColor: m.color }}
                                    />
                                    <span>{m.displayName}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div className="glass-panel flex-1 overflow-hidden p-3">
                <div className="h-full overflow-hidden rounded-[1.4rem] border border-border/60 bg-background/70 p-2">
                    <style dangerouslySetInnerHTML={{ __html: CALENDAR_CSS }} />

                    <Calendar
                        localizer={localizer}
                        events={displayEvents}
                        view={rbcView}
                        onView={noop}
                        date={currentDate}
                        onNavigate={setCurrentDate}
                        eventPropGetter={eventStyleGetter}
                        components={components}
                        culture="zh-CN"
                        min={calendarMinTime}
                        max={calendarMaxTime}
                        popup
                        selectable={false}
                        style={{ height: "100%" }}
                        messages={calendarMessages}
                    />
                </div>
            </div>

            {memberData.length === 0 && (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                    <div className="rounded-[1.6rem] border border-border/70 bg-background/90 px-6 py-6 text-center text-muted-foreground shadow-lg backdrop-blur-xl">
                        <CalendarIcon className="mx-auto mb-3 size-10 opacity-40" />
                        <p className="text-base font-medium text-foreground">暂无成员课表数据</p>
                        <p className="mt-1 text-sm">邀请成员加入并让他们导入课表后，这里会自动生成聚合日历。</p>
                    </div>
                </div>
            )}
        </div>
    );
}
