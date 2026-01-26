export class JoinRequestData {
    requestId: string;
    studentId: string;
    studentName: string;
    timestamp: Date;
    deviceStatus: {
        camera: boolean;
        microphone: boolean;
        screenShare: boolean;
        fullscreen: boolean;
    };
}

export class GetPendingJoinRequestsResponse {
    success: boolean;
    message: string;
    data?: JoinRequestData[];
}