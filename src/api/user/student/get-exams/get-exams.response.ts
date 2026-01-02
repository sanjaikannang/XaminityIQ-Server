export class StudentExam {
    examId: string;
    examName: string;
    examDate: Date;
    startTime: string;
    endTime: string;
    duration: number;
    mode: string;
    status: string;
    enrollmentStatus: string;
    canJoin: boolean;
}

export class GetExamsResponse {

    message: string;
    success: boolean;
    data: StudentExam[];

}