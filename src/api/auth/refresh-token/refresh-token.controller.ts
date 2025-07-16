import { Controller, Post, Body, Res, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { RefreshTokenRequest } from './refresh-token.request';
import { RefreshTokenResponse } from './refresh-token.response';
import { AuthService } from 'src/services/auth-service/auth.service';

@Controller('auth')
export class RefreshTokenController {
    constructor(private readonly authService: AuthService) { }

    @Post('refresh-token')
    async refreshToken(
        @Body() refreshTokenData: RefreshTokenRequest,
        @Res() res: Response,
    ): Promise<void> {
        try {
            const tokens = await this.authService.refreshToken(refreshTokenData);

            const response: RefreshTokenResponse = {
                success: true,
                message: 'Token refreshed successfully',
                data: tokens,
            };

            res.status(HttpStatus.OK).json(response);
        } catch (error) {
            const response: RefreshTokenResponse = {
                success: false,
                message: error.message || 'Token refresh failed',
            };
            res.status(HttpStatus.UNAUTHORIZED).json(response);
        }
    }
}
