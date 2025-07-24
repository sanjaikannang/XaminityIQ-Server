import { Injectable, UnauthorizedException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
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
        private readonly jwtService: AuthJwtService,
        private readonly sessionService: SessionService,
        private readonly sessionRepositoryService: SessionRepositoryService,
    ) { }


    // Login API Endpoint
    async loginAPI(loginData: LoginRequest, userAgent: string, ipAddress: string) {
        try {
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

            // Generate tokens
            const sessionId = await this.sessionService.createUserSession(user, userAgent, ipAddress);

            // Get the tokens from the session
            const tokens = await this.sessionRepositoryService.getTokensBySessionId(sessionId);

            if (!tokens) {
                throw new UnauthorizedException('Failed to create session');
            }

            // Update last login
            await this.userRepositoryService.updateLastLogin((user._id as Types.ObjectId).toString());

            return {
                user: {
                    id: (user._id as Types.ObjectId).toString(),
                    email: user.email,
                    role: user.role,
                    isFirstLogin: user.isFirstLogin,
                },
                tokens: {
                    accessToken: tokens.accessToken,
                    refreshToken: tokens.refreshToken,
                },
                sessionId,
            };
        } catch (error) {
            throw new UnauthorizedException('Login failed');
        }
    }


    // Refresh Token API Endpoint
    async refreshToken(refreshData: RefreshTokenRequest) {
        const { refreshToken, sessionId } = refreshData;

        try {
            // Verify refresh token
            const payload = this.jwtService.verifyRefreshToken(refreshToken);

            // Check session
            const session = await this.sessionService.getSession(sessionId);
            if (!session || session.refreshToken !== refreshToken) {
                throw new UnauthorizedException('Invalid session');
            }

            // Check if session is expired
            if (session.expiresAt < Date.now()) {
                await this.sessionService.deleteSession(sessionId);
                throw new UnauthorizedException('Session expired');
            }

            // Generate new tokens
            const newAccessToken = this.jwtService.generateAccessToken({
                sub: payload.sub,
                email: payload.email,
                role: payload.role,
                sessionId: payload.sessionId,
            });

            const newRefreshToken = this.jwtService.generateRefreshToken({
                sub: payload.sub,
                email: payload.email,
                role: payload.role,
                sessionId: payload.sessionId,
            });

            // Update database session
            await this.sessionRepositoryService.updateSession(sessionId, {
                accessToken: newAccessToken,
                refreshToken: newRefreshToken,
            });

            return {
                accessToken: newAccessToken,
                refreshToken: newRefreshToken,
            };
        } catch (error) {
            throw new UnauthorizedException('Invalid refresh token');
        }
    }


    // Change Password API Endpoint
    async changePasswordAPI(userId: string, changePasswordData: ChangePasswordRequest) {
        try {
            const { currentPassword, newPassword, confirmPassword } = changePasswordData;

            if (newPassword !== confirmPassword) {
                throw new BadRequestException('New password and confirm password do not match');
            }

            // Find user
            const user = await this.userRepositoryService.findUserById(userId);
            if (!user) {
                throw new UnauthorizedException('User not found');
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
            await this.userRepositoryService.updateUserPassword(userId, hashedPassword);

            return {
                message: 'Password changed successfully'
            };
        } catch (error) {
            throw new UnauthorizedException('Failed to change password');
        }
    }


    // Reset Password API Endpoint
    async resetPassword(email: string) {
        const user = await this.userRepositoryService.findUserByEmail(email);
        if (!user) {
            // Don't reveal if email exists or not
            return { message: 'If the email exists, password reset instructions have been sent' };
        }

        // Generate new temporary password
        const newPassword = this.passwordService.generateRandomPassword();
        const hashedPassword = await this.passwordService.hashPassword(newPassword);

        // Update user with new password and set first login flag
        await this.userRepositoryService.updateUser((user._id as Types.ObjectId).toString(), {
            password: hashedPassword,
            isFirstLogin: true,
            isPasswordReset: true,
        });

        // Invalidate all sessions
        await this.sessionService.deleteAllUserSessions((user._id as Types.ObjectId).toString(),);
        await this.sessionRepositoryService.deactivateAllUserSessions((user._id as Types.ObjectId).toString(),);

        // In a real application, you would send this password via email
        // For now, we'll return it in the response (remove this in production)
        return {
            message: 'Password has been reset successfully',
            temporaryPassword: newPassword // Remove this in production
        };
    }


    // Logout API Endpoint
    async logout(sessionId: string) {
        await this.sessionService.deleteSession(sessionId);
        await this.sessionRepositoryService.deactivateSession(sessionId);
        return { message: 'Logged out successfully' };
    }


    // GetMe API Endpoint
    async getMeAPI(userId: string) {
        const userWithProfile = await this.userRepositoryService.getUserWithProfile(userId);
        if (!userWithProfile) {
            throw new UnauthorizedException('User not found');
        }

        const { user, profile } = userWithProfile;

        return {
            user: {
                id: (user._id as Types.ObjectId).toString(),
                email: user.email,
                role: user.role,
                isFirstLogin: user.isFirstLogin,
                lastLogin: user.lastLogin,
            },
            profile: {
                firstName: profile.firstName,
                lastName: profile.lastName,
                phone: profile.phone,
                address: profile.address,
            },
        };
    }

}