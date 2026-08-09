import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class SendChatRequest {

    @IsString()
    @IsNotEmpty()
    @MaxLength(1000)
    message: string;

}
