import { Request } from 'express';
import { LoginRequest } from './login.request';
import { LoginResponse } from './login.response';
import { AuthService } from 'src/services/auth-service/auth.service';
import { Controller, Post, Body, Req, BadRequestException } from '@nestjs/common';

@Controller('auth')
export class LoginController {
    constructor(private readonly authService: AuthService) { }

    @Post('login')
    async login(
        @Body() loginData: LoginRequest,
        @Req() req: Request,
    ) {
        try {
            const result = await this.authService.loginAPI(loginData, {
                ipAddress: req.ip,
                userAgent: req.headers['user-agent'],
            });

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