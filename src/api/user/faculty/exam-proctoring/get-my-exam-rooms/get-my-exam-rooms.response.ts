export class RoomExamRef {
    examId: string;
    examName: string;
}

export class MyExamRoomData {
    roomId: string;
    // Every distinct exam represented in this room — more than one entry means
    // this room pools leftover students from multiple window-sibling exams
    exams: RoomExamRef[];
    startDateTime: Date;
    endDateTime: Date;
    // Persisted room status (in practice always SCHEDULED — see
    // ExamRoomRepositoryService.buildEffectiveStatusFilter) alongside the
    // time-derived one the client actually renders and gates on
    status: string;
    effectiveStatus: 'UPCOMING' | 'IN_PROGRESS' | 'COMPLETED';
    studentCount: number;
}

export class GetMyExamRoomsResponse {
    success: boolean;
    message: string;
    data?: MyExamRoomData[];
}
