import { Controller, Post, Body, Req, Res, HttpStatus, UseGuards } from '@nestjs/common';
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
    ): Promise<void> {
        try {
            const userId = req.user?.sub;

            await this.authService.changePassword(userId, changePasswordData);

            const response: ChangePasswordResponse = {
                success: true,
                message: 'Password changed successfully',
            };

            res.status(HttpStatus.OK).json(response);
        } catch (error) {
            const response: ChangePasswordResponse = {
                success: false,
                message: error.message || 'Password change failed',
            };

            const statusCode = error.status || HttpStatus.INTERNAL_SERVER_ERROR;
            res.status(statusCode).json(response);
        }
    }
}
