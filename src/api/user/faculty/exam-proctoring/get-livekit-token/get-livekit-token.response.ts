export class FacultyLiveKitTokenData {
    token: string;
    liveKitUrl: string;
    roomName: string;
    identity: string;
}

export class GetLiveKitTokenResponse {
    success: boolean;
    message: string;
    data?: FacultyLiveKitTokenData;
}
