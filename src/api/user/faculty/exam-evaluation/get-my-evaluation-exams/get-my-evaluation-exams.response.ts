export class MyEvaluationExamData {
    examId: string;
    name: string;
    status: string;
    totalMarks: number;
}

export class GetMyEvaluationExamsResponse {
    success: boolean;
    message: string;
    data?: MyEvaluationExamData[];
}
