import * as crypto from 'crypto';
import { Types } from "mongoose";
import { AuthJwtService } from './jwt.service';
import { UserRole } from 'src/utils/enum';
import { PasswordService } from './password.service';
import { ConfigService } from 'src/config/config.service';
import { LoginRequest } from 'src/api/auth/login/login.request';
import { AuthAction } from 'src/schemas/AuthActivityLog/auth-activity-log.schema';
import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { UserRepositoryService } from 'src/repositories/user-repository/user.repository';
import { ResetPasswordRequest } from 'src/api/auth/reset-password/reset-password.request';
import { ChangePasswordRequest } from 'src/api/auth/change-password/change-password.request';
import { AuthActivityLogRepositoryService } from 'src/repositories/auth-activity-log-repository/auth-activity-log.repository';

export interface RequestMetadata {
    ipAddress?: string;
    userAgent?: string;
}

function hashResetToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
}

@Injectable()
export class AuthService {
    constructor(
        private readonly userRepositoryService: UserRepositoryService,
        private readonly authActivityLogRepositoryService: AuthActivityLogRepositoryService,
        private readonly passwordService: PasswordService,
        private readonly jwtService: AuthJwtService,
        private readonly configService: ConfigService,
    ) { }


    // Login API Endpoint
    async loginAPI(loginData: LoginRequest, meta: RequestMetadata = {}) {
        const { email, password } = loginData;

        // Find user by email
        const user = await this.userRepositoryService.findUserByEmail(email);
        if (!user) {
            throw new UnauthorizedException('Invalid email or password');
        }

        // Verify password
        const isPasswordValid = await this.passwordService.comparePassword(password, user.password);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid email or password');
        }

        const userId = (user._id as Types.ObjectId).toString();

        // Generate tokens
        const accessToken = this.jwtService.generateAccessToken({
            sub: userId,
            email: user.email,
            role: user.role,
        });

        const refreshToken = this.jwtService.generateRefreshToken({
            sub: userId,
            email: user.email,
            role: user.role,
        });

        // Update user with tokens and last login
        await this.userRepositoryService.updateUserTokens(userId, accessToken, refreshToken);
        await this.userRepositoryService.updateLastLogin(userId);

        // Record login activity
        await this.authActivityLogRepositoryService.create({
            userId: user._id as Types.ObjectId,
            email: user.email,
            role: user.role,
            action: AuthAction.LOGIN,
            ipAddress: meta.ipAddress,
            userAgent: meta.userAgent,
        });

