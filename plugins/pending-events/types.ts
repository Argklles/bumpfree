export interface RoomEvent {
    id: string;
    room_id: string;
    creator_id: string;
    title: string;
    description: string | null;
    location: string | null;
    start_time: string; // ISO timestamptz
    end_time: string;   // ISO timestamptz
    status: "pending" | "confirmed" | "cancelled";
    created_at: string;
}
