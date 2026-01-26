export class ChatMessageData {
    messageId: string;
    senderId: string;
    senderName: string;
    recipientId?: string;
    message: string;
    type: string;
    timestamp: Date;
}

export class GetChatHistoryResponse {
    success: boolean;
    message: string;
    data?: ChatMessageData[];
}
