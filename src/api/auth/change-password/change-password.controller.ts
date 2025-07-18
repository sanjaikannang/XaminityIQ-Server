import { Controller, Post, Body, Req, Res, HttpStatus, UseGuards, BadRequestException } from '@nestjs/common';
import { Request, Response } from 'express';
import { ChangePasswordRequest } from './change-password.request';
import { ChangePasswordResponse } from './change-password.response';
import { AuthService } from 'src/services/auth-service/auth.service';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';

@Controller('auth')
export class ChangePasswordController {
    constructor(private readonly authService: AuthService) { }

    @Post('change-password')
    @UseGuards(JwtAuthGuard)
    async changePassword(
        @Body() changePasswordData: ChangePasswordRequest,
        @Req() req: Request,
        @Res() res: Response,
    ) {
        try {
            const userId = (req as any).user?.sub;

            await this.authService.changePasswordAPI(userId, changePasswordData);

            const response: ChangePasswordResponse = {
                success: true,
                message: 'Password changed successfully',
            };

            return response;

        } catch (error) {
            throw new BadRequestException({
                success: false,
                message: error.message || 'Password change failed',
            })
        }
    }
}
