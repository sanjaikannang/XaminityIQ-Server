import { IsEnum, IsMongoId, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { ChatRecipientType } from 'src/utils/enum';

export class SendChatRequest {

    @IsString()
    @IsNotEmpty()
    @MaxLength(1000)
    message: string;

    @IsEnum(ChatRecipientType)
    recipientType: ChatRecipientType;

    @IsOptional()
    @IsMongoId()
    recipientStudentId?: string;

}
