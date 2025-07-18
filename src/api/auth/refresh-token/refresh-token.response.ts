export class RefreshTokenResponse {

  success: boolean;
  message: string;
  data?: {
    accessToken: string;
    refreshToken: string;
  };
  
}