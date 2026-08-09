export class MyExamRoomData {
    roomId: string;
    examId: string;
    examName: string;
    startDateTime: Date;
    endDateTime: Date;
    status: string;
    studentCount: number;
}

export class GetMyExamRoomsResponse {
    success: boolean;
    message: string;
    data?: MyExamRoomData[];
}