        return {
            user: {
                id: (user._id as Types.ObjectId).toString(),
                email: user.email,
                role: user.role,
                isFirstLogin: user.isFirstLogin,
            },
            tokens: {
                accessToken,
                refreshToken
            },
        };
    }


    // Refresh Token API Endpoint
    async refreshTokenAPI(refreshToken: string) {
        try {
            // Verify refresh token
            const payload = this.jwtService.verifyRefreshToken(refreshToken);

            // Find user by refresh token
            const user = await this.userRepositoryService.findUserByRefreshToken(refreshToken);
            if (!user) {
                throw new UnauthorizedException('Invalid refresh token');
            }

            // Generate new tokens
            const newAccessToken = this.jwtService.generateAccessToken({
                sub: payload.sub,
                email: payload.email,
                role: payload.role,
            });

            const newRefreshToken = this.jwtService.generateRefreshToken({
                sub: payload.sub,
                email: payload.email,
                role: payload.role,
            });

            // Update user with new tokens
            await this.userRepositoryService.updateUserTokens(
                payload.sub,
                newAccessToken,
                newRefreshToken
            );

            return {
                accessToken: newAccessToken,
                refreshToken: newRefreshToken,
            };
        } catch (error) {
            throw new UnauthorizedException('Invalid refresh token');
        }
    }


    // Change Password API Endpoint
    async changePasswordAPI(changePasswordData: ChangePasswordRequest) {
        const { email, currentPassword, newPassword, confirmPassword } = changePasswordData;

        if (newPassword !== confirmPassword) {
            throw new BadRequestException('New password and confirm password do not match');
        }

        // Find user by email instead of userId
        const user = await this.userRepositoryService.findUserByEmail(email);
        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        // Check if user has already changed password
        if (!user.isFirstLogin) {
            throw new BadRequestException('You have already changed your password. Please use the login to access your account.');
        }

        // Verify current password
        const isCurrentPasswordValid = await this.passwordService.comparePassword(currentPassword, user.password);
        if (!isCurrentPasswordValid) {
            throw new UnauthorizedException('Current password is incorrect');
        }

        // Validate new password strength
        const passwordValidation = this.passwordService.validatePasswordStrength(newPassword);
        if (!passwordValidation.isValid) {
            throw new BadRequestException(passwordValidation.message);
        }

        // Hash new password
        const hashedPassword = await this.passwordService.hashPassword(newPassword);

        // Update password
        await this.userRepositoryService.updateUserPassword((user._id as Types.ObjectId).toString(), hashedPassword);

        return {
            message: 'Password changed successfully'
        };
    }


    // Logout API Endpoint
    async logoutAPI(userId: string, meta: RequestMetadata & { email: string; role: UserRole }) {
        try {
            // Clear tokens from user
            await this.userRepositoryService.clearUserTokens(userId);

            // Record logout activity
            await this.authActivityLogRepositoryService.create({
                userId: new Types.ObjectId(userId),
                email: meta.email,
                role: meta.role,
                action: AuthAction.LOGOUT,
                ipAddress: meta.ipAddress,
                userAgent: meta.userAgent,
            });

            return {
                message: 'Logged out successfully'
            };

        } catch (error) {
            throw new UnauthorizedException('Failed to logout');
        }
    }


    // Forgot Password API Endpoint
    async forgotPasswordAPI(email: string) {
        const user = await this.userRepositoryService.findUserByEmail(email);

        if (user && user.role === UserRole.ADMIN) {
            throw new BadRequestException('Forgot password is not available for admin accounts');
        }

        if (user) {
            const userId = (user._id as Types.ObjectId).toString();

            const resetToken = this.jwtService.generatePasswordResetToken({
                sub: userId,
                email: user.email,
            });

            const tokenHash = hashResetToken(resetToken);
            const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

            await this.userRepositoryService.setPasswordResetToken(userId, tokenHash, expiresAt);

            const resetLink = `${this.configService.getFrontEndBaseUrl2()}/reset-password/${resetToken}`;

            // TODO: integrate email service to send resetLink to user.email
            console.log(`Password reset link for ${user.email}: ${resetLink}`);
        }

        return {
            message: 'If this email is registered, a password reset link has been generated.',
        };
    }


    // Reset Password API Endpoint
    async resetPasswordAPI(resetData: ResetPasswordRequest) {
        const { token, newPassword, confirmPassword } = resetData;

        if (newPassword !== confirmPassword) {
            throw new BadRequestException('New password and confirm password do not match');
        }

        let payload;
        try {
            payload = this.jwtService.verifyPasswordResetToken(token);
        } catch (error) {
            throw new BadRequestException('Reset link is invalid or has expired');
        }

        const user = await this.userRepositoryService.findById(payload.sub);
        if (!user || !user.resetPasswordTokenHash || !user.resetPasswordTokenExpiresAt) {
            throw new BadRequestException('Reset link is invalid or has expired');
        }

        if (user.resetPasswordTokenExpiresAt.getTime() < Date.now()) {
            throw new BadRequestException('Reset link is invalid or has expired');
        }

        if (hashResetToken(token) !== user.resetPasswordTokenHash) {
            throw new BadRequestException('Reset link is invalid or has expired');
        }

        const passwordValidation = this.passwordService.validatePasswordStrength(newPassword);
        if (!passwordValidation.isValid) {
            throw new BadRequestException(passwordValidation.message);
        }

        const hashedPassword = await this.passwordService.hashPassword(newPassword);

        await this.userRepositoryService.resetPassword((user._id as Types.ObjectId).toString(), hashedPassword);

        return {
            message: 'Password has been reset successfully. Please log in with your new password.',
        };
    }

}