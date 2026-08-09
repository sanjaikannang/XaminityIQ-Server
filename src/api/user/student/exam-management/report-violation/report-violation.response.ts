export class ReportViolationResponse {
    success: boolean;
    message?: string;
    violationCount: number;
    terminated: boolean;
    status?: string;
    objectiveScore?: number;
    totalScore?: number;
    passed?: boolean;
}
