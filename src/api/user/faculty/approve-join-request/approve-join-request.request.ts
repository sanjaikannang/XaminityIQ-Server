import { IsString, IsNotEmpty } from 'class-validator';

export class ApproveJoinRequestRequest {
    @IsString()
    @IsNotEmpty()
    requestId: string;
}