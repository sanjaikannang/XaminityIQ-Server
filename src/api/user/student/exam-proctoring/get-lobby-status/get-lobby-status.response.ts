export class LobbyStatusData {
    status: string;
    attemptId: string | null;
    removalReason?: string;
}

export class GetLobbyStatusResponse {
    success: boolean;
    message: string;
    data?: LobbyStatusData;
}
