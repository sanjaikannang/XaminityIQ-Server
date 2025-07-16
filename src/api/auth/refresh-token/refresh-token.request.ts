import { IsString, IsNotEmpty } from 'class-validator';

export class RefreshTokenRequest {

  @IsString()
  @IsNotEmpty()
  refreshToken: string;

  @IsString()
  @IsNotEmpty()
  sessionId: string;
  
}