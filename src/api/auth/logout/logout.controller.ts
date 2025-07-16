import { Controller, Post, Req, Res, HttpStatus, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import { LogoutResponse } from './logout.response';
import { AuthService } from 'src/services/auth-service/auth.service';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';

@Controller('auth')
export class LogoutController {
    constructor(private readonly authService: AuthService) { }

    @Post('logout')
    @UseGuards(JwtAuthGuard)
    async logout(@Req() req: Request, @Res() res: Response): Promise<void> {
        try {
            const sessionId = req.user?.sessionId;

            await this.authService.logout(sessionId);

            const response: LogoutResponse = {
                success: true,
                message: 'Logged out successfully',
            };

            res.status(HttpStatus.OK).json(response);
        } catch (error) {
            const response: LogoutResponse = {
                success: false,
                message: error.message || 'Logout failed',
            };
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(response);
        }
    }
}