import { Controller, Post, Body, Req, Res, HttpStatus, BadRequestException } from '@nestjs/common';
import { Request, Response } from 'express';
import { LoginRequest } from './login.request';
import { LoginResponse } from './login.response';
import { AuthService } from 'src/services/auth-service/auth.service';

@Controller('auth')
export class LoginController {
    constructor(private readonly authService: AuthService) { }

    @Post('login')
    async login(
        @Body() loginData: LoginRequest,
        @Req() req: Request,
    ) {
        try {
            const userAgent = req.headers['user-agent'] || '';
            const ipAddress = req.ip || req.connection.remoteAddress || '';

            const result = await this.authService.loginAPI(loginData, userAgent, ipAddress);

            const response: LoginResponse = {
                success: true,
                message: result.user.isFirstLogin
                    ? 'Login successful. Please change your password.'
                    : 'Login successful',
                data: {
                    user: result.user,
                    tokens: {
                        accessToken: result.tokens.accessToken,
                        refreshToken: result.tokens.refreshToken,
                    },
                    sessionId: result.sessionId,
                },
            };

            return response;

        } catch (error) {
            throw new BadRequestException({
                success: false,
                message: error.message || 'Login failed',
            });
        }
    }
}