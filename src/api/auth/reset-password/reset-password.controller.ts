import { Controller, Post, Body, Res, HttpStatus } from '@nestjs/common';
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
            const result = await this.authService.resetPassword(resetPasswordData.email);

            const response: ResetPasswordResponse = {
                success: true,
                message: result.message,
                // // In production, don't include the temporary password in response
                // data: {
                //     temporaryPassword: result.temporaryPassword,
                // },
            };

            res.status(HttpStatus.OK).json(response);
        } catch (error) {
            ({
                success: false,
                message: error.message || 'Password reset failed',
            })
        }
    }
}