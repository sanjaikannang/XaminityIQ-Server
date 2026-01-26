export class FacultyExamData {
    examId: string;
    examName: string;
    date: Date;
    time: string;
    duration: number;
    status: string;
}

export class GetFacultyExamsResponse {
    success: boolean;
    message: string;
    data?: FacultyExamData[];
}