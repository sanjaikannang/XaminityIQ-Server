export class CheckJoinStatusResponse {
    success: boolean;
    message: string;
    data?: {
        status: string;
        reason?: string;
        tokens?: {
            rtcToken: string;
            rtmToken: string;
            channelName: string;
            uid: string;
            expiresAt: Date;
        };
    };
}