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
}

export class GetExamRoomsResponse {
    success: boolean;
    message: string;
    data?: {
        rooms: ExamRoomSummaryData[];
    };
}
