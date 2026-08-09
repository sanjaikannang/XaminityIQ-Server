import { IsEmail, IsNotEmpty } from 'class-validator';

export class ForgotPasswordRequest {

    @IsEmail()
    @IsNotEmpty()
    email: string;

}
