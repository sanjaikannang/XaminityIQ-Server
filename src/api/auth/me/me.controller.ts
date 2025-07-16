import { Controller, Get, Req, Res, HttpStatus, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import { MeResponse } from './me.response';
import { AuthService } from 'src/services/auth-service/auth.service';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';

@Controller('auth')
export class MeController {
    constructor(private readonly authService: AuthService) { }

    @Get('me')
    @UseGuards(JwtAuthGuard)
    async getMe(@Req() req: Request, @Res() res: Response): Promise<void> {
        try {
            const userId = req.user?.sub;

            const userProfile = await this.authService.getMe(userId);

            const response: MeResponse = {
                success: true,
                message: 'User profile retrieved successfully',
                data: userProfile,
            };

            res.status(HttpStatus.OK).json(response);
        } catch (error) {
            const response: MeResponse = {
                success: false,
                message: error.message || 'Failed to retrieve user profile',
            };
            res.status(HttpStatus.UNAUTHORIZED).json(response);
        }
    }
}
