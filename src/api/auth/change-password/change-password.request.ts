import { IsString, IsNotEmpty, MinLength } from 'class-validator';

export class ChangePasswordRequest {

  @IsString()
  @IsNotEmpty()
  currentPassword: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  newPassword: string;

  @IsString()
  @IsNotEmpty()
  confirmPassword: string;
  
}