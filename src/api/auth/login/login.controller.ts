import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { LoginRequest } from './login.request';
import { LoginResponse } from './login.response';
import { AuthService } from 'src/services/auth-service/auth.service';

@Controller('auth')
export class LoginController {
    constructor(private readonly authService: AuthService) { }

    @Post('login')
    async login(
        @Body() loginData: LoginRequest,
    ) {
        try {
            const result = await this.authService.loginAPI(loginData);

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