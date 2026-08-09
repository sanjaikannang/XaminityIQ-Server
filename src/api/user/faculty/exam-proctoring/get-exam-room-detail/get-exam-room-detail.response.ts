export class RoomExamRef {
    examId: string;
    examName: string;
}

export class RoomAssignmentData {
    assignmentId: string;
    // Own exam identity — a pooled room mixes students from multiple exams,
    // so exam identity is read per-assignment, not inherited from the room
    examId: string;
    examName: string;
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
    // Every distinct exam represented in this room
    exams: RoomExamRef[];
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
