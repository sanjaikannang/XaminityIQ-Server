import { IsString, IsNotEmpty } from 'class-validator';

export class RejectJoinRequestRequest {

    @IsString()
    @IsNotEmpty()
    requestId: string;

    @IsString()
    @IsNotEmpty()
    reason: string;
    
}