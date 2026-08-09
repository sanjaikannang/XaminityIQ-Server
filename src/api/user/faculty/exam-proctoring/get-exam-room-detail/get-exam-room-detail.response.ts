export class RoomAssignmentData {
    assignmentId: string;
    studentId: string;
    studentCode: string;
    attemptId: string | null;
    status: string;
    enteredWaitingRoomAt?: Date;
    admittedAt?: Date;
    removedAt?: Date;
    removalReason?: string;
}

export class ExamRoomDetailData {
    roomId: string;
    examId: string;
    examName: string;
    startDateTime: Date;
    endDateTime: Date;
    status: string;
    liveKitSessionId: string;
    assignments: RoomAssignmentData[];
}

export class GetExamRoomDetailResponse {
    success: boolean;
    message: string;
    data?: ExamRoomDetailData;
}
