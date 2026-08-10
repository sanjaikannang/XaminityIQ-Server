export class RoomAssignmentDetailData {
    assignmentId: string;
    // Own exam identity — a pooled room mixes students from multiple exams,
    // so exam identity is read per-assignment, not inherited from the room
    examId: string;
    examName: string;
    studentId: string;
    studentCode: string;
    studentName: string;
    studentEmail: string;
    status: string;
    enteredWaitingRoomAt?: Date;
    admittedAt?: Date;
    removedAt?: Date;
    removalReason?: string;
}

export class ExamRoomSummaryData {
    roomId: string;
    facultyId: string;
    facultyCode: string;
    facultyName: string;
    facultyEmail: string;
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
    // Every student assigned to this room, across all pooled exams
    assignments: RoomAssignmentDetailData[];
}

export class GetExamRoomsResponse {
    success: boolean;
    message: string;
    data?: {
        rooms: ExamRoomSummaryData[];
    };
}
