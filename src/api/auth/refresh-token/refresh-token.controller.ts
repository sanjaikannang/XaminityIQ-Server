import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { RefreshTokenRequest } from './refresh-token.request';
import { RefreshTokenResponse } from './refresh-token.response';
import { AuthService } from 'src/services/auth-service/auth.service';

@Controller('auth')
export class RefreshTokenController {
    constructor(private readonly authService: AuthService) { }

    @Post('refresh-token')
    async refreshToken(
        @Body() refreshTokenData: RefreshTokenRequest,
    ) {
        try {
            const tokens = await this.authService.refreshToken(refreshTokenData);

            const response: RefreshTokenResponse = {
                success: true,
                message: 'Token refreshed successfully',
                data: tokens,
            };

            return response;

        } catch (error) {
            throw new BadRequestException({
                success: false,
                message: error.message || 'Token refresh failed',
            })
        }
    }
}
