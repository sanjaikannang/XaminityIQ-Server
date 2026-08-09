export class AnswerPageData {
    pageNumber: number;
    cloudinaryUrl: string;
    uploadedAt: Date;
}

export class EvaluationAnswerData {
    answerId: string;
    attemptId: string;
    studentCode: string;
    questionText: string;
    maxMarks: number;
    pages: AnswerPageData[];
    marksAwarded?: number;
    remarks?: string;
    evaluatedAt?: Date;
}

export class GetExamAnswersForEvaluationResponse {
    success: boolean;
    message: string;
    data?: EvaluationAnswerData[];
}
