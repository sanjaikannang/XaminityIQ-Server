export class SubmitAttemptResponse {
    success: boolean;
    message: string;
    status?: string;
    objectiveScore?: number;
    totalScore?: number;
    passed?: boolean;
}
