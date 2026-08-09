export class ExamAttemptSummaryData {
    attemptId: string;
    studentId: string;
    studentCode: string;
    status: string;
    isFlagged: boolean;
    // Count of each logged ViolationType for this attempt, keyed by type
    violationCounts: Record<string, number>;
    totalScore?: number;
    passed?: boolean;
}

export class GetExamAttemptsResponse {
    success: boolean;
    message: string;
    data?: { attempts: ExamAttemptSummaryData[] };
}
