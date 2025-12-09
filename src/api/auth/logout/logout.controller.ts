import { Request } from 'express';
import { LogoutResponse } from './logout.response';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { AuthService } from 'src/services/auth-service/auth.service';
import { Controller, Post, Req, UseGuards, BadRequestException } from '@nestjs/common';

@Controller('auth')
export class LogoutController {
    constructor(private readonly authService: AuthService) { }

    @Post('logout')
    @UseGuards(JwtAuthGuard)
    async logout(
        @Req() req: Request,
    ) {
        try {
            const userId = (req as any).user?.sub;

            await this.authService.logoutAPI(userId);

            const response: LogoutResponse = {
                success: true,
                message: 'Logged out successfully',
            };

            return response;

        } catch (error) {
            throw new BadRequestException({
                success: false,
                message: error.message || 'Logout failed',
            })
        }
    }
}