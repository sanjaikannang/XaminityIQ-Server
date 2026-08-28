export class AnswerPageData {
    pageNumber: number;
    cloudinaryUrl: string;
    uploadedAt: Date;
}

export class EvaluationAnswerData {
    answerId: string;
    attemptId: string;
    studentCode: string;
    type: string;
    questionText: string;
    maxMarks: number;
    pages: AnswerPageData[];
    answerText?: string;
    marksAwarded?: number;
    remarks?: string;
    evaluatedAt?: Date;
}

export class GetExamAnswersForEvaluationResponse {
    success: boolean;
    message: string;
    data?: EvaluationAnswerData[];
}
