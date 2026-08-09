export class FormedRoomData {
    roomId: string;
    facultyId: string;
    facultyCode: string;
    liveKitSessionId: string;
    studentCount: number;
    // Names of every exam represented in this room — more than one entry means
    // this room combines leftover students pooled across window-sibling exams
    pooledExamNames: string[];
}

export class FormExamRoomsResponse {
    success: boolean;
    message: string;
    data?: {
        rooms: FormedRoomData[];
    };
}
