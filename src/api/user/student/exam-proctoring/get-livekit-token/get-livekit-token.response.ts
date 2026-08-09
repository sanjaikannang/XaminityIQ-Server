export class LiveKitTokenData {
    token: string;
    liveKitUrl: string;
    roomName: string;
    roomId: string;
    identity: string;
    facultyIdentity: string;
}

export class GetLiveKitTokenResponse {
    success: boolean;
    message: string;
    data?: LiveKitTokenData;
}
