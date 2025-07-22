import { Controller, Get, Req, UseGuards, BadRequestException } from '@nestjs/common';
import { Request } from 'express';
import { MeResponse } from './me.response';
import { AuthService } from 'src/services/auth-service/auth.service';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';

@Controller('auth')
export class MeController {
    constructor(private readonly authService: AuthService) { }

    @Get('me')
    @UseGuards(JwtAuthGuard)
    async getMe(
        @Req() req: Request,
    ) {
        try {
            const userId = (req as any).user?.sub;

            const userProfile = await this.authService.getMeAPI(userId);

            const response: MeResponse = {
                success: true,
                message: 'User profile retrieved successfully',
                data: userProfile,
            };

            return response;
        } catch (error) {
            throw new BadRequestException({
                success: false,
                message: error.message || 'Failed to retrieve user profile',
            })
        }
    }
}
