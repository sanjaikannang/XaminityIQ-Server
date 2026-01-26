export class FinishExamResponse {
    success: boolean;
    message: string;
    data?: {
        duration: number;
        timestamp: Date;
    };
}