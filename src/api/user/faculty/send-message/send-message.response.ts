export class SendMessageResponse {
    success: boolean;
    message: string;
    data?: {
        messageId: string;
        timestamp: Date;
    };
}