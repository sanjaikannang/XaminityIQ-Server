export class StudentJoinRequestResponse {
    success: boolean;
    message: string;
    data?: {
        requestId: string;
        status: string;
        timestamp: Date;
    };
}