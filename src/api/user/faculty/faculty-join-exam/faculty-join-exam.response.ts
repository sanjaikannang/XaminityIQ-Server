export class FacultyJoinExamResponse {
    success: boolean;
    message: string;
    data?: {
        rtcToken: string;
        rtmToken: string;
        channelName: string;
        uid: string;
        expiresAt: Date;
    };
}