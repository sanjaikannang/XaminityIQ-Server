import { MessageType } from 'src/utils/enum';
import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';

export class SendMessageRequest {

    @IsString()
    @IsNotEmpty()
    senderId: string;

    @IsString()
    @IsOptional()
    recipientId?: string;

    @IsString()
    @IsNotEmpty()
    message: string;

    @IsEnum(MessageType)
    type: MessageType;
    
}