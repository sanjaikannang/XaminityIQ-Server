import { Controller, Post, Body, Res, HttpStatus, BadRequestException } from '@nestjs/common';
import { Response } from 'express';
import { ResetPasswordRequest } from './reset-password.request';
import { ResetPasswordResponse } from './reset-password.response';
import { AuthService } from 'src/services/auth-service/auth.service';

@Controller('auth')
export class ResetPasswordController {
    constructor(private readonly authService: AuthService) { }

    @Post('reset-password')
    async resetPassword(
        @Body() resetPasswordData: ResetPasswordRequest,
        @Res() res: Response,
    ) {
        try {
            const result = await this.authService.resetPasswordAPI(resetPasswordData.email);

            const response: ResetPasswordResponse = {
                success: true,
                message: result.message,
                // // In production, don't include the temporary password in response
                // data: {
                //     temporaryPassword: result.temporaryPassword,
                // },
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