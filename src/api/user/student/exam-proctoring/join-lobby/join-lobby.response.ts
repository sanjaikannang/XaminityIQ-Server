export class JoinLobbyData {
    roomId: string;
    assignmentId: string;
    status: string;
}

export class JoinLobbyResponse {
    success: boolean;
    message: string;
    data?: JoinLobbyData;
}
