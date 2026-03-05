"use client";

import { useState, useMemo, useEffect } from "react";
import { Calendar, dateFnsLocalizer, Views, type View } from "react-big-calendar";
import {
    format,
    parse,
    startOfWeek,
    getDay,
    addWeeks,
    parseISO,
} from "date-fns";
import { zhCN } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { expandCourses } from "@/lib/utils/calendar";
import type { CalendarEvent, Course, Schedule } from "@/lib/types";
import type { RoomEvent } from "@/plugins/pending-events/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { hexToRgba } from "@/lib/utils/colors";
import { Calendar as CalendarIcon, User, LayoutGrid, ChevronLeft, ChevronRight } from "lucide-react";
import { CreateEventDialog } from "@/plugins/pending-events/CreateEventDialog";
import { RoomSettingsDialog, type MemberWithDisplay } from "@/plugins/room-settings/RoomSettingsDialog";
import { FEATURES } from "@/plugins/features";

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
    roomEvents?: RoomEvent[];
    roomId?: string;
    currentUser?: any;
    roomAdminId?: string;
}

type ViewMode = "month" | "week" | "person";

export function RoomCalendar({ memberData, roomName, isReadOnly, roomEvents = [], roomId, currentUser, roomAdminId }: RoomCalendarProps) {
    const [viewMode, setViewMode] = useState<ViewMode>("week");
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
    const [currentDate, setCurrentDate] = useState(new Date());

    const [eventDialogOpen, setEventDialogOpen] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState<{ start: Date; end: Date } | null>(null);
    const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);

    // Font Preferences (LocalStorage)
    const [fontSize, setFontSize] = useState<number>(0.72);
    const [fontColor, setFontColor] = useState<string>("#ffffff");
    const [bgImage, setBgImage] = useState<string>("");

    // Load preferences on mount
    useEffect(() => {
        const storedSize = localStorage.getItem("room-font-size");
        const storedColor = localStorage.getItem("room-font-color");
        const storedBg = localStorage.getItem("room-bg-image");
        if (storedSize) setFontSize(parseFloat(storedSize));
        if (storedColor) setFontColor(storedColor);
        if (storedBg) setBgImage(storedBg);
    }, []);

    // Save preferences when they change
    function handleFontSizeChange(size: number) {
        setFontSize(size);
        localStorage.setItem("room-font-size", size.toString());
    }

    function handleFontColorChange(color: string) {
        setFontColor(color);
        localStorage.setItem("room-font-color", color);
    }

    function handleBgImageChange(dataUrl: string) {
        setBgImage(dataUrl);
        if (dataUrl) {
            localStorage.setItem("room-bg-image", dataUrl);
        } else {
            localStorage.removeItem("room-bg-image");
        }
    }

    function handleSelectSlot(slotInfo: { start: Date; end: Date; action: "select" | "click" | "doubleClick" }) {
        if (FEATURES.PENDING_EVENTS && !isReadOnly && roomId) {
            // Adjust end time if it's the exact same as start time (e.g. click instead of drag)
            let end = slotInfo.end;
            if (slotInfo.action === "click" && slotInfo.start.getTime() === slotInfo.end.getTime()) {
                end = new Date(slotInfo.start.getTime() + 60 * 60 * 1000); // Default 1 hour duration

                // Prevent cross-day overflow on single click
                const endOfDay = new Date(slotInfo.start);
                endOfDay.setHours(23, 59, 59, 999);
                if (end > endOfDay) {
                    end = endOfDay;
                }
            }

            setSelectedSlot({ start: slotInfo.start, end });
            setEditingEvent(null);
            setEventDialogOpen(true);
        }
    }

    function handleSelectEvent(event: CalendarEvent) {
        if (FEATURES.PENDING_EVENTS && !isReadOnly && roomId && event.resource.isPending) {
            setEditingEvent(event);
            setSelectedSlot(null);
            setEventDialogOpen(true);
        }
    }

    // Expand all members' courses into events
    const allEvents = useMemo(() => {
        const events: CalendarEvent[] = [];
        for (const member of memberData) {
            const memberEvents = expandCourses(
                member.courses,
                member.schedule as Schedule,
                member.userId,
                member.displayName,
                member.color
            );
            events.push(...memberEvents);
        }
        return events;
    }, [memberData]);

    // Convert room events to CalendarEvent format
    const pendingEvents = useMemo(() => {
        const events: CalendarEvent[] = [];

        roomEvents.forEach((re) => {
            const start = new Date(re.start_time);
            const end = new Date(re.end_time);

            const startDay = new Date(start.getFullYear(), start.getMonth(), start.getDate());
            const endDay = new Date(end.getFullYear(), end.getMonth(), end.getDate());

            const resource = {
                userId: re.creator_id,
                displayName: re.title,
                color: "#f59e0b", // amber for pending events
                courseName: re.title,
                room: re.location,
                teacher: null,
                isPending: true,
                eventStatus: re.status,
                description: re.description,
            };

            if (startDay.getTime() === endDay.getTime()) {
                events.push({
                    id: `event-${re.id}`,
                    title: `📌 ${re.title}`,
                    start,
                    end,
                    resource,
                });
            } else {
                // Split multi-day event into multiple segments
                let current = new Date(start);
                while (current < end) {
                    const currentDayEnd = new Date(current.getFullYear(), current.getMonth(), current.getDate(), 23, 59, 59, 999);
                    const segmentEnd = end < currentDayEnd ? end : currentDayEnd;

                    if (current.getTime() < segmentEnd.getTime()) {
                        events.push({
                            id: `event-${re.id}`,
                            title: `📌 ${re.title}`,
                            start: new Date(current),
                            end: new Date(segmentEnd),
                            resource,
                        });
                    }

                    // Move to start of next day
                    current = new Date(current.getFullYear(), current.getMonth(), current.getDate() + 1, 0, 0, 0, 0);
                }
            }
        });
        return events;
    }, [roomEvents]);

    // Filter events by selected user (person view)
    const displayEvents = useMemo(() => {
        let courseEvents = allEvents;
        if (viewMode === "person" && selectedUserId) {
            courseEvents = allEvents.filter((e) => e.resource.userId === selectedUserId);
        }
        // Always show pending events
        return [...courseEvents, ...pendingEvents];
    }, [allEvents, pendingEvents, viewMode, selectedUserId]);

    // Calculate default scroll time based on earliest event
    const defaultScrollHour = useMemo(() => {
        let earliest = 7; // Default to 7 AM
        if (displayEvents.length > 0) {
            earliest = 24;
            displayEvents.forEach(event => {
                const startHour = event.start.getHours();
                if (startHour < earliest) earliest = startHour;
            });
            earliest = Math.max(0, earliest - 1); // 1 hour padding above
        }
        return earliest;
    }, [displayEvents]);

    const rbcView: View = viewMode === "person" ? "week" : viewMode === "month" ? "month" : "week";

    function eventStyleGetter(event: CalendarEvent) {
        const color = event.resource.color;
        if (event.resource.isPending) {
            return {
                style: {
                    backgroundColor: hexToRgba(color, 0.15),
                    border: `2px dashed ${color}`,
                    color: fontColor,
                    borderRadius: "4px",
                    fontSize: `${fontSize}rem`,
                    padding: "1px 4px",
                    containerType: "inline-size" as const,
                    overflow: "hidden",
                },
            };
        }
        return {
            style: {
                backgroundColor: hexToRgba(color, 0.85),
                borderLeft: `3px solid ${color}`,
                color: fontColor,
                borderRadius: "4px",
                fontSize: `${fontSize}rem`,
                padding: "1px 4px",
                containerType: "inline-size" as const,
                overflow: "hidden",
            },
        };
    }

    function EventComponent({ event }: { event: CalendarEvent }) {
        if (event.resource.isPending) {
            return (
                <div className="event-content leading-tight">
                    <div className="event-title font-semibold truncate" style={{ fontSize: `${fontSize}rem`, color: fontColor }}>{event.resource.courseName}</div>
                    <div className="event-detail opacity-80 truncate" style={{ fontSize: `${fontSize * 0.9}rem`, color: fontColor }}>
                        {event.resource.room && `📍 ${event.resource.room}`}
                        {event.resource.description && ` · ${event.resource.description}`}
                    </div>
                </div>
            );
        }
        return (
            <div className="event-content leading-tight">
                <div className="event-title font-medium truncate" style={{ fontSize: `${fontSize}rem`, color: fontColor }}>{event.resource.courseName}</div>
                <div className="event-detail opacity-80 truncate" style={{ fontSize: `${fontSize * 0.9}rem`, color: fontColor }}>
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

    return (
        <div className="flex flex-col h-[calc(100vh-3.5rem)]">
            {/* Toolbar */}
            <div className="border-b border-border/60 px-4 py-3 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                {/* View switcher */}
                <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
                    <Button
                        variant={viewMode === "month" ? "default" : "ghost"}
                        size="sm"
                        className="h-7 px-3 text-xs gap-1"
                        onClick={() => setViewMode("month")}
                    >
                        <LayoutGrid className="w-3.5 h-3.5" />
                        月视图
                    </Button>
                    <Button
                        variant={viewMode === "week" ? "default" : "ghost"}
                        size="sm"
                        className="h-7 px-3 text-xs gap-1"
                        onClick={() => setViewMode("week")}
                    >
                        <CalendarIcon className="w-3.5 h-3.5" />
                        周视图
                    </Button>
                    <Button
                        variant={viewMode === "person" ? "default" : "ghost"}
                        size="sm"
                        className="h-7 px-3 text-xs gap-1"
                        onClick={() => { setViewMode("person"); if (!selectedUserId && memberData.length > 0) setSelectedUserId(memberData[0].userId); }}
                    >
                        <User className="w-3.5 h-3.5" />
                        按人
                    </Button>
                </div>

                {/* Navigation */}
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => {
                        const d = new Date(currentDate);
                        if (viewMode === "month") d.setMonth(d.getMonth() - 1);
                        else d.setDate(d.getDate() - 7);
                        setCurrentDate(d);
                    }}>
                        <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => setCurrentDate(new Date())}>
                        今天
                    </Button>
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => {
                        const d = new Date(currentDate);
                        if (viewMode === "month") d.setMonth(d.getMonth() + 1);
                        else d.setDate(d.getDate() + 7);
                        setCurrentDate(d);
                    }}>
                        <ChevronRight className="w-4 h-4" />
                    </Button>
                </div>

                {/* Member legend / person filter */}
                <div className="flex items-center gap-2 flex-wrap">
                    {memberData.map((m) => (
                        <button
                            key={m.userId}
                            onClick={() => {
                                if (viewMode === "person") {
                                    setSelectedUserId(m.userId);
                                }
                            }}
                            className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-xs transition-colors ${viewMode === "person" && selectedUserId === m.userId
                                ? "ring-2 ring-offset-1 bg-muted"
                                : "hover:bg-muted"
                                }`}
                            style={{ "--ring-color": m.color } as React.CSSProperties}
                        >
                            <span
                                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                                style={{ backgroundColor: m.color }}
                            />
                            <span className="font-medium">{m.displayName}</span>
                        </button>
                    ))}
                    {isReadOnly && (
                        <Badge variant="outline" className="text-xs">只读模式</Badge>
                    )}
                    {roomId && memberData.length > 0 && roomAdminId && (
                        <RoomSettingsDialog
                            roomId={roomId}
                            currentUser={currentUser}
                            roomAdminId={roomAdminId}
                            members={memberData as any}
                            currentFontSize={fontSize}
                            onFontSizeChange={handleFontSizeChange}
                            currentFontColor={fontColor}
                            onFontColorChange={handleFontColorChange}
                            currentBgImage={bgImage}
                            onBgImageChange={handleBgImageChange}
                        />
                    )}

                    {!isReadOnly && roomId && FEATURES.PENDING_EVENTS && (
                        <CreateEventDialog
                            key={selectedSlot ? selectedSlot.start.toISOString() : (editingEvent?.id || 'default')}
                            roomId={roomId}
                            open={eventDialogOpen}
                            onOpenChange={(open) => {
                                setEventDialogOpen(open);
                                if (!open) {
                                    setSelectedSlot(null);
                                    setEditingEvent(null);
                                }
                            }}
                            defaultStartTime={selectedSlot?.start}
                            defaultEndTime={selectedSlot?.end}
                            editingEvent={editingEvent}
                        />
                    )}
                </div>
            </div>

            {/* Calendar */}
            <div className="flex-1 overflow-hidden p-2 relative">
                {bgImage && (
                    <div
                        className="absolute inset-0 z-0 pointer-events-none"
                        style={{
                            backgroundImage: `url(${bgImage})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                            opacity: 0.12,
                        }}
                    />
                )}
                <div className="relative z-10 h-full">
                    <style>{`
          .rbc-calendar { font-family: var(--font-geist-sans), sans-serif; }
          .rbc-toolbar { display: none; }
          .rbc-time-view { border: none; }
          .rbc-month-view { border: none; }
          
          /* Force exact 10 hour viewport: 24 hours / 10 hours = 240% */
          .rbc-time-content > .rbc-time-gutter,
          .rbc-time-content > .rbc-day-slot {
              min-height: 240%;
          }
          
          /* Override container font variables */
          .rbc-calendar {
              --event-font-size: ${fontSize}rem;
              --event-font-color: ${fontColor};
          }

          .rbc-header { padding: 8px 4px; font-size: 0.8rem; font-weight: 500; color: hsl(var(--muted-foreground)); border-bottom: 1px solid hsl(var(--border)); }
          .rbc-day-bg + .rbc-day-bg { border-left: 1px solid hsl(var(--border)); }
          .rbc-month-row + .rbc-month-row { border-top: 1px solid hsl(var(--border)); }
          .rbc-off-range-bg { background: hsl(var(--muted) / 30%); }
          .rbc-today { background: hsl(var(--primary) / 5%); }
          .rbc-event { border: none !important; min-width: 12px; transition: z-index 0s, box-shadow 0.15s; container-type: inline-size; overflow: hidden; }
          .rbc-event:hover { z-index: 100 !important; box-shadow: 0 2px 8px rgba(0,0,0,0.25); }
          .rbc-event.rbc-selected { box-shadow: 0 0 0 2px hsl(var(--primary)); }
          /* Width-based responsive: shrink text when event is narrow */
          @container (max-width: 60px) {
            .event-content { font-size: 0.55rem !important; line-height: 1.1; }
            .event-detail { display: none; }
            .event-title { white-space: normal; word-break: break-all; }
          }
          @container (min-width: 61px) and (max-width: 100px) {
            .event-content { font-size: 0.62rem !important; }
            .event-detail { font-size: 0.55rem !important; }
          }
          @container (min-width: 101px) {
            .event-content { font-size: 0.72rem !important; }
          }
          /* --- Drag Selection Matrix Styles --- */
          /* Light mode: dark indicator */
          .rbc-slot-selection { 
              background: rgba(0, 0, 0, 0.1); 
              border: 1px dashed rgba(0, 0, 0, 0.5); 
              box-shadow: inset 0 0 0 1px hsl(var(--background));
              z-index: 10;
          }
          .rbc-slot-selecting .rbc-time-slot { border-top: 1px dashed rgba(0, 0, 0, 0.4); }
          /* Dark mode: light indicator (see below in .dark rules) */
          /* --- End Drag Styles --- */
          
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
          
          /* Dark mode drag styles */
          .dark .rbc-slot-selection {
              background: rgba(255, 255, 255, 0.15);
              border: 1px dashed rgba(255, 255, 255, 0.5);
          }
          .dark .rbc-slot-selecting .rbc-time-slot { border-top: 1px dashed rgba(255, 255, 255, 0.4); }
        `}</style>

                    <Calendar
                        localizer={localizer}
                        events={displayEvents}
                        selectable={FEATURES.PENDING_EVENTS && !isReadOnly && !!roomId}
                        onSelectSlot={handleSelectSlot}
                        onSelectEvent={handleSelectEvent}
                        view={rbcView}
                        onView={() => { }}
                        date={currentDate}
                        onNavigate={setCurrentDate}
                        eventPropGetter={eventStyleGetter}
                        dayLayoutAlgorithm="overlap"
                        components={{
                            event: viewMode === "month" ? MonthEventComponent : EventComponent,
                        }}
                        culture="zh-CN"
                        min={new Date(0, 0, 0, 0, 0)}
                        max={new Date(0, 0, 0, 23, 59)}
                        scrollToTime={new Date(0, 0, 0, defaultScrollHour, 0)}
                        popup
                        style={{ height: "100%" }}
                        messages={{
                            noEventsInRange: "该时间段内没有课程",
                            showMore: (total) => `还有 ${total} 节课`,
                        }}
                    />
                </div>

                {/* No data fallback */}
                {memberData.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="text-center text-muted-foreground">
                            <CalendarIcon className="w-12 h-12 mx-auto mb-3 opacity-30" />
                            <p>暂无成员课表数据</p>
                            <p className="text-sm mt-1">邀请成员加入并让他们导入课表</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
