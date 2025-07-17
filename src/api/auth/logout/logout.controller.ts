import { Controller, Post, Req, Res, HttpStatus, UseGuards, BadRequestException } from '@nestjs/common';
import { Request, Response } from 'express';
import { LogoutResponse } from './logout.response';
import { AuthService } from 'src/services/auth-service/auth.service';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';

@Controller('auth')
export class LogoutController {
    constructor(private readonly authService: AuthService) { }

    @Post('logout')
    @UseGuards(JwtAuthGuard)
    async logout(
        @Req() req: Request,
    ) {
        try {
            const sessionId = (req as any).user?.sessionId;

            await this.authService.logout(sessionId);

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