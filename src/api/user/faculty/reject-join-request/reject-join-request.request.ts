import { IsOptional, IsString } from 'class-validator';

export class RejectJoinRequest {

    @IsOptional()
    @IsString()
    reason?: string;

}
