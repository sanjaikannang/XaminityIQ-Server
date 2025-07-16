import { IsEmail, IsString, IsNotEmpty } from 'class-validator';

export class LoginRequest {

    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    password: string;
    
}