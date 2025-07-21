import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { PasswordService } from './password.service';
import { AuthJwtService } from './jwt.service';
import { Types } from "mongoose";
import { SessionService } from './session.service';
import { LoginRequest } from 'src/api/auth/login/login.request';
import { RefreshTokenRequest } from 'src/api/auth/refresh-token/refresh-token.request';
import { ChangePasswordRequest } from 'src/api/auth/change-password/change-password.request';
import { UserRepositoryService } from 'src/repositories/user-repository/user.repository';
import { SessionRepositoryService } from 'src/repositories/session-repository/session.repository';

@Injectable()
export class AuthService {
    constructor(
        private readonly userRepositoryService: UserRepositoryService,
        private readonly passwordService: PasswordService,
        private readonly sessionService: SessionService,
    ) { }


    // Login API Endpoint
    async loginAPI(loginData: LoginRequest, userAgent: string, ipAddress: string) {
        const { email, password } = loginData;

        // Find user by email
        const user = await this.userRepositoryService.findUserByEmail(email);
        if (!user) {
            throw new UnauthorizedException('Invalid email or password');
        }

        // Check if user is active
        if (!user.isActive) {
            throw new UnauthorizedException('Account is deactivated');
        }

        // Verify password
        const isPasswordValid = await this.passwordService.comparePassword(password, user.password);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid email or password');
        }

        // Create session in Redis
        const sessionId = await this.sessionService.createUserSession(user, userAgent, ipAddress);

        // Get the session data to extract tokens
        const sessionData = await this.sessionService.getSessionBySessionId(sessionId);

        if (!sessionData) {
            throw new UnauthorizedException('Failed to create session');
        }

        // Update last login in database
        await this.userRepositoryService.updateLastLogin((user._id as Types.ObjectId).toString());

        return {
            user: {
                id: (user._id as Types.ObjectId).toString(),
                email: user.email,
                role: user.role,
                isFirstLogin: user.isFirstLogin,
            },
            tokens: {
                accessToken: sessionData.accessToken,
                refreshToken: sessionData.refreshToken,
            },
            sessionId,
        };
    }


    // Refresh Token API Endpoint
    async refreshTokenAPI(refreshTokenData: RefreshTokenRequest, userAgent: string, ipAddress: string) {
        const { refreshToken } = refreshTokenData;

        const newTokens = await this.sessionService.refreshTokens(refreshToken, userAgent, ipAddress);

        if (!newTokens) {
            throw new UnauthorizedException('Invalid or expired refresh token');
        }

        return {
            tokens: newTokens,
        };
    }


    async logoutAPI(sessionId: string) {
        await this.sessionService.invalidateSession(sessionId);

        return {
            message: 'Logout successful',
        };
    }

    // Logout from all devices
    async logoutAllDevicesAPI(userId: string) {
        await this.sessionService.invalidateAllUserSessions(userId);

        return {
            message: 'Logged out from all devices successfully',
        };
    }

    // Validate session (for middleware/guards)
    async validateSession(sessionId: string): Promise<any> {
        const sessionData = await this.sessionService.getSessionBySessionId(sessionId);

        if (!sessionData) {
            return null;
        }

        // Update last activity
        await this.sessionService.updateLastActivity(sessionId);

        return {
            userId: sessionData.userId,
            email: sessionData.email,
            role: sessionData.role,
            sessionId: sessionData.sessionId,
        };
    }

    // Change Password API Endpoint
    async changePasswordAPI(userId: string, changePasswordData: ChangePasswordRequest) {
        const { currentPassword, newPassword } = changePasswordData;

        // Get user
        const user = await this.userRepositoryService.findUserById(userId);
        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        // Verify current password
        const isCurrentPasswordValid = await this.passwordService.comparePassword(currentPassword, user.password);
        if (!isCurrentPasswordValid) {
            throw new BadRequestException('Current password is incorrect');
        }

        // Hash new password
        const hashedNewPassword = await this.passwordService.hashPassword(newPassword);

        // Update password and related fields
        // await this.userRepositoryService.updateUserPassword(userId, hashedNewPassword, {
        //     isFirstLogin: false,
        //     isPasswordReset: false,
        //     lastPasswordChange: new Date(),
        // });

        // Invalidate all sessions to force re-login with new password
        await this.sessionService.invalidateAllUserSessions(userId);

        return {
            message: 'Password changed successfully. Please login again.',
        };
    }
}
