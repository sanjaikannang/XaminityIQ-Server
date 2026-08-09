export class FormedRoomData {
    roomId: string;
    facultyId: string;
    facultyCode: string;
    liveKitSessionId: string;
    studentCount: number;
}

export class FormExamRoomsResponse {
    success: boolean;
    message: string;
    data?: {
        rooms: FormedRoomData[];
    };
}
