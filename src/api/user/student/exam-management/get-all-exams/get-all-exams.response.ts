export class MyExamData {
    _id: string;
    name: string;
    description?: string;
    mode: string;
    status: string;
    subjectName?: string;
    durationMinutes: number;
    totalMarks: number;
    passingMarks: number;
    startDate: Date;
    endDate: Date;
    myAttemptId: string | null;
    myAttemptStatus: string | null;
    totalScore?: number;
    passed?: boolean;
}

export class GetAllExamsResponse {
    success: boolean;
    message: string;
    data?: MyExamData[];
}
