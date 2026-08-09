export class ExamRoomSummaryData {
    roomId: string;
    facultyId: string;
    facultyCode: string;
    liveKitSessionId: string;
    startDateTime: Date;
    endDateTime: Date;
    status: string;
    waitingCount: number;
    admittedCount: number;
    inProgressCount: number;
    completedCount: number;
    removedOrRejectedCount: number;
    totalCount: number;
    // Every assignment in the room, any exam — differs from totalCount (this
    // exam's own count) only when the room has been pooled with other exams
    roomTotalOccupancy: number;
    // Names of other exams sharing this room, empty if it wasn't pooled
    pooledWithExamNames: string[];
}

export class GetExamRoomsResponse {
    success: boolean;
    message: string;
    data?: {
        rooms: ExamRoomSummaryData[];
    };
}
