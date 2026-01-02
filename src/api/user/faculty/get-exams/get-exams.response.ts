export class FacultyExam {
    examId: string;
    examName: string;
    examDate: Date;
    startTime: string;
    endTime: string;
    duration: number;
    mode: string;
    status: string;
    totalStudents: number;
    roomCreated: boolean;
    hmsRoomId?: string;
}

export class GetExamsResponse {

    success: boolean;
    message: string;
    data: FacultyExam[];

}