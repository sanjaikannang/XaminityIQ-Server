export class ChatMessageData {
    _id: string;
    senderRole: string;
    senderId: string;
    recipientType: string;
    recipientStudentId?: string;
    message: string;
    sentAt: Date;
}

export class SendChatResponse {
    success: boolean;
    message: string;
    data?: ChatMessageData;
}
