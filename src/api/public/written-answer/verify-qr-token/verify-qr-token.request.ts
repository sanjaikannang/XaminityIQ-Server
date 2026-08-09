import { IsNotEmpty, IsString } from 'class-validator';

export class VerifyQrTokenRequest {

    @IsString()
    @IsNotEmpty()
    token: string;

}
