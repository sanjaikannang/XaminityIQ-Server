export class EvaluationProgressData {
    totalWrittenAnswers: number;
    evaluatedCount: number;
    pendingCount: number;
}

export class GetEvaluationProgressResponse {
    success: boolean;
    message: string;
    data?: EvaluationProgressData;
}
