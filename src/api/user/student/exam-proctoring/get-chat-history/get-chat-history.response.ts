import { ChatMessageData } from '../send-chat/send-chat.response';

export class GetChatHistoryResponse {
    success: boolean;
    message: string;
    data?: ChatMessageData[];
}
