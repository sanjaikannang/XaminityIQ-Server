export class QuestionUploadResult {
    rowNumber: number;
    questionId?: string;
    status: 'success' | 'failed';
    error?: string;
}

export class BulkUploadQuestionsSummary {
    totalRecords: number;
    successCount: number;
    failedCount: number;
    successfulUploads: QuestionUploadResult[];
    failedUploads: QuestionUploadResult[];
}

export class BulkUploadQuestionsResponse {
    success: boolean;
    message: string;
    summary: BulkUploadQuestionsSummary;
}
