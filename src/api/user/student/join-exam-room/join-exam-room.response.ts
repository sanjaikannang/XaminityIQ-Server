export class JoinExamRoomData {
    roomId: string;
    authToken: string;
    examName: string;
    duration: number;
}

export class JoinExamRoomResponse {
    success: boolean;
    message: string;
    data: JoinExamRoomData;
}
